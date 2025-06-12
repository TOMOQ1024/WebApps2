"use client";

import { Canvas } from "@react-three/fiber";
import { useEffect, useState } from "react";
import TopScene from "./TopScene";
import styles from "./index.module.scss";

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
    <div className={styles.topPage}>
      {/* Three.js Canvas - 画面いっぱいのサイズ */}
      <div className={styles.canvasContainer}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{ antialias: true }}
        >
          <TopScene scrollY={scrollY} />
        </Canvas>
      </div>

      {/* スクロール可能なコンテンツエリア */}
      <div className={styles.content}>
        <section className={styles.heroSection}>
          <h1>tomoq</h1>
          <p>数学と計算機と創作</p>
        </section>

        <section className={styles.aboutSection}>
          <h2>About me</h2>
          <div className={styles.personalStory}>
            <p>TODO: 自己紹介文を書く</p>
          </div>
        </section>

        <section className={styles.interestsSection}>
          <h2>Interests</h2>

          <div className={styles.visualList}>
            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>関数アート</h3>
                <p>
                  波動関数と螺旋が織りなす流動的なパターン。数学関数の時間発展による美しい軌跡を描きます。
                  三角関数の調和が生み出す自然な流れを感じてください。
                </p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>フラクタル図形</h3>
                <p>
                  マンデルブロ集合をベースにした自己相似構造。複素平面での反復計算により現れる
                  無限の複雑さを持つ境界線。ズームインしても繰り返される美しいパターンの世界です。
                </p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>空間充填</h3>
                <p>
                  ボロノイ図をベースとした動的な空間分割パターン。各点から最も近い種子点によって
                  定義される領域が織りなす有機的な構造。自然界でも見られる効率的な空間利用の法則です。
                </p>
              </div>
            </div>

            <div className={styles.visualItem}>
              <div className={styles.visualCard}>
                <h3>非ユークリッド幾何学</h3>
                <p>
                  双曲面上のタイリングパターン。平行線の公理が成り立たない世界での幾何学。
                  曲がった空間での距離と角度の概念が生み出す、直感に反する美しい秩序。
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contactSection}>
          <h2>Contact</h2>
          <div className={styles.contactContainer}>
            <div className={styles.contactCard}>
              <p>
                作品や技術についてお話ししたい方、コラボレーションのご相談など、
                お気軽にお声かけください。
              </p>
              <div className={styles.contactLinks}>
                <a
                  href="https://github.com/TOMOQ1024"
                  className={styles.contactLink}
                >
                  GitHub
                </a>
                <a
                  href="mailto:contact@example.com"
                  className={styles.contactLink}
                >
                  Email
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.licenseSection}>
          <h2>License</h2>
          <div className={styles.licenseContainer}>
            <div className={styles.licenseCard}>
              <p>
                このサイトのソースコードは MIT License の下で公開されています。
                数学的ビジュアライゼーションのコードも学習・研究目的で自由にご利用いただけます。
              </p>
              <div className={styles.licenseNote}>
                <small>作品の商用利用については事前にご相談ください。</small>
              </div>
            </div>
          </div>
        </section>

        {/* スクロールのためのスペーサー */}
        <div className={styles.spacer}></div>
      </div>
    </div>
  );
};

export default TopPage;
