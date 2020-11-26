import _ from 'lodash';
import * as THREE from 'three';

import {
  randomRange, 
  randomRangeFromArray,
  jitterVertices,
  remapValue, 
  RADIANS_FOR_1_DEGREE, 
  RADIANS_FOR_90_DEGREES, 
  RADIANS_FOR_360_DEGREES, 
  RADIANS_FOR_180_DEGREES
} from './util';

import {finalizeMesh, USE_HARD_EDGE_LOWPOLY_STYLE} from './generatorUtil';
import { MeshGenerator } from './MeshGenerator';

const treeMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors, flatShading: USE_HARD_EDGE_LOWPOLY_STYLE});

export const LollipopTreeMaker = new MeshGenerator({
  generatorParams : {
    trunkHeight : { range : [3.75, 4.25] },
    trunkWidth : { range : [0.28, 0.365] },
    trunkColor : { options : [0x604011, 0x573f1e], type : 'color' },
    leafballRadius : { range : [1.9, 2.4] },
    leafballColor : { options : [0x009922, 0x997d], type : 'color' },
    leafballJitterDistance : { value : 0.1 },
    finalScale : { range : [0.5, 1.05] },
    seed : { type : 'seed' }
  },
  generatorFunction : (params) => {
    const geometry = new THREE.Geometry();

    const leafball = new THREE.SphereGeometry(params.leafballRadius, 5, 4);
    leafball.translate(0, params.trunkHeight + params.leafballRadius - params.leafballJitterDistance - 0.325, 0);
    leafball.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    leafball.faces.forEach(f => f.color.set(params.leafballColor));
    jitterVertices(leafball, params.leafballJitterDistance);
    geometry.merge(leafball);

    const trunkWidth = params.trunkWidth;
    const trunkHeight = params.trunkHeight;
    const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, trunkHeight, 5);
    trunk.translate(0, trunkHeight * 0.5, 0);
    trunk.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    trunk.faces.forEach(f => f.color.set(params.trunkColor));
    geometry.merge(trunk);

    const finalScale = params.finalScale;
    geometry.scale(finalScale, finalScale, finalScale);

    if (USE_HARD_EDGE_LOWPOLY_STYLE) {
      geometry.verticesNeedUpdate = true;
      geometry.computeFlatVertexNormals();
    }

    return new THREE.Mesh(
      geometry,
      treeMaterial,
    );
  }
})

export const DeadTreeMaker = new MeshGenerator({
  generatorParams : {
    trunkWidth : { range : [0.2 * 0.7, 0.35 * 0.7] },
    trunkHeight : { range : [3, 5] },
    trunkColor : { options : [0x604011, 0x573f1e, 0x342c23, 0x373330], type : 'color' },
    branchCount : { range : [4, 9], type : 'int' },
    branchStartDist : { range : [0.725, 0.85] },
    branchEndDist : { range : [0.75, 0.95] }, // subtracted from trunk height
    branchWidthFactor : { range : [0.475, 0.5] }, // multiplied by trunk width
    branchLengthRange : { value : [0.4, 0.7], type : 'range' },
    branchTaperRange : { value : [0.35, 0.85], type : 'range' },
    branchDiminishRate : {value : 0.25 },
    tilt : { range : [0, 15] },
    finalScale : { range : [0.5, 1.05] },
    seed : { type : 'seed' }
  },
  generatorFunction : (params) => {
    const geometry = new THREE.Geometry();

    const trunkWidth = params.trunkWidth;
    const trunkHeight = params.trunkHeight;
    const trunkColor = params.trunkColor;
    const trunk = new THREE.CylinderGeometry(trunkWidth * 0.5, trunkWidth, trunkHeight, 5);
    trunk.translate(0, trunkHeight * 0.5, 0);
    trunk.faces.forEach(f => f.color.set(trunkColor));
    geometry.merge(trunk);

    const numBranches = params.branchCount

    const minOrientationIncrement = RADIANS_FOR_90_DEGREES;
    const maxOrientationIncrement = RADIANS_FOR_180_DEGREES;

    const branchHeightMin = params.branchStartDist; // dist from base
    const branchHeightMax = trunkHeight - params.branchEndDist;

    const branchWidth = trunkWidth * params.branchWidthFactor;
    const branchLengthRange = params.branchLengthRange;
    const branchTaperRange = params.branchTaperRange;
    
    let lastOrientation = 0;
    for (let i = 0; i < numBranches; i++) {
      const branchLength = randomRangeFromArray(branchLengthRange) / (i * params.branchDiminishRate + 1); // tendency to get smaller as they go up
      const branchTaperFactor = randomRangeFromArray(branchTaperRange);
      const branch = new THREE.CylinderGeometry(branchWidth, branchWidth * branchTaperFactor, branchLength, 5);
      const branchOrientation = lastOrientation + randomRange(minOrientationIncrement, maxOrientationIncrement);
      const branchOffset = new THREE.Vector2((branchLength * 0.5 ) + (trunkWidth * 0.25) - 0.05, 0); // to push branch outside of the trunk
      const branchPosY = remapValue(i, 0, numBranches-1, branchHeightMin, branchHeightMax); // todo: make the interval a little more variable
      
      branch.rotateZ(RADIANS_FOR_90_DEGREES);
      branch.rotateY(branchOrientation);
      branchOffset.rotateAround(new THREE.Vector2(0,0), -branchOrientation); // aligns the branchoffset amounts to the angle of the branch rotation
      branch.translate(branchOffset.x, branchPosY, branchOffset.y);

      branch.faces.forEach(f => f.color.set(trunkColor));
      geometry.merge(branch);
      
      lastOrientation = branchOrientation;
    }

    const finalScale = params.finalScale;
    geometry.scale(finalScale, finalScale, finalScale);
    geometry.rotateX(randomRange(0, params.tilt * RADIANS_FOR_1_DEGREE));
    geometry.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));

    return finalizeMesh(geometry, this, params);
  }
});

export const TreeStumpMaker = new MeshGenerator({
  generatorParams : {
    width : { range : [0.2, 0.375] },
    height : { range : [0.5, 1] },
    taperFactor : { range : [0.85, 1] },
    color : { options : [0x604011, 0x573f1e, 0x342c23, 0x373330], type : 'color' },
    seed : { type : 'seed' }
  },
  generatorFunction : (params) => {
    const geometry = new THREE.Geometry();
    const trunkWidth = params.width;
    const trunkHeight = params.height;
    const trunk = new THREE.CylinderGeometry(trunkWidth * params.taperFactor, trunkWidth, trunkHeight, 7);
    trunk.translate(0, trunkHeight * 0.5 - 0.125, 0);
    trunk.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    trunk.faces.forEach(f => f.color.set(params.color));
    geometry.merge(trunk);

    return finalizeMesh(geometry, this, params);
  }
});

export const ConiferMaker = new MeshGenerator({
  generatorParams : {
    trunkWidth : { range : [0.2, 0.35] },
    trunkHeight : { range : [1.5, 2.8] },
    trunkColor : { options : [0x604011, 0x4d3616], type : 'color' },
    leafColor : { options : [0x008022, 0xa7052], type : 'color'},
    leafTierWidths : { value : [1.4, 2, 2.6], type : 'array:number'}, // 2.6 / 2 = 1.3; 2 / 1.4 = 1.4285714286 (rounded), so maybe tierScaleFactor is ~1.4?
    leafTierYOffsets : { value : [2.2, 1.1, 0], type : 'array:number' }, // tier spacing factor is 1.1?
    leafWidthScale : { range : [0.5, 0.9] },
    tierYOffsetVariation : { value : [0, 0.25], type : 'range' },
    tierScaleOffsetVariation : { value : [-0.125, 0.125], type : 'range' },
    finalScale : { range : [0.5, 1.05] },
    tilt : { range : [-0.04,0.04] },
    seed : { type : 'seed' }
  },
  generatorFunction : (params) => {
    // this started from the tutorial at: https://medium.com/@joshmarinacci/procedural-geometry-trees-896cc06f54ce
    const geometry = new THREE.Geometry();
    const leafWidthScale = params.leafWidthScale;
    const leafBottom = params.trunkHeight - params.tierYOffsetVariation[1];
    const tierScaleOffsetVariation = params.tierScaleOffsetVariation;
    const tierYOffsetVariation = params.tierYOffsetVariation;
    const leafTierYOffsets = params.leafTierYOffsets;
    const radialSegments = 5;
    const leafColor = params.leafColor;

    _.each(params.leafTierWidths, (width, index) => {
      const tierWidth = (width * leafWidthScale) + randomRangeFromArray(tierScaleOffsetVariation);
      const tierHeight = 2;
      const tierY = leafBottom + leafTierYOffsets[index] + randomRangeFromArray(tierYOffsetVariation) + tierHeight * 0.5 - 0.125;
      
      const leafTier = new THREE.ConeGeometry(tierWidth, tierHeight, radialSegments)
      leafTier.translate(0, tierY, 0);
      leafTier.rotateY(randomRange(0, 1));
      leafTier.faces.forEach(f => f.color.set(leafColor));
      geometry.merge(leafTier);
    });

    const trunkWidth = params.trunkWidth;
    const trunkHeight = params.trunkHeight;
    const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, trunkHeight, 5);
    trunk.translate(0, trunkHeight * 0.5 - 0.1, 0);
    trunk.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
    trunk.faces.forEach(f => f.color.set(params.trunkColor));
    geometry.merge(trunk);

    const finalScale = params.finalScale;
    geometry.scale(finalScale, finalScale, finalScale);
    geometry.rotateX(params.tilt);
    geometry.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));

    return finalizeMesh(geometry, this, params);
  }
});