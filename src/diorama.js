import * as THREE from 'three';
import * as dat from 'dat.gui';

import {ConiferMaker, DeadTreeMaker, TreeStumpMaker} from './treeMaker';
import {CumulousCloudMaker} from './cloudMaker';
import { makeGroundPlane } from './groundMaker';
import {getNewRandomSeed, getRandomValue, RADIANS_FOR_90_DEGREES, randomOdds, randomRange, randomRangeFromArray, setRandomSeed, WeightedOddsPicker} from './util';
import { Vector3 } from 'three';
import { FlowerBunchMaker, StickMaker, RockMaker, StalkClumpMaker } from './groundStuffMaker';
import { formPlaneBorder, USE_HARD_EDGE_LOWPOLY_STYLE } from './generatorUtil';


const ENABLE_SHADOWS = false; // experimental -- needs further investigation & comes at performance cost. also seems to have issues with the hard-edged styling, perhaps the material settings?

let light = null;
let trees = [];
let clouds = [];
let ground = null;
let water = null;
let sky = null;
let groundStuff = [];
let dioramaGroup = null;
let treesGroup = null;

let groundSeed = null;

const skyColor = "rgb(72, 151, 221)";//"#6688FF"; // must be a color string, as we're also using css here
const skySphereRadius = 500;
const ambientLightColor = 0xFFFFFF;
const ambientLightIntensity = 0.5;
const directionalLightColor = 0xFFFFFF;
const directionalLightIntensity = 0.9;
const directionaLightTargetX = 2.75;
const directionaLightTargetY = 0;
const directionaLightTargetZ = 4;

const NUM_TREES = 10; // max trees per axis. stress test 70(x70) hits ~30fps with each tree as separate geometry; switching to buffer geometry raises to ~40
const treeSeparation = 4.5;
const treeSpawnOddsRange = [0.3, 0.95];

const NUM_CLOUDS = 5; // max clouds per axis
const cloudSeparation = 14;
const cloudSpawnOddsRange = [0.3, 1];
const cloudHeightRange = [19.5, 21.5];

const skyMaterial = new THREE.MeshBasicMaterial({color: skyColor, side: THREE.BackSide});

const waterHeight = 1.125;
const waterColor = 0x0f2343;//0x182090;
const waterOpacity = 0.84;//0.8;
const waterShininess = 10;//15
const waterMaterial = new THREE.MeshPhongMaterial({
  color: waterColor,
  transparent: true,
  opacity: waterOpacity,
  flatShading: USE_HARD_EDGE_LOWPOLY_STYLE,
  shininess: waterShininess
});

const groundWidth = NUM_TREES * treeSeparation;
const groundLength = NUM_TREES * treeSeparation;

const groundStuffCountRange = [45,350];

const groundRaycasterHeight = 30;

export function initDiorama(scene, renderer) {
  dioramaGroup = new THREE.Group();
  scene.add(dioramaGroup);

  treesGroup = new THREE.Group();
  dioramaGroup.add(treesGroup);

  renderer.domElement.style.backgroundColor = skyColor;

  prepLighting(renderer);

  sky = new THREE.Mesh(
    new THREE.SphereBufferGeometry(skySphereRadius, 32, 15),
    skyMaterial
  );
  dioramaGroup.add(sky);

  let testColor = {
    color: waterColor
  };

  let gui = new dat.GUI();
  gui.addColor(testColor, 'color').onChange(()=>{
    waterMaterial.color = new THREE.Color(testColor.color);
  });
  gui.add(waterMaterial, 'opacity',0,1);
  gui.add(waterMaterial, 'shininess',0,255);
}

export function prepLighting(renderer) {
  // scene.add(new THREE.HemisphereLight("#ffffff","#666666"));
  dioramaGroup.add(new THREE.AmbientLight(ambientLightColor, ambientLightIntensity));
  
  light = new THREE.DirectionalLight(directionalLightColor, directionalLightIntensity);
  
  if (ENABLE_SHADOWS) {
    renderer.shadowMap.enabled = true; // default: false

    light.castShadow = true; // default: false
    light.shadow.mapSize.width = 512; // default: 512
    light.shadow.mapSize.height = 512; // default: 512
    light.shadow.camera.near = 0.01; // default: 0.5
    light.shadow.camera.far = 800; // default: 500
  }

  light.position.y = 20;
  light.target.position.set(directionaLightTargetX, directionaLightTargetY, directionaLightTargetZ);

  dioramaGroup.add(light);
  dioramaGroup.add(light.target);
}

export function generateFullDiorama(seed) {
  if (seed === undefined) {
    seed = getNewRandomSeed();
  }
  setRandomSeed(seed);
  createGround(seed);
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
      item.geometry.dispose();
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

function createGround(seed) {
  groundSeed = seed;
  if (ground) {
    dioramaGroup.remove(ground);
  }
  ground = makeGroundPlane(groundWidth, groundLength, groundSeed);
  dioramaGroup.add(ground);
  if (ENABLE_SHADOWS) {
    ground.receiveShadow = true;
  }
};

function createWater() {
  if (water) {
    dioramaGroup.remove(water);
  }
  const waterWidth = groundWidth - 0.2;
  const waterLength = groundLength - 0.2;
  const planeGeometry = new THREE.PlaneGeometry( waterWidth * 3, waterLength * 3, 3, 3);
  formPlaneBorder(planeGeometry, 4, 4, -6);
  planeGeometry.rotateX(-RADIANS_FOR_90_DEGREES);
  planeGeometry.verticesNeedUpdate = true;
  planeGeometry.computeFlatVertexNormals();
  water = new THREE.Mesh(
    planeGeometry,
    waterMaterial
  );
  water.position.y = waterHeight;
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
  spawnInGrid(trees, treesGroup, randomTreeGenerator, NUM_TREES, treeSeparation, (tree) => {
    if (randomOdds(removalOdds)) {
      treesGroup.remove(tree);
      return;
    }
    
    raycaster.set(new Vector3(tree.position.x, groundRaycasterHeight, tree.position.z), downVector);
    
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
  const leftBound = groundWidth * -0.5 + 1;
  const rightBound = groundWidth * 0.5 - 1;
  const nearBound = groundLength * -0.5 + 1;
  const farBound = groundLength * 0.5 - 1;
  const xBounds = [leftBound, rightBound];
  const zBounds = [nearBound, farBound];

  const downVector = new THREE.Vector3(0, -1, 0);
  const raycaster = new THREE.Raycaster( new THREE.Vector3(), downVector, 0.1, 100 );

  const numObjects = randomRangeFromArray(groundStuffCountRange);

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
    raycaster.set(new Vector3(randomRangeFromArray(xBounds), groundRaycasterHeight, randomRangeFromArray(zBounds)), downVector);
    
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
  spawnInGrid(clouds, dioramaGroup, CumulousCloudMaker.makeRandomMesh.bind(CumulousCloudMaker), NUM_CLOUDS, cloudSeparation, (cloud) => {
    if (randomOdds(removalOdds)) {
      dioramaGroup.remove(cloud);
      return;
    }
    cloud.position.y = randomRangeFromArray(cloudHeightRange);
  });
}