import _ from 'lodash';
import * as THREE from 'three';

require('./threejs-extras/OrbitControls');

let orbitControls = null;

import { initDiorama, generateFullDiorama } from './diorama';
import { getNewRandomSeed, RADIANS_FOR_1_DEGREE } from './util';

let rootElem = null;
let renderer= null;
let scene = null;
let camera = null;
let clock = null;
let thisIsActive = false;

function init() {
  rootElem = document.getElementById('app-root');

  const aspectRatio = rootElem.clientWidth / rootElem.clientHeight;
  const initialFOV = 55;
  
  renderer = new THREE.WebGLRenderer({alpha:true});
  camera = new THREE.PerspectiveCamera(initialFOV, aspectRatio, 0.1, 1000);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  
  renderer.setSize( rootElem.clientWidth, rootElem.clientHeight );
  rootElem.appendChild( renderer.domElement );
  
  initDiorama(scene, renderer);
  generateFullDiorama();

  camera.position.z = 23.5;
  camera.position.y = 9.5;
  camera.position.x = 22.9;

  orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
  orbitControls.enableDamping = true;
  orbitControls.maxDistance = 58;
  orbitControls.minDistance = 2;
  orbitControls.maxPolarAngle = RADIANS_FOR_1_DEGREE * 90;
  orbitControls.zoomSpeed = 0.6;
  orbitControls.target.y = 3;

  animate();

  document.addEventListener('keydown', (evt) => {
    const keyString = evt.key.toLowerCase();
    if (thisIsActive) {
      if (keyString == 'r') {
        generateFullDiorama(getNewRandomSeed());
      } else if (keyString == 'o') {
        orbitControls.reset();
      }
    }
  });

  window.camera = camera;
}

function animate() {
  if (!thisIsActive) {
    return;
  }
  requestAnimationFrame( animate );
  orbitControls.update();
  renderer.render( scene, camera );
}

function focus() {
  thisIsActive = true;
  animate();
}

function blur() {
  thisIsActive = false;
}

export default {
  init,
  focus,
  blur
};