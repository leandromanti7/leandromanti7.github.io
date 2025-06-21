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

// ➕ Braccia dinamiche (spalla fissa, cilindro che si estende verso il controller)
function createDynamicArm(color, shoulderPosition) {
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 1, 12, 1, true),
    new THREE.MeshStandardMaterial({ color })
  );
  arm.geometry.translate(0, -0.5, 0); // per ruotare da spalla a controller
  arm.position.copy(shoulderPosition);
  scene.add(arm);
  return arm;
}

const leftShoulder = new THREE.Vector3(-0.2, 1.6, -0.5);
const rightShoulder = new THREE.Vector3(0.2, 1.6, -0.5);

const dynamicArmLeft = createDynamicArm(0xff4444, leftShoulder);
const dynamicArmRight = createDynamicArm(0x44ff44, rightShoulder);

const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

// Animazione: aggiorna la lunghezza e orientamento delle braccia
renderer.setAnimationLoop(() => {
  // Braccio sinistro
  const dir1 = new THREE.Vector3().subVectors(controller1.position, leftShoulder);
  dynamicArmLeft.position.copy(leftShoulder.clone().addScaledVector(dir1, 0.5));
  dynamicArmLeft.scale.y = dir1.length();
  dynamicArmLeft.lookAt(controller1.position);
  dynamicArmLeft.rotateX(Math.PI / 2);

  // Braccio destro
  const dir2 = new THREE.Vector3().subVectors(controller2.position, rightShoulder);
  dynamicArmRight.position.copy(rightShoulder.clone().addScaledVector(dir2, 0.5));
  dynamicArmRight.scale.y = dir2.length();
  dynamicArmRight.lookAt(controller2.position);
  dynamicArmRight.rotateX(Math.PI / 2);

  renderer.render(scene, camera);
});
