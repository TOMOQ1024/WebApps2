"use client";

import { CompDynamPost } from "@prisma/client";
import React from "react";

export default function Post({ data }: { data: CompDynamPost }) {
  return (
    <div>
      <div>{data.authorId}</div>
      <div>{data.expression}</div>
    </div>
  );
}
