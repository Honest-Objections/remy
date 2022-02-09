import { DOMMessage } from '../types/DOMMessages';
import { Ingredient } from '../types/Ingredient';
import { Recipe } from '../types/Recipe';

import numericQuantity from 'numeric-quantity';
var convert = require('convert-units')
 
const messagesFromReactAppListener = (msg: DOMMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: Recipe) => void) => {
    console.log('[content.js]. Message received', msg);
  

    const ingredients = getIngredients()

    let recipe: Recipe = {
        isValid: ingredients.length > 0, 
        isGoogleAssistantReady: false, 
        name: undefined, 
        ingredients: getIngredients(),
        steps: getSteps(),
        serves: NaN
    }
  
    console.log('[content.js]. Message response', recipe);
    sendResponse(recipe); 
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