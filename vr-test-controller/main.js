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
scene.add(new THREE.HemisphereLight(0xffffff, 0x444444));

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// === PARAMETRI STRUTTURALI === //
const torsoWidth = 0.35;      // 35 cm
const torsoDepth = 0.24;      // 24 cm (non visibile su cilindro)
const torsoHeight = 0.40;     // 40 cm

const shoulderRadius = 0.05;  // 10 cm diametro
const armLength = 0.38;       // 38 cm
const elbowRadius = 0.035;    // 7 cm diametro
const forearmLength = 0.30;   // 30 cm
const wristRadius = 0.025;    // 5 cm diametro

// === BUSTO === //
const torso = new THREE.Group();

const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(torsoWidth / 2, torsoWidth / 2, torsoHeight, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.6;
torso.add(chest);

// === TESTA === //
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.6 + torsoHeight / 2 + 0.1;
torso.add(head);

torso.position.z = -0.5;
scene.add(torso);

// === SPALLE === //
const shoulderLeft = new THREE.Mesh(
  new THREE.SphereGeometry(shoulderRadius, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
shoulderLeft.position.set(-torsoWidth / 2, 1.6 + torsoHeight / 2 - shoulderRadius, -0.5);
scene.add(shoulderLeft);

const shoulderRight = shoulderLeft.clone();
shoulderRight.position.x = torsoWidth / 2;
scene.add(shoulderRight);

// === UTILITY PER SEGMENTI === //
function createSegment(length, color) {
  const geo = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geo.translate(0, -length / 2, 0); // per far partire da spalla/gomito
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
}
function createJoint(radius) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
}

// === BRACCIO SINISTRO === //
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

// === BRACCIO DESTRO === //
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

// === MANI A PINZA === //
function createPinzaHand(color = 0xdddddd) {
  const group = new THREE.Group();

  // Base mano
  const base = new THREE.BoxGeometry(0.05, 0.01, 0.05);
  const baseMesh = new THREE.Mesh(base, new THREE.MeshStandardMaterial({ color }));
  group.add(baseMesh);

  // Dita
  const finger1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.04, 0.01),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  finger1.position.set(-0.015, -0.025, 0);
  group.add(finger1);

  const finger2 = finger1.clone();
  finger2.position.x = 0.015;
  group.add(finger2);

  return group;
}

// Mano sinistra
const handLeft = createPinzaHand();
handLeft.position.copy(wristLeft.position).add(new THREE.Vector3(0, -0.04, 0)); // sotto al polso
scene.add(handLeft);

// Mano destra
const handRight = createPinzaHand();
handRight.position.copy(wristRight.position).add(new THREE.Vector3(0, -0.04, 0));
scene.add(handRight);


// === CONTROLLER XR (non usati ancora) === //
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1, controller2);

// === MODELLI VISIBILI PER I CONTROLLER === //
function createControllerMesh(color) {
  const geometry = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12);
  geometry.rotateX(Math.PI / 2); // orienta in avanti
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

// Controller sinistro (rosso)
const controllerGrip1 = createControllerMesh(0xff0000);
controller1.add(controllerGrip1);

// Controller destro (verde)
const controllerGrip2 = createControllerMesh(0x00ff00);
controller2.add(controllerGrip2);
scene.add(controller1, controller2);

function addAxesToController(controller) {
  const axisLength = 0.1;

  // X - ROSSO → ORA punta verso l'alto (asse Y globale)
  const xDir = new THREE.Vector3(0, 1, 0);
  const xArrow = new THREE.ArrowHelper(xDir, new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
  controller.add(xArrow);

  // Y - VERDE → ORA punta verso sinistra (asse -X globale)
  const yDir = new THREE.Vector3(-1, 0, 0);
  const yArrow = new THREE.ArrowHelper(yDir, new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
  controller.add(yArrow);

  // Z - BLU → resta entrante nella scena (asse -Z globale)
  const zDir = new THREE.Vector3(0, 0, -1);
  const zArrow = new THREE.ArrowHelper(zDir, new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);
  controller.add(zArrow);
}


addAxesToController(controller1);
addAxesToController(controller2);


// === LOOP === //
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
