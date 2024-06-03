"use client"
import { Levenshtein } from '@/src/Levenshtein';
import axios from 'axios';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AppData {
  [key: string]: {
    "tag": string[];
    "desc": string;
    "since": string;
    "lastUpdate": string;
  }
};

interface AppList {
  name: string,
  data: AppData[string],
  pt: boolean,
  ld: number,
  score: number,
}

export default function MainWrapper () {
  const pathname = usePathname() ?? '';
  const [apps, setApps] = useState<AppData>({});
  const [sortedApps, setSortedApps] = useState<AppList[]>([]);

  useEffect(() => {
    axios.get('/applist.json')
    .then(res=>{
      console.log('!');
      setApps(res.data);
    })
  }, []);

  useEffect(() => {
    setSortedApps(Object.entries(apps).map(([name,val])=>{
      const _name = name.replace(/\s/g,'').toLowerCase();
      const _pathname = pathname.replace(/\s|\//g,'').toLowerCase();
      return ({
        name,
        data: val,
        pt: 0<=_pathname.indexOf(_name)
        || 0<=_name.indexOf(_pathname),
        ld: Levenshtein(pathname, _name),
        score: 0,
      });
    }).map(v=>{
      return ({
        ...v,
        score: v.ld - (v.pt ? 20 : 0),
      });
    }).toSorted((a,b)=>a.score-b.score));
  }, [pathname, apps]);

  return (
    <main>
      <p>ページが見つかりませんでした(pathname: {pathname})</p>
      <br/>
      <div>
        もしかして：
        {
          sortedApps.map((a,i) => {
            return (
              <div key={i}>
                <Link href={`/${a.name.replace(/\s/g,'').toLowerCase()}`}>{a.name}</Link>
              </div>
            );
          })
        }
      </div>
      {/* <pre>
        {JSON.stringify(sortedApps, null, 2)}
      </pre> */}
    </main>
  )
}
