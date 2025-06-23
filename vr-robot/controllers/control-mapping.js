// controllers/control-mapping.js

/**
 * Mappa la rotazione dei controller VR sui joint del robot.
 * Per semplicità, usiamo rotazioni rispetto a Y per le spalle,
 * rispetto a Z per i gomiti.
 */
export function applyControlMapping(robot, controllers) {
  const [ctrlL, ctrlR] = controllers;
  const { shoulderLeft, shoulderRight, elbowLeft, elbowRight } = robot.parts;

  // Lettura rotazioni da controller
  const quatL = ctrlL.quaternion;
  const quatR = ctrlR.quaternion;

  // Converti in Euler
  const eulerL = new THREE.Euler().setFromQuaternion(quatL, 'YXZ');
  const eulerR = new THREE.Euler().setFromQuaternion(quatR, 'YXZ');

  // Applica alle spalle (rotazione orizzontale y)
  shoulderLeft.rotation.y = eulerL.y;
  shoulderRight.rotation.y = eulerR.y;

  // Applica ai gomiti (rotazione z con amplificazione)
  elbowLeft.rotation.z = eulerL.x * 0.5;
  elbowRight.rotation.z = eulerR.x * 0.5;
}
