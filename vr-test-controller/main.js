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

// Braccia articolate a due segmenti (braccio + avambraccio)
function createArmSegment(color) {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1, 12),
    new THREE.MeshStandardMaterial({ color })
  );
}

const leftShoulder = new THREE.Vector3(-0.2, 1.6, -0.5);
const rightShoulder = new THREE.Vector3(0.2, 1.6, -0.5);

const upperArmLeft = createArmSegment(0xff4444);
const lowerArmLeft = createArmSegment(0xaa0000);
scene.add(upperArmLeft, lowerArmLeft);

const upperArmRight = createArmSegment(0x44ff44);
const lowerArmRight = createArmSegment(0x00aa00);
scene.add(upperArmRight, lowerArmRight);

const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

// Funzione per aggiornare segmenti braccio + avambraccio con lunghezze fisse
function updateArm(shoulder, controller, upperArm, lowerArm, lengthUpper = 0.25, lengthLower = 0.25) {
  const handPos = controller.position.clone();
  const shoulderToHand = handPos.clone().sub(shoulder);
  const totalDist = shoulderToHand.length();

  // Se troppo distante, normalizza
  const dir = shoulderToHand.clone().normalize();
  const elbowDist = Math.min(lengthUpper, totalDist / 2);

  // Stima gomito (elbow) come punto intermedio piegato in direzione ortogonale
  const up = new THREE.Vector3(0, 1, 0);
  const elbowOffset = new THREE.Vector3().crossVectors(dir, up).normalize().multiplyScalar(0.1);
  const elbow = shoulder.clone().addScaledVector(dir, elbowDist).add(elbowOffset);

  // ➤ Upper arm
  const upperVec = elbow.clone().sub(shoulder);
  const upperMid = shoulder.clone().addScaledVector(upperVec, 0.5);
  upperArm.position.copy(upperMid);
  upperArm.scale.y = upperVec.length();
  upperArm.lookAt(elbow);
  upperArm.rotateX(Math.PI / 2);

  // ➤ Lower arm
  const lowerVec = handPos.clone().sub(elbow);
  const lowerMid = elbow.clone().addScaledVector(lowerVec, 0.5);
  lowerArm.position.copy(lowerMid);
  lowerArm.scale.y = lowerVec.length();
  lowerArm.lookAt(handPos);
  lowerArm.rotateX(Math.PI / 2);
}

// Loop
renderer.setAnimationLoop(() => {
  updateArm(leftShoulder, controller1, upperArmLeft, lowerArmLeft);
  updateArm(rightShoulder, controller2, upperArmRight, lowerArmRight);
  renderer.render(scene, camera);
});
