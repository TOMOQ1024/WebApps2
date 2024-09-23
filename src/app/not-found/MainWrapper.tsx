"use client";
import { Levenshtein } from "@/src/Levenshtein";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AppData {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  path: string;
  tag: string[];
}

interface AppList {
  name: string;
  data: AppData;
  pt: boolean;
  ld: number;
  score: number;
  path?: string;
}

export default function MainWrapper() {
  const pathname = usePathname() ?? "";
  const [apps, setApps] = useState<AppData[]>([]);
  const [sortedApps, setSortedApps] = useState<AppList[]>([]);

  useEffect(() => {
    axios.get("/api/apps/get").then((res) => {
      console.log("!");
      setApps(res.data);
    });
  }, []);

  useEffect(() => {
    setSortedApps(
      apps
        .map((ad) => {
          const _name = ad.name.replace(/\s/g, "").toLowerCase();
          const _pathname = pathname.replace(/\s|\//g, "").toLowerCase();
          return {
            name: ad.name,
            data: ad,
            pt: 0 <= _pathname.indexOf(_name) || 0 <= _name.indexOf(_pathname),
            ld: Levenshtein(pathname, _name),
            score: 0,
            path: ad.path,
          };
        })
        .map((v) => {
          return {
            ...v,
            score: v.ld - (v.pt ? 20 : 0),
          };
        })
        .toSorted((a, b) => a.score - b.score)
    );
  }, [pathname, apps]);

  return (
    <main>
      <p>ページが見つかりませんでした(pathname: {pathname})</p>
      <br />
      <div>
        もしかして：
        {sortedApps.map((a, i) => {
          return (
            <div key={i}>
              <Link
                href={a.path ?? `/${a.name.replace(/\s/g, "").toLowerCase()}`}
              >
                {a.name}
              </Link>
            </div>
          );
        })}
      </div>
      {/* <pre>
        {JSON.stringify(sortedApps, null, 2)}
      </pre> */}
    </main>
  );
}
