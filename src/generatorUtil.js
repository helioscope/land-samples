import * as THREE from 'three';

import {getNewRandomSeed, setRandomSeed} from './util';


export const USE_HARD_EDGE_LOWPOLY_STYLE = true; // this probably shouldn't live in a util

const defaultMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors, flatShading: USE_HARD_EDGE_LOWPOLY_STYLE});


export function mushBottom(geometry, bottomY) {
  _.each(geometry.vertices, (v) => {
    v.y = Math.max(v.y, bottomY)
  });
}

export function prepRandomSeed(params) {
  if (params.seed == null) {
    params.seed = getNewRandomSeed();
  }
  setRandomSeed(params.seed);
}

export function finalizeMesh(geometry, generatorFunction, params, material = null) {
  geometry.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.computeFlatVertexNormals();
  } else {
    geometry.computeVertexNormals();
  }

  let mesh = new THREE.Mesh(
    new THREE.BufferGeometry().fromGeometry(geometry),
    material || defaultMaterial
  );
  mesh.userData = {
    generator : generatorFunction,
    generatorParams : params
  };

  return mesh;
}