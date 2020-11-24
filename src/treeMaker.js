// started from tutorial at: https://medium.com/@joshmarinacci/procedural-geometry-trees-896cc06f54ce

import _ from 'lodash';
import * as THREE from 'three';

import {
  randomRange, 
  randomRangeFromArray,
  jitterVertices, 
  randomRangeInt, 
  remapValue, 
  RADIANS_FOR_1_DEGREE, 
  RADIANS_FOR_90_DEGREES, 
  RADIANS_FOR_360_DEGREES, 
  RADIANS_FOR_180_DEGREES
} from './util';

import {prepRandomSeed, finalizeMesh, USE_HARD_EDGE_LOWPOLY_STYLE} from './generatorUtil';


const defaultTierWidths = [1.4, 2, 2.6];
const defaultTierYOffsets = [2.2, 1.1, 0];
const widthScaleRange = [0.5, 1.0];
const tierYOffsetVariation = [0, 0.25];
const leafBottomOffsetRange = [1.25, 2];
const tierScaleOffsetVariation = [-0.125, 0.125];
const trunkWidthRange = [0.2, 0.35];
const finalScaleRange = [0.5, 1.05];
const treeMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors, flatShading: USE_HARD_EDGE_LOWPOLY_STYLE});
const tiltRange = [-0.04,0.04];

export function makeLollipopTree() {
  const geometry = new THREE.Geometry();

  const leafball = new THREE.SphereGeometry(2.5,5,4);
  leafball.translate(0, 4.5, 0);
  leafball.rotateY(randomRange(0,1));
  leafball.faces.forEach(f => f.color.set(0x009922));
  jitterVertices(leafball, 0.1);
  geometry.merge(leafball);

  const trunkWidth = randomRangeFromArray(trunkWidthRange);
  const trunkHeight = 3;
  const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, trunkHeight, 5);
  trunk.translate(0, trunkHeight * 0.5, 0);
  trunk.rotateY(randomRange(0, 1));
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  const randomScale = randomRangeFromArray(finalScaleRange);
  geometry.scale(randomScale, randomScale, randomScale);

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.verticesNeedUpdate = true;
    geometry.computeFlatVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );
}

export function makeDeadTree() {
  const geometry = new THREE.Geometry();

  const trunkWidth = randomRangeFromArray(trunkWidthRange) * 0.7;
  const trunkHeight = randomRange(3, 5);
  const trunk = new THREE.CylinderGeometry(trunkWidth * 0.5, trunkWidth, trunkHeight, 5);
  trunk.translate(0, trunkHeight * 0.5, 0);
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  const minBranches = 4; // should move this outside
  const maxBranches = 9; // should move this outside
  const numBranches = randomRangeInt(minBranches, maxBranches);

  const minOrientationIncrement = RADIANS_FOR_90_DEGREES;
  const maxOrientationIncrement = RADIANS_FOR_180_DEGREES;

  const branchHeightMin = 0.75; // dist from base

  const branchHeightMax = trunkHeight - 0.75;
  const branchWidth = trunkWidth * 0.5;
  const branchLengthRange = [0.4, 0.7]; // should move this outside
  const branchTaperRange = [0.35, 0.85];
  
  let lastOrientation = 0;
  for (let i = 0; i < numBranches; i++) {
    const branchLength = randomRangeFromArray(branchLengthRange) / (i * 0.25 + 1); // note: tendency to get smaller as they go up (should move rate outside)
    const branchTaperFactor = randomRangeFromArray(branchTaperRange);
    const branch = new THREE.CylinderGeometry(branchWidth, branchWidth * branchTaperFactor, branchLength, 5);
    const branchOrientation = lastOrientation + randomRange(minOrientationIncrement, maxOrientationIncrement);
    const branchOffset = new THREE.Vector2((branchLength * 0.5 ) + (trunkWidth * 0.25) - 0.05, 0); // to push branch outside of the trunk
    const branchPosY = remapValue(i, 0, numBranches-1, branchHeightMin, branchHeightMax); // todo: make the interval a little more variable
    
    branch.rotateZ(RADIANS_FOR_90_DEGREES);
    branch.rotateY(branchOrientation);
    branchOffset.rotateAround(new THREE.Vector2(0,0), -branchOrientation); // aligns the branchoffset amounts to the angle of the branch rotation
    branch.translate(branchOffset.x, branchPosY, branchOffset.y);

    branch.faces.forEach(f => f.color.set(0x604011));
    geometry.merge(branch);
    
    lastOrientation = branchOrientation;
  }

  const randomScale = randomRangeFromArray(finalScaleRange);
  geometry.scale(randomScale, randomScale, randomScale);
  geometry.rotateX(randomRange(0, 15 * RADIANS_FOR_1_DEGREE));
  geometry.rotateY(randomRange(0, 6 * RADIANS_FOR_360_DEGREES));

  geometry.verticesNeedUpdate = true;
  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.computeFlatVertexNormals();
  } else {
    geometry.computeFaceNormals();
  }

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );
}

export function makeTreeStump() {
  const geometry = new THREE.Geometry();
  const trunkWidth = randomRangeFromArray(trunkWidthRange);
  const trunkTaper = randomRangeFromArray([0.85, 1]);
  const trunkHeight = randomRange(0.5,1);
  const trunk = new THREE.CylinderGeometry(trunkWidth * trunkTaper, trunkWidth, trunkHeight, 7);
  trunk.translate(0, trunkHeight * 0.45, 0);
  trunk.rotateY(randomRange(0, RADIANS_FOR_360_DEGREES));
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.verticesNeedUpdate = true;
    geometry.computeFlatVertexNormals();
  }

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );
}

export function makeConiferTree() {
  const geometry = new THREE.Geometry();
  const leafWidthScale = randomRangeFromArray(widthScaleRange);
  const leafBottom = randomRangeFromArray(leafBottomOffsetRange);

  _.each(defaultTierWidths, (width, index) => {
    const tierWidth = (width * leafWidthScale) + randomRangeFromArray(tierScaleOffsetVariation);
    const tierHeight = 2;
    const radialSegments = 5;
    const tierY = leafBottom + defaultTierYOffsets[index] + randomRangeFromArray(tierYOffsetVariation) + tierHeight * 0.5 - tierScaleOffsetVariation[1];
    
    const leafTier = new THREE.ConeGeometry(tierWidth, tierHeight, radialSegments)
    leafTier.translate(0, tierY, 0);
    leafTier.rotateY(randomRange(0, 1));
    leafTier.faces.forEach(f => f.color.set(0x008022));
    geometry.merge(leafTier);
  });

  const trunkWidth = randomRangeFromArray(trunkWidthRange);
  const trunkHeight = 2;
  const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, trunkHeight, 5);
  trunk.translate(0,trunkHeight * 0.5 - 0.1, 0);
  trunk.rotateY(randomRange(0, 1));
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  const randomScale = randomRangeFromArray(finalScaleRange);
  geometry.scale(randomScale, randomScale, randomScale);
  geometry.rotateZ(randomRangeFromArray(tiltRange));
  geometry.rotateX(randomRangeFromArray(tiltRange));

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    geometry.verticesNeedUpdate = true;
    geometry.computeFlatVertexNormals();
  }

  // for reference: BufferGeometry is supposed to be more performant
  // const performantGeometry = new BufferGeometry();
  // performantGeometry.fromGeometry(geometry);

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );
}