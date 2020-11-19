import _ from 'lodash';

export const RADIANS_FOR_1_DEGREE = Math.PI / 180;
export const RADIANS_FOR_90_DEGREES = Math.PI * 0.5;
export const RADIANS_FOR_180_DEGREES = Math.PI;
export const RADIANS_FOR_270_DEGREES = Math.PI * 1.5;
export const RADIANS_FOR_360_DEGREES = Math.PI * 2;

export function randomOdds(chance) {
  // assumes chance is between 0 and 1, so 0.5 is 50% odds
  return Math.random() < chance;
}

export function randomRange(min, max) {
  const range = max - min;
  return (Math.random() * range) + min;
}
export function randomRangeInt(min, max) {
  const range = max - min + 1; // add 1 to be inclusive of the max value
  return Math.floor((Math.random() * range) + min);
}

export function randomRangeFromArray(arr) {
  return randomRange(arr[0],arr[1]);
}

export function remapValue(value, inMin, inMax, outMin, outMax) {
  // remap value from its initial range ("in" min and max) to a new range ("out" min & max)
  const inRange = inMax - inMin;
  const outRange = outMax - outMin
  return outRange * ((value - inMin) / inRange) + outMin;
}

export function jitterVertices(geometry, maxDistance){
  // note: maxDistance is per axis, linear distance could be greater
  _.each(geometry.vertices, (v) => {
    v.x += randomRange(-maxDistance, maxDistance),
    v.y += randomRange(-maxDistance, maxDistance),
    v.z += randomRange(-maxDistance, maxDistance)
  });
}

export function mushBottom(geometry, bottomY) {
  _.each(geometry.vertices, (v) => {
    v.y = Math.max(v.y, bottomY)
  });
}