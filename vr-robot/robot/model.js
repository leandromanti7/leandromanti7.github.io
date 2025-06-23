// robot/model.js
import * as THREE from '../three.module.js';

export function buildRobot() {
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

  // === Spalle ===
  const shoulderLeft = createJoint(shoulderRadius);
  shoulderLeft.position.set(-torsoWidth / 2, 1.6 + torsoHeight / 2 - shoulderRadius, -0.5);

  const shoulderRight = createJoint(shoulderRadius);
  shoulderRight.position.set(torsoWidth / 2, 1.6 + torsoHeight / 2 - shoulderRadius, -0.5);

  // === Braccia sx ===
  const upperArmLeft = createSegment(armLength, 0xff4444);
  upperArmLeft.position.y = 0;

  const elbowLeft = createJoint(elbowRadius);
  elbowLeft.position.y = -armLength;

  const forearmLeft = createSegment(forearmLength, 0xaa0000);
  forearmLeft.position.y = 0;

  const wristLeft = createJoint(wristRadius);
  wristLeft.position.y = -forearmLength;

  // === Braccia dx ===
  const upperArmRight = createSegment(armLength, 0x44ff44);
  upperArmRight.position.y = 0;

  const elbowRight = createJoint(elbowRadius);
  elbowRight.position.y = -armLength;

  const forearmRight = createSegment(forearmLength, 0x00aa00);
  forearmRight.position.y = 0;

  const wristRight = createJoint(wristRadius);
  wristRight.position.y = -forearmLength;

  // === Ritorna tutto ===
  robot.parts = {
    torso,
    shoulderLeft, shoulderRight,
    upperArmLeft, upperArmRight,
    elbowLeft, elbowRight,
    forearmLeft, forearmRight,
    wristLeft, wristRight
  };

  robot.root = torso; // <-- IMPORTANTE: nodo radice

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
