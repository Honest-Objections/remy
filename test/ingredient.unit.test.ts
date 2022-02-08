import { expect } from 'chai';
import { Ingredient } from '../src/types/Ingredient'


let ingredients = [
    { 
        "description": "Both imperial and metric", 
        "test": `▢ 240 ml / 1 cup unsweetened non dairy milk`, 
        "quantity": 240, 
        "unit": "ml", 
        "name": "unsweetened non dairy milk" ,
    },
    { 
        "description": "Imperial addition",
        "test": `▢ 2 tablespoons + 1 teaspoon oil of choice , or cashew butter for oil free but they won't be quite as light and fluffy`,
        "quantity": 34.50,
        "unit": "ml",
        "name": "oil of choice"
    },
    {
        "description": "Unicode fractions with whole number",
        "test": `▢ 1½ cups all purpose flour (plain flour in the UK) , Or spelt flour but you must weigh it and use 200g - the cup measurements given won't be accurate for spelt as it's lighter than all purpose flour)`,
        "quantity": 354.88,
        "unit": "ml",
        "name": "all purpose flour"
    },
    {
        "description": "Unicode fractions with whole number and space",
        "test": `▢ 1 ½ cups all purpose flour (plain flour in the UK) , Or spelt flour but you must weigh it and use 200g - the cup measurements given won't be accurate for spelt as it's lighter than all purpose flour)`,
        "quantity": 354.88,
        "unit": "ml",
        "name": "all purpose flour"
    },
    {
        "description": "Unicode fractions with whole number and space",
        "test": `▢ ½ cups all purpose flour (plain flour in the UK) , Or spelt flour but you must weigh it and use 200g - the cup measurements given won't be accurate for spelt as it's lighter than all purpose flour)`,
        "quantity": 118.29,
        "unit": "ml",
        "name": "all purpose flour"
    },
    {
        "description": "Imperial addition",
        "test": `▢ 1½ cups + 2 tablespoons all purpose flour (plain flour in the UK) , Or spelt flour but you must weigh it and use 200g - the cup measurements given won't be accurate for spelt as it's lighter than all purpose flour)`,
        "quantity": 384.46,
        "unit": "ml",
        "name": "all purpose flour"
    },
    {
        "description": "Typed fractions",
        "test": `1/4 oz. (2 1/4 teaspoons) active dry yeast`,
        "quantity": 7.09,
        "unit": "g",
        "name": "active dry yeast"
    },
    {
        "description": "Unit of item",
        "test": `5 small onions`,
        "quantity": 5,
        "unit": "",
        "name": "small onions"
    }
]

ingredients.forEach((testCase) => {
    it(testCase["description"], function () {
        let uut = new Ingredient(testCase["test"])
        expect(uut.name).equal(testCase["name"])
        expect(uut.unit).equal(testCase["unit"])
        expect(uut.quantity).equal(testCase["quantity"])
    })
})