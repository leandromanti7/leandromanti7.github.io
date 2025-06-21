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

// 👤 Corpo centrale robotico (busto + testa)
const torso = new THREE.Group();

// Torace (cilindro verticale)
const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.4;
torso.add(chest);

// Testa (sfera sopra il busto)
const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.65;
torso.add(head);

scene.add(torso);

// ➕ Braccio robotico stilizzato
function createRobotArm(color = 0x00ffcc) {
  const group = new THREE.Group();

  const shoulder = new THREE.Mesh(
    new THREE.SphereGeometry(0.07, 16, 16),
    new THREE.MeshStandardMaterial({ color })
  );
  group.add(shoulder);

  const forearm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.25, 12),
    new THREE.MeshStandardMaterial({ color })
  );
  forearm.position.y = -0.15;
  group.add(forearm);

  return group;
}

// Controller sinistro → braccio rosso
const controller1 = renderer.xr.getController(0);
const arm1 = createRobotArm(0xff4444);
controller1.add(arm1);
scene.add(controller1);

// Controller destro → braccio verde
const controller2 = renderer.xr.getController(1);
const arm2 = createRobotArm(0x44ff44);
controller2.add(arm2);
scene.add(controller2);

// ➕ (opzionale) base fissa sotto al robot
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
base.position.y = 1.15;
torso.add(base);

// Animazione continua
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
