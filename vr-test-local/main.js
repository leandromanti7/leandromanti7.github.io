import * as THREE from './js/three.module.js';
import { VRButton } from './js/VRButton.js';
import { XRHandModelFactory } from './js/XRHandModelFactory.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x222222);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
document.body.appendChild(renderer.domElement);

document.body.appendChild(VRButton.createButton(renderer, {
  requiredFeatures: ['hand-tracking']
}));

// Cubo semplice
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Luce
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

// ➕ Mani visibili
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

// Loop
renderer.setAnimationLoop(() => {
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
});
