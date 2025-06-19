export class CoxeterDynkinDiagram {
  gens: string[] = [];
  gensStr: string = "";

  private _isVolumeless: boolean | undefined;
  private _dimension: number | undefined;

  children: Map<string, CoxeterDynkinDiagram> = new Map();

  constructor(
    public labels: { [genPair: string]: [number, number] } = {},
    public nodeMarks: { [gen: string]: string } = {}
  ) {
    this.gens = Object.keys(nodeMarks);
    this.gensStr = this.gens.join(",");
  }

  static fromStringMatrix(matrix: string[][], toggles: string[]) {
    const diagram = new CoxeterDynkinDiagram();
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < matrix[i].length; j++) {
        const [numerator, denominator] = /\//.test(matrix[i][j])
          ? matrix[i][j].split("/").map((x) => parseInt(x))
          : [parseInt(matrix[i][j]), 1];
        diagram.labels[
          `${String.fromCharCode(65 + i)}${String.fromCharCode(65 + j)}`
        ] = [numerator, denominator];
      }
    }
    for (let i = 0; i < toggles.length; i++) {
      diagram.nodeMarks[String.fromCharCode(65 + i)] = toggles[i];
    }

    return diagram;
  }

  dropCache() {
    this._isVolumeless = undefined;
    this._dimension = undefined;
    this.children.clear();
  }

  withoutGen(gen: string) {
    if (this.children.has(gen)) return this.children.get(gen)!;
    const newNodeMarks = { ...this.nodeMarks };
    const newLabels = { ...this.labels };

    delete newNodeMarks[gen];

    for (const genPair in newLabels) {
      if (genPair.includes(gen)) {
        delete newLabels[genPair];
      }
    }

    const newDiagram = new CoxeterDynkinDiagram(newLabels, newNodeMarks);
    this.children.set(gen, newDiagram);
    return newDiagram;
  }

  isVolumeless() {
    if (this._isVolumeless !== undefined) return this._isVolumeless;

    if (Object.values(this.labels).some((label) => label[0] / label[1] === 1)) {
      this._isVolumeless = true;
      return true;
    }

    // ノードの集合を取得
    const nodes = Object.keys(this.nodeMarks);
    if (nodes.length === 0) return false;

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
      if (!hasX) {
        this._isVolumeless = true;
        return true;
      }
    }

    // すべての連結成分に"x"マークのノードが存在する場合はfalseを返す
    this._isVolumeless = false;
    return false;
  }

  getDimension() {
    if (this._dimension !== undefined) return this._dimension;

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

    this._dimension = this.gens.length - count;
    return this._dimension;
  }
}
