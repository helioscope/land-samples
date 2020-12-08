import _ from 'lodash';
import * as THREE from 'three';
import * as dat from 'dat.gui';

require('./threejs-extras/OrbitControls');

let orbitControls = null;

import { RADIANS_FOR_180_DEGREES, RADIANS_FOR_90_DEGREES} from './util';

let rootElem = null;
let renderer= null;
let scene = null;
let camera = null;
let clock = null;
let gui = null;

let thisIsOpen = false;

const axisReferenceLength = 2;
const xAxisColor = 0xFF0000;
const yAxisColor = 0x00FF00;
const zAxisColor = 0x0000FF;

function init() {
  // containerElem = containerElem || document;

  // rootElem = document.createElement('div');
  // rootElem.id = "mesh-editor";
  // containerElem.appendChild(rootElem);
  rootElem = document.getElementById("mesh-editor");

  const aspectRatio = rootElem.clientWidth / rootElem.clientHeight;
  const initialFOV = 75;
  
  renderer = new THREE.WebGLRenderer({alpha:true});
  camera = new THREE.PerspectiveCamera(initialFOV, aspectRatio, 0.1, 1000);
  scene = new THREE.Scene();
  clock = new THREE.Clock();

  renderer.setSize( rootElem.clientWidth, rootElem.clientHeight );
  rootElem.appendChild( renderer.domElement );

  let groundPlane = new THREE.Mesh (
    new THREE.PlaneBufferGeometry(8,8,8,8).rotateX(-RADIANS_FOR_90_DEGREES),
    new THREE.MeshBasicMaterial({ wireframe: true, color : 0xFFFFFF, transparent: true, opacity: 0.1 })
  );
  scene.add(groundPlane);

  let zAxis = new THREE.Line (
    new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, 0, axisReferenceLength * -0.1), new THREE.Vector3(0, 0, axisReferenceLength) ]),
    new THREE.LineBasicMaterial( { color: zAxisColor } ),
  );
  scene.add(zAxis);
  let yAxis = new THREE.Line (
    new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(0, axisReferenceLength  * -0.1, 0), new THREE.Vector3(0, axisReferenceLength, 0) ]),
    new THREE.LineBasicMaterial( { color: yAxisColor } ),
  );
  scene.add(yAxis);
  let xAxis = new THREE.Line (
    new THREE.BufferGeometry().setFromPoints([ new THREE.Vector3(axisReferenceLength * -0.1, 0, 0), new THREE.Vector3(axisReferenceLength, 0, 0) ]),
    new THREE.LineBasicMaterial( { color: xAxisColor } ),
  );
  scene.add(xAxis);

  camera.position.z = 10;
  camera.position.y = 2;

  orbitControls = new THREE.OrbitControls( camera, renderer.domElement );
  orbitControls.enableDamping = true;
  orbitControls.maxDistance = 50;
  orbitControls.minDistance = 2;
  orbitControls.zoomSpeed = 0.6;

  close();

  // animate();

  // document.addEventListener('keydown', (evt) => {
  //   if (evt.key == 'r') {
  //     // randomize mesh?
  //   } else if (evt.key == 'o') {
  //     orbitControls.reset();
  //   }
  // });
}

function animate() {
  if (!thisIsOpen) {
    return;
  }
  requestAnimationFrame( animate );
  orbitControls.update();
  renderer.render( scene, camera );
}

function open() {
  thisIsOpen = true;
  // rootElem.style.pointerEvents = "";
  rootElem.style.display = "block";
  animate();
}

function close() {
  thisIsOpen = false;
  rootElem.style.display = "none";
  // rootElem.style.pointerEvents = "none";
}

export function openEditorForGenerator(generator) {
  if (gui) {
    gui.destroy();
  }

  let obj = null;
  let params = generator.getRandomParams();

  const regenObj = () => {
    if (obj) {
      scene.remove(obj);
    }
    obj = generator.makeMesh(params);
    scene.add(obj);
    return obj;
  }
  obj = generator.makeMesh(params);
  scene.add(obj);

  gui = new dat.GUI();

  let actions = {
    cancel : () => {
      console.log('todo: cancel');
    },
    save : () => {
      console.log('todo: save');
    },
    randomize : () => {
      Object.assign(params, generator.getRandomParams());
      regenObj();
      for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
      }    
    }
  };

  gui.add(actions, 'randomize');
  generator.prepEditorPanel(gui, params, regenObj);
  // gui.add(actions, 'save');
  // gui.add(actions, 'cancel');

  camera.position.z = 5;
  camera.position.y = 2;
  obj.geometry.computeBoundingBox();
  orbitControls.target.y = obj.geometry.boundingBox.getCenter().y; // could set this relative to the mesh bounds, centering it
  orbitControls.minDistance = 1; // could set this relative to the mesh bounds, making sure we don't accidentally clip through
  orbitControls.maxPolarAngle = RADIANS_FOR_180_DEGREES;

  open();
}

export default {init, openEditorForGenerator, open, close};
