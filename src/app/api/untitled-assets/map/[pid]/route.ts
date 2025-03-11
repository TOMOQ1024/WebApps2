import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";

type Data = {
  text: string;
};

async function handler(
  req: NextRequest,
  { params }: { params: Promise<{ pid: string }> }
) {
  try {
    const { pid } = await params;
    const buf = fs.readFileSync(
      path.resolve("./public", "resources", "untitled", "maps", `map${pid}.txt`)
    );

    return NextResponse.json({ text: buf.toString() }, { status: 200 });
  } catch (e) {
    return NextResponse.json({}, { status: 404 });
  }
}

export { handler as GET };
