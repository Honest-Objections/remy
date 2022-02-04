import React from 'react';
import './App.css';
import { DOMMessage, Recipe } from './types/DOMMessages';

function App() {

  function getRecipeOfActiveTab () {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {

      chrome.tabs.sendMessage(tabs[0].id || 0, { type: 'GET_RECIPE' } as DOMMessage,
        (recipe: Recipe) => {
          console.log('recipe', recipe); 
        });
    });
  }

  return (
    <div className="w-full">
      <header className="App-header">Remy</header>
      <div>
      <button onClick={getRecipeOfActiveTab}>Activate Lasers</button>
      </div>
    </div>
  );
}

export default App;
