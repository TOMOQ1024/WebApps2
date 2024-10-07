"use client";
import { Levenshtein } from "@/src/Levenshtein";
import { IApp } from "@/types/IApp";
import axios from "axios";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface AppList {
  data: IApp;
  pt: boolean;
  ld: number;
  score: number;
}

export default function NotFoundPage() {
  const pathname = usePathname() ?? "";
  const [apps, setApps] = useState<IApp[]>([]);
  const [sortedApps, setSortedApps] = useState<AppList[]>([]);

  useEffect(() => {
    axios.get("/api/apps/get").then((res) => {
      setApps(res.data);
    });
  }, []);

  useEffect(() => {
    setSortedApps(
      apps
        .map((ad) => {
          const _name = ad.path.replace(/\s/g, "").toLowerCase();
          const _pathname = pathname.replace(/\s|\//g, "").toLowerCase();
          return {
            data: ad,
            pt: 0 <= _pathname.indexOf(_name) || 0 <= _name.indexOf(_pathname),
            ld: Levenshtein(pathname, _name),
            score: 0,
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
              <Link href={`/apps/${a.data.path}`}>{a.data.name}</Link>
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
