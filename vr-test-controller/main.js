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
head.position.set(0, 1.9, 0); // Altezza corretta
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

// Funzione per creare un cilindro segmentato
function createArmSegment(color, length = 0.25) {
  const geometry = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geometry.translate(0, -length / 2, 0);
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
}

// Spalle
const shoulderLeft = new THREE.Mesh(
  new THREE.SphereGeometry(0.035, 12, 12),
  new THREE.MeshStandardMaterial({ color: 0xcccccc })
);
shoulderLeft.position.set(-0.2, 1.75, -0.5);
scene.add(shoulderLeft);

const shoulderRight = shoulderLeft.clone();
shoulderRight.position.x = 0.2;
scene.add(shoulderRight);

// Bracci + avambracci + mani
const lengthUpper = 0.25;
const lengthLower = 0.25;

const upperArmLeft = createArmSegment(0xff4444, lengthUpper);
const lowerArmLeft = createArmSegment(0xaa0000, lengthLower);
const handLeft = new THREE.Mesh(
  new THREE.SphereGeometry(0.04, 12, 12),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
scene.add(upperArmLeft, lowerArmLeft, handLeft);

const upperArmRight = createArmSegment(0x44ff44, lengthUpper);
const lowerArmRight = createArmSegment(0x00aa00, lengthLower);
const handRight = handLeft.clone();
scene.add(upperArmRight, lowerArmRight, handRight);

const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

// Funzione di aggiornamento braccio articolato
function updateArm(shoulder, controller, upperArm, lowerArm, hand, lengthUpper, lengthLower) {
  const handPos = controller.position.clone();
  const shoulderToHand = handPos.clone().sub(shoulder);
  const totalLength = lengthUpper + lengthLower;

  const correctedHand = shoulder.clone().add(shoulderToHand.clone().normalize().multiplyScalar(totalLength));
  const dir = correctedHand.clone().sub(shoulder).normalize();

  const elbowOffset = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize().multiplyScalar(0.1);
  const elbow = shoulder.clone().addScaledVector(dir, lengthUpper).add(elbowOffset);

  const upperMid = shoulder.clone().add(elbow).multiplyScalar(0.5);
  upperArm.position.copy(upperMid);
  upperArm.lookAt(elbow);
  upperArm.rotateX(Math.PI / 2);

  const lowerMid = elbow.clone().add(correctedHand).multiplyScalar(0.5);
  lowerArm.position.copy(lowerMid);
  lowerArm.lookAt(correctedHand);
  lowerArm.rotateX(Math.PI / 2);

  hand.position.copy(correctedHand);
}

// Animazione
renderer.setAnimationLoop(() => {
  updateArm(shoulderLeft.position, controller1, upperArmLeft, lowerArmLeft, handLeft, lengthUpper, lengthLower);
  updateArm(shoulderRight.position, controller2, upperArmRight, lowerArmRight, handRight, lengthUpper, lengthLower);

  // Ruota la testa in base alla rotazione della camera
  head.quaternion.copy(camera.quaternion);

  renderer.render(scene, camera);
});
