import fs from 'fs'
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path'

type Data = {
  text: string;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    const { pid } = req.query;
    const buf = fs.readFileSync(
      path.resolve('./public', 'resources', 'untitled', 'maps', `map${pid}.txt`)
    );
  
    res.status(200).json({
      text: buf.toString()
    });
  }
  catch (e) {
    res.status(404);
  }
}