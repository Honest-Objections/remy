import numericQuantity from 'numeric-quantity';
import { v4 as uuid } from 'uuid'
var convert = require('convert-units')

type Unit = {
  abbr: string
  system: string
}
type JsonUnit = {
  id: string,
  name: string,
  originalSentence: string, 
  unit: string,
  quantity: number
}
export class Ingredient {
  
  private _id: string
  public get id(): string {
    return this._id
  }

  private _name: string = "unknown"
  public get name() : string {
    return this._name
  }

  private _quantity: number = NaN
  public get quantity() : number {
    return Number(this._quantity.toFixed(2))
  }

  private _unit: Unit | undefined = undefined
  public get unit() : string {
    return this._unit?.abbr || ''
  }

  private _originalUnit: Unit | undefined = undefined
  public get originalUnit(): Unit | undefined {
    return this._originalUnit
  }
  private set originalUnit(unit: Unit | undefined) {
    this._originalUnit = unit 
  }

  private _element: Element | undefined
  public get element() : Element | undefined  {
    return this._element
  }
  public set element(element: Element | undefined) {
    this._element = element
  }
  
  private _originalSentence: string = "" 
  public get originalSentence() : string {
    return this._originalSentence
  }

  constructor(input: string) {
    try {

      const jsInput = JSON.parse(input) as JsonUnit
      this._name = jsInput.name
      this._quantity = jsInput.quantity
      this._unit = this.getUnit(jsInput.unit)
      this._originalSentence = jsInput.originalSentence
      this._id = jsInput.id

    } catch (e) {
        
      this._id = uuid()
      this._originalSentence = input as string
      this.extractMeasurement()

    }
  }


  private simplifySentence() : string {
    var prefixes = /^[\W\s]*/g // starting 
    var simplified = /,.*/g
    var brackets = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
    var unicodeFractions = /(\d*)\s?([\u2150-\u215E\u00BC-\u00BE])/g
    var typedFractions = /(?<quantity>\d+\/\.?\d*)\s?(?<unit>[^\s\/+,\.:;]+)/
    var tablespoonAlias = /tbsp/g
    var floralOzAlias = /\d?(fl\s?oz)\s/g
    var imperialPositiveModifier = /(\d?)\s?heaped\s/g
    var imperialNegativeModifier = /(\d?)\s?level\s/g

    return this._originalSentence
      .replace(unicodeFractions, (match, whole, fraction) => `${numericQuantity(fraction) + Number(whole)}`)
      .replace(typedFractions, (match, fraction, unit) => `${numericQuantity(fraction)} ${unit}`)
      .replace(simplified, '')
      .replace(prefixes, '')
      .replace(brackets, '')
      .replace(tablespoonAlias, 'tablespoon')
      .replace(floralOzAlias, (match, floz) => match.replace(floz, 'fl-oz'))
      .replace(imperialPositiveModifier, (match, number) => `${Number(number) * 1.2}`)
      .replace(imperialNegativeModifier, (match, number) => `${Number(number) * 0.8}`)
  }

  private extractMeasurement() : {} {
    var measurementsExp = /(?<quantity>\d+\/?\.?\d*)\s?(?<unit>[^\s\/+,\.:;]+)/g
    var sentence = this.simplifySentence()
    var measurements = sentence.matchAll(measurementsExp)

    
    var unit : Unit | undefined = undefined
    var quantity = NaN

    var measurementsFound = 0
    for (const measurement of measurements) {     
      let potentialUnit : Unit | undefined = this.getUnit(measurement.groups?.unit) || undefined
      let potentialQuantity = Number(measurement.groups?.quantity) || NaN

      // Is a valid unit 
      if (potentialUnit !== undefined) {
        
        var system = potentialUnit['system']
        if (system === 'imperial') {
          
          // add imperial together
          if (unit?.system === 'imperial') {
            var additionalQty = convert(potentialQuantity).from(potentialUnit.abbr).to(unit.abbr)
            quantity += additionalQty
          } else if (unit === undefined) {
            unit = potentialUnit
            quantity = potentialQuantity
          }
        } else if (system === 'metric') {
          unit = potentialUnit
          quantity = potentialQuantity
        }

        // remove quantity once evaluated
        sentence = sentence.replace(measurement[0], '')
      } else {
        quantity = potentialQuantity
        sentence = sentence.replace(quantity.toString(), '')
      }

      measurementsFound ++
    }

    if (measurementsFound === 0) {
      quantity = 1
      sentence = sentence.replace(/^An?/ig, '')
    } else if (measurementsFound === 1) {
      this.originalUnit = unit
    }

    // Set name 
    var remainingWords = sentence.match(/\w+( \w+)*/)
    if (remainingWords) this._name = remainingWords[0]

    // convert to metric by default 
    if (unit !== undefined && unit.system === 'imperial') {
      var possibilities = convert().from(unit.abbr).possibilities()
      if (possibilities.includes('ml')) {
        quantity = convert(quantity).from(unit.abbr).to('ml')
        unit = this.getUnit('ml')
      } else if (possibilities.includes('g')) {
        quantity = convert(quantity).from(unit.abbr).to('g')
        unit = this.getUnit('g')
      }
    }

    this._quantity = quantity
    this._unit = unit || undefined

    return {}
  }

  private getUnit(proposedUnit : string | undefined) : Unit | undefined {
    const units = convert().list('mass').concat(convert().list('volume'))
    var unitInfo = undefined
    
    if (proposedUnit) {
      // look through all units 
      units.forEach((u: {}) => {
        // look through all variants of unit   
        Object.keys(u).forEach(format => {
          // @ts-ignore
          if (u[format].toLowerCase() === proposedUnit.toLowerCase()) {
              unitInfo = u as Unit
              return 
          }
        }); 
      })
    }
    
    return unitInfo
  }

  public toJson() : string {
    return JSON.stringify({
      id: this._id,
      name: this.name,
      originalSentence: this.originalSentence, 
      unit: this.unit,
      quantity: this.quantity
    })
  }
  
}