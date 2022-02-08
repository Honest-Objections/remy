import numericQuantity from 'numeric-quantity';
import { cursorTo } from 'readline';
var convert = require('convert-units')


export class Ingredient {
  
  
  private _name: string = "unknown"
  public get name() : string {
    return this._name
  }

  private _quantity: number = NaN
  public get quantity() : number {
    return Number(this._quantity.toFixed(2))
  }

  private _unit: { abbr: string } = { abbr: '' }
  public get unit() : string {
    return this._unit.abbr
  }
  
  private originalSentence: string = "" 

  constructor(sentence: string) {

    this.originalSentence = sentence
    this.extractMeasurement()
  }

  private simplifySentence() : string {
    var prefixes = /^[\W\s]*/g // starting 
    var simplified = /,.*/g
    var brackets = /\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\)/g
    var unicodeFractions = /(\d*)\s?([\u2150-\u215E\u00BC-\u00BE])/g
    var typedFractions = /(?<quantity>\d+\/\.?\d*)\s?(?<unit>[^\s\/+,\.:;]+)/

    return this.originalSentence
      .replace(unicodeFractions, (match, whole, fraction) => `${numericQuantity(fraction) + Number(whole)}`)
      .replace(typedFractions, (match, fraction, unit) => `${numericQuantity(fraction)} ${unit}`)
      .replace(simplified, '')
      .replace(prefixes, '')
      .replace(brackets, '')
  }

  private extractMeasurement() : {} {
    var measurementsExp = /(?<quantity>\d+\/?\.?\d*)\s?(?<unit>[^\s\/+,\.:;]+)/g
    var sentence = this.simplifySentence()
    var measurements = sentence.matchAll(measurementsExp)

    var unit = undefined
    var quantity = NaN

    for (const measurement of measurements) {     
      let potentialUnit = this.getUnit(measurement.groups?.unit) || {}
      let potentialQuantity = Number(measurement.groups?.quantity) || NaN

      // Is a valid unit 
      if (potentialUnit.hasOwnProperty('abbr')) {
        
        // @ts-ignore
        var system = potentialUnit['system']
        if (system == 'imperial') {
          
          // @ts-ignore add imperial together
          if (unit?.system == 'imperial') {
            var additionalQty = convert(potentialQuantity).from(potentialUnit.abbr).to(unit.abbr)
            quantity += additionalQty
          } else if (unit === undefined) {
            unit = potentialUnit
            quantity = potentialQuantity
          }
        } else if (system == 'metric') {
          unit = potentialUnit
          quantity = potentialQuantity
        }

        sentence = sentence.replace(measurement[0], '')
      } else {
        quantity = potentialQuantity
        sentence = sentence.replace(quantity.toString(), '')
      }

    }

    // Set name 
    var remainingWords = sentence.match(/\w+( \w+)*/)
    if (remainingWords) this._name = remainingWords[0]

    // convert to metric by default 
    if (unit !== undefined && unit.system == 'imperial') {
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
    // @ts-ignore
    this._unit = unit || {abbr: ''}

    return {}
  }


  private getUnit(proposedUnit : string | undefined) : {} {
    const units = convert().list('mass').concat(convert().list('volume'))
    var unitInfo = {}
    
    if (proposedUnit) {
      // look through all units 
      units.forEach((u: {}) => {
        // look through all variants of unit   
        Object.keys(u).forEach(format => {
          // @ts-ignore
          if (u[format].toLowerCase() == proposedUnit.toLowerCase()) {
              unitInfo = u
              return 
          }
        }); 
      })
    }
    
    return unitInfo
  }
  
}