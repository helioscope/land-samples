import _ from 'lodash';
import * as THREE from 'three';
import { Vector3 } from 'three';

import {
  randomRange, 
  randomRangeFromArray,
  randomRangeIntFromArray,
  jitterVertices, 
  randomRangeInt, 
  remapValue, 
  RADIANS_FOR_1_DEGREE, 
  RADIANS_FOR_90_DEGREES, 
  RADIANS_FOR_360_DEGREES, 
  RADIANS_FOR_180_DEGREES,
  RADIANS_FOR_270_DEGREES,
  randomPickOne,
  randomDistanceVector2FromArray
} from './util';

const USE_HARD_EDGE_LOWPOLY_STYLE = false;

const defaultMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors, flatShading: USE_HARD_EDGE_LOWPOLY_STYLE});

const defaultFlowerBunchParams = {
  stemColors : [0x00A028],
  bloomColors : [0xFFFFFF],
  bloomWidthRange : [0.05, 0.1],
  bloomHeightRange : [0.05, 0.06], // might be better to use an aspect ratio range, so flowers in a bunch are more self-similar
  stemHeightRange : [0.2, 0.5],
  stemWidth : 0.02,
  countRange : [2,4],
  separationRange : [0.1, 0.3], // not entirely guaranteed (separation distance is only measured against last location)
  tiltRange : [RADIANS_FOR_1_DEGREE * -10, RADIANS_FOR_1_DEGREE * 10]
};

export function makeFlowerBunch(params) {
  params = Object.assign({}, defaultFlowerBunchParams, params);
  let geometry = new THREE.Geometry();
  const flowerParams = {
    bloomColor : randomPickOne(params.bloomColors),
    stemColor : randomPickOne(params.stemColors),
    stemWidth : params.stemWidth
  };
  const numFlowers = randomRangeIntFromArray(params.countRange);
  let baseOffset = new Vector3();
  for (let i = 0; i < numFlowers; i++) {
    flowerParams.bloomWidth = randomRangeFromArray(params.bloomWidthRange);
    flowerParams.bloomHeight = randomRangeFromArray(params.bloomHeightRange);
    flowerParams.stemHeight = randomRangeFromArray(params.stemHeightRange);
    const flower = makeFlowerGeometry(flowerParams);
    let nextOffset = randomDistanceVector2FromArray(params.separationRange);
    baseOffset = baseOffset.add(new THREE.Vector3(nextOffset.x, 0, nextOffset.y));
    flower.rotateX(randomRangeFromArray(params.tiltRange));
    flower.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    flower.translate(baseOffset.x, 0, baseOffset.z);
    geometry.merge(flower);
  }

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.verticesNeedUpdate = true;
    geometry.computeFlatVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    defaultMaterial,
  );
}

function makeFlowerGeometry(params) {
  // params: stemColor, bloomColor, bloomWidth, bloomHeight, stemHeight, stemWidth
  const stemWidth = params.stemWidth;
  const stemHeight = params.stemHeight;
  const bloomHeight = params.bloomHeight;
  const bloomColor = params.bloomColor;
  const stemColor = params.stemColor;

  const geometry = new THREE.Geometry();

  const bloom = new THREE.ConeGeometry(params.bloomWidth, bloomHeight, 3);
  bloom.translate(0, stemHeight + bloomHeight * 0.5, 0);
  bloom.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  bloom.faces.forEach(f => f.color.set(bloomColor));
  geometry.merge(bloom);

  
  const stem = new THREE.CylinderGeometry(stemWidth, stemWidth, stemHeight, 3);
  stem.translate(0, stemHeight * 0.5, 0);
  stem.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  stem.faces.forEach(f => f.color.set(stemColor));
  geometry.merge(stem);

  // geometry.scale(20,20,20);

  return geometry;
}

export function makeRock() { // todo: use params
  const geometry = new THREE.Geometry();
  const rock = new THREE.SphereGeometry(randomRange(0.25,0.9), randomRangeInt(4,6), randomRangeInt(4,6));
  rock.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  rock.faces.forEach(f => f.color.set(0x888888));
  jitterVertices(rock, 0.1);

  // optionally add other bumps?
  
  geometry.merge(rock);

  return new THREE.Mesh(
    geometry,
    defaultMaterial,
  );
}

export function makePebbleCluster(params) { // todo: use params

}

function makePebbleGeometry(params) {
  // options: color, size, jitterDist
}