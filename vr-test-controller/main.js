// Import principali
import * as THREE from '../vr-test-local/js/three.module.js';
import { VRButton } from '../vr-test-local/js/VRButton.js';

// Scena e renderer
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);
document.body.appendChild(VRButton.createButton(renderer));

// Luci e pavimento
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Corpo centrale (torso + testa)
const torso = new THREE.Group();

const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.6;
torso.add(chest);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.9;
torso.add(head);

torso.position.z = -0.5;
scene.add(torso);

// Base opzionale
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
base.position.y = 1.15;
torso.add(base);

// Parametri braccia
const lengthUpper = 0.25;
const lengthLower = 0.25;

function createArmSegment(color, length) {
  const geometry = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geometry.translate(0, -length / 2, 0);
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
}

function createJointSphere(color = 0xffffff, radius = 0.03) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color })
  );
}

// Spalle
const leftShoulder = new THREE.Vector3(-0.2, 1.8, -0.5);
const rightShoulder = new THREE.Vector3(0.2, 1.8, -0.5);

// Braccio sinistro
const upperArmLeft = createArmSegment(0xff4444, lengthUpper);
const elbowLeft = createJointSphere();
const lowerArmLeft = createArmSegment(0xaa0000, lengthLower);
const handLeft = createJointSphere();
scene.add(upperArmLeft, elbowLeft, lowerArmLeft, handLeft);

// Braccio destro
const upperArmRight = createArmSegment(0x44ff44, lengthUpper);
const elbowRight = createJointSphere();
const lowerArmRight = createArmSegment(0x00aa00, lengthLower);
const handRight = createJointSphere();
scene.add(upperArmRight, elbowRight, lowerArmRight, handRight);

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1, controller2);

function updateArm(shoulder, controller, upperArm, elbow, lowerArm, hand, lengthUpper, lengthLower) {
  const handPos = controller.position.clone();
  const shoulderToHand = handPos.clone().sub(shoulder);
  const totalLength = lengthUpper + lengthLower;
  const correctedHand = shoulder.clone().add(shoulderToHand.clone().normalize().multiplyScalar(totalLength));

  // Calcolo del gomito realistico
  const dir = correctedHand.clone().sub(shoulder).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const elbowOffsetDir = new THREE.Vector3().crossVectors(dir, up).normalize();
  const elbowOffset = elbowOffsetDir.multiplyScalar(0.1);
  const elbowPos = shoulder.clone().addScaledVector(dir, lengthUpper).add(elbowOffset);

  // Upper arm
  const upperVec = elbowPos.clone().sub(shoulder);
  const upperMid = shoulder.clone().addScaledVector(upperVec, 0.5);
  upperArm.position.copy(upperMid);
  upperArm.lookAt(elbowPos);
  upperArm.rotateX(Math.PI / 2);

  // Lower arm
  const lowerVec = correctedHand.clone().sub(elbowPos);
  const lowerMid = elbowPos.clone().addScaledVector(lowerVec, 0.5);
  lowerArm.position.copy(lowerMid);
  lowerArm.lookAt(correctedHand);
  lowerArm.rotateX(Math.PI / 2);

  // Giunti
  elbow.position.copy(elbowPos);
  hand.position.copy(correctedHand);
}

// Loop di animazione
renderer.setAnimationLoop(() => {
  updateArm(leftShoulder, controller1, upperArmLeft, elbowLeft, lowerArmLeft, handLeft, lengthUpper, lengthLower);
  updateArm(rightShoulder, controller2, upperArmRight, elbowRight, lowerArmRight, handRight, lengthUpper, lengthLower);

  // La testa segue la rotazione del visore
  head.quaternion.copy(camera.quaternion);

  renderer.render(scene, camera);
});
