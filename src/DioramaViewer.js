import _ from 'lodash';
import * as THREE from 'three';

require('./threejs-extras/OrbitControls');

let orbitControls = null;

import { initDiorama, generateFullDiorama } from './diorama';
import { getNewRandomSeed, RADIANS_FOR_1_DEGREE } from './util';

let rootElem = null;
let renderer = null;
let scene = null;
let camera = null;
let clock = null;
let thisIsActive = false;
let canvas = null;
let buttonContainer = null;

function init() {
  rootElem = document.getElementById('app-root');

  const aspectRatio = rootElem.clientWidth / rootElem.clientHeight;
  const initialFOV = 55;
  
  canvas = document.getElementById('main-canvas');
  renderer = new THREE.WebGLRenderer({alpha:false, canvas: canvas, preserveDrawingBuffer: true});
  camera = new THREE.PerspectiveCamera(initialFOV, aspectRatio, 0.1, 1000);
  scene = new THREE.Scene();
  clock = new THREE.Clock();
  
  renderer.setSize( rootElem.clientWidth, rootElem.clientHeight );
  rootElem.appendChild( renderer.domElement );
  canvas = renderer.domElement;

  buttonContainer = document.createElement('div');
  buttonContainer.id = "diorama-viewer-buttons";
  buttonContainer.className = "button-container";
  rootElem.appendChild(buttonContainer);

  const downloadButton = document.createElement('button');
  downloadButton.textContent = "save image";
  downloadButton.onclick = onClickSaveImage;
  downloadButton.className = "download-button";
  buttonContainer.appendChild(downloadButton);
  
  initDiorama(scene, renderer);
  generateFullDiorama();

  camera.position.z = 23.5;
  camera.position.y = 9.5;
  camera.position.x = 22.9;

  orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
  orbitControls.enableDamping = true;
  orbitControls.maxDistance = 60;
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

function onClickSaveImage() {
  var link = document.createElement('a');
  link.download = 'diorama-snapshot.png';
  link.href = renderer.domElement.toDataURL('image/png');
  link.click();

  // var img = document.createElement('img');
  // img.src = canvas.toDataURL();
  // rootElem.appendChild(img);
}

export default {
  init,
  focus,
  blur
};