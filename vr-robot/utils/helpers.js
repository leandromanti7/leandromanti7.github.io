// utils/helpers.js

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function toDeg(rad) {
  return rad * 180 / Math.PI;
}

export function toRad(deg) {
  return deg * Math.PI / 180;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
