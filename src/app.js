import _ from 'lodash';
import * as THREE from 'three';
import { DirectionalLight } from 'three';

import {makeConiferTree, makeLollipopTree} from './treeMaker';
import {makeCumulousCloud} from './cloudMaker';
import { makeGroundPlane } from './groundMaker';

let rootElem = null;
let renderer= null;
let scene = null;
let camera = null;
let cube = null;
let light = null;
let trees = [];
let clouds = [];
let ground = null;
let diaromaGroup = null;
let clock = null;

const NUM_TREES = 10; // stress test 70x70 hits ~30fps with each tree as separate geometry; switching to buffer geometry raises to ~40fps
const NUM_CLOUDS = 5;

function init() {
  rootElem = document.getElementById('app-root');

  const aspectRatio = rootElem.clientWidth / rootElem.clientHeight;
  const initialFOV = 75;
  
  renderer = new THREE.WebGLRenderer({alpha:true});
  camera = new THREE.PerspectiveCamera(initialFOV, aspectRatio, 0.1, 1000);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  
  diaromaGroup = new THREE.Group();
  scene.add(diaromaGroup);

  renderer.domElement.style.backgroundColor = "#6688FF";

  renderer.setSize( rootElem.clientWidth, rootElem.clientHeight );
  rootElem.appendChild( renderer.domElement );

  // test
  // const geometry = new THREE.BoxGeometry();
  // const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  // cube = new THREE.Mesh( geometry, material );
  // scene.add( cube );
  
  prepLighting();
  generateDiorama();

  camera.position.z = 12;
  camera.position.y = 7;
  
  animate();

  document.addEventListener('keydown', (evt) => {
    if (evt.key == 'r') {
      generateDiorama();
    }
  });
}

function prepLighting() {
  // scene.add(new THREE.HemisphereLight("#ffffff","#666666"));
  scene.add(new THREE.AmbientLight(0xFFFFFF, 0.5));

  light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.y = 10;
  light.target.position.z = 4;
  diaromaGroup.add(light);
  diaromaGroup.add(light.target);
}

function generateDiorama() {
  createGround();
  createTrees();
  createClouds();
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
      postSpawnFunction(item);
    }
  }
}

function createGround() {
  if (ground) {
    diaromaGroup.remove(ground);
  }
  ground = makeGroundPlane(NUM_TREES * 5, NUM_TREES * 5);
  diaromaGroup.add(ground);
};

function createTrees() {
  spawnInGrid(trees, diaromaGroup, makeConiferTree, NUM_TREES, 4.5);
}

function createClouds() {
  const separationDistance = 14;
  spawnInGrid(clouds, diaromaGroup, makeCumulousCloud, NUM_CLOUDS, 14, (cloud) => {
    cloud.position.y = 20;
  });
}

function animate() {
  requestAnimationFrame( animate );
  diaromaGroup.rotation.y += (Math.PI/90) * clock.getDelta();
  renderer.render( scene, camera );
}

export default {init};