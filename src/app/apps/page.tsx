import { appList } from "@/lib/appList";
import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "tomoq apps",
};

export default function Home() {
  return (
    <main>
      {Array.from(Object.entries(appList)).map(([path, { appName }]) => {
        return (
          <div>
            <Link href={`/apps/${path}`}>
              <Image
                src={`/app-icons/${path}.png`}
                width={128}
                height={128}
                alt={`App icon of ${appName}`}
                priority={false}
              />
            </Link>
            <div>{appName}</div>
          </div>
        );
      })}
    </main>
  );
}
