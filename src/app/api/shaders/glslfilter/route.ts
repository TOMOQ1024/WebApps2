import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Data = {
  frag: string;
};

export function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (name == null) {
    return NextResponse.json(
      { message: "parameter 'name' is not defined" },
      { status: 400 }
    );
  }

  try {
    const fragPath = path.resolve(
      "./public",
      "resources",
      "glslfilter",
      `${name}.frag`
    );
    const fragBuf = fs.readFileSync(fragPath);

    return NextResponse.json(
      {
        frag: fragBuf.toString(),
      },
      { status: 200 }
    );
  } catch (e) {
    return NextResponse.json(
      { message: `cannot find file named ${name}.frag` },
      { status: 404 }
    );
  }
}
