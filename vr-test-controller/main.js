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

// === CONTROLLER XR (non usati ancora) === //
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1, controller2);

// === LOOP === //
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
