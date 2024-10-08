"use client";
import Image from "next/image";
import Link from "next/link";
import "../app/app.scss";
import { IApp } from "@/types/IApp";

export default function AppCard({ app }: { app: IApp }) {
  if (!app) return <></>;

  return (
    <div className="appcard">
      <Link href={`/apps/${app.path}`}>
        <Image
          src={`/app-icons/${app.path}.png`}
          width={128}
          height={128}
          alt={`App icon of ${app.name}`}
          priority={false}
        />
      </Link>
      <div>{app.name}</div>
      {/* <div style={{ fontSize: "small" }}>{app.description}</div> */}
    </div>
  );
}
