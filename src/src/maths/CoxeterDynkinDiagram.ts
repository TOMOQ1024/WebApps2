export class CoxeterDynkinDiagram {
  gens: string[] = [];
  constructor(
    public labels: { [genPair: string]: [number, number] } = {},
    public nodeMarks: { [gen: string]: string } = {}
  ) {
    this.gens = Object.keys(nodeMarks);
  }

  withGens(gens: string[]) {
    const newNodeMarks: { [gen: string]: string } = {};
    const newLabels: { [genPair: string]: [number, number] } = {};

    // 指定されたノードのマークだけを含める
    for (const node of gens) {
      if (this.nodeMarks[node]) {
        newNodeMarks[node] = this.nodeMarks[node];
      }
    }

    // 指定されたノード間の辺のラベルだけを含める
    for (const genPair in this.labels) {
      if (gens.includes(genPair[0]) && gens.includes(genPair[1])) {
        newLabels[genPair] = this.labels[genPair];
      }
    }

    return new CoxeterDynkinDiagram(newLabels, newNodeMarks);
  }

  withoutGens(gens: string[]) {
    const newNodeMarks = { ...this.nodeMarks };
    const newLabels = { ...this.labels };

    for (const node of gens) {
      delete newNodeMarks[node];
    }

    for (const genPair in newLabels) {
      if (gens.some((node) => genPair.includes(node))) {
        delete newLabels[genPair];
      }
    }

    return new CoxeterDynkinDiagram(newLabels, newNodeMarks);
  }

  isVolumeless() {
    // ノードの集合を取得
    const nodes = Object.keys(this.nodeMarks);
    if (nodes.length === 0) return true;

    // 連結成分を格納する配列
    const components: string[][] = [];
    // 訪問済みノードを記録するSet
    const visited = new Set<string>();

    // 深さ優先探索で連結成分を見つける関数
    const dfs = (node: string, component: string[]) => {
      visited.add(node);
      component.push(node);

      for (const neighbor of nodes) {
        if (visited.has(neighbor)) continue;

        // 2つのノード間のラベルを取得
        const label = this.labels[node + neighbor];
        // ラベルが存在し、2でない場合のみ連結と見做す
        if (label[0] / label[1] !== 2) {
          dfs(neighbor, component);
        }
      }
    };

    // すべてのノードについて連結成分を見つける
    for (const node of nodes) {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs(node, component);
        components.push(component);
      }
    }

    // 各連結成分に"x"マークのノードが存在するかチェック
    for (const component of components) {
      let hasX = false;
      for (const node of component) {
        if (this.nodeMarks[node] === "x") {
          hasX = true;
          break;
        }
      }
      // 1つでも"x"マークのないコンポーネントがあればtrueを返す
      if (!hasX) return true;
    }

    // すべての連結成分に"x"マークのノードが存在する場合はfalseを返す
    return false;
  }

  getDimension() {
    // ノードの集合を取得
    const nodes = Object.keys(this.nodeMarks);
    if (nodes.length === 0) return 0;

    // 連結成分を格納する配列
    const components: string[][] = [];
    // 訪問済みノードを記録するSet
    const visited = new Set<string>();

    // 深さ優先探索で連結成分を見つける関数
    const dfs = (node: string, component: string[]) => {
      visited.add(node);
      component.push(node);

      for (const neighbor of nodes) {
        if (visited.has(neighbor)) continue;

        // 2つのノード間のラベルを取得
        const label = this.labels[node + neighbor];
        // ラベルが存在し、2でない場合のみ連結と見做す
        if (label[0] / label[1] !== 2) {
          dfs(neighbor, component);
        }
      }
    };

    // すべてのノードについて連結成分を見つける
    for (const node of nodes) {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs(node, component);
        components.push(component);
      }
    }

    // "x"マークのノードが存在しない連結成分の個数をカウントする
    let count = 0;
    for (const component of components) {
      let hasX = false;
      for (const node of component) {
        if (this.nodeMarks[node] === "x") {
          hasX = true;
          break;
        }
      }
      if (!hasX) count++;
    }

    return this.gens.length - count;
  }
}
