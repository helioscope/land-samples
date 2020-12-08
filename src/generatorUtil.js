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

export function finalizeMesh(geometry, generator, params, material = null) {
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
    generator : generator,
    generatorParams : params
  };

  return mesh;
}

export function formPlaneBorder(geometry, vertCountX, vertCountY, sliceDepth) {
  const borderSize = 1;
  const verts = geometry.vertices;
  const lastX = vertCountX - 1;
  const lastY = vertCountY - 1;
  
  // x edges (skips corners)
  for (let vx = borderSize; vx < lastX; vx++) {
    // y min
    let vert = verts[vx];
    let neighborVert = verts[vx + vertCountX];
    vert.z = sliceDepth;
    vert.x = neighborVert.x;
    vert.y = neighborVert.y;

    // y max
    vert = verts[(lastY) * vertCountX + vx];
    neighborVert = verts[vx + ((lastY - borderSize) * vertCountX)];
    vert.z = sliceDepth;
    vert.x = neighborVert.x;
    vert.y = neighborVert.y;
  }

  // // y edges (skips corners)
  for (let vy = borderSize; vy < lastY; vy++) {
    // x min
    let vert = verts[vy * vertCountX];
    let neighborVert = verts[vy * vertCountX + borderSize];
    vert.z = sliceDepth;
    vert.x = neighborVert.x;
    vert.y = neighborVert.y;

    // x max
    vert = verts[vy * vertCountX + (lastX)];
    neighborVert = verts[vy * vertCountX + (lastX - borderSize)];
    vert.z = sliceDepth;
    vert.x = neighborVert.x;
    vert.y = neighborVert.y;
  }

  // // corners
  let vert = verts[0]; // (0, 0) -- far left from start
  let neighborVert = verts[vertCountX + borderSize]; // (1, 1)
  vert.z = sliceDepth;
  vert.x = neighborVert.x;
  vert.y = neighborVert.y;

  vert = verts[vertCountX - 1]; // (max, 0) -- far right from start
  neighborVert = verts[vertCountX + lastX - borderSize]; // (max-1, 1)
  vert.z = sliceDepth;
  vert.x = neighborVert.x;
  vert.y = neighborVert.y;

  vert = verts[vertCountX * (lastY)]; // (0, max) -- near left from start
  neighborVert = verts[vertCountX * (lastY - borderSize) + 1]; // (1, max-1)
  vert.z = sliceDepth;
  vert.x = neighborVert.x;
  vert.y = neighborVert.y;

  vert = verts[vertCountX * (lastY) + lastX]; // (max, max) -- near left from start
  neighborVert = verts[vertCountX * (lastY - borderSize) + lastX - borderSize]; // (max-1, max-1)
  vert.z = sliceDepth;
  vert.x = neighborVert.x;
  vert.y = neighborVert.y;
}