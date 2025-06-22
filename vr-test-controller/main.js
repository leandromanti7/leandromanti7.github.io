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
const torsoWidth = 0.35;
const torsoDepth = 0.24;
const torsoHeight = 0.40;

const shoulderRadius = 0.05;
const armLength = 0.38;
const elbowRadius = 0.035;
const forearmLength = 0.30;
const wristRadius = 0.025;

// === BUSTO === //
const torso = new THREE.Group();

const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(torsoWidth / 2, torsoWidth / 2, torsoHeight, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.6;
torso.add(chest);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.6 + torsoHeight / 2 + 0.1;
torso.add(head);

torso.position.z = -0.5;
scene.add(torso);

const shoulderLeft = new THREE.Mesh(
  new THREE.SphereGeometry(shoulderRadius, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
shoulderLeft.position.set(-torsoWidth / 2, 1.6 + torsoHeight / 2 - shoulderRadius, -0.5);
scene.add(shoulderLeft);

const shoulderRight = shoulderLeft.clone();
shoulderRight.position.x = torsoWidth / 2;
scene.add(shoulderRight);

function createSegment(length, color) {
  const geo = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geo.translate(0, -length / 2, 0);
  return new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color }));
}

function createJoint(radius) {
  return new THREE.Mesh(
    new THREE.SphereGeometry(radius, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
}

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

function createPinzaHand(color = 0xdddddd) {
  const group = new THREE.Group();

  const base = new THREE.BoxGeometry(0.05, 0.01, 0.05);
  const baseMesh = new THREE.Mesh(base, new THREE.MeshStandardMaterial({ color }));
  group.add(baseMesh);

  const finger1 = new THREE.Mesh(
    new THREE.BoxGeometry(0.01, 0.04, 0.01),
    new THREE.MeshStandardMaterial({ color: 0xffffff })
  );
  finger1.position.set(-0.015, -0.025, 0);
  group.add(finger1);

  const finger2 = finger1.clone();
  finger2.position.x = 0.015;
  group.add(finger2);

  return group;
}

const handLeft = createPinzaHand();
handLeft.position.copy(wristLeft.position).add(new THREE.Vector3(0, -0.04, 0));
scene.add(handLeft);

const handRight = createPinzaHand();
handRight.position.copy(wristRight.position).add(new THREE.Vector3(0, -0.04, 0));
scene.add(handRight);

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
scene.add(controller1, controller2);

function addAxesToController(controller) {
  const axisLength = 0.1;

  const xDir = new THREE.Vector3(0, 1, 0);
  const xArrow = new THREE.ArrowHelper(xDir, new THREE.Vector3(0, 0, 0), axisLength, 0xff0000);
  controller.add(xArrow);

  const yDir = new THREE.Vector3(-1, 0, 0);
  const yArrow = new THREE.ArrowHelper(yDir, new THREE.Vector3(0, 0, 0), axisLength, 0x00ff00);
  controller.add(yArrow);

  const zDir = new THREE.Vector3(0, 0, 1);
  const zArrow = new THREE.ArrowHelper(zDir, new THREE.Vector3(0, 0, 0), axisLength, 0x0000ff);
  controller.add(zArrow);
}

addAxesToController(controller1);
addAxesToController(controller2);

// === TERNA DI RIFERIMENTO AI PIEDI DELL'UTENTE ===
const userFrame = new THREE.Group();
scene.add(userFrame);

function createWorldAxes(length = 0.2) {
  const group = new THREE.Group();

  const origin = new THREE.Vector3();

  const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, length, 0x0000ff);
  const xArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), origin, length, 0xff0000);
  const yArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), origin, length, 0x00ff00);

  group.add(zArrow, xArrow, yArrow);

  // Carica il font ed etichetta gli assi
  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
    const makeLabel = (text, color, position) => {
      const mat = new THREE.MeshBasicMaterial({ color });
      const geo = new THREE.TextGeometry(text, {
        font: font,
        size: 0.03,
        height: 0.001
      });
      geo.computeBoundingBox();
      const mesh = new THREE.Mesh(geo, mat);
      const offsetX = -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
      mesh.position.copy(position);
      mesh.position.x += offsetX;
      group.add(mesh);
    };

    makeLabel('X', 0xff0000, new THREE.Vector3(0, 0, -length - 0.02));
    makeLabel('Y', 0x00ff00, new THREE.Vector3(-length - 0.02, 0, 0));
    makeLabel('Z', 0x0000ff, new THREE.Vector3(0, length + 0.02, 0));
  });

  group.position.set(0, -1.6, 0);
  return group;
}


function createWorldAxesLabeled(length = 0.2) {
  const group = new THREE.Group();

  const origin = new THREE.Vector3();

  const zArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 1, 0), origin, length, 0x0000ff);
  const xArrow = new THREE.ArrowHelper(new THREE.Vector3(0, 0, -1), origin, length, 0xff0000);
  const yArrow = new THREE.ArrowHelper(new THREE.Vector3(-1, 0, 0), origin, length, 0x00ff00);

  const loader = new THREE.FontLoader();
  loader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', font => {
    const createLabel = (text, color, offset) => {
      const mat = new THREE.MeshBasicMaterial({ color });
      const geo = new THREE.TextGeometry(text, {
        font,
        size: 0.03,
        height: 0.001
      });
      const mesh = new THREE.Mesh(geo, mat);
      geo.computeBoundingBox();
      const centerOffset = -0.5 * (geo.boundingBox.max.x - geo.boundingBox.min.x);
      mesh.position.copy(offset);
      mesh.position.x += centerOffset;
      group.add(mesh);
    };

    createLabel('X', 0xff0000, new THREE.Vector3(0, 0, -length - 0.02));
    createLabel('Y', 0x00ff00, new THREE.Vector3(-length - 0.02, 0, 0));
    createLabel('Z', 0x0000ff, new THREE.Vector3(0, length + 0.02, 0));
  });

  group.add(xArrow, yArrow, zArrow);
  group.position.set(0, -1.6, 0);
  return group;
}

const feetAxes = createWorldAxesLabeled();
userFrame.add(feetAxes);


// === HUD VR PANEL ===
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

renderer.setAnimationLoop(() => {
  const controllers = [controller1, controller2];

  // === aggiornamento terna mondo ===
  // Posizionata ai piedi
  userFrame.position.copy(camera.position);
  userFrame.position.y = 0;

  // Solo yaw (rotazione attorno a Y)
  const cameraYaw = new THREE.Euler().setFromQuaternion(camera.quaternion, 'YXZ').y;
  userFrame.rotation.set(0, cameraYaw, 0);

  // === aggiornamento canvas ===
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

