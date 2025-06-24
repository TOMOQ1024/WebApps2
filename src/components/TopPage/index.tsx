"use client";

import { useEffect, useState } from "react";
import TopScene from "./TopScene";
import styles from "./index.module.scss";
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
    <main className={styles.topPage}>
      <FullScreenCanvas>
        <TopScene scrollY={scrollY} />
      </FullScreenCanvas>

      {/* スクロール可能なコンテンツエリア */}
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <h1>tomoq</h1>
          <p>数学と計算機と創作</p>
        </section>

        <section className={styles.aboutSection}>
          <h2>About this site</h2>
          <p>私のみたいものと，私のみたいものをつくるものをつくります．</p>
          <div className={styles.linkWrapper}>
            <a href="/apps">Apps</a>
            <a href="/galleries">Galleries</a>
            {/* <a href="/works">Works</a> */}
          </div>
        </section>

        <section className={styles.interestsSection}>
          <h2>Interests</h2>

          <div className={styles.visualList}>
            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>関数アート</h3>
                <p>方程式や不等式で図形を描く</p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>フラクタル図形</h3>
                <p>関数の反復計算で図形を描く</p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>一様平面充填</h3>
                <p>鏡で模様を描く</p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>一様多胞体</h3>
                <p>正多角形，正多面体を一般化する</p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>仮想現実</h3>
                <p>現実にはない景色をつくる</p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>シェーダー</h3>
                <p>多量の計算で新しい体験をつくる</p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2>Links</h2>
          <p>
            作品や技術についてお話ししたい方，コラボレーションのご相談など，お気軽にお声かけください．
          </p>
          <div className={styles.linkWrapper}>
            <a href="https://x.com/TOMOQ8192">X</a>
            <a href="https://github.com/TOMOQ1024">GitHub</a>
            <a href="https://tomoq8192.booth.pm/">Booth</a>
            <a href="https://vrchat.com/home/user/usr_de301140-5558-4aa6-8b5c-8ca502b7ac0a">
              VRChat
            </a>
          </div>
        </section>

        <section className={styles.licenseSection}>
          <h2>License</h2>
          <p>
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
