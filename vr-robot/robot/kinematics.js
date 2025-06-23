// robot/kinematics.js
import * as THREE from '../three.module.js';

/**
 * Esempio base di cinematica diretta:
 * Applica una rotazione manuale ai giunti del braccio sinistro
 * in base ad angoli predefiniti (o input futuri).
 */
export function updateKinematics(robot, angles = {}) {
  const {
    shoulderLeft,
    upperArmLeft,
    elbowLeft,
    forearmLeft,
    wristLeft
  } = robot.parts;

  // Applica rotazioni se presenti
  if (angles.shoulderY !== undefined)
    shoulderLeft.rotation.y = clampAngle(angles.shoulderY);

  if (angles.elbowZ !== undefined)
    elbowLeft.rotation.z = clampAngle(angles.elbowZ);

  // In futuro puoi estendere ad altri assi e braccio destro
}

function clampAngle(angleRad, min = -Math.PI / 2, max = Math.PI / 2) {
  return Math.max(min, Math.min(max, angleRad));
}
