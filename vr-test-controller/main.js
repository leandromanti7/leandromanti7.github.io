import * as THREE from '../vr-test-local/js/three.module.js';
import { VRButton } from '../vr-test-local/js/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.6, 3);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// Piano di riferimento
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Corpo centrale robotico
const torso = new THREE.Group();

// Torace
const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.6;
torso.add(chest);

// Testa
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.9;
torso.add(head);

// Base
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
base.position.y = 1.15;
torso.add(base);

torso.position.z = -0.5;
scene.add(torso);

// ➕ Spalle fisse
const leftShoulder = new THREE.Object3D();
leftShoulder.position.set(-0.2, 1.6, -0.5);
scene.add(leftShoulder);

const rightShoulder = new THREE.Object3D();
rightShoulder.position.set(0.2, 1.6, -0.5);
scene.add(rightShoulder);

// ➕ Controller
const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

// ➕ Bracci dinamici (cubi)
const dynamicArm1 = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.025, 1, 8, 1, true),
  new THREE.MeshStandardMaterial({ color: 0xff4444 })
);
scene.add(dynamicArm1);

const dynamicArm2 = new THREE.Mesh(
  new THREE.CylinderGeometry(0.025, 0.025, 1, 8, 1, true),
  new THREE.MeshStandardMaterial({ color: 0x44ff44 })
);
scene.add(dynamicArm2);

// 🔁 Loop
renderer.setAnimationLoop(() => {
  const p1 = leftShoulder.getWorldPosition(new THREE.Vector3());
  const p2 = controller1.getWorldPosition(new THREE.Vector3());
  updateCylinder(dynamicArm1, p1, p2);

  const p3 = rightShoulder.getWorldPosition(new THREE.Vector3());
  const p4 = controller2.getWorldPosition(new THREE.Vector3());
  updateCylinder(dynamicArm2, p3, p4);

  renderer.render(scene, camera);
});

// Funzione per aggiornare cilindro tra 2 punti
function updateCylinder(cylinder, start, end) {
  const mid = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dir = new THREE.Vector3().subVectors(end, start);
  const length = dir.length();

  cylinder.position.copy(mid);
  cylinder.scale.set(1, length / 2, 1);
  cylinder.lookAt(end);
  cylinder.rotation.z += Math.PI / 2;
}
