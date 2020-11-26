import _ from 'lodash';
import * as THREE from 'three';
import * as dat from 'dat.gui';

require('./threejs-extras/OrbitControls');

let controls = null;

import { initDiorama, generateDiorama } from './diorama';
import { RADIANS_FOR_1_DEGREE,randomRangeFromArray,
  randomRangeIntFromArray,
  getNewRandomSeed,
randomPickOne, 
RADIANS_FOR_180_DEGREES} from './util';
import { FlowerBunchMaker, makeRock, RockMaker, StalkClumpMaker, StickMaker } from './groundStuffMaker';
import Tweakpane from 'tweakpane';
import { WebGLMultisampleRenderTarget } from 'three';
import { CumulousCloudMaker } from './cloudMaker';
import { ConiferMaker, DeadTreeMaker, LollipopTreeMaker, TreeStumpMaker } from './treeMaker';

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
  
  // dioramaGroup = generateDiorama();

  camera.position.z = 20;
  camera.position.y = 12;

  controls = new THREE.OrbitControls( camera, renderer.domElement );
  controls.enableDamping = true;
  controls.maxDistance = 50;
  controls.minDistance = 3;
  controls.maxPolarAngle = RADIANS_FOR_1_DEGREE * 85;
  controls.zoomSpeed = 0.6;
  controls.target.y = 2.5;

  buildGUITest();

  animate();

  document.addEventListener('keydown', (evt) => {
    if (evt.key == 'r') {
      dioramaGroup = generateDiorama();
    } else if (evt.key == 'o') {
      controls.reset();
    }
  });
}

let gui = null;
function openEditorForGenerator(generator) {
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

  gui = new dat.GUI({name : "TEST"});

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
  gui.add(actions, 'save');
  gui.add(actions, 'cancel');

  camera.position.z = 5;
  camera.position.y = 0;
  controls.target.y = 0; // could set this relative to the mesh bounds, centering it
  controls.minDistance = 1; // could set this relative to the mesh bounds, making sure we don't accidentally clip through
  controls.maxPolarAngle = RADIANS_FOR_180_DEGREES;
}

function buildGUITest() {
  openEditorForGenerator(ConiferMaker);

  // gui.add(params, 'size').onChange(regenObj);
  // gui.addColor(params, 'color').onChange(regenObj);
  // gui.add(params, 'seed').onChange(regenObj);
  
  // const gui = new Tweakpane();
  // gui.addButton({title : 'randomize'}).on('click', ()=>{console.log('todo: randomize')});
  // gui.addInput(params, 'size');
  // gui.addInput(params, 'color', {input: 'color'});
  // gui.addInput(params, 'seed');
  // gui.addButton({title : 'save'}).on('click', ()=>{console.log('todo: save changes')});
  // gui.addButton({title : 'cancel'}).on('click', ()=>{console.log('todo: close window')});
  // gui.on('change', regenObj);
}

function animate() {
  requestAnimationFrame( animate );
  controls.update();
  renderer.render( scene, camera );
}

export default {init};