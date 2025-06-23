// robot/model.js
import * as THREE from '../three.module.js';

export function buildRobot(scene) {
  const robot = {};

  // === Parametri ===
  const torsoWidth = 0.35;
  const torsoDepth = 0.24;
  const torsoHeight = 0.40;
  const shoulderRadius = 0.05;
  const armLength = 0.38;
  const elbowRadius = 0.035;
  const forearmLength = 0.30;
  const wristRadius = 0.025;

  // === Busto ===
  const torso = new THREE.Group();
  const chest = new THREE.Mesh(
    new THREE.CylinderGeometry(torsoWidth / 2, torsoWidth / 2, torsoHeight, 16),
    new THREE.MeshStandardMaterial({ color: 0x8888ff })
  );
  chest.position.y = 1.6;
  torso.add(chest);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffcc })
  );
  head.position.y = 1.6 + torsoHeight / 2 + 0.1;
  torso.add(head);

  torso.position.z = -0.5;
  scene.add(torso);

  // === Spalle ===
  const shoulderLeft = createJoint(shoulderRadius);
  shoulderLeft.position.set(-torsoWidth / 2, 1.6 + torsoHeight / 2 - shoulderRadius, -0.5);
  scene.add(shoulderLeft);

  const shoulderRight = shoulderLeft.clone();
  shoulderRight.position.x = torsoWidth / 2;
  scene.add(shoulderRight);

  // === Braccia ===
  const upperArmLeft = createSegment(armLength, 0xff4444);
  upperArmLeft.position.copy(shoulderLeft.position);
  scene.add(upperArmLeft);

  const elbowLeft = createJoint(elbowRadius);
  elbowLeft.position.copy(shoulderLeft.position).add(new THREE.Vector3(0, -armLength, 0));
  scene.add(elbowLeft);

  const forearmLeft = createSegment(forearmLength, 0xaa0000);
  forearmLeft.position.copy(elbowLeft.position);
  scene.add(forearmLeft);

  const wristLeft = createJoint(wristRadius);
  wristLeft.position.copy(elbowLeft.position).add(new THREE.Vector3(0, -forearmLength, 0));
  scene.add(wristLeft);

  const upperArmRight = createSegment(armLength, 0x44ff44);
  upperArmRight.position.copy(shoulderRight.position);
  scene.add(upperArmRight);

  const elbowRight = createJoint(elbowRadius);
  elbowRight.position.copy(shoulderRight.position).add(new THREE.Vector3(0, -armLength, 0));
  scene.add(elbowRight);

  const forearmRight = createSegment(forearmLength, 0x00aa00);
  forearmRight.position.copy(elbowRight.position);
  scene.add(forearmRight);

  const wristRight = createJoint(wristRadius);
  wristRight.position.copy(elbowRight.position).add(new THREE.Vector3(0, -forearmLength, 0));
  scene.add(wristRight);

  robot.parts = {
    torso,
    shoulderLeft, shoulderRight,
    upperArmLeft, upperArmRight,
    elbowLeft, elbowRight,
    forearmLeft, forearmRight,
    wristLeft, wristRight
  };

  return robot;
}

function createSegment(length, color) {
  const geo = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geo.translate(0, -length / 2, 0);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
}

function createJoint(radius) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
}
