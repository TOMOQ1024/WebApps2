import * as THREE from "three";

// prettier-ignore
export const sampleParams = {
  sierpinski_tetrahedron: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 1,
    threshold3: 1,
    transform0: new THREE.Matrix4(
      0.5, 0.0, 0.0, 0.5,
      0.0, 0.5, 0.0, 0.5,
      0.0, 0.0, 0.5, 0.5,
      0, 0, 0, 1
    ),
    transform1: new THREE.Matrix4(
      0.5,
      0.0,
      0.0,
      -0.5,
      0.0,
      0.5,
      0.0,
      -0.5,
      0.0,
      0.0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ),
    transform2: new THREE.Matrix4(
      0.5,
      0.0,
      0.0,
      -0.5,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      0.0,
      0.5,
      -0.5,
      0,
      0,
      0,
      1
    ),
    transform3: new THREE.Matrix4(
      0.5,
      0.0,
      0.0,
      0.5,
      0.0,
      0.5,
      0.0,
      -0.5,
      0.0,
      0.0,
      0.5,
      -0.5,
      0,
      0,
      0,
      1
    ),
  },
  bernsley_fern: {
    threshold0: 0.01,
    threshold1: 0.85,
    threshold2: 0.07,
    threshold3: 0.07,
    transform0: new THREE.Matrix4(
          0,    0,    0,    0,
          0, 0.16,    0,    0,
          0,    0,    0,    0,
          0,    0,    0,    1
    ),
    transform1: new THREE.Matrix4(
       0.85, 0.04,    0,    0,
      -0.04, 0.85,    0, 1.60,
          0,    0, 0.50,    0,
          0,    0,    0,    1
    ),
    transform2: new THREE.Matrix4(
       0.20, -0.26,    0,    0,
       0.23,  0.22,    0, 1.60,
          0,     0, 0.50,    0,
          0,     0,    0,    1
    ),
    transform3: new THREE.Matrix4(
      -0.15, 0.28,    0,    0,
       0.26, 0.24,    0, 0.44,
          0,    0, 0.50,    0,
          0,    0,    0,    1
    ),
  },
};
