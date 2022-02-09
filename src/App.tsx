import React from 'react'
import './App.css'

import { DOMMessage } from './types/DOMMessages'
import { Recipe } from './types/Recipe'

const { useState } = React;


function App() {

  const [recipe, setRecipe] = useState<Recipe>({isValid: false, isGoogleAssistantReady: false, ingredients: [], steps: [], serves: 0 });

    return (
      <div className="w-full">
        <header className="h-10">Remy</header>
        <div>
          { recipe.isValid ? <DisplayRecipe></DisplayRecipe> : <ExtractRecipe></ExtractRecipe> }
        </div>
      </div>
    );


    function DisplayRecipe () {

      var ingredients : JSX.Element[] = []
      recipe.ingredients.forEach(ingredient => 
        ingredients.push(<li>{ingredient}</li>)
      )

      var steps : JSX.Element[] = []
      recipe.steps.forEach(step => 
        steps.push(<li>{step}</li>)
      )

      return (
        <div>
          <h2>Recipe</h2>
          <ul>{ingredients}</ul>
          <h2>Steps</h2>
          <ul>{steps}</ul>
        </div>
      )
    }


    function ExtractRecipe () {

      function getRecipeOfActiveTab () {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  
          chrome.tabs.sendMessage(tabs[0].id || 0, { type: 'GET_RECIPE' } as DOMMessage,
            (recipe: Recipe) => {
              setRecipe(recipe)
            });
        });
      }


      return <button onClick={getRecipeOfActiveTab}>Extract Recipe</button>
    }

}

export default App;
