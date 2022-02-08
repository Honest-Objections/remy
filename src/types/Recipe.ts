import { Ingredient } from "./Ingredient"

export type Recipe = {
    isValid: boolean;
    isGoogleAssistantReady: boolean; 
    name?: string;
    serves: number
    ingredients: Ingredient[],
    steps: string[]
}