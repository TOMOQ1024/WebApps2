import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

export function GET(req: NextRequest) {
  try {
    const vertPath = path.resolve(
      "./public",
      "resources",
      "cubes",
      "shaders",
      "shader.vert"
    );
    const fragPath = path.resolve(
      "./public",
      "resources",
      "cubes",
      "shaders",
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
  } catch (e) {
    return NextResponse.json(
      { message: `failed to get shader files` },
      { status: 404 }
    );
  }
}
