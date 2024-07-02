"use client";

import React from "react";
import Post from "./Post";
import useSWR from "swr";
import axios from "axios";
import { CompDynamPost } from "@prisma/client";

async function fetcher() {
  return (await axios.get("/api/works/get")).data;
}

type Post = {
  id: number;
  author: {
    name: string;
  };
  iteration: number;
  z0Expression: string;
  expression: string;
  radius: number;
  originX: number;
  originY: number;
  createdAt: string;
  tags: {
    tag: {
      name: string;
    };
  }[];
};

export default function TimeLine() {
  const { data, error, isLoading } = useSWR<Post[]>("/api/user", fetcher);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading posts</div>;

  return (
    <div>
      {data?.map((post) => (
        <div key={post.id}>
          <h2>{post.author.name}</h2>
          <p>Iteration: {post.iteration}</p>
          <p>Z0 Expression: {post.z0Expression}</p>
          <p>Expression: {post.expression}</p>
          <p>Radius: {post.radius}</p>
          <p>
            Origin: ({post.originX}, {post.originY})
          </p>
          <p>Created at: {new Date(post.createdAt).toLocaleDateString()}</p>
          <div>
            Tags:
            {post.tags.map((tag) => (
              <span key={tag.tag.name}>{tag.tag.name}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
