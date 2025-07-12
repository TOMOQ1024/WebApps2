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
    threshold0: 1,
    threshold1: 85,
    threshold2: 7,
    threshold3: 7,
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
  snowflake: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 9,
    threshold3: 0,
    transform0: new THREE.Matrix4(
        0.5,    0,    0,    0,
          0,  0.5,    0,    0,
          0,    0,  0.5,    0,
          0,    0,    0,    1
    ),
    transform1: new THREE.Matrix4(
        0.4,    0,    0,  0.6,
          0,  0.3,    0,    0,
          0,    0,  0.5,    0,
          0,    0,    0,    1
    ),
    transform2: new THREE.Matrix4(
        0.500, -0.866,    0,    0,
        0.866,  0.500,    0,    0,
            0,      0,  0.5,    0,
            0,      0,    0,    1
    ),
    transform3: new THREE.Matrix4(
      -0.15, 0.28,    0,    0,
       0.26, 0.24,    0, 0.44,
          0,    0, 0.50,    0,
          0,    0,    0,    1
    ),
  },
  maples_leaf: {
    threshold0: 1,
    threshold1: 4,
    threshold2: 4,
    threshold3: 5,
    transform0: new THREE.Matrix4(
        0.14,  0.01,    0, -0.08,
           0,  0.51,    0, -1.31,
           0,     0,  0.5,     0,
           0,     0,    0,     1
    ),
    transform1: new THREE.Matrix4(
        0.43,  0.52,    0,  1.49,
       -0.45,  0.50,    0, -0.75,
         0.1,     0,  0.5,   0.1,
           0,     0,    0,     1
    ),
    transform2: new THREE.Matrix4(
        0.45, -0.49,    0, -1.62,
        0.47,  0.47,    0, -0.74,
        -0.1,     0,  0.5,   0.1,
           0,     0,    0,     1
    ),
    transform3: new THREE.Matrix4(
        0.49,  0.00,    0,  0.02,
           0,  0.51,    0,  1.62,
           0,   0.1,  0.5,     0,
           0,     0,    0,     1
    ),
  },
  dragon_curve: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 0,
    threshold3: 0,
    transform0: new THREE.Matrix4(
        0.5, -0.5,   0, 0,
        0.5,  0.5,   0, 0,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform1: new THREE.Matrix4(
       -0.5, -0.5,   0, 1,
        0.5, -0.5,   0, 0,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform2: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
    transform3: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
  },
  levy_dragon_curve: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 0,
    threshold3: 0,
    transform0: new THREE.Matrix4(
        0.5, -0.5,   0, 0,
        0.5,  0.5,   0, 0,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform1: new THREE.Matrix4(
        0.5, -0.5,   0, 1,
        0.5,  0.5,   0, 0,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform2: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
    transform3: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
  },
  levy_c_curve: {
    threshold0: 1,
    threshold1: 1,
    threshold2: 0,
    threshold3: 0,
    transform0: new THREE.Matrix4(
        0.5, -0.5,   0, 0,
        0.5,  0.5,   0, 0,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform1: new THREE.Matrix4(
        0.5,  0.5,   0, 0.5,
       -0.5,  0.5,   0, 0.5,
          0,    0, 0.5,   0,
          0,    0,   0,   1
    ),
    transform2: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
    transform3: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
  },
  pythagorean_tree: {
    threshold0: 3,
    threshold1: 3,
    threshold2: 2,
    threshold3: 0,
    transform0: new THREE.Matrix4(
        0.4, -0.4,   0, 0,
        0.4,  0.4,   0, 1,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform1: new THREE.Matrix4(
        0.4,  0.4,   0, 0,
       -0.4,  0.4,   0, 1,
          0,    0, 0.5, 0,
          0,    0,   0, 1
    ),
    transform2: new THREE.Matrix4(
      0, 0, 0, 0,
      0, 0.49, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 1
    ),
    transform3: new THREE.Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ),
  },

  // sierpinski_carpet
  // jerusalem_square
  // octahedron_fractal
  // menger_sponge
  // cube_fractal
  // durers_pentagons


};
