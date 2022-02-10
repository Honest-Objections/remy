import { Ingredient } from "./Ingredient"

export class Recipe {
    
    public get isValid(): boolean {
        return this.ingredients.length > 1
    }
    serves: number = 0
    ingredients: Ingredient[] = []
    isGoogleFriendly?: boolean = undefined

    constructor(json?: string) {
        if (json) {
         var r = JSON.parse(json) 
         this.serves = r.serves
         this.ingredients = r.ingredients.map((i: string) => new Ingredient(i))
         this.isGoogleFriendly = r.isGoogleFriendly
        }
    }

    public toJson() : string {
        return JSON.stringify({
            isValid: this.isValid,
            ingredients: this.ingredients.map(i => i.toJson()),
            isGoogleFriendly: this.isGoogleFriendly
        })
    }
}

