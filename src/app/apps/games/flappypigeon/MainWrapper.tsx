"use client";
import MainCanvas from "@/components/maincanvas";
import { Suspense, useEffect, useState } from "react";
import { Game } from "./Game";
import Render from "./Render/Render";
import Update from "./Update";
import { useSearchParams } from "next/navigation";
import { Params } from "./Params";

function MainWrapper_() {
  const searchParams = useSearchParams();
  if (searchParams) Params.get((name: string) => searchParams.get(name));

  useEffect(() => {
    document.title = "Flappy Pigeon";
    let game = new Game(document.getElementById("cvs") as HTMLCanvasElement);

    const GameLoop = () => {
      Update(game);
      Render(game);
    };

    const interval = setInterval(GameLoop, 1000 / Params.FRAMERATE);

    const KeyDown = (keyName: string) => game.keyDown(keyName);
    const KeyUp = (keyName: string) => game.keyUp(keyName);

    const HandleKeyDown = (e: KeyboardEvent) => KeyDown(e.key.toLowerCase());
    const HandleKeyUp = (e: KeyboardEvent) => KeyUp(e.key.toLowerCase());
    const HandleTouchStart = (e: TouchEvent) => KeyDown("_m_touch");
    const HandleTouchEnd = (e: TouchEvent) => KeyUp("_m_touch");
    const HandleMouseDown = (e: MouseEvent) => KeyDown("_m_mouse");
    const HandleMouseUp = (e: MouseEvent) => KeyUp("_m_mouse");

    document.addEventListener("keydown", HandleKeyDown);
    document.addEventListener("keyup", HandleKeyUp);
    document.addEventListener("mousedown", HandleMouseDown);
    document.addEventListener("mouseup", HandleMouseUp);
    document.addEventListener("touchstart", HandleTouchStart);
    document.addEventListener("touchend", HandleTouchEnd);
    return () => {
      clearInterval(interval);
      document.removeEventListener("keydown", HandleKeyDown);
      document.removeEventListener("keyup", HandleKeyUp);
      document.removeEventListener("mousedown", HandleMouseDown);
      document.removeEventListener("mouseup", HandleMouseUp);
      document.removeEventListener("touchstart", HandleTouchStart);
      document.removeEventListener("touchend", HandleTouchEnd);
    };
  }, []);

  return (
    <main
      style={{
        textAlign: "center",
      }}
    >
      <MainCanvas width={Params.CANVASWIDTH} height={Params.CANVASHEIGHT} />
      <div
        style={{
          color: "#888",
          fontSize: "small",
          lineHeight: 0,
        }}
      >
        操作：ANY KEY
      </div>
    </main>
  );
}

export default function MainWrapper() {
  return (
    <Suspense>
      <MainWrapper_ />
    </Suspense>
  );
}
