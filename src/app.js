import _ from 'lodash';
import * as THREE from 'three';
import { initDiorama, generateDiorama } from './diorama';

let rootElem = null;
let renderer= null;
let scene = null;
let camera = null;
let clock = null;

let dioramaGroup = null;

const DEFAULT_SPIN_RATE = (Math.PI/90) * 10;

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
  camera.position.y = 6;
  
  animate();

  document.addEventListener('keydown', (evt) => {
    if (evt.key == 'r') {
      dioramaGroup = generateDiorama();
    }
  });
}

function animate() {
  requestAnimationFrame( animate );
  dioramaGroup.rotation.y += DEFAULT_SPIN_RATE * clock.getDelta();
  renderer.render( scene, camera );
}

export default {init};