import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export function GET(req: NextRequest) {
  const vertPath = path.resolve(
    "./public",
    "resources",
    "maths",
    "polychora",
    "shader.vert"
  );
  const fragPath = path.resolve(
    "./public",
    "resources",
    "maths",
    "polychora",
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
