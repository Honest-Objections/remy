import React, { useEffect } from 'react'
import './App.css'

import { DOMMessage } from './types/DOMMessages'
import { Ingredient } from './types/Ingredient';
import { Recipe } from './types/Recipe'

const { useState } = React;


function App() {

  const [recipe, setRecipe] = useState<Recipe>(new Recipe());

  useEffect(() => {
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      var test = new Recipe()
      test.ingredients = [
        new Ingredient(`4 celery sticks, finely chopped`),
        new Ingredient(`1½ kg lean minced beef (or use half beef, half pork mince)`),
        new Ingredient(`4 onions, finely chopped`)
      ]
      setRecipe(test)
    } else {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id || 0, { type: 'GET_RECIPE' } as DOMMessage,
          (recipe: string) => {
            console.log(recipe)
            console.log(new Recipe(recipe))
            if (recipe) setRecipe(new Recipe(recipe))
          })
      })
    }
    
  }, [])

  return (
    <div className="w-full">
      <div>
        { recipe.isValid ? <DisplayRecipe></DisplayRecipe> : <NoRecipe></NoRecipe> }
      </div>
    </div>
  );


  function DisplayRecipe () {
    const [ingredientsExpanded, setIngredintsExpanded] = useState(false)

    var ingredients : JSX.Element[] = []
    recipe.ingredients.forEach(ingredient => 
      ingredients.push(<IngredientDisplay ingredient={ingredient} ></IngredientDisplay>)
    )

    var steps : JSX.Element[] = []
    // recipe.steps.forEach(step => 
    //   steps.push(<li>{step}</li>)
    // )

    return (
      <div className='w-full text-white'>
        <h2 className='text-center' onClick={() => setIngredintsExpanded(!ingredientsExpanded)}>Ingredients ({recipe.ingredients.length})</h2>
        { ingredientsExpanded ? <ul>{ingredients}</ul> : ''}
        <h2 className='text-center'>Steps</h2>
        <ul>{steps}</ul>
      </div>
    )
  }

  function IngredientDisplay (props: { ingredient: Ingredient}) {
    const [isHovering, setIsHovering] = useState(false);
    const ingredient = props.ingredient
    
    return <li 
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      >{isHovering ? ingredient.originalSentence : `${ingredient.quantity} ${ingredient.unit} ${ingredient.name}`}</li>
  }


  function NoRecipe () {
    return <div>Looks like there aren't any complete recipes on this page</div>
  }

}

export default App;
