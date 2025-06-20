import * as THREE from 'https://unpkg.com/three@0.162.0/build/three.module.js';
import { VRButton } from 'https://unpkg.com/three@0.162.0/examples/jsm/webxr/VRButton.js';
import { XRHandModelFactory } from 'https://unpkg.com/three@0.162.0/examples/jsm/webxr/XRHandModelFactory.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x202020);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer, {
  requiredFeatures: ['hand-tracking']
}));

// Cubo semplice al centro
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Luce ambiente
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
light.position.set(0, 20, 0);
scene.add(light);

// ➕ Aggiunta mani tracciate
const handModelFactory = new XRHandModelFactory();

function setupHands() {
  for (let i = 0; i <= 1; i++) {
    const hand = renderer.xr.getHand(i);
    scene.add(hand);
    const handModel = handModelFactory.createHandModel(hand, "mesh");
    hand.add(handModel);
  }
}

setupHands();

// Animazione continua
renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
});

// Resize responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
