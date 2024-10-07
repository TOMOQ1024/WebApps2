"use client";

import React from "react";
import { IPost } from "@/types/IPost";
import Image from "next/image";
import Link from "next/link";

export default function Post({ data }: { data: IPost & { src: string } }) {
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
      <Link
        href={`/apps/maths/compdynam?expr=${encodeURIComponent(
          data.expression
        )}&z0expr=${encodeURIComponent(data.z0Expression)}&iter=${
          data.iteration
        }&origin=${data.originX},${data.originY}&radius=${data.radius}`}
      >
        <Image
          id={`cdcvs-${data.id}`}
          src={data.src ?? ""}
          alt={""}
          width={200}
          height={200}
        />
      </Link>
    </div>
  );
}
