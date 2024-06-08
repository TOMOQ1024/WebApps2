import { EdgeMasks, TriangleTable } from "@/src/MarchingCubesLookUpTables";
import { BufferGeometry, Float32BufferAttribute, Mesh, MeshLambertMaterial, Scene } from "three";

export class MarchingCubesMgr {
  private _func = (x: number, y: number, z: number) => 0;
  set func (f: typeof this._func) {
    this._func = f;
    (async () => {
      await this.init();
    })();
  }
  get func () {
    return this._func;
  }

  res = {
    x: 30,
    y: 30,
    z: 30,
  };

  min = {
    x: -5,
    y: -5,
    z: -5,
  };

  max = {
    x: +5,
    y: +5,
    z: +5,
  };

  get size () {
    return ({
      x: this.max.x - this.min.x,
      y: this.max.y - this.min.y,
      z: this.max.z - this.min.z,
    });
  }

  getIndex (x: number, y: number, z: number, o: number) {
    return x<this.res.x && y<this.res.y && z<this.res.z ? o+3*(x+this.res.x*(y+this.res.y*z)) : undefined;
  }

  vertices: number[] = [];
  indices: number[] = [];
  errors: number[] = [];

  vals: number[][][] = [];
  geometry = new BufferGeometry();
  
  calc () {
    this.vals = [];

    const s = this.size;
    for (let z=0; z<=this.res.z; z++) {
      this.vals.push([]);
      for (let y=0; y<=this.res.y; y++) {
        this.vals[z].push([]);
        for (let x=0; x<=this.res.x; x++) {
          this.vals[z][y].push(this.func(
            this.min.x+x*s.x,
            this.min.y+y*s.y,
            this.min.z+z*s.z
          ));
        }
      }
    }
  }

  getState (x: number, y: number, z: number) {
    return (
      (this.vals[z  ][y  ][x  ] < 0 ? 0x01 : 0) +
      (this.vals[z  ][y  ][x+1] < 0 ? 0x02 : 0) +
      (this.vals[z  ][y+1][x  ] < 0 ? 0x04 : 0) +
      (this.vals[z  ][y+1][x+1] < 0 ? 0x08 : 0) +
      (this.vals[z+1][y  ][x  ] < 0 ? 0x10 : 0) +
      (this.vals[z+1][y  ][x+1] < 0 ? 0x20 : 0) +
      (this.vals[z+1][y+1][x  ] < 0 ? 0x40 : 0) +
      (this.vals[z+1][y+1][x+1] < 0 ? 0x80 : 0)
    );
  }

  constructor (
    public scene: Scene
  ) {
    const p = {
      x: 0,
      y: 0,
      z: 0,
    };
    this.vertices = [];
    const s = this.size;
    for (let z=0; z<this.res.z; z++) {
      for (let y=0; y<this.res.y; y++) {
        for (let x=0; x<this.res.x; x++) {
          // 各セルに対して3辺に対応する頂点を追加する
          p.x = this.min.x+x*s.x;
          p.y = this.min.y+y*s.y;
          p.z = this.min.z+z*s.z;
          this.vertices.push(
            p.x, p.y, p.z,
            p.x, p.y, p.z,
            p.x, p.y, p.z,
          );
        }
      }
    }

    const material = new MeshLambertMaterial({
      color: '#ffffff',
    });

    const mesh = new Mesh(this.geometry, material);
    scene.add(mesh);

    // (async () => {
    //   const rawShaderData = await axios.get('/api/shaders/maths3d').then(res=>{
    //     return res.data;
    //   }).catch(e=>{
    //     throw new Error(e);
    //   });

      

    //   const material = new ShaderMaterial({
    //     vertexShader: rawShaderData.vert,
    //     fragmentShader: rawShaderData.frag,
    //     // wireframe: true,
    //   });
    // })();
  }

  async init () {
    this.calc();

    let i: number;
    let em: number;
    let dv: number;
    let v: number[];
    let tt: number[];
    this.errors = [];
    this.indices = [];
    for (let z=0; z<this.res.z; z++) {
      for (let y=0; y<this.res.y; y++) {
        for (let x=0; x<this.res.x; x++) {
          dv = this.getIndex(x  , y  , z  , 0)!
          v = [
            this.getIndex(x  , y  , z  , 0) ?? dv,
            this.getIndex(x+1, y  , z  , 1) ?? dv,
            this.getIndex(x  , y+1, z  , 0) ?? dv,
            this.getIndex(x  , y  , z  , 1) ?? dv,
            this.getIndex(x  , y  , z+1, 0) ?? dv,
            this.getIndex(x+1, y  , z+1, 1) ?? dv,
            this.getIndex(x  , y+1, z+1, 0) ?? dv,
            this.getIndex(x  , y  , z+1, 1) ?? dv,
            this.getIndex(x  , y  , z  , 2) ?? dv,
            this.getIndex(x+1, y  , z  , 2) ?? dv,
            this.getIndex(x+1, y+1, z  , 2) ?? dv,
            this.getIndex(x  , y+1, z  , 2) ?? dv,
          ];

          const ev = [
            this.vals[z][y][x]-this.vals[z][y][x+1],
            this.vals[z][y][x]-this.vals[z][y+1][x],
            this.vals[z][y][x]-this.vals[z+1][y][x],
          ];
          // this.errors.push(
          //   1, 0, 0,
          //   0, 1, 0,
          //   0, 0, 1,
          // );
          this.errors.push(
            ev[0] && this.vals[z][y][x]/ev[0], 0, 0,
            0, ev[1] && this.vals[z][y][x]/ev[1], 0,
            0, 0, ev[2] && this.vals[z][y][x]/ev[2],
          );

          i = this.getState(x, y, z);
          em = EdgeMasks[i];
          tt = TriangleTable[i].slice(0, -1);
          this.indices.push(...tt.map(t=>v[t]));
        }
      }
    }

    // 頂点座標を書き換える方式に．動作が重いようだったら改良する．
    this.geometry.setAttribute('position', new Float32BufferAttribute(this.vertices.map((v,i)=>v+this.errors[i]), 3));
    // this.geometry.setAttribute('aError', new Float32BufferAttribute(this.errors, 3));
    this.geometry.setIndex(this.indices);
    this.geometry.computeVertexNormals();
    console.log(this.vertices.length, Math.max(...this.indices));
  }
}