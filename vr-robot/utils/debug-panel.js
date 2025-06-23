// utils/debug-panel.js
import * as THREE from '../three.module.js';

let vrCanvas, vrCtx, vrTexture;

export function initDebugPanel(camera) {
  vrCanvas = document.createElement('canvas');
  vrCanvas.width = 512;
  vrCanvas.height = 256;
  vrCtx = vrCanvas.getContext('2d');

  vrTexture = new THREE.CanvasTexture(vrCanvas);
  const vrMaterial = new THREE.MeshBasicMaterial({ map: vrTexture, side: THREE.DoubleSide });
  const vrPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), vrMaterial);
  vrPlane.position.set(0, 0, -0.8);
  camera.add(vrPlane);
}

export function updateDebugPanel(controllers) {
  if (!vrCtx || !vrCanvas) return;

  vrCtx.fillStyle = 'black';
  vrCtx.fillRect(0, 0, vrCanvas.width, vrCanvas.height);

  vrCtx.fillStyle = 'white';
  vrCtx.font = '20px monospace';
  vrCtx.textBaseline = 'top';

  const lines = controllers.map((ctrl, i) => {
    const pos = ctrl.position;
    const quat = ctrl.quaternion;
    const euler = new THREE.Euler().setFromQuaternion(quat, 'YXZ');
    const toDeg = rad => (rad * 180 / Math.PI).toFixed(1);

    return [
      `Controller ${i + 1} (${i === 0 ? 'sx' : 'dx'})`,
      `Pos:  x:${pos.x.toFixed(2)} y:${pos.y.toFixed(2)} z:${pos.z.toFixed(2)} m`,
      `Quat: x:${quat.x.toFixed(2)} y:${quat.y.toFixed(2)} z:${quat.z.toFixed(2)} w:${quat.w.toFixed(2)}`,
      `Euler: pitch:${toDeg(euler.x)}° yaw:${toDeg(euler.y)}° roll:${toDeg(euler.z)}°`,
      ''
    ];
  }).flat();

  lines.forEach((line, i) => {
    vrCtx.fillText(line, 10, 10 + i * 24);
  });

  vrTexture.needsUpdate = true;
}
