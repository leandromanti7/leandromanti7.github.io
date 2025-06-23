// core/lighting.js
import * as THREE from '../vr-test-local/js/three.module.js';

export function addLighting(scene) {
  const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
  scene.add(hemiLight);
}
