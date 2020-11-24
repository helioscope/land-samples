import _ from 'lodash';
import * as THREE from 'three';

import {
  randomRange, 
  randomRangeFromArray,
  jitterVertices,
  RADIANS_FOR_1_DEGREE,
  RADIANS_FOR_360_DEGREES, 
  RADIANS_FOR_180_DEGREES,
  randomPickOne,
  randomDistanceVector2FromArray,
} from './util';
import {
  finalizeMesh
} from './generatorUtil';
import {MeshGenerator} from './MeshGenerator';


function sproutGeometryClump(parentGeometry, clumpParams, getObjectParams) {
  const numObjects = clumpParams.count;
  const spawnFunc = clumpParams.spawnFunction;
  let baseOffset = new THREE.Vector3();
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


export const FlowerBunchMaker = new MeshGenerator({
  generatorParams : {
    count : { range : [2,5], type : 'int'},
    separationRange : { value : [0.18, 0.4], type: 'range' },
    tiltRange : { value : [RADIANS_FOR_1_DEGREE * -12, RADIANS_FOR_1_DEGREE * 12], type: 'range'},
    stemHeightRange : { value : [0.25, 0.5], type: 'range'}, 
    stemWidth : { value : 0.02 },
    stemTaper : { value : 0.55 }, // taper factor -- 1 = no tapering toward the top, 0 = taper into a point at the top
    bloomWidthRange : { value : [0.064, 0.125], type : 'range' },
    bloomHeightRange : { value : [0.05, 0.06], type : 'range' }, // might be better to use an aspect ratio range, so flowers in a bunch are more self-similar
    stemColor : {options : [0x00C980], type: 'color'},
    bloomColor : {options : [0xFFFFFF, 0xFFDD00, 0x0000D0, 0xFF7700, 0xFF0088], type: 'color'},
    seed : {type : 'seed'} // if not provided, will auto-generate
  },
  generatorFunction : (params) => {
    let geometry = new THREE.Geometry();
    const flowerParams = {
      bloomColor : params.bloomColor,
      stemColor : params.stemColor,
      stemWidth : params.stemWidth
    };
    
    sproutGeometryClump(geometry, {
      count : params.count,
      separationRange : params.separationRange,
      spawnFunction : makeFlowerGeometry,
      tiltRange : params.tiltRange
    }, (spawnIndex) => {
      flowerParams.bloomWidth = randomRangeFromArray(params.bloomWidthRange);
      flowerParams.bloomHeight = randomRangeFromArray(params.bloomHeightRange);
      flowerParams.stemHeight = randomRangeFromArray(params.stemHeightRange);
      return flowerParams;
    });

    return finalizeMesh(geometry, this, params);
  }
});

function makeFlowerGeometry(params) {
  const stemWidth = params.stemWidth;
  const stemHeight = params.stemHeight;
  const bloomHeight = params.bloomHeight;
  const bloomColor = params.bloomColor;
  const stemColor = params.stemColor;
  const facingAngle = randomRange(0,RADIANS_FOR_360_DEGREES);

  const geometry = new THREE.Geometry();

  const bloom = new THREE.ConeGeometry(params.bloomWidth, bloomHeight, 3);
  bloom.rotateX(RADIANS_FOR_180_DEGREES);
  bloom.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  bloom.translate(0, stemHeight + bloomHeight * 0.5 - 0.03, 0);
  bloom.faces.forEach(f => f.color.set(bloomColor));
  // jitterVertices(bloom, 0.01); // low ROI - not really visible without zooming in carefully
  geometry.merge(bloom);

  
  const stem = new THREE.CylinderGeometry(stemWidth * 0.55, stemWidth, stemHeight, 3);
  stem.translate(0, stemHeight * 0.5, 0);
  stem.rotateY(facingAngle);
  stem.faces.forEach(f => f.color.set(stemColor));
  geometry.merge(stem);

  return geometry;
}


export const StalkClumpMaker = new MeshGenerator({
  generatorParams : {
    count : { range : [1,5], type : 'int'},
    widthRange : { value : [0.02, 0.04], type: 'range'},
    heightRange : { value : [0.15, 0.7], type: 'range'}, 
    taperRange : { value : [0.25, 0.6], type: 'range'}, // taper factor -- 1 = no tapering toward the top, 0 = taper into a point at the top
    separationRange : { value : [0.2, 0.4], type: 'range' },
    tiltRange : { value : [RADIANS_FOR_1_DEGREE * -24, RADIANS_FOR_1_DEGREE * 24], type: 'range'},
    colors : {value : [0x118840, 0x337540], type: 'options:color'}, // not supported. should this be type : 'options:color'?
    seed : {type : 'seed'} // if not provided, will auto-generate
  },
  generatorFunction : (params) => {
    let geometry = new THREE.Geometry();
    sproutGeometryClump(geometry, {
      count : params.count,
      separationRange : params.separationRange,
      tiltRange : params.tiltRange,
      spawnFunction : makeStalkGeometry,
    }, (spawnIndex) => {
      return {
        stalkColor : randomPickOne(params.colors),
        stalkWidth : randomRangeFromArray(params.widthRange),
        stalkHeight : randomRangeFromArray(params.heightRange),
        taperFactor : randomRangeFromArray(params.taperRange),
      };
    });

    geometry.translate(0, -0.015, 0); // help embed rotated stalk bottoms into the ground

    return finalizeMesh(geometry, this, params);
  }
});

function makeStalkGeometry(params) {
  const stalkWidth = params.stalkWidth;
  const stalkHeight = params.stalkHeight;
  const stalkColor = params.stalkColor;
  const stalk = new THREE.CylinderGeometry(stalkWidth * params.taperFactor, stalkWidth, stalkHeight, 3);
  stalk.translate(0, stalkHeight * 0.5, 0);
  stalk.rotateY(randomRange(0,RADIANS_FOR_360_DEGREES));
  stalk.faces.forEach(f => f.color.set(stalkColor));

  return stalk;
}


export const StickMaker = new MeshGenerator({
  generatorParams : {
    color : {options : [0x5F4030], type : 'color'},
    length : { range : [0.24, 1.05] },
    width : { range : [0.03, 0.07] },
    taperFactor : { range : [0.25,0.95] },
    jitterDistance : { value : 0.023 },
    angle : {range : [RADIANS_FOR_1_DEGREE * 70, RADIANS_FOR_1_DEGREE * 100]},
    seed : {type : 'seed'}
  },
  generatorFunction : (params) => {
    const width = params.width;
    const length = params.length;
    const color = params.color;
    const facingAngle = randomRange(0,RADIANS_FOR_360_DEGREES);
    
    const stick = new THREE.CylinderGeometry(width * params.taperFactor, width, length, 3, 2);
    jitterVertices(stick, params.jitterDistance);
    stick.translate(0, length * 0.5, 0);
    stick.rotateX(params.angle);
    stick.rotateY(facingAngle);
    stick.faces.forEach(f => f.color.set(color));

    return finalizeMesh(stick, this, params);
  }
})


export const RockMaker = new MeshGenerator({
  generatorParams : {
    size : { range : [0.25,0.9] },
    widthSegments : { range : [5,7], type : 'int' },
    heightSegments : { range : [5,7], type : 'int' },
    jitterDistance : { value : 0.075 },
    color: { options : [0x888888, 0x777777, 0x897252, 0x6f786f], type : 'color' },
    heightScale : { range : [0.3, 1.1] },
    widthScale : { range : [0.45, 1] },
    tilt : { range : [-10 * RADIANS_FOR_1_DEGREE, 10 * RADIANS_FOR_1_DEGREE] },
    seed: { type : 'seed' },
  },
  generatorFunction : (params) => {
    const geometry = new THREE.Geometry();
    const rock = new THREE.SphereGeometry(params.size, params.widthSegments, params.heightSegments);
    const color = params.color;
    const facingAngle = randomRange(0,RADIANS_FOR_360_DEGREES);

    jitterVertices(rock, params.jitterDistance);
    
    rock.scale(params.widthScale, params.heightScale, 1);
    rock.rotateZ(params.tilt);
    rock.rotateY(facingAngle);
    rock.faces.forEach(f => f.color.set(color));

    // optionally add other bumps?
    
    geometry.merge(rock);
    
    return finalizeMesh(geometry, this, params);
  }
});
