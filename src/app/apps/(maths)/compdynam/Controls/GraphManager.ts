import * as THREE from "three";

export interface Graph {
  origin: THREE.Vector2;
  radius: number;
}

export class GraphManager {
  private graph: Graph;

  constructor(initialOrigin: THREE.Vector2, initialRadius: number) {
    this.graph = {
      origin: initialOrigin,
      radius: initialRadius,
    };
  }

  getGraph(): Graph {
    return { ...this.graph };
  }

  translate(delta: THREE.Vector2) {
    const v = delta.clone().multiplyScalar(this.graph.radius);
    this.graph.origin.add(v);
  }

  zoom(factor: number, mousePosition: THREE.Vector2) {
    const c = mousePosition.clone();
    const ds = Math.exp(factor / 500);
    const dor = c
      .clone()
      .multiplyScalar(this.graph.radius * (1 - 1 / ds))
      .multiply(new THREE.Vector2(1, -1));

    this.graph.origin.add(dor);
    this.graph.radius *= ds;
  }
}
