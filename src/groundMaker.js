// started from tutorial at: https://blog.mozvr.com/low-poly-style-terrain-generation/

import _ from 'lodash';
import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import {RADIANS_FOR_180_DEGREES, RADIANS_FOR_1_DEGREE, RADIANS_FOR_360_DEGREES, RADIANS_FOR_90_DEGREES, randomRange, randomRangeFromArray, randomRangeIntFromArray, remapValue, remapValueFromArrays} from './util';
import {finalizeMesh, formPlaneBorder, USE_HARD_EDGE_LOWPOLY_STYLE} from './generatorUtil';


let noiseSeed = new Date().toString();
let simplex = new SimplexNoise(noiseSeed);
const heightmapCanvas = document.createElement('canvas');
const heightmapContext = heightmapCanvas.getContext('2d');

const NOISE_OCTAVES = 16;

// const heightColors = [// more toy-like
//   0x463914,
//   0x003911,
//   0x004511,
//   0x004911,
//   0x005212,
//   0x006014,
//   0x007020,
// ]; // each entry's index is its y-position

const heightColors = [ // more realistic
  0x463914,
  0x323c1b,
  0x323c1b,
  0x385919,
  0x224911,
  0x206014,
  0x485F3F,
]; // each entry's index is its y-position

const noiseHeightRange = [-0.5, 6.5];

const jitterXRange = [-0.15, 0.15];
const jitterZRange = [-0.15, 0.15];
const jitterYRange = [-0.2, 0.2];

const bigLakeCountRange = [0, 1];
const bigLakeWidthRange = [5, 20];
const bigLakeIntensity = 0.8;
const bigLakeRimIntensity = 0.125;
const bigLakeRimThickness = 3;
const maxLakeAspectRatio = 2.5; // note: aspect ratio enforcement will *not* go beyond the width-range (below min or above max)

const islandCountRange = [0, 3];
const islandRimThicknessRange = [0,4];
const islandHeightRange = [30, 150]; // note: corresponds to color-channel value (0-255) and should be an integer
const islandIntensity = 0.85; // corresponds to opacity of height coloring
const islandRimIntensity = 0.3; // ditto
const islandMaxRelativeAngle = 20; // max rotation (either way) away from the lake's angle

const smallLakeCountRange = [0, 4];
const smallLakeWidthRange = [1,5];
const smallLakeLengthRange = [1,5];
const smallLakeIntensity = 0.85;
const smallLakeRimIntensity = 0.275;
const smallLakeRimThickness = 2.5;


function sampleNoise(x, y) {
  return remapValue(simplex.noise2D(x, y), -1,1, 0,1);
}
function sampleOctavedNoise(x, y, octaveCount) {
  let value = 0;
  let freq = 1; // doubles for each octave
  let strength = 1; // diminishes with each octave
  let totalOctaveStrength = 0;

  for(let i = 0; i < octaveCount; i++) {
      value += sampleNoise(x*freq, y*freq) * strength;
      totalOctaveStrength += strength;
      strength /= 2;
      freq  *= 2;
  }
  return value / totalOctaveStrength;
}

function generateTexture(width, height) {
  heightmapCanvas.width = width;
  heightmapCanvas.height = height;

  const c = heightmapContext;

  // clear rect
  c.fillStyle = 'black';
  c.fillRect(0, 0, width, height);

  generateNoiseTexture(width, height);
  generateLakes(width, height);
  
  return heightmapContext.getImageData(0,0,width,height);
}

function generateNoiseTexture(width, height) {
  const c = heightmapContext;
  for(let x = 0; x < width; x++) {
      for(let y = 0; y < height; y++) {
          let value =  sampleOctavedNoise(x/width, y/height, NOISE_OCTAVES);
          const percentage = (100 * value).toFixed(2)+'%';
          c.fillStyle = `rgb(${percentage},${percentage},${percentage})`;
          c.fillRect(x,y, 1,1);
      }
  }0
}

function generateLakes(width, height) {
  const c = heightmapContext;
  const numBigLakes = randomRangeIntFromArray(bigLakeCountRange);
  const numSmallLakes = randomRangeIntFromArray(smallLakeCountRange);

  for (let i = 0; i < numSmallLakes; i++) {
    const lakeRadiusX = randomRangeFromArray(smallLakeWidthRange);
    const lakeRadiusY = randomRangeFromArray(smallLakeLengthRange);
    const lakeAngle = randomRange(0, RADIANS_FOR_180_DEGREES);
    const lakeCenterX = randomRange(0, width);
    const lakeCenterY = randomRange(0, height);

    c.beginPath();
    c.ellipse(lakeCenterX, lakeCenterY, lakeRadiusX, lakeRadiusY, lakeAngle, 0, RADIANS_FOR_360_DEGREES, false);
    c.fillStyle = `rgba(0,0,0,${smallLakeIntensity})`;
    c.fill();
    c.lineWidth = smallLakeRimThickness;
    c.strokeStyle = `rgba(0,0,0,${smallLakeRimIntensity})`;
    c.stroke();
  }

  for (let i = 0; i < numBigLakes; i++) {
    const lakeRadiusX = randomRangeFromArray(bigLakeWidthRange);
    const lakeRadiusY = randomRange(
      Math.max(bigLakeWidthRange[0], lakeRadiusX / maxLakeAspectRatio), 
      Math.min(bigLakeWidthRange[1], lakeRadiusX * maxLakeAspectRatio)
    );
    const lakeAngle = randomRange(0, RADIANS_FOR_180_DEGREES);
    const lakeCenterX = randomRange(0, width);
    const lakeCenterY = randomRange(0, height);
    const minLakeAxis = Math.min(lakeRadiusX, lakeRadiusY);
    // const numExtraEllipses = randomRangeInt(0,2); // later
    const numIslands = randomRangeIntFromArray(islandCountRange);

    c.beginPath();
    c.ellipse(lakeCenterX, lakeCenterY, lakeRadiusX, lakeRadiusY, lakeAngle, 0, RADIANS_FOR_360_DEGREES, false);
    c.fillStyle = `rgba(0,0,0,${bigLakeIntensity})`;
    c.fill();
    c.lineWidth = bigLakeRimThickness;
    c.fillStyle = `rgba(0,0,0,${bigLakeRimIntensity})`;
    c.stroke();

    // for (let j = 0; j < numExtraEllipses; j++) { // later
    //   let centerX = randomRange
    // }

    for (let j = 0; j < numIslands; j++) { 
      // note: this currently just tries to stay within the bounds of the minimum axis, rather than the entire lake's bounds
      let islandRadiusX = randomRange(1, Math.min(6, minLakeAxis - 2)); // EXTRACT 6? EXTRACT 2? EXTRACT 1?
      let islandRadiusY = randomRange(1, Math.min(6, minLakeAxis - 2)); // EXTRACT 6? EXTRACT 2? EXTRACT 1?
      let islandCenterX = randomRange(lakeCenterX - minLakeAxis + 1, lakeCenterX + minLakeAxis - 1); // EXTRACT 1?
      let islandCenterY = randomRange(lakeCenterY - minLakeAxis + 1, lakeCenterY + minLakeAxis - 1); // EXTRACT 1?
      let islandAngle = randomRange(lakeAngle - (RADIANS_FOR_1_DEGREE * islandMaxRelativeAngle), lakeAngle + (RADIANS_FOR_1_DEGREE * islandMaxRelativeAngle));
      let islandHeightValue = randomRangeIntFromArray(islandHeightRange);
      c.beginPath();
      c.ellipse(islandCenterX, islandCenterY, islandRadiusX, islandRadiusY, islandAngle, 0, RADIANS_FOR_360_DEGREES, false);
      c.lineWidth = randomRangeFromArray(islandRimThicknessRange);
      c.strokeStyle = `rgba(${islandHeightValue}, ${islandHeightValue}, ${islandHeightValue}, ${islandRimIntensity})`;
      c.stroke();
      c.fillStyle = `rgba(${islandHeightValue}, ${islandHeightValue}, ${islandHeightValue}, ${islandIntensity})`;
      c.fill();
    }
  }
}

function getColorForHeight(height) {
  if (height > heightColors.length) {
    return heightColors[heightColors.length];
  } else if (height < 0) {
    return heightColors[0];
  } else {
    // this isn't really optimized.
    // extremely minor improvement: could define colors as THREE.Color above.
    // alternatively: could pre-define a color gradient in a canvas context, save the image, assign the height range,
    //   then just pull the pixel for that height.
    let floor = Math.floor(height);
    let ceiling = Math.ceil(height);
    let remainder = height - floor;
    let colorBelow = new THREE.Color(heightColors[floor]);
    let colorAbove = new THREE.Color(heightColors[ceiling]);
    
    return colorBelow.lerp(colorAbove, remainder);
  }
}

export function makeGroundPlane(width, height, seed=undefined) {
  const borderSize = 1; // note: changing this might break things
  const sliceDepth = -5;
  const vertCountX = width + (borderSize * 2);
  const vertCountY = height + (borderSize * 2);
  const geometry = new THREE.PlaneGeometry(width + (borderSize * 2), height + (borderSize * 2), vertCountX - 1, vertCountY - 1);

  // note: the vertex count is larger than the face count by 1 (hence the subtraction above -- we want 1 texture sample per 1 vertex)
  // e.g. 2x2 faces means 3x3 vertices

  // also note: the plane geometry is generated on the x/y plane,
  // so using it as a ground plane (where y is the axis of gravity) requires rotating first (which we're currently doing at the end)

  if (seed !== undefined) {
    noiseSeed = seed;
    simplex = new SimplexNoise(noiseSeed);
  }

  const texture = generateTexture(width, height);
  for (let ty = 0; ty < height; ty++) {
    let inYInterior = ty > 0 && ty < height - 1;
    for (let tx = 0; tx < width; tx++) {
        const vertIndex = ((ty + borderSize) * (vertCountX) + (tx + borderSize));
        const textureIndex = (ty * width + tx);
        const value = texture.data[textureIndex*4]; // (sampling the red channel)
        const vert = geometry.vertices[vertIndex];
        
        vert.z = remapValueFromArrays(value, [0,255], noiseHeightRange);

        // some ideas from the tutorial:
        // if(vert.z > 2.5) vert.z *= 1.3; //exaggerate the peaks
        
        // a bit of extra mesh noise
        if (inYInterior && tx > 0 && tx < width - 1) { // this ground-axis displacement makes the outer edges rough -- easier to skip the outer edges
          vert.x += randomRangeFromArray(jitterXRange);
          vert.y += randomRangeFromArray(jitterZRange); // using Z for Y here is weird, and related to the rotation of the plane
        }
        vert.z += randomRangeFromArray(jitterYRange); // using Y for Z here is weird, and related to the rotation of the plane
    }
  }

  formPlaneBorder(geometry, vertCountX, vertCountY, sliceDepth);

  if (USE_HARD_EDGE_LOWPOLY_STYLE) {
    // coloring by face has a fun lo-fi retro-blend look
    _.each(geometry.faces, (face) => {
      const vertA = geometry.vertices[face.a];
      const vertB = geometry.vertices[face.b];
      const vertC = geometry.vertices[face.c];

      if (vertA.z == sliceDepth || vertB.z == sliceDepth || vertC.z == sliceDepth) {
        face.color.set(getColorForHeight(sliceDepth));
      } else {
        const maxHeight = Math.max(vertA.z ,Math.max(vertB.z, vertC.z));

        face.color.set(getColorForHeight(maxHeight));
      }
    });
  } else {
    // coloring per vertex is much smoother (and potentially more "blurry"-looking)
    _.each(geometry.faces, (face) => {
      const vertA = geometry.vertices[face.a];
      const vertB = geometry.vertices[face.b];
      const vertC = geometry.vertices[face.c];

      face.vertexColors = [
        getColorForHeight(vertA.z),
        getColorForHeight(vertB.z),
        getColorForHeight(vertC.z)
      ];
    });
  }

  geometry.rotateX(-RADIANS_FOR_90_DEGREES);
  
  return finalizeMesh(geometry, makeGroundPlane, {});
}

export function getHeightAt(x, y) { // this is a VERY rough height value -- better to just raycast the terrain
  let valueAtPosition = heightmapContext.getImageData(x+heightmapCanvas.width*0.5, y+heightmapCanvas.height*0.5, 1,1).data[2];
  return remapValueFromArrays(valueAtPosition, [0,255], noiseHeightRange);
}