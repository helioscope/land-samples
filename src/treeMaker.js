import _ from 'lodash';
import * as THREE from 'three';

import {randomRange, jitterVertices} from './util';

const defaultTierWidths = [1.4, 2, 2.6];
const defaultTierYOffsets = [2.2, 1.1, 0];
const widthScaleRange = [0.5, 1.0];
const tierYOffsetVariation = [0, 0.25];
const leafBottomOffsetRange = [1.25, 2];
const tierScaleOffsetVariation = [-0.125, 0.125];
const trunkWidthRange = [0.2, 0.35];
const finalScaleRange = [0.5, 1.05];
const treeMaterial = new THREE.MeshLambertMaterial({vertexColors: THREE.VertexColors});
const tiltRange = [-0.04,0.04];

export function makeLollipopTree() {
  const geometry = new THREE.Geometry();

  const leafball = new THREE.SphereGeometry(2.5,5,4);
  leafball.translate(0, 4.5, 0);
  leafball.rotateY(randomRange(0,1));
  leafball.faces.forEach(f => f.color.set(0x009922));
  jitterVertices(leafball, 0.1);
  geometry.merge(leafball);

  const trunkWidth = randomRange(trunkWidthRange[0], trunkWidthRange[1]);
  const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, 6, 5);
  trunk.translate(0,0,0);
  trunk.rotateY(randomRange(0, 1));
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  const randomScale = randomRange(finalScaleRange[0],finalScaleRange[1]);
  geometry.scale(randomScale, randomScale, randomScale);

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );
}

export function makeConiferTree() {
  // const group = new THREE.Group();
  const geometry = new THREE.Geometry();
  const leafWidthScale = randomRange(widthScaleRange[0], widthScaleRange[1]);
  const leafBottom = randomRange(leafBottomOffsetRange[0], leafBottomOffsetRange[1]);

  _.each(defaultTierWidths, (width, index) => {
    const tierWidth = (width * leafWidthScale) + randomRange(tierScaleOffsetVariation[0], tierScaleOffsetVariation[1]);
    const tierHeight = 2;
    const radialSegments = 5;
    const tierY = leafBottom + defaultTierYOffsets[index] + randomRange(tierYOffsetVariation[0], tierYOffsetVariation[1]);
    
    const leafTier = new THREE.ConeGeometry(tierWidth, tierHeight, radialSegments)
    leafTier.translate(0, tierY, 0);
    leafTier.rotateY(randomRange(0, 1));
    leafTier.faces.forEach(f => f.color.set(0x008022));
    geometry.merge(leafTier);
    
    // const leafTier = new THREE.Mesh(
    //   new THREE.ConeGeometry(tierWidth, tierHeight, radialSegments),
    //   new THREE.MeshLambertMaterial({color:0x009922})
    // );
    // leafTier.position.y = tierY;
    // leafTier.rotation.y = randomRange(0, 360);
    // group.add(leafTier);
  });

  const trunkWidth = randomRange(trunkWidthRange[0], trunkWidthRange[1]);
  const trunk = new THREE.CylinderGeometry(trunkWidth, trunkWidth, 2, 5);
  trunk.translate(0,0,0);
  trunk.rotateY(randomRange(0, 1));
  trunk.faces.forEach(f => f.color.set(0x604011));
  geometry.merge(trunk);

  const randomScale = randomRange(finalScaleRange[0],finalScaleRange[1]);
  geometry.scale(randomScale, randomScale, randomScale);
  geometry.rotateZ(randomRange(tiltRange[0],tiltRange[1]));
  geometry.rotateX(randomRange(tiltRange[0],tiltRange[1]));

  // const performantGeometry = new BufferGeometry();
  // performantGeometry.fromGeometry(geometry);

  return new THREE.Mesh(
    geometry,
    treeMaterial,
  );

  // const trunk = new THREE.Mesh(
  //     new THREE.CylinderGeometry(trunkWidth, trunkWidth, 2, 5),
  //     new THREE.MeshLambertMaterial({color:0xbb6600})
  // );
  // trunk.rotation.y = randomRange(0, 360);
  // trunk.position.y = 0;
  // group.add(trunk);

  // return group;
}