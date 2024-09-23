"use client";

import CompDynamCanvas from "@/components/CompDynamCanvas";
import React from "react";
import { IPost } from "@/types/IPost";

export default function Post({ data }: { data: IPost }) {
  return (
    <div
      style={{
        width: 200,
        height: 200,
        margin: 5,
        border: "1px solid white",
        borderRadius: 10,
        overflow: "hidden",
      }}
    >
      <CompDynamCanvas options={{ data, width: 200, height: 200 }} />
    </div>
  );
}
