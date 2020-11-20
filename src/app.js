import _ from 'lodash';
import * as THREE from 'three';

require('./threejs-extras/OrbitControls');

let controls = null;

import { initDiorama, generateDiorama } from './diorama';
import { RADIANS_FOR_1_DEGREE } from './util';

let rootElem = null;
let renderer= null;
let scene = null;
let camera = null;
let clock = null;

let dioramaGroup = null;

function init() {
  rootElem = document.getElementById('app-root');

  const aspectRatio = rootElem.clientWidth / rootElem.clientHeight;
  const initialFOV = 75;
  
  renderer = new THREE.WebGLRenderer({alpha:true});
  camera = new THREE.PerspectiveCamera(initialFOV, aspectRatio, 0.1, 1000);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  
  initDiorama(scene, renderer);

  renderer.setSize( rootElem.clientWidth, rootElem.clientHeight );
  rootElem.appendChild( renderer.domElement );
  
  dioramaGroup = generateDiorama();

  camera.position.z = 20;
  camera.position.y = 12;

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.maxDistance = 50;
  controls.minDistance = 3;
  controls.maxPolarAngle = RADIANS_FOR_1_DEGREE * 85;
  controls.zoomSpeed = 0.6;
  controls.target.y = 2.5;

  
  animate();

  document.addEventListener('keydown', (evt) => {
    if (evt.key == 'r') {
      dioramaGroup = generateDiorama();
    }
  });
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
}

export default {init};