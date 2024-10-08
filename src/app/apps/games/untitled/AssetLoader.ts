import * as THREE from 'three';
import Core from "./Core";
import Map from "./Map";

type MapData = {
  text: string;
}

export default class AssetLoader {
  assets: {
    [key:string]: THREE.Texture
  } = {};
  loader = new THREE.TextureLoader();

  constructor (
    public core: Core
  ) {
    //
  }

  async loadMap (n: number) {
    let response = await fetch('/api/untitled-assets/map/1');
    const data = await response.json() as MapData;
    const lines = data.text.split('\n');
    const [w, h] = lines[0].split(/\s+/).map(v=>parseInt(v));
    const map: string[][] = [];

    let line: string[];
    for (let y=0; y<h; y++) {
      map.push([]);
      for (let x=0; x<w; x++) {
        line = lines[1+y].split(/[,\s]+/);
        map[y].push(line[x]);
      }
    }

    return new Map(this.core, w, h, map);
  }

  setAsset (name: string, filename: string, repeatX: number, repeatY: number) {
    this.assets[name] = this.loader.load(`resources/untitled/images/${filename}`);
    this.assets[name].minFilter = THREE.NearestFilter;
    this.assets[name].magFilter = THREE.NearestFilter;
    this.assets[name].repeat.x = repeatX;
    this.assets[name].repeat.y = repeatY;
    this.assets[name].wrapS = THREE.RepeatWrapping;
    this.assets[name].wrapT = THREE.RepeatWrapping;
  }

  async load () {
    this.setAsset('wall', 'tile-blue.png', 1, 2);
    this.setAsset('ceil', 'tile-blue.png', 51, 51);
    this.setAsset('floor', 'tile-blue.png', 51, 51);
    this.setAsset('gate', 'tile-blue-tiny.png', 2, 1);
  }
}
