import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path'

type Data = {
  vert: string;
  frag: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  // Let's say your json is in /public/assets/my-json.json
  const vertPath = path.resolve('./public', 'resources', 'mandelbrotset', 'shaders', 'vert.wgsl');
  const fragPath = path.resolve('./public', 'resources', 'mandelbrotset', 'shaders', 'frag.wgsl');
  const vertBuf = fs.readFileSync(vertPath);
  const fragBuf = fs.readFileSync(fragPath);

  res.status(200).json({
    vert: vertBuf.toString(),
    frag: fragBuf.toString()
  });
}