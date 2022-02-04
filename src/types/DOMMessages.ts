export type DOMMessage = {
  type: 'GET_RECIPE'
}
  
export type Recipe = {
  isValid: boolean;
  isGoogleAssistantReady: boolean; 
  name?: string;
  ingredients?: Ingredient[]
}

export type Ingredient = {
  quantity: BigInt,
  measurement: Measurement
  name: string
}

enum Measurement {
  Kg,
  g,
  Lb, 
  Cup, 
  m, 
  ml
}