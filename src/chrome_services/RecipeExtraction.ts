import { DOMMessage, Ingredient, Recipe } from '../types';
import numericQuantity from 'numeric-quantity';
var convert = require('convert-units')
 
const messagesFromReactAppListener = (msg: DOMMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: Recipe) => void) => {
    console.log('[content.js]. Message received', msg);
  
    let recipe: Recipe = {
        isValid: isRecipe(), 
        isGoogleAssistantReady: false, 
        name: undefined, 
        ingredients: getIngredients(),
        steps: getSteps()
    }
  
    console.log('[content.js]. Message response', recipe);
    sendResponse(recipe); 
}

function isRecipe (): boolean {
    var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var isRecipe = false; 

    headers.forEach(h => {
        var header = h.innerHTML.toLowerCase()

        if (header.includes("ingredients") || header.includes("instructions")) {
            isRecipe = true; 
            return  
        }
    }); 

    return isRecipe; 
}


function getIngredients () : string[] {
    var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var ingredients : string[] = []

    

    headers.forEach(h => {
        var header = h.innerHTML.toLowerCase()

        if (header.includes("ingredient")) {
            var ingredientList = h.parentElement?.querySelectorAll("ul")
            
            if (ingredientList?.length == 1) {
                ingredientList[0].querySelectorAll("li").forEach(li => {

                    var og = li.innerText

                    var simplified = /,.*/g
                    var prefixes = /^[\W\s]*/g
                    var brackets = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
                    var fractions = /[\u2150-\u215E\u00BC-\u00BE]/g

                    var cleaned = og.replace(fractions, (fraction) => numericQuantity(fraction).toString())
                        .replace(simplified, '')
                        .replace(prefixes, '')
                        .replace(brackets, '')

                        

                    var measurementsExp = /(?<quantity>\d+\.?\d*)\s?(?<unit>[^\s\/+,\.:;]+)/g
                    var measurements = measurementsExp.exec(cleaned); 

                    var unit = measurements?.groups?.unit

                    try {
                        let quantity : number = Number(measurements?.groups?.quantity) || NaN
                        
                        if (unit && quantity !== NaN) {

                            var unitInfo = null

                            convert().list('mass').concat(convert().list('volume')).forEach((u: {}) => {
                                Object.keys(u).forEach(format => {
                                    // @ts-ignore
                                    if (u[format].toLowerCase() == unit?.toLowerCase()) {
                                        unitInfo = u
                                        return 
                                    }
                                }); 
                            })

                            if (unitInfo) {
                                var conversion = convert(quantity).from(unitInfo['abbr'])
                                console.log("unit is valid", unitInfo, conversion.possibilities())
                            } else {
                                console.log(`Could not find ${unit} as a valid unit. Likely an entire ingredient`)
                            }
                            
                        }

                    } catch (err) {
                        console.log(err)
                        // multiples of whole item 
                    }
                    

                    li.innerHTML = cleaned
                    ingredients.push(cleaned)
                })
            }
            
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