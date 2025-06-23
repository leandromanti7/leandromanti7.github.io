// core/floor.js
import * as THREE from '../three.module.js';

let userFrame;

export function createFloor(scene) {
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 4),
    new THREE.MeshStandardMaterial({ color: 0x222222 })
  );
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  userFrame = new THREE.Group();
  scene.add(userFrame);

  const feetAxes = createWorldAxes();
  userFrame.add(feetAxes);
}

export function updateUserFrame(camera) {
  if (userFrame) {
    userFrame.position.x = camera.position.x;
    userFrame.position.z = camera.position.z;
  }
}

function createWorldAxes(length = 0.2) {
  const group = new THREE.Group();

  const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), new THREE.Vector3(), length, 0x0000ff);
  const xArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), new THREE.Vector3(), length, 0xff0000);
  const yArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), new THREE.Vector3(), length, 0x00ff00);

  group.add(zArrow, xArrow, yArrow);
  return group;
}
