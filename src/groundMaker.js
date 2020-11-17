import _ from 'lodash';
import * as THREE from 'three';
import SimplexNoise from 'simplex-noise';

import {randomRange, remapValue} from './util';


let noiseSeed = new Date().toString();
let simplex = new SimplexNoise(noiseSeed);
const heightmapCanvas = document.createElement('canvas');
const heightmapContext = heightmapCanvas.getContext('2d');

const NOISE_OCTAVES = 16;


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
  const c = heightmapContext;
  
  heightmapCanvas.width = width;
  heightmapCanvas.height = height;

  c.fillStyle = 'black';
  c.fillRect(0,0,width, height);

  for(let x = 0; x < width; x++) {
      for(let y = 0; y < height; y++) {
          let value =  sampleOctavedNoise(x/width, y/height, NOISE_OCTAVES);
          const percentage = (100 * value).toFixed(2)+'%';
          c.fillStyle = `rgb(${percentage},${percentage},${percentage})`;
          c.fillRect(x,y, 1,1);
      }
  }
  return c.getImageData(0,0,width,height);
}

const heightColors = [
  0x002911,
  0x003911,
  0x004511,
  0x004911,
  0x005212,
  0x006014,
  0x007720,
]; // each entry's index is its y-position

function getColorForHeight(height) {
  if (height > heightColors.length) {
    return heightColors[heightColors.length];
  } else if (height < 0) {
    return heightColors[0];
  } else {
    let floor = Math.floor(height);
    // let remainder = height - floor;
    // todo: interpolate color
    // alternatively could define gradient in a canvas context, save the image, and just pull the pixels
    return heightColors[floor];
  }
}

export function makeGroundPlane(width, height, seed=undefined) {
  console.log('generating plane:', width, height);
  const geometry = new THREE.PlaneGeometry(width, height, width, height);

  if (seed !== undefined) {
    noiseSeed = seed;
    simplex = new SimplexNoise(noiseSeed);
  }

  const texture = generateTexture(width, height);
  console.log('texture dimensions:', width)
  for(let ty = 0; ty < texture.height; ty++) {
    for (let tx = 0; tx < texture.width; tx++) {
        const vertIndex = (ty * (texture.height) + tx);
        const nextVertIndex = (ty * (texture.height+1) + tx);
        const value = texture.data[vertIndex*4]; // (sampling the red channel)
        const vert = geometry.vertices[nextVertIndex];
        
        vert.z = remapValue(value, 0,255, 0,7);

        // if(vert.z > 2.5) vert.z *= 1.3 //exaggerate the peaks
        
        // vert.x += map(Math.random(),0,1,-0.5,0.5) //jitter x
        // vert.y += map(Math.random(),0,1,-0.5,0.5) //jitter y
    }
  }

  _.each(geometry.faces, (face) => {
    //get three verts for the face
    const vertA = geometry.vertices[face.a];
    const vertB = geometry.vertices[face.b];
    const vertC = geometry.vertices[face.c];

    //assign colors based on the highest point of the face
    const max = Math.max(vertA.z ,Math.max(vertB.z, vertC.z));

    face.color.set(getColorForHeight(max));
  });

  geometry.rotateX(Math.PI/-2);
  // geometry.rotateY(Math.PI);
  geometry.verticesNeedUpdate = true;
  // geometry.computeFlatVertexNormals(); // for flat shading, in common 'lowpoly' style
  geometry.computeVertexNormals();
  
  return new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({
      // color: 0x004511,
      vertexColors: THREE.VertexColors,
      // wireframe: true,
      // flatShading: true,
    })
  );
}

export function getHeightAt(x, y) {
  let valueAtPosition = heightmapContext.getImageData(x+heightmapCanvas.width*0.5, y+heightmapCanvas.height*0.5, 1,1).data[2];
  return remapValue(valueAtPosition, 0,255, 0,7);
}