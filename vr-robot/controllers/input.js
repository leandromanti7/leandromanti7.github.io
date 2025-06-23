// controllers/input.js
import * as THREE from '../three.module.js';

export function setupControllers(scene, renderer) {
  const controller1 = renderer.xr.getController(0);
  const controller2 = renderer.xr.getController(1);
  scene.add(controller1, controller2);

  const controllerGrip1 = createControllerMesh(0xff0000);
  const controllerGrip2 = createControllerMesh(0x00ff00);
  controller1.add(controllerGrip1);
  controller2.add(controllerGrip2);

  addAxesToController(controller1);
  addAxesToController(controller2);

  return [controller1, controller2];
}

function createControllerMesh(color) {
  const geometry = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12);
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

function addAxesToController(controller) {
  const axisLength = 0.1;

  const xArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), axisLength, 0xff0000);
  const yArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), axisLength, 0x00ff00);
  const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), new THREE.Vector3(), axisLength, 0x0000ff);

  controller.add(xArrow, yArrow, zArrow);
}
