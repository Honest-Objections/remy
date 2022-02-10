import React, { useEffect } from 'react'
import './App.css'

import { DataGrid, GridRowsProp, GridColDef } from '@mui/x-data-grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box'

import GoogleIcon from '@mui/icons-material/Google'

import { DOMMessage } from './types/DOMMessages'
import { Ingredient } from './types/Ingredient';
import { Recipe } from './types/Recipe'
import { handleBreakpoints } from '@mui/system';

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
            if (recipe) {
              var updated = new Recipe(recipe) 
              setRecipe(updated)
              console.log("updated to", recipe)
            }
          })
      })
    }
    
  }, [])

  return (
    <div>
        { recipe.isValid ? <DisplayRecipe></DisplayRecipe> : <NoRecipe></NoRecipe> }
    </div>
  );


  function DisplayRecipe () {
    const [activeTab, setActiveTab] = useState<number>(0)

    return (
      <div className='h-[600px] w-[450px] text-white bg-red-800 flex flex-col'>
        <header className='overflow-hidden'>
          <div className='inline float-right m-2'>
            <GoogleIcon className={(recipe.isGoogleFriendly ? 'opacity-100' : 'opacity-10')} titleAccess={recipe.isGoogleFriendly ? "Open this recipe on your phone to cast to Google Home Hub" : "Looks like there's no support for Google Assistant"}></GoogleIcon>
          </div>
        </header>
        <Box sx={{ width: '100%' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} aria-label="basic tabs example" centered>
              <Tab label="Overview" />
              <Tab label="Ingredients" />
              <Tab label="Steps" />
            </Tabs>
          </Box>
        </Box>
        <div className="flex-1 m-5 overflow-hidden">
        {{
          '0': <OverviewDisplay></OverviewDisplay>,
          '1': <IngredientsDisplay></IngredientsDisplay>,
          '2': <StepsDisplay></StepsDisplay>
        }[activeTab]}
        </div>
      </div>
    )
  }

  function OverviewDisplay () {
    return <div>Overview</div>
  }

  function StepsDisplay () {
    return <div>No steps found</div>
  }

  function IngredientsDisplay () {
    return <section className="h-full">
      <DataGrid 
        sx={{
          boxShadow: 2,
          border: 2,
          borderColor: 'primary.light',
          '& .MuiDataGrid-cell:hover': {
            color: 'primary.main',
          },
        }}
        rows={recipe.ingredients.map(i => { return {
          id: i.name,
          ingredient: i.name, 
          quantity: i.quantity, 
          unit: i.unit 
        }})} 
        columns={[
          {field: 'ingredient', width: 210}, 
          {field: 'quantity', type: 'number', width: 70}, 
          {field: 'unit', width: 70}
        ]} />
    </section>
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
