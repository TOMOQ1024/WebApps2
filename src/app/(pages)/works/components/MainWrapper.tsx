"use client";

import axios from "axios";
import { useSession } from "next-auth/react";
import React from "react";
import TimeLine from "./TimeLine";

export default function MainWrapper() {
  const { data: session, status } = useSession();

  const get = async () => {
    const response = await axios.get("/api/works/get");
    console.log(response);
  };

  const cre = async () => {
    const data = {
      authorId: +(prompt("authorId?") ?? 1),
      z0Expression: prompt("z0Expression?"),
      expression: prompt("expression?"),
      radius: +(prompt("radius?") ?? 0),
      originX: +(prompt("originX?") ?? 0),
      originY: +(prompt("originY?") ?? 0),
      tags: [],
    };
    const response = await axios.post("/api/works/create", data);
    console.log(response);
  };

  const del = async () => {
    const response = await axios.post("/api/works/delete", {
      id: prompt("id?") || "",
    });
    console.log(response);
  };

  return (
    <main id="main-wrapper">
      <p>セッション：{session ? "有効" : "無効"}</p>
      <button onClick={get}>GET</button>
      <button onClick={cre}>CREATE</button>
      <button onClick={del}>DELETE</button>
      <TimeLine />
    </main>
  );
}
