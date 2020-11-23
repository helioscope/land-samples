// started from tutorial at: https://blog.mozvr.com/procedural-geometry-low-poly-clouds/

import _ from 'lodash';
import * as THREE from 'three';

import {jitterVertices, randomRangeFromArray} from './util';
import {mushBottom, prepRandomSeed, USE_HARD_EDGE_LOWPOLY_STYLE} from './generatorUtil';

const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xFFFFFF,
  emissive: 0x333333,
  flatShading: USE_HARD_EDGE_LOWPOLY_STYLE,
});

const defaultCloudParams = {
  tuftRadii : [1.5, 1.5, 2.0],
  tuftOffset : [-2, 2, 0],
  tuftOffsetScaleRange : [0.75, 1],
  tuftYOffsetVariation : [-0.25, 0.1],
  tuftZOffsetVariation : [-0.125, 0.125],
  finalScaleRange : [0.7, 1],
  bottomSmushRange : [-0.55, -0.1],
  jitterDistance : 0.2,
  seed : undefined
};

export function makeCumulousCloud(params) {
  params = Object.assign({}, defaultCloudParams, params);
  prepRandomSeed(params);

  const geometry = new THREE.Geometry();
  const tuftRadii = params.tuftRadii;
  const tuftOffset = params.tuftOffset;
  const tuftOffsetScaleRange = params.tuftOffsetScaleRange;
  const tuftYOffsetVariation = params.tuftYOffsetVariation;
  const tuftZOffsetVariation = params.tuftZOffsetVariation;
  const finalScaleRange = params.finalScaleRange;
  const bottomSmushRange = params.bottomSmushRange;
  const jitterDistance = params.jitterDistance;

  _.each(tuftRadii, (radius, index) => {
    const tuft = new THREE.SphereGeometry(radius,7,8);
    tuft.translate(
      tuftOffset[index] * randomRangeFromArray(tuftOffsetScaleRange),
      randomRangeFromArray(tuftYOffsetVariation), 
      randomRangeFromArray(tuftZOffsetVariation)
    );
    jitterVertices(tuft, jitterDistance);
    mushBottom(tuft, randomRangeFromArray(bottomSmushRange));
    geometry.merge(tuft);
  });

  const finalScale = randomRangeFromArray(finalScaleRange);
  geometry.scale(finalScale, finalScale, finalScale);

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.verticesNeedUpdate = true; // note: it seems like the original sphere normals are actually kinda nice if not pursruing a hard-edge style
    geometry.computeFlatVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    cloudMaterial
  );
}