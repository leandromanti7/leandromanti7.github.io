// robot/axes.js
import * as THREE from './three.module.js';

export function addAxesToRobot(robot) {
  const { wristLeft, wristRight } = robot.parts;
  addAxesTo(wristLeft);
  addAxesTo(wristRight);
}

function addAxesTo(object, length = 0.1) {
  const origin = new THREE.Vector3();

  const zDir = new THREE.Vector3(0, 1, 0); // blu - su
  const xDir = new THREE.Vector3(0, 0, -1); // rosso - avanti
  const yDir = new THREE.Vector3(-1, 0, 0); // verde - sinistra

  const zArrow = new THREE.ArrowHelper(zDir, origin, length, 0x0000ff);
  const xArrow = new THREE.ArrowHelper(xDir, origin, length, 0xff0000);
  const yArrow = new THREE.ArrowHelper(yDir, origin, length, 0x00ff00);

  object.add(zArrow, xArrow, yArrow);
}
