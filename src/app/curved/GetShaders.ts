import WGMgr from "./Core";

type Data = {
  vert: string;
  frag: string;
}

export default async function GetShaders(this: WGMgr) {
  try {
    let response = await fetch('/api/curved-shaders');
    const data: Data = await response.json();
    return `${data.vert}\n\n${data.frag}`;
  }
  catch (e){
    console.error(e);
    return '';
  }
}