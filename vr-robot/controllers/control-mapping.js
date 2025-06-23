// controllers/control-mapping.js
import * as THREE from '../vr-test-local/js/three.module.js';
import { clamp, lerp } from '../utils/helpers.js';

let offsetYawL = null;
let offsetYawR = null;
let currentYawL = 0;
let currentYawR = 0;

/**
 * Mappa la rotazione dei controller VR sui joint del robot,
 * con offset iniziale, smoothing e limiti angolari.
 */
export function applyControlMapping(robot, controllers) {
  const [ctrlL, ctrlR] = controllers;
  const { shoulderLeft, shoulderRight, elbowLeft, elbowRight } = robot.parts;

  const quatL = ctrlL.quaternion;
  const quatR = ctrlR.quaternion;

  const eulerL = new THREE.Euler().setFromQuaternion(quatL, 'YXZ');
  const eulerR = new THREE.Euler().setFromQuaternion(quatR, 'YXZ');

  // Registra offset iniziale una volta sola
  if (offsetYawL === null) offsetYawL = eulerL.y;
  if (offsetYawR === null) offsetYawR = eulerR.y;

  // Calcola differenza rispetto all'offset
  const rawYawL = eulerL.y - offsetYawL;
  const rawYawR = eulerR.y - offsetYawR;

  // Clamp ±90°
  const clampedYawL = clamp(rawYawL, -Math.PI / 2, Math.PI / 2);
  const clampedYawR = clamp(rawYawR, -Math.PI / 2, Math.PI / 2);

  // Smoothing (lerp verso il valore clamped)
  currentYawL = lerp(currentYawL, clampedYawL, 0.1);
  currentYawR = lerp(currentYawR, clampedYawR, 0.1);

  // Applica rotazione alle spalle
  shoulderLeft.rotation.y = currentYawL;
  shoulderRight.rotation.y = currentYawR;

  // Applica pitch (X) ai gomiti, clamped e smussato
  const rawPitchL = clamp(eulerL.x, -Math.PI / 2, Math.PI / 2);
  const rawPitchR = clamp(eulerR.x, -Math.PI / 2, Math.PI / 2);

  elbowLeft.rotation.z = lerp(elbowLeft.rotation.z, rawPitchL * 0.5, 0.1);
  elbowRight.rotation.z = lerp(elbowRight.rotation.z, rawPitchR * 0.5, 0.1);
}

// Facoltativo: reset offset su richiesta (es. tasto)
export function resetControllerOffsets() {
  offsetYawL = null;
  offsetYawR = null;
}
