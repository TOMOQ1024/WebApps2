import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Data = {
  vert: string;
  frag: string;
};

export function GET(req: NextRequest) {
  const vertPath = path.resolve(
    "./public",
    "resources",
    "maths",
    "renderer",
    "2d",
    "shader.vert"
  );
  const fragPath = path.resolve(
    "./public",
    "resources",
    "maths",
    "renderer",
    "2d",
    "shader.frag"
  );
  const vertBuf = fs.readFileSync(vertPath);
  const fragBuf = fs.readFileSync(fragPath);

  return NextResponse.json(
    {
      vert: vertBuf.toString(),
      frag: fragBuf.toString(),
    },
    { status: 200 }
  );
}
