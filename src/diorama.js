import * as THREE from 'three';

import {ConiferMaker, DeadTreeMaker, TreeStumpMaker} from './treeMaker';
import {CumulousCloudMaker} from './cloudMaker';
import { makeGroundPlane } from './groundMaker';
import {getRandomValue, randomOdds, randomRange, randomRangeFromArray, WeightedOddsPicker} from './util';
import { Vector3 } from 'three';
import { FlowerBunchMaker, StickMaker, RockMaker, StalkClumpMaker } from './groundStuffMaker';


let light = null;
let trees = [];
let clouds = [];
let ground = null;
let water = null;
let groundStuff = [];
let dioramaGroup = null;
let treesGroup = null;

let groundSeed = null;

const NUM_TREES = 10; // stress test 70(x70) hits ~30fps with each tree as separate geometry; switching to buffer geometry raises to ~40fps
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

export function generateFullDiorama() {
  createGround();
  createWater();
  createTrees();
  createGroundStuff();
  createClouds();

  return dioramaGroup;
}

function cleanUpObjects(collection, group) {
  if (collection.length > 0) {
    _.each(collection, (item) => {
      group.remove(item);
    });
    collection.splice(collection.length);
  }
}

function spawnInGrid(collection, group, meshGenerator, gridSize, separationDistance, postSpawnFunction = _.noop) {
  cleanUpObjects(collection, group);
  for (let x = 0; x < gridSize; x++) {
    for (let y = 0; y < gridSize; y++) {
      let item = meshGenerator();
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
  groundSeed = new Date().toString();
  if (ground) {
    dioramaGroup.remove(ground);
  }
  ground = makeGroundPlane(NUM_TREES * 4.5, NUM_TREES * 4.5, groundSeed);
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
  const spawnPicker = new WeightedOddsPicker([
    {value : TreeStumpMaker, weight: 10},
    {value : DeadTreeMaker, weight: 25},
    {value : ConiferMaker, weight: 65},
  ]);
  const randomTreeGenerator = () => {
    return spawnPicker.pickOne().makeRandomMesh();
  }
  const downVector = new THREE.Vector3(0, -1, 0);
  const raycaster = new THREE.Raycaster( new THREE.Vector3(), downVector, 0.1, 100 );
  spawnInGrid(trees, treesGroup, randomTreeGenerator, NUM_TREES, 4.5, (tree) => {
    if (randomOdds(removalOdds)) {
      treesGroup.remove(tree);
      return;
    }
    
    raycaster.set(new Vector3(tree.position.x, 30, tree.position.z), downVector);
    
    let intersections = raycaster.intersectObject(ground);
    let canPlaceHere = true;
    let yPos = 0;
    
    if (intersections.length == 0) {
      canPlaceHere = false;
    } else {
      yPos = intersections[0].point.y;
      if (yPos <= water.position.y) {
        canPlaceHere = false;
      }
    }

    if (canPlaceHere) {
      tree.position.y = yPos - 0.05;
    } else {
      treesGroup.remove(tree); // not great -- would be better to skip generating those trees, or generate something else instead
    }
  });
}

function createGroundStuff() {
  const groundWidth = NUM_TREES * 4.5;
  const groundLength = NUM_TREES * 4.5;
  
  const leftBound = groundWidth * -0.5 + 1;
  const rightBound = groundWidth * 0.5 - 1;
  const nearBound = groundLength * -0.5 + 1;
  const farBound = groundLength * 0.5 - 1;
  const xBounds = [leftBound, rightBound];
  const zBounds = [nearBound, farBound];

  const downVector = new THREE.Vector3(0, -1, 0);
  const raycaster = new THREE.Raycaster( new THREE.Vector3(), downVector, 0.1, 100 );

  const numObjects = randomRange(45,350);

  const groundSpawnPicker = new WeightedOddsPicker([
    {value : StalkClumpMaker, weight: 50},
    {value : FlowerBunchMaker, weight: 25},
    {value : StickMaker, weight: 20},
    {value : RockMaker, weight: 5},
  ]);
  const spawnGroundObject = () => {
    return groundSpawnPicker.pickOne().makeRandomMesh();
  }

  let spawnWaterObject = () => {
    let odds = getRandomValue(100);
    let obj = null;
    if (odds < 50) {
      obj = StalkClumpMaker.makeRandomMesh();
      obj.scale.y *= 3;
    } else if (odds < 75) {
      obj = StickMaker.makeRandomMesh();
      obj.scale.multiplyScalar(4);
    } else {
      obj = RockMaker.makeRandomMesh();
    }
    return obj;
  }

  cleanUpObjects(groundStuff, dioramaGroup);

  for (let i = 0; i < numObjects; i++) {
    raycaster.set(new Vector3(randomRangeFromArray(xBounds), 30, randomRangeFromArray(zBounds)), downVector);
    
    let intersections = raycaster.intersectObject(ground);
    let pos = new THREE.Vector3();
    let canPlaceHere = true;
    let inWater = false;
    
    if (intersections.length == 0) {
      canPlaceHere = false;
    } else {
      pos = intersections[0].point;
      if (pos.y <= water.position.y) {
        inWater = true;
      }
    }

    let spawnedObject = null;
    if (inWater) {
      spawnedObject = spawnWaterObject();
    } else {
      spawnedObject = spawnGroundObject();
    }
    spawnedObject.position.copy(pos);
    dioramaGroup.add(spawnedObject);
    groundStuff.push(spawnedObject);
  }
}

function createClouds() {
  const removalOdds = 1 - randomRangeFromArray(cloudSpawnOddsRange);
  spawnInGrid(clouds, dioramaGroup, CumulousCloudMaker.makeRandomMesh.bind(CumulousCloudMaker), NUM_CLOUDS, 14, (cloud) => {
    if (randomOdds(removalOdds)) {
      dioramaGroup.remove(cloud);
      return;
    }
    cloud.position.y = 20;
  });
}