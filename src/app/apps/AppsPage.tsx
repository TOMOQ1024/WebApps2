"use client";
import AppCard from "@/components/appcard";
import { IApp } from "@/types/IApp";
import axios from "axios";
import { useEffect, useState } from "react";

export default function AppsPage() {
  const [apps, setApps] = useState<IApp[]>([]);

  useEffect(() => {
    axios.get("/api/apps/get").then((res) => {
      setApps(res.data);
    });
  }, []);

  return (
    <main>
      {apps.map((a, i) => {
        return <AppCard key={i} app={a} />;
      })}
    </main>
  );
}
