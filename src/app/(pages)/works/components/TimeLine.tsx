"use client";

import React from "react";
import Post from "./Post";
import useSWR from "swr";
import axios from "axios";
import { IPost } from "../../../../types/IPost";

async function fetcher() {
  return (await axios.get("/api/works/get")).data;
}

export default function TimeLine() {
  const { data, error, isLoading } = useSWR<IPost[]>("/api/user", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
      }}
    >
      {data?.map((d) => (
        <Post key={d.id} data={d} />
      ))}
    </div>
  );
}
