import _, { random } from 'lodash';
import * as THREE from 'three';

import {jitterVertices, mushBottom, randomRange, randomRangeFromArray} from './util';

const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xFFFFFF,
  emissive: 0x333333,
  // flatShading: true,
});

const tuftRadii = [1.5, 1.5, 2.0];
const tuftOffset = [-2, 2, 0];
const tuftOffsetScaleRange = [0.75, 1];
const tuftYOffsetVariation = [-0.25, 0.1];
const tuftZOffsetVariation = [-0.125, 0.125];
const finalScaleRange = [0.7, 1];
const bottomSmushRange = [-0.55, -0.1];

export function makeCumulousCloud() {
  const geometry = new THREE.Geometry();

  _.each(tuftRadii, (radius, index) => {
    const tuft = new THREE.SphereGeometry(radius,7,8);
    tuft.translate(
      tuftOffset[index] * randomRangeFromArray(tuftOffsetScaleRange),
      randomRangeFromArray(tuftYOffsetVariation), 
      randomRangeFromArray(tuftZOffsetVariation)
    );
    jitterVertices(tuft, 0.2);
    mushBottom(tuft, randomRangeFromArray(bottomSmushRange));
    geometry.merge(tuft);
  });

  const finalScale = randomRangeFromArray(finalScaleRange);
  geometry.scale(finalScale, finalScale, finalScale);

  return new THREE.Mesh(
    geometry,
    cloudMaterial
  );
}