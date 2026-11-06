// app/last-journey/three/buildStage.ts
// พื้นกระเบื้อง แท่นหมุนใต้หีบ รางเหล็กคู่วิ่งเข้าเตา (ref 07) และแสง
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { JourneyTextures } from './textures';
import { FURNACE_Z } from './buildFurnace';

export interface StageParts {
  group: THREE.Group;
  hemi: THREE.HemisphereLight;
  key: THREE.DirectionalLight;
}

/** รางห่างกัน 0.62 ตรงกับล้อรถเข็น */
const RAIL_X = 0.31;

export function buildStage(tex: JourneyTextures): StageParts {
  const group = new THREE.Group();

  const size = 30;
  tex.floor.repeat.set(size / 2.4, size / 2.4);
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({ map: tex.floor, roughness: 0.85 }),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.z = -4;
  group.add(floor);

  // แท่นหมุนที่หีบหันตัวในขั้นที่ 2
  const turntable = new THREE.Mesh(
    new THREE.CircleGeometry(1.2, 48),
    new THREE.MeshStandardMaterial({ color: '#8f877a', roughness: 0.7, metalness: 0.1 }),
  );
  turntable.rotation.x = -Math.PI / 2;
  turntable.position.y = 0.001;
  group.add(turntable);

  // รางเหล็กฝังในร่องพื้นจากแท่นหมุนเข้าไปในเตา
  const start = -0.9;
  const end = FURNACE_Z - 2.8;
  const len = start - end;
  const mid = (start + end) / 2;
  const groove = new THREE.Mesh(
    mergeGeometries([
      new THREE.BoxGeometry(0.12, 0.004, len).translate(RAIL_X, 0.002, mid),
      new THREE.BoxGeometry(0.12, 0.004, len).translate(-RAIL_X, 0.002, mid),
    ]),
    new THREE.MeshStandardMaterial({ color: '#1f1c19', roughness: 1 }),
  );
  const rails = new THREE.Mesh(
    mergeGeometries([
      new THREE.BoxGeometry(0.04, 0.012, len).translate(RAIL_X, 0.006, mid),
      new THREE.BoxGeometry(0.04, 0.012, len).translate(-RAIL_X, 0.006, mid),
    ]),
    new THREE.MeshStandardMaterial({ color: '#3c3934', metalness: 0.8, roughness: 0.4 }),
  );
  group.add(groove, rails);

  const hemi = new THREE.HemisphereLight('#fff7ea', '#3a3530', 1.1);
  const key = new THREE.DirectionalLight('#ffffff', 2.2);
  key.position.set(-2.5, 4, 3.5);
  group.add(hemi, key);

  return { group, hemi, key };
}
