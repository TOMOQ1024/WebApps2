import type { Metadata } from "next";
import LinearAttractor2DApp from "./LinearAttractor2DApp";

export const metadata: Metadata = {
  title: "Linear Attractor 2D",
  description: "Linear Attractor 2D",
};

export default function Page() {
  return <LinearAttractor2DApp />;
}
