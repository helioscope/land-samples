import _ from 'lodash';
import * as THREE from 'three';
import Alea from 'alea';

export const RADIANS_FOR_1_DEGREE = Math.PI / 180;
export const RADIANS_FOR_90_DEGREES = Math.PI * 0.5;
export const RADIANS_FOR_180_DEGREES = Math.PI;
export const RADIANS_FOR_270_DEGREES = Math.PI * 1.5;
export const RADIANS_FOR_360_DEGREES = Math.PI * 2;

export const VECTOR2_ORIGIN = new THREE.Vector2(0,0);
export const VECTOR2_UP = new THREE.Vector2(0,1);
export const VECTOR2_DOWN = new THREE.Vector2(0,-1);
export const VECTOR2_LEFT = new THREE.Vector2(-1,0);
export const VECTOR2_RIGHT = new THREE.Vector2(1,0);

let rand = new Alea();

export function setRandomFunction(newRandomFunction) {
  rand = newRandomFunction;
}

export function getNewRandomSeed() {
  return randomRangeInt(0, 99999999); // not very hardcore, but probably fine for our purposes
}

export function setRandomSeed(seed) {
  rand = new Alea(seed);
}

export function exportRandomState() {
  return rand.exportState();
}

export function importRandomState(state) {
  rand = Alea.importState(state);
}

export function getRandomValue(scale = 1) {
  return rand() * scale;
}

export function randomOdds(chance) {
  // assumes chance is between 0 and 1, so 0.5 is 50% odds
  return rand() < chance;
}

export function randomPickOne(optionsArr) {
  return optionsArr[randomRangeInt(0, optionsArr.length - 1)];
}
export function randomPickMultiple(optionsArr, numPicks) {
  const lastIndex = optionsArr.length - 1;
  let picks = [];

  for (let i = 0; i < numPicks; i++) {
    picks.push(optionsArr[randomRangeInt(0, lastIndex)]);
  }
  
  return picks;
}

export function randomRange(min, max) {
  const range = max - min;
  return (rand() * range) + min;
}
export function randomRangeFromArray(arr) {
  return randomRange(arr[0],arr[1]);
}

export function randomRangeInt(min, max) {
  const range = max - min + 1; // add 1 to be inclusive of the max value
  return Math.floor((rand() * range) + min);
}
export function randomRangeIntFromArray(arr) {
  return randomRangeInt(arr[0],arr[1]);
}

export function randomDistanceVector2(min, max) {
  let vec2 = new THREE.Vector2(randomRange(min, max));
  vec2.rotateAround(VECTOR2_ORIGIN, randomRange(0, RADIANS_FOR_360_DEGREES));
  return vec2;
}
export function randomDistanceVector2FromArray(arr) {
  return randomDistanceVector2(arr[0],arr[1]);
}

export function remapValue(value, inMin, inMax, outMin, outMax) {
  // remap value from its initial range ("in" min and max) to a new range ("out" min & max)
  const inRange = inMax - inMin;
  const outRange = outMax - outMin
  return outRange * ((value - inMin) / inRange) + outMin;
}
export function remapValueFromArrays(value, inArr, outArr) {
  return remapValue(value, inArr[0], inArr[1], outArr[0], outArr[1]);
}

export function jitterVertices(geometry, maxDistance){
  // note: maxDistance is per axis, linear distance could be greater
  _.each(geometry.vertices, (v) => {
    v.x += randomRange(-maxDistance, maxDistance),
    v.y += randomRange(-maxDistance, maxDistance),
    v.z += randomRange(-maxDistance, maxDistance)
  });
}

export class WeightedOddsPicker {
  // choice format: {value: 'anything', weight: NUMBER}
  constructor(choicesArray) {
    this.totalWeight = 0;
    this.choices = [];

    _.each(choicesArray, this.addChoice.bind(this));
  }

  addChoice(choice) {
    let storedChoice = Object.assign({}, choice);
    
    this.totalWeight += choice.weight;
    storedChoice.upperLimit = this.totalWeight;
    this.choices.push(storedChoice);
  }

  pickOne() {
    let odds = rand() * this.totalWeight;
    let choices = this.choices;
    let imax = choices.length;
    for (let i = 0; i < imax; i++) {
      let choice = choices[i];
      if (odds < choice.upperLimit) {
        return choice.value;
      }
    }
    console.warn("weighted picker odds overran choices? this shouldn't happen! egad!", odds, this.totalWeight);
    return choices[choices.length - 1].value;
  }
}

