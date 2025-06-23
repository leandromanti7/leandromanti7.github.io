// robot/hierarchy.js
export function setupHierarchy(robot) {
  const p = robot.parts;

  // Braccio sinistro
  p.shoulderLeft.add(p.upperArmLeft);
  p.upperArmLeft.add(p.elbowLeft);
  p.elbowLeft.add(p.forearmLeft);
  p.forearmLeft.add(p.wristLeft);

  // Braccio destro
  p.shoulderRight.add(p.upperArmRight);
  p.upperArmRight.add(p.elbowRight);
  p.elbowRight.add(p.forearmRight);
  p.forearmRight.add(p.wristRight);

  // Collega le spalle al busto
  p.torso.add(p.shoulderLeft);
  p.torso.add(p.shoulderRight);
}
