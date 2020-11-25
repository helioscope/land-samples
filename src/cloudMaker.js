// started from tutorial at: https://blog.mozvr.com/procedural-geometry-low-poly-clouds/

import _ from 'lodash';
import * as THREE from 'three';

import {jitterVertices, randomRangeFromArray} from './util';
import {mushBottom, prepRandomSeed, USE_HARD_EDGE_LOWPOLY_STYLE} from './generatorUtil';
import { MeshGenerator } from './MeshGenerator';

const cloudMaterial = new THREE.MeshLambertMaterial({
  color: 0xFFFFFF,
  emissive: 0x333333,
  flatShading: USE_HARD_EDGE_LOWPOLY_STYLE,
});

/*
  thoughts on alternative handling, for variable tuft counts:
  center-tuft size: range 1.9 - 2.25
  left tufts : range 0 - 2
  right tufts : range 0 - 2
  outer tuft scale factor : range 0.5 - 1.05 (current numbers are 0.75 x center size)

  bonus variation:
  outer tuft (x) offset factor : 0 (offset right now = previous tuft x + previous tuft radius; could add/subtract offset = new tuft's radius * factor)

  bonus improvement:
  instead of hard flattening of bottom, could lerp towards cutoff point, either by fixed t or related to distance
*/

export const CumulousCloudMaker = new MeshGenerator({
  generatorParams : {
    tuftRadii : { value : [1.5, 1.5, 2.0], type : 'array:number' }, // might be better to redefine these number-array params to handle variable tuft counts
    tuftOffset : { value : [-2, 2, 0], type : 'array:number' }, // might be better to redefine these number-array params to handle variable tuft counts
    tuftOffsetScaleRange : { value : [0.75, 1.0125], type: 'range'},
    tuftYOffsetVariation : { value : [-0.25, 0.1], type: 'range'},
    tuftZOffsetVariation : { value : [-0.125, 0.125], type: 'range'},
    bottomSmushRange : { value : [-0.55, -0.1], type: 'range'},
    jitterDistance : { value : 0.2 },
    finalScale : { range : [0.7, 1] },
    seed : { type : 'seed' }
  },
  generatorFunction : (params) => {
    const geometry = new THREE.Geometry();
    const tuftRadii = params.tuftRadii;
    const tuftOffset = params.tuftOffset;
    const tuftOffsetScaleRange = params.tuftOffsetScaleRange;
    const tuftYOffsetVariation = params.tuftYOffsetVariation;
    const tuftZOffsetVariation = params.tuftZOffsetVariation;
    const bottomSmushRange = params.bottomSmushRange;
    const jitterDistance = params.jitterDistance;
    const finalScale = params.finalScale;

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

    geometry.scale(finalScale, finalScale, finalScale);

    if (USE_HARD_EDGE_LOWPOLY_STYLE) {
      geometry.verticesNeedUpdate = true; // note: it seems like the original sphere normals are actually kinda nice if not pursuing a hard-edge style
      geometry.computeFlatVertexNormals();
    }

    return new THREE.Mesh(
      geometry,
      cloudMaterial
    );
  }
})