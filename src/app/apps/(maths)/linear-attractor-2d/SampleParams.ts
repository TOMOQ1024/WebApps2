import * as THREE from "three";

// biome-ignore format: s
export const sampleParams = {
  sierpinski_triangle: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 1,
    threshold3: 0,
    transform0: new THREE.Matrix3(
      0.5, 0.0, 0.5,
      0.0, 0.5, 0.5,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      0.5, 0.0, -0.5,
      0.0, 0.5, -0.5,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      0.5, 0.0, -0.5,
      0.0, 0.5, 0.5,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
  },
  barnsley_fern: {
    threshold0: 1,
    threshold1: 85,
    threshold2: 7,
    threshold3: 7,
    transform0: new THREE.Matrix3(
      0.0, 0.0, 0.0,
      0.0, 0.16, 0.0,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      0.85, 0.04, 0.0,
      -0.04, 0.85, 1.6,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      0.2, -0.26, 0.0,
      0.23, 0.22, 1.6,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      -0.15, 0.28, 0.0,
      0.26, 0.24, 0.44,
      0.0, 0.0, 1.0
    ),
  },
  dragon_curve: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 0,
    threshold3: 0,
    transform0: new THREE.Matrix3(
      0.5, -0.5, 0.0,
      0.5, 0.5, 0.0,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      -0.5, -0.5, 1.0,
      0.5, -0.5, 0.0,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
  },
  levy_c_curve: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 0,
    threshold3: 0,
    transform0: new THREE.Matrix3(
      0.5, -0.5, 0.0,
      0.5, 0.5, 0.0,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      0.5, 0.5, 0.5,
      -0.5, 0.5, 0.5,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
  },
  pythagorean_tree: {
    threshold0: 3,
    threshold1: 3,
    threshold2: 2,
    threshold3: 0,
    transform0: new THREE.Matrix3(
      0.4, -0.4, 0.0,
      0.4, 0.4, 1.0,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      0.4, 0.4, 0.0,
      -0.4, 0.4, 1.0,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      0.0, 0.0, 0.0,
      0.0, 0.49, 0.0,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      1.0, 0.0, 0.0,
      0.0, 1.0, 0.0,
      0.0, 0.0, 1.0
    ),
  },
  maple_leaf: {
    threshold0: 1,
    threshold1: 4,
    threshold2: 4,
    threshold3: 5,
    transform0: new THREE.Matrix3(
      0.14, 0.01, -0.08,
      0.0, 0.51, -1.31,
      0.0, 0.0, 1.0
    ),
    transform1: new THREE.Matrix3(
      0.43, 0.52, 1.49,
      -0.45, 0.50, -0.75,
      0.0, 0.0, 1.0
    ),
    transform2: new THREE.Matrix3(
      0.45, -0.49, -1.62,
      0.47, 0.47, -0.74,
      0.0, 0.0, 1.0
    ),
    transform3: new THREE.Matrix3(
      0.49, 0.0, 0.02,
      0.0, 0.51, 1.62,
      0.0, 0.0, 1.0
    ),
  },
};
