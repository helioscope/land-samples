import _ from 'lodash';
import * as THREE from 'three';

import {randomRange} from './util';

export function makeGroundPlane(width, height) {
  const geometry = new THREE.PlaneGeometry(width, height, width, height+1);
  geometry.rotateX(Math.PI/-2);
  return new THREE.Mesh(
    geometry,
    new THREE.MeshLambertMaterial({color: 0x004511})
  );
}