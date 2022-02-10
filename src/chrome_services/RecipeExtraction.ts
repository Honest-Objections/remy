import { DOMMessage } from '../types/DOMMessages';
import { Ingredient } from '../types/Ingredient';
import { Recipe } from '../types/Recipe';

var recipe: Recipe | undefined = undefined

const messagesFromReactAppListener = (msg: DOMMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: string) => void) => {
    console.log('[content.js]. Message received', msg);
  
    switch (msg.type) {
        case 'GET_RECIPE': 
        {
            recipe = new Recipe()
            recipe.ingredients = getIngredients()
            recipe.isGoogleFriendly = isGoogleFriendly()
            console.log('[content.js]. Message response', recipe)
            sendResponse(recipe.toJson()); 
            break
        }
        case 'SHOW_INGREDIENTS':
        {
            if (recipe !== undefined) recipe?.ingredients[0]?.element?.scrollIntoView()
            break; 
        }
        case 'SHOW_STEPS': 
        {
            console.log("SHOW_STEPS TODO")
            break; 
        }
    }

    
}

function isGoogleFriendly () {
    var scripts = [
        ...document.getElementsByTagName("head")[0].querySelectorAll("script"), 
        ...document.getElementsByTagName("body")[0].querySelectorAll("script")
    ]
    var isReady = false

    scripts.forEach(s => {
        var type = s.getAttribute("type")
        
        if (type == "application/ld+json") {
            var recipe = JSON.parse(s.innerHTML)
            // @ts-ignore
            if (recipe['@type'] === "Recipe") {
                isReady = true
            }
            console.log("recipe", recipe['@type'])
            console.log(recipe)
        }
        return 
    })

    return isReady
}


function getIngredients () : Ingredient[] {
    var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var ingredients : Ingredient[] = []

    headers.forEach(h => {
        var header = h.innerHTML.toLowerCase()

        if (header.includes("ingredient")) {
            var ingredientContainer : Element = h
            var not = ['HEADER', 'H1', 'H2', 'H3', 'H4', 'H5']
            var ingredientList : NodeListOf<HTMLUListElement>
            
            // Get container
            while (ingredientContainer && not.includes(ingredientContainer.nodeName)) {
                ingredientContainer = ingredientContainer.parentElement as Element
                console.log(ingredientContainer, ingredientContainer.nodeName)
            }

            // Find list(s) within 
            ingredientList = ingredientContainer.querySelectorAll('ul')
            ingredientList.forEach(ingredientSet => {
                ingredientSet.querySelectorAll("li").forEach(li => {
                    var ingredient = new Ingredient(li.innerText)
                    ingredient.element = li
                    ingredients.push(ingredient)
                })
            })
        }
    }); 

    return ingredients
}

function getSteps () : string[] {
    var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var steps : string[] = []

    headers.forEach(h => {
        var header = h.innerHTML.toLowerCase()

        if (header.includes("method") || header.includes("instructions") || header.includes("steps")) {
            var stepsList = h.parentElement?.querySelectorAll("ul ol")
            
            if (stepsList && stepsList.length >= 1) {
                stepsList[0].querySelectorAll("li").forEach(li => {
                    steps.push(li.innerText)
                })
            }
            
        }
    }); 

    return steps; 
}
 
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
console.log("Registering")