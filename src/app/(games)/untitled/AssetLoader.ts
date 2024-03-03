import Core from "./Core";
import Map from "./Map";

type MapData = {
  text: string;
}

export default class AssetLoader {
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
}
