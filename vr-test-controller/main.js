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

// === SPALLE === //
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

// === Braccia con cinematica === //
const joints = {};

function createArm(side) {
  const isLeft = side === 'left';
  const sign = isLeft ? -1 : 1;

  const shoulder = isLeft ? shoulderLeft.position : shoulderRight.position;

  const upperArm = createSegment(armLength, isLeft ? 0xff4444 : 0x44ff44);
  const elbow = createJoint(elbowRadius);
  const forearm = createSegment(forearmLength, isLeft ? 0xaa0000 : 0x00aa00);
  const wrist = createJoint(wristRadius);
  const hand = createPinzaHand();

  scene.add(upperArm, elbow, forearm, wrist, hand);

  joints[side] = {
    shoulder,
    upperArm,
    elbow,
    forearm,
    wrist,
    hand
  };
}

createArm('left');
createArm('right');

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

function updateIKArm(controller, joint) {
  const { shoulder, upperArm, elbow, forearm, wrist, hand } = joint;
  const handPos = controller.position.clone();
  const shoulderToHand = handPos.clone().sub(shoulder);
  const totalLength = armLength + forearmLength;
  const correctedHand = shoulder.clone().add(shoulderToHand.clone().normalize().multiplyScalar(totalLength));

  const dir = correctedHand.clone().sub(shoulder).normalize();
  const elbowDir = new THREE.Vector3().crossVectors(dir, new THREE.Vector3(0, 1, 0)).normalize();
  const elbowOffset = elbowDir.multiplyScalar(0.05);
  const elbowPos = shoulder.clone().addScaledVector(dir, armLength).add(elbowOffset);

  const upperMid = shoulder.clone().add(elbowPos).multiplyScalar(0.5);
  upperArm.position.copy(upperMid);
  upperArm.lookAt(elbowPos);
  upperArm.rotateX(Math.PI / 2);

  const foreMid = elbowPos.clone().add(correctedHand).multiplyScalar(0.5);
  forearm.position.copy(foreMid);
  forearm.lookAt(correctedHand);
  forearm.rotateX(Math.PI / 2);

  elbow.position.copy(elbowPos);
  wrist.position.copy(correctedHand);
  hand.position.copy(correctedHand.clone().add(new THREE.Vector3(0, -0.04, 0)));
}

const controller1 = renderer.xr.getController(0);
const controller2 = renderer.xr.getController(1);
scene.add(controller1, controller2);

// Controller model (visibili)
const controllerModelFactory = new XRControllerModelFactory();
const controllerGrip1 = renderer.xr.getControllerGrip(0);
controllerGrip1.add(controllerModelFactory.createControllerModel(controllerGrip1));
scene.add(controllerGrip1);

const controllerGrip2 = renderer.xr.getControllerGrip(1);
controllerGrip2.add(controllerModelFactory.createControllerModel(controllerGrip2));
scene.add(controllerGrip2);

// === LOOP === //
renderer.setAnimationLoop(() => {
  updateIKArm(controller1, joints.left);
  updateIKArm(controller2, joints.right);
  renderer.render(scene, camera);
});
