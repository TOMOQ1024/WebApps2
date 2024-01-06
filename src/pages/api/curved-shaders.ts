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
  const vertPath = path.resolve('./public', 'resources', 'curved', 'shaders', 'shader.vert');
  const fragPath = path.resolve('./public', 'resources', 'curved', 'shaders', 'shader.frag');
  const vertBuf = fs.readFileSync(vertPath);
  const fragBuf = fs.readFileSync(fragPath);

  res.status(200).json({
    vert: vertBuf.toString(),
    frag: fragBuf.toString()
  });
}