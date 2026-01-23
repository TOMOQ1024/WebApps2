"use client";

import { useEffect, useState } from "react";
import TopScene from "./TopScene";
import FullScreenCanvas from "../FullScreenCanvas";

const TopPage = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative w-full min-h-screen overflow-x-hidden">
      <FullScreenCanvas>
        <TopScene scrollY={scrollY} />
      </FullScreenCanvas>

      {/* スクロール可能なコンテンツエリア */}
      <div className="relative z-[1] w-full pointer-events-none [&_section]:pointer-events-auto [&_section]:p-8 [&_section]:my-8 [&_section]:mx-auto [&_section]:max-w-[800px] [&_section]:bg-[var(--background-color)] [&_section]:border-2 [&_section]:border-[var(--border-color)] max-md:[&_section]:m-4 max-md:[&_section]:p-4">
        {/* Hero Section */}
        <section className="mt-[calc(50vh+var(--header-height))] text-center">
          <h1 className="text-7xl max-md:text-5xl m-0 font-bold">tomoq</h1>
          <p className="text-xl my-4">数学と計算機と創作</p>
        </section>

        {/* About Section */}
        <section>
          <h2 className="text-3xl mb-4 border-b-2 border-[var(--border-color)] pb-2">
            About this site
          </h2>
          <p className="leading-relaxed text-lg">
            私のみたいものと，私のみたいものをつくるものをつくります．
          </p>
          <div className="flex gap-4 justify-center flex-wrap mt-4">
            <a
              href="/apps"
              className="inline-block px-8 py-4 border-2 border-[var(--border-color)] bg-[var(--background-color)] no-underline font-bold hover:invert"
            >
              Apps
            </a>
            <a
              href="/galleries"
              className="inline-block px-8 py-4 border-2 border-[var(--border-color)] bg-[var(--background-color)] no-underline font-bold hover:invert"
            >
              Galleries
            </a>
          </div>
        </section>

        {/* Interests Section */}
        <section>
          <h2 className="text-3xl mb-4 border-b-2 border-[var(--border-color)] pb-2">
            Interests
          </h2>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 mt-4">
            {[
              { title: "関数アート", desc: "方程式や不等式で図形を描く" },
              { title: "フラクタル図形", desc: "関数の反復計算で図形を描く" },
              { title: "一様平面充填", desc: "鏡で模様を描く" },
              { title: "一様多胞体", desc: "正多角形，正多面体を一般化する" },
              { title: "仮想現実", desc: "現実にはない景色をつくる" },
              { title: "シェーダー", desc: "多量の計算で新しい体験をつくる" },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-[var(--background-color)] border-2 border-[var(--border-color)] p-4"
              >
                <h3 className="text-xl mb-2">{item.title}</h3>
                <p className="text-sm leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Links Section */}
        <section>
          <h2 className="text-3xl mb-4 border-b-2 border-[var(--border-color)] pb-2">
            Links
          </h2>
          <p className="leading-relaxed text-lg">
            作品や技術についてお話ししたい方，コラボレーションのご相談など，お気軽にお声かけください．
          </p>
          <div className="flex gap-4 justify-center flex-wrap mt-4">
            {[
              { href: "https://x.com/TOMOQ8192", label: "X" },
              { href: "https://github.com/TOMOQ1024", label: "GitHub" },
              { href: "https://tomoq8192.booth.pm/", label: "Booth" },
              {
                href: "https://vrchat.com/home/user/usr_de301140-5558-4aa6-8b5c-8ca502b7ac0a",
                label: "VRChat",
              },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="inline-block px-8 py-4 border-2 border-[var(--border-color)] bg-[var(--background-color)] no-underline font-bold hover:invert"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        {/* License Section */}
        <section>
          <h2 className="text-3xl mb-4 border-b-2 border-[var(--border-color)] pb-2">
            License
          </h2>
          <p className="leading-relaxed text-lg">
            このサイトの
            <a href="https://github.com/TOMOQ1024/WebApps2">ソースコード</a>は
            MIT License
            の下で公開されており，学習・研究目的で自由にご利用いただけます．またサイト内でのスクリーンショットやダウンロード可能なコンテンツは目的にかかわらず自由にご利用いただけます．
          </p>
        </section>
      </div>
    </main>
  );
};

export default TopPage;
