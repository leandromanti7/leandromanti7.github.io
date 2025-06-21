import * as THREE from '../vr-test-local/js/three.module.js';
import { VRButton } from '../vr-test-local/js/VRButton.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer));

const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// ➕ Crea un cubo per ogni controller
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);

const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
const material1 = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const material2 = new THREE.MeshStandardMaterial({ color: 0x00ff00 });

const cube1 = new THREE.Mesh(geometry, material1);
const cube2 = new THREE.Mesh(geometry, material2);

controller1.add(cube1);
controller2.add(cube2);

scene.add(controller1);
scene.add(controller2);

// ➕ Piano di riferimento
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: 0x111111 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// ➕ Animazione
renderer.setAnimationLoop(() => {
  renderer.render(scene, camera);
});
