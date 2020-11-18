import * as THREE from 'three';

import {makeConiferTree, makeLollipopTree} from './treeMaker';
import {makeCumulousCloud} from './cloudMaker';
import { makeGroundPlane, getHeightAt } from './groundMaker';
import {randomOdds, randomRange, randomRangeFromArray} from './util';


let light = null;
let trees = [];
let clouds = [];
let ground = null;
let water = null;
let dioramaGroup = null;
let treesGroup = null;

const NUM_TREES = 10; // stress test 70x70 hits ~30fps with each tree as separate geometry; switching to buffer geometry raises to ~40fps
const treeSpawnOddsRange = [0.3, 0.95];
const cloudSpawnOddsRange = [0.3, 1];
const NUM_CLOUDS = 5;
const ENABLE_SHADOWS = false;

export function initDiorama(scene, renderer) {
  dioramaGroup = new THREE.Group();
  scene.add(dioramaGroup);

  treesGroup = new THREE.Group();
  dioramaGroup.add(treesGroup);

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

  light.position.y = 20;
  light.target.position.z = 4;
  light.target.position.y = 0;

  dioramaGroup.add(light);
  dioramaGroup.add(light.target);
}

export function generateDiorama() {
  createGround();
  createWater();
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
  ground = makeGroundPlane(NUM_TREES * 4.5, NUM_TREES * 4.5, Math.random());
  dioramaGroup.add(ground);
  if (ENABLE_SHADOWS) {
    ground.receiveShadow = true;
  }
};

function createWater() {
  if (water) {
    dioramaGroup.remove(water);
  }
  const planeGeometry = new THREE.PlaneGeometry(NUM_TREES * 4.5, NUM_TREES * 4.5);
  planeGeometry.rotateX(-Math.PI/2);
  water = new THREE.Mesh(
    planeGeometry,
    new THREE.MeshLambertMaterial({
      color: 0x182090,
      transparent: true,
      opacity: 0.8
    })
  );
  water.position.y = 1;
  dioramaGroup.add(water);
}

function createTrees() {
  const removalOdds = 1 - randomRangeFromArray(treeSpawnOddsRange);
  spawnInGrid(trees, treesGroup, makeConiferTree, NUM_TREES, 4.5, (tree) => {
    if (randomOdds(removalOdds)) {
      treesGroup.remove(tree);
      return;
    }
    let yPos = getHeightAt(tree.position.x, tree.position.z);
    if (yPos > water.position.y) {
      tree.position.y = yPos;
    } else {
      treesGroup.remove(tree); // not great -- would be better to skip generating those trees, or generate something else instead
    }
  });
}

function createClouds() {
  const removalOdds = 1 - randomRangeFromArray(cloudSpawnOddsRange);
  spawnInGrid(clouds, dioramaGroup, makeCumulousCloud, NUM_CLOUDS, 14, (cloud) => {
    if (randomOdds(removalOdds)) {
      dioramaGroup.remove(cloud);
      return;
    }
    cloud.position.y = 20;
  });
}