import _ from 'lodash';
import * as THREE from 'three';
import { Mesh, Vector3 } from 'three';

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
const slightlyEmissiveMaterial = new THREE.MeshLambertMaterial({emissive: 0x2F2F2F, vertexColors: THREE.VertexColors, flatShading: USE_HARD_EDGE_LOWPOLY_STYLE});

const defaultFlowerBunchParams = {
  stemColors : [0x00C980],
  bloomColors : [0xFFFFFF],
  bloomWidthRange : [0.06, 0.1125],
  bloomHeightRange : [0.05, 0.06], // might be better to use an aspect ratio range, so flowers in a bunch are more self-similar
  stemHeightRange : [0.2, 0.5],
  stemWidth : 0.02,
  countRange : [2,4],
  separationRange : [0.125, 0.35], // not entirely guaranteed (separation distance is only measured against last location)
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
  sproutGeometryClump({
    count : randomRangeIntFromArray(params.countRange),
    separationRange : params.separationRange,
    spawnFunction : makeFlowerGeometry,
    tiltRange : params.tiltRange
  }, geometry, (spawnIndex) => {
    flowerParams.bloomWidth = randomRangeFromArray(params.bloomWidthRange);
    flowerParams.bloomHeight = randomRangeFromArray(params.bloomHeightRange);
    flowerParams.stemHeight = randomRangeFromArray(params.stemHeightRange);
    return flowerParams;
  });

  geometry.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.computeFlatVertexNormals();
  } else {
    geometry.computeVertexNormals();
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
  bloom.rotateX(RADIANS_FOR_180_DEGREES);
  bloom.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  bloom.translate(0, stemHeight + bloomHeight * 0.5 - 0.03, 0);
  // jitterVertices(bloom, 0.01); // low ROI - not really visible without zooming in carefully
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

function sproutGeometryClump(clumpParams, parentGeometry, getObjectParams) {
  const numObjects = clumpParams.count;
  const spawnFunc = clumpParams.spawnFunction;
  let baseOffset = new Vector3();
  for (let i = 0; i < numObjects; i++) {
    const objectParams = getObjectParams(i);
    const sprout = spawnFunc(objectParams);
    let nextOffset = randomDistanceVector2FromArray(clumpParams.separationRange);
    baseOffset = baseOffset.add(new THREE.Vector3(nextOffset.x, 0, nextOffset.y));
    sprout.rotateX(randomRangeFromArray(clumpParams.tiltRange));
    sprout.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    sprout.translate(baseOffset.x, 0, baseOffset.z);
    parentGeometry.merge(sprout);
  }
}

const defaultStalkClumpParams = {
  countRange : [1,5],
  separationRange : [0.2, 0.4],
  tiltRange : [RADIANS_FOR_1_DEGREE * -24, RADIANS_FOR_1_DEGREE * 24],
  stalkColors : [0x118840, 0x337540],
  stalkWidthRange : [0.02, 0.04],
  stalkHeightRange : [0.15, 0.7],
  stalkTaperRange : [0.25, 0.6], // taper factor -- 1 = no tapering toward the top, 0 = taper into a point at the top
}

export function makeStalkClump(params) {
  params = Object.assign({}, defaultStalkClumpParams, params);
  let geometry = new THREE.Geometry();

  sproutGeometryClump({
    count : randomRangeIntFromArray(params.countRange),
    separationRange : params.separationRange,
    spawnFunction : makeStalkGeometry,
    tiltRange : params.tiltRange
  }, geometry, (spawnIndex) => {
    return {
      stalkColor : randomPickOne(params.stalkColors),
      stalkWidth : randomRangeFromArray(params.stalkWidthRange),
      stalkHeight : randomRangeFromArray(params.stalkHeightRange),
      taperFactor : randomRangeFromArray(params.stalkTaperRange),
    };
  });

  geometry.translate(0,-0.015,0); // help embed rotated stalk bottoms into the ground

  geometry.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.computeFlatVertexNormals();
  } else {
    geometry.computeVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    defaultMaterial,
  );
}

function makeStalkGeometry(params) {
  // params: stalkColor, stalkHeight, stalkWidth, taperFactor
  const stalkWidth = params.stalkWidth;
  const stalkHeight = params.stalkHeight;
  const stalkColor = params.stalkColor;
  
  const stalk = new THREE.CylinderGeometry(stalkWidth * params.taperFactor, stalkWidth, stalkHeight, 3);
  stalk.translate(0, stalkHeight * 0.5, 0);
  stalk.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  stalk.faces.forEach(f => f.color.set(stalkColor));

  return stalk;
}

const defaultRandomStickParams = {
  colors : [0x5F4030],
  lengthRange : [0.24, 1.05],
  widthRange : [0.03, 0.07],
  taperFactorRange : [0.25,0.95],
  jitterDistance : 0.035,
  angleRange : [RADIANS_FOR_1_DEGREE * 70, RADIANS_FOR_1_DEGREE * 100],
};

export function makeRandomStick(params) {
  params = Object.assign({}, defaultRandomStickParams, params);
  return makeStick({
    color : randomPickOne(params.colors),
    length : randomRangeFromArray(params.lengthRange),
    width : randomRangeFromArray(params.widthRange),
    taperFactor : randomRangeFromArray(params.taperFactorRange),
    jitterDistance : params.jitterDistance,
    angle : randomRangeFromArray(params.angleRange)
  });
}

export function makeStick(params) {
  const width = params.width;
  const length = params.length;
  const color = params.color;
  
  const stick = new THREE.CylinderGeometry(width * params.taperFactor, width, length, 3, 2);
  jitterVertices(stick, params.jitterDistance);
  stick.translate(0, length * 0.5, 0);
  stick.rotateX(params.angle);
  stick.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  stick.faces.forEach(f => f.color.set(color));

  stick.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    stick.computeFlatVertexNormals();
  } else {
    stick.computeVertexNormals();
  }

  return new THREE.Mesh(
    stick,
    defaultMaterial
  );
}

const defaultRandomRockParams = {
  sizeRange : [0.25,0.9],
  widthSegmentsRange : [5,7],
  heightSegmentsRange : [5,7],
  colors : [0x888888, 0x777777],
  jitterDistance : 0.1,
  heightScaleRange : [0.3, 1.1],
  widthScaleRange : [0.35, 1],
  tiltRange : [-10 * RADIANS_FOR_1_DEGREE, 10 * RADIANS_FOR_1_DEGREE]
}

export function makeRandomRock(params) {
  params = Object.assign({}, defaultRandomRockParams, params);
  return makeRock({
    size : randomRangeFromArray(params.sizeRange),
    widthSegments : randomRangeIntFromArray(params.widthSegmentsRange),
    heightSegments : randomRangeIntFromArray(params.heightSegmentsRange),
    jitterDistance : params.jitterDistance,
    color: randomPickOne(params.colors),
    heightScale : randomRangeFromArray(params.heightScaleRange),
    widthScale : randomRangeFromArray(params.widthScaleRange),
    tilt : randomRangeFromArray(params.tiltRange)
  });
}
export function makeRock(params) {
  const geometry = new THREE.Geometry();
  const rock = new THREE.SphereGeometry(params.size, params.widthSegments, params.heightSegments);
  const color = params.color;

  jitterVertices(rock, 0.1);
  
  rock.scale(params.widthScale, params.heightScale, 1);
  rock.rotateZ(params.tilt);
  rock.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  rock.faces.forEach(f => f.color.set(color));

  // optionally add other bumps?
  
  geometry.merge(rock);

  geometry.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.computeFlatVertexNormals();
  } else {
    geometry.computeVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    defaultMaterial,
  );
}