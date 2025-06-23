// core/scene.js
import * as THREE from './three.module.js';
import { VRButton } from './VRButton.js';

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111111);

  const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 1.6, 3);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;

  document.body.appendChild(renderer.domElement);

  // Verifica WebXR
  if ('xr' in navigator) {
    navigator.xr.isSessionSupported('immersive-vr').then((supported) => {
      if (supported) {
        document.body.appendChild(VRButton.createButton(renderer));
      } else {
        showXRNotSupported();
      }
    });
  } else {
    showXRNotSupported();
  }

  function showXRNotSupported() {
    const msg = document.createElement('div');
    msg.textContent = '⚠️ WebXR non supportato. Prova con un visore VR o browser compatibile.';
    msg.style.color = 'white';
    msg.style.background = 'darkred';
    msg.style.padding = '1rem';
    msg.style.position = 'absolute';
    msg.style.top = '20px';
    msg.style.left = '20px';
    msg.style.zIndex = '9999';
    document.body.appendChild(msg);
  }

  return { scene, camera, renderer };
}
