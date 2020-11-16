import * as THREE from 'three';

import {makeConiferTree, makeLollipopTree} from './treeMaker';
import {makeCumulousCloud} from './cloudMaker';
import { makeGroundPlane } from './groundMaker';


let light = null;
let trees = [];
let clouds = [];
let ground = null;
let dioramaGroup = null;

const NUM_TREES = 10; // stress test 70x70 hits ~30fps with each tree as separate geometry; switching to buffer geometry raises to ~40fps
const NUM_CLOUDS = 5;
const ENABLE_SHADOWS = false;

export function initDiorama(scene, renderer) {
  dioramaGroup = new THREE.Group();
  scene.add(dioramaGroup);

  renderer.domElement.style.backgroundColor = "#6688FF";

  prepLighting(renderer);
}

export function prepLighting(renderer) {
  // scene.add(new THREE.HemisphereLight("#ffffff","#666666"));
  dioramaGroup.add(new THREE.AmbientLight(0xFFFFFF, 0.5));
  
  light = new THREE.DirectionalLight(0xffffff, 0.9);
  
  if (ENABLE_SHADOWS) {
    renderer.shadowMap.enabled = true; // default: false

    light.castShadow = true; // default: false
    light.shadow.mapSize.width = 512; // default: 512
    light.shadow.mapSize.height = 512; // default: 512
    light.shadow.camera.near = 0.01; // default: 0.5
    light.shadow.camera.far = 800; // default: 500
  }

  light.position.y = 10;
  light.target.position.z = 4;
  dioramaGroup.add(light);
  dioramaGroup.add(light.target);
}

export function generateDiorama() {
  createGround();
  createTrees();
  createClouds();

  return dioramaGroup;
}

function spawnInGrid(collection, group, spawnFunction, gridSize, separationDistance, postSpawnFunction = _.noop) {
  if (collection.length > 0) {
    _.each(collection, (item) => {
      group.remove(item);
    });
    collection.splice(collection.length);
  }
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      let item = spawnFunction();
      item.position.x = x * separationDistance - (separationDistance * (gridSize - 1) / 2);
      item.position.z = y * separationDistance - (separationDistance * (gridSize - 1) / 2);
      group.add(item);
      collection.push(item);
      if (ENABLE_SHADOWS) {
        item.castShadow = true;
      }
      postSpawnFunction(item);
    }
  }
}

function createGround() {
  if (ground) {
    dioramaGroup.remove(ground);
  }
  ground = makeGroundPlane(NUM_TREES * 5, NUM_TREES * 5);
  dioramaGroup.add(ground);
  if (ENABLE_SHADOWS) {
    ground.receiveShadow = true;
  }
};

function createTrees() {
  spawnInGrid(trees, dioramaGroup, makeConiferTree, NUM_TREES, 4.5);
}

function createClouds() {
  spawnInGrid(clouds, dioramaGroup, makeCumulousCloud, NUM_CLOUDS, 14, (cloud) => {
    cloud.position.y = 20;
  });
}