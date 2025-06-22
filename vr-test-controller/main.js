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

// Controller
const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1, controller2);

function createControllerMesh(color) {
  const geometry = new THREE.CylinderGeometry(0.015, 0.015, 0.1, 12);
  geometry.rotateX(Math.PI / 2);
  const material = new THREE.MeshStandardMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

const controllerGrip1 = createControllerMesh(0xff0000);
controller1.add(controllerGrip1);

const controllerGrip2 = createControllerMesh(0x00ff00);
controller2.add(controllerGrip2);

function addAxesToController(controller) {
  const axisLength = 0.1;

  const xDir = new THREE.Vector3(1, 0, 0);
  const yDir = new THREE.Vector3(0, 1, 0);
  const zDir = new THREE.Vector3(0, 0, 1);

  controller.add(new THREE.ArrowHelper(xDir, new THREE.Vector3(0, 0, 0), axisLength, 0xff0000));
  controller.add(new THREE.ArrowHelper(yDir, new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00));
  controller.add(new THREE.ArrowHelper(zDir, new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff));
}

addAxesToController(controller1);
addAxesToController(controller2);

// Terna ai piedi dell'utente
const userFrame = new THREE.Group();
scene.add(userFrame);

function createWorldAxesLabeled(length = 0.2) {
  const group = new THREE.Group();
  const origin = new THREE.Vector3();

  group.add(new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), origin, length, 0xff0000)); // X
  group.add(new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, length, 0x00ff00)); // Y
  group.add(new THREE.ArrowHelper(new THREE.Vector3(0, 0, 1), origin, length, 0x0000ff)); // Z

  group.position.set(0, -1.6, 0);
  return group;
}

const feetAxes = createWorldAxesLabeled();
userFrame.add(feetAxes);

// HUD VR Panel
const vrCanvas = document.createElement('canvas');
vrCanvas.width = 512;
vrCanvas.height = 256;
const vrCtx = vrCanvas.getContext('2d');

const vrTexture = new THREE.CanvasTexture(vrCanvas);
const vrMaterial = new THREE.MeshBasicMaterial({ map: vrTexture, side: THREE.DoubleSide });
const vrPlane = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.35), vrMaterial);
vrPlane.position.set(0, 0, -0.8);
camera.add(vrPlane);
scene.add(camera);

// Render loop
renderer.setAnimationLoop(() => {
  const controllers = [controller1, controller2];

  // aggiorna terna ai piedi
  userFrame.position.copy(camera.position);
  userFrame.position.y = 0;
  const cameraYaw = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
  userFrame.rotation.set(0, cameraYaw, 0);

  // aggiorna HUD
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
  renderer.render(scene, camera);
});
