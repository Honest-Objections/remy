import { DOMMessage, Recipe } from '../types/DOMMessages';
 
const messagesFromReactAppListener = (msg: DOMMessage, sender: chrome.runtime.MessageSender, sendResponse: (response: Recipe) => void) => {
    console.log('[content.js]. Message received', msg);
  
    let recipe: Recipe = {
        isValid: isRecipe(), 
        isGoogleAssistantReady: false, 
        name: undefined, 
        ingredients: undefined
    }
  
    console.log('[content.js]. Message response', );
  
    sendResponse(recipe); 
}

function isRecipe (): boolean {
    var headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    var isRecipe = false; 

    headers.forEach(h => {
        var header = h.innerHTML.toLowerCase()
        console.log(header)
        if (header.includes("ingredients") || header.includes("instructions")) {
            isRecipe = true; 
            return  
        }
    }); 

    return isRecipe; 
}
 
chrome.runtime.onMessage.addListener(messagesFromReactAppListener);
console.log("Registering")