# Gmowski-Mira Attractor

https://ja.wikipedia.org/wiki/%E3%82%B0%E3%83%A2%E3%82%A6%E3%82%B9%E3%82%AD%E3%83%BC%E3%83%BB%E3%83%9F%E3%83%A9%E3%81%AE%E5%86%99%E5%83%8F

スライダーで調整できるパラメータによって動的に描画を行う

## 実装

- 各点は Three.js の `GPUComputationRenderer` を用いて独立に計算される
- 頂点は Three.js を用いて描画される
