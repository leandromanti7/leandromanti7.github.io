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
const light = new THREE.HemisphereLight(0xffffff, 0x444444);
scene.add(light);

const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(4, 4),
  new THREE.MeshStandardMaterial({ color: 0x222222 })
);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Corpo centrale (torso + testa)
const torso = new THREE.Group();

const chest = new THREE.Mesh(
  new THREE.CylinderGeometry(0.15, 0.15, 0.4, 16),
  new THREE.MeshStandardMaterial({ color: 0x8888ff })
);
chest.position.y = 1.6;
torso.add(chest);

const head = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffcc })
);
head.position.y = 1.9;
torso.add(head);

const headPivot = new THREE.Object3D();
headPivot.position.set(0, 1.9, -0.5);
headPivot.add(head);
scene.add(headPivot);

// Sposta il torso
const torsoOffset = new THREE.Vector3(0, 0, -0.5);
torso.position.copy(torsoOffset);
scene.add(torso);

// Base opzionale
const base = new THREE.Mesh(
  new THREE.CylinderGeometry(0.2, 0.2, 0.05, 20),
  new THREE.MeshStandardMaterial({ color: 0x555555 })
);
base.position.y = 1.15;
torso.add(base);

// Spalle
const leftShoulder = new THREE.Vector3(-0.2, 1.6, -0.5);
const rightShoulder = new THREE.Vector3(0.2, 1.6, -0.5);

const leftJoint = new THREE.Mesh(
  new THREE.SphereGeometry(0.04, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
leftJoint.position.copy(leftShoulder);
scene.add(leftJoint);

const rightJoint = new THREE.Mesh(
  new THREE.SphereGeometry(0.04, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
rightJoint.position.copy(rightShoulder);
scene.add(rightJoint);

// Braccia articolate (2 segmenti)
function createArmSegment(color, length = 0.25) {
  const geometry = new THREE.CylinderGeometry(0.025, 0.025, length, 12);
  geometry.translate(0, -length / 2, 0);
  return new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
}

const lengthUpper = 0.25;
const lengthLower = 0.25;

const upperArmLeft = createArmSegment(0xff4444, lengthUpper);
const lowerArmLeft = createArmSegment(0xaa0000, lengthLower);
scene.add(upperArmLeft, lowerArmLeft);

const upperArmRight = createArmSegment(0x44ff44, lengthUpper);
const lowerArmRight = createArmSegment(0x00aa00, lengthLower);
scene.add(upperArmRight, lowerArmRight);

// ➕ Mani fisse
const handLeft = new THREE.Mesh(
  new THREE.SphereGeometry(0.035, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
scene.add(handLeft);

const handRight = new THREE.Mesh(
  new THREE.SphereGeometry(0.035, 16, 16),
  new THREE.MeshStandardMaterial({ color: 0xffffff })
);
scene.add(handRight);

const controller1 = renderer.xr.getController(0);
scene.add(controller1);

const controller2 = renderer.xr.getController(1);
scene.add(controller2);

function updateArm(shoulder, controller, upperArm, lowerArm, hand, lengthUpper, lengthLower) {
  const handPos = controller.position.clone();
  const shoulderToHand = handPos.clone().sub(shoulder);
  const distance = shoulderToHand.length();
  const totalLength = lengthUpper + lengthLower;

  const clampedDir = shoulderToHand.clone().normalize().multiplyScalar(Math.min(distance, totalLength));
  const correctedHand = shoulder.clone().add(clampedDir);

  const mid = shoulder.clone().add(correctedHand).multiplyScalar(0.5);
  const bendAxis = new THREE.Vector3().crossVectors(shoulderToHand, new THREE.Vector3(0, 1, 0)).normalize();
  const bendAmount = Math.sqrt(Math.max(lengthUpper * lengthUpper - Math.pow(distance / 2, 2), 0));
  const elbow = mid.clone().add(bendAxis.multiplyScalar(bendAmount));

  const upperVec = elbow.clone().sub(shoulder);
  upperArm.position.copy(shoulder.clone().addScaledVector(upperVec, 0.5));
  upperArm.lookAt(elbow);
  upperArm.rotateX(Math.PI / 2);

  const lowerVec = correctedHand.clone().sub(elbow);
  lowerArm.position.copy(elbow.clone().addScaledVector(lowerVec, 0.5));
  lowerArm.lookAt(correctedHand);
  lowerArm.rotateX(Math.PI / 2);

  hand.position.copy(correctedHand);
}

// Loop
renderer.setAnimationLoop(() => {
  // Muovi testa in base al visore
  if (renderer.xr.isPresenting) {
    const refSpace = renderer.xr.getReferenceSpace();
    const viewerPose = renderer.xr.getCameraPose ? renderer.xr.getCameraPose(refSpace) : null;
    if (viewerPose && viewerPose.transform) {
      const pos = viewerPose.transform.position;
      const rot = viewerPose.transform.orientation;
      headPivot.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    }
  }

  updateArm(leftShoulder, controller1, upperArmLeft, lowerArmLeft, handLeft, lengthUpper, lengthLower);
  updateArm(rightShoulder, controller2, upperArmRight, lowerArmRight, handRight, lengthUpper, lengthLower);
  renderer.render(scene, camera);
});
