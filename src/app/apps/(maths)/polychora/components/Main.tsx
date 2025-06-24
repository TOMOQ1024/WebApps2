import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import ControlPanel from "./ControlPanel";
import Canvas from "./Canvas";
import ControlButtons from "./ControlButtons";
import Core from "../core/Core";
import { CoxeterDynkinDiagram } from "@/src/maths/CoxeterDynkinDiagram";

export default function Main() {
  const [core, setCore] = useState<Core>();
  const [diagram, setDiagram] = useState<CoxeterDynkinDiagram>(
    new CoxeterDynkinDiagram(
      {
        ab: [2, 1],
        ba: [2, 1],
        bc: [3, 1],
        cb: [3, 1],
        cd: [3, 1],
        dc: [3, 1],
        ad: [3, 1],
        da: [3, 1],
        ac: [2, 1],
        ca: [2, 1],
        bd: [2, 1],
        db: [2, 1],
      },
      {
        a: "x",
        b: "x",
        c: "x",
        d: "x",
      }
    )
  );
  const [error, setError] = useState<string | null>(null);
  const [buildTime, setBuildTime] = useState(0);
  const [hasLoadedFromParams, setHasLoadedFromParams] = useState(false);

  const searchParams = useSearchParams();

  // クエリパラメータから状態を読み込む（初回のみ）
  useEffect(() => {
    if (searchParams && !hasLoadedFromParams) {
      // ここでクエリパラメータから初期状態を読み込む処理を追加
      setHasLoadedFromParams(true);
    }
  }, [searchParams, hasLoadedFromParams]);

  // 状態が変更された時にクエリパラメータを更新
  const updateQueryParams = useCallback(() => {
    // ここでクエリパラメータの更新処理を追加
  }, [diagram]);

  const computeSchlafliMatrixDeterminant = async () => {
    if (!core) return 0;
    const labels = core.diagram.labels;
    const { Matrix4 } = await import("three");
    const mat = new Matrix4(
      2,
      -2 * Math.cos((Math.PI / labels.ab[0]) * labels.ab[1]),
      -2 * Math.cos((Math.PI / labels.ac[0]) * labels.ac[1]),
      -2 * Math.cos((Math.PI / labels.ad[0]) * labels.ad[1]),

      -2 * Math.cos((Math.PI / labels.ab[0]) * labels.ab[1]),
      2,
      -2 * Math.cos((Math.PI / labels.bc[0]) * labels.bc[1]),
      -2 * Math.cos((Math.PI / labels.bd[0]) * labels.bd[1]),

      -2 * Math.cos((Math.PI / labels.ac[0]) * labels.ac[1]),
      -2 * Math.cos((Math.PI / labels.bc[0]) * labels.bc[1]),
      2,
      -2 * Math.cos((Math.PI / labels.cd[0]) * labels.cd[1]),

      -2 * Math.cos((Math.PI / labels.ad[0]) * labels.ad[1]),
      -2 * Math.cos((Math.PI / labels.bd[0]) * labels.bd[1]),
      -2 * Math.cos((Math.PI / labels.cd[0]) * labels.cd[1]),
      2
    );

    return mat.determinant();
  };

  const handleBuild = useCallback(async () => {
    if (!core) return;

    try {
      core.diagram.dropCache();
      const det = await computeSchlafliMatrixDeterminant();
      if (core.diagram.isVolumeless()) {
        setError(
          "多胞体の次元が4未満です．低次元多胞体の生成は今後の開発で対応予定です．"
        );
      } else if (det <= 0) {
        setError("頂点数が有限ではありません");
      } else {
        setError(null);
        setBuildTime(0);
        await new Promise((resolve) => setTimeout(resolve, 10));
        core.setPolychoron();
        setBuildTime(core.buildTime);
      }
    } catch (err) {
      setError(String(err));
    }
  }, [core]);

  const handleDiagramChange = useCallback(
    (newDiagram: CoxeterDynkinDiagram) => {
      setDiagram(newDiagram);
      if (core) {
        core.diagram = newDiagram;
        core.diagram.dropCache();
        handleBuild();
      }
    },
    [core, handleBuild]
  );

  const handleDownloadGLB = useCallback(() => {
    if (core) {
      core.downloadGLB();
    }
  }, [core]);

  const handleReset = useCallback(() => {
    const defaultDiagram = new CoxeterDynkinDiagram(
      {
        ab: [2, 1],
        ba: [2, 1],
        bc: [3, 1],
        cb: [3, 1],
        cd: [3, 1],
        dc: [3, 1],
        ad: [3, 1],
        da: [3, 1],
        ac: [2, 1],
        ca: [2, 1],
        bd: [2, 1],
        db: [2, 1],
      },
      {
        a: "x",
        b: "x",
        c: "x",
        d: "x",
      }
    );
    setDiagram(defaultDiagram);
    setError(null);
  }, []);

  return (
    <main className="relative w-full h-screen">
      <ControlPanel
        diagram={diagram}
        onDiagramChange={handleDiagramChange}
        error={error}
        buildTime={buildTime}
        onBuild={handleBuild}
      />
      <Canvas core={core} setCore={setCore} diagram={diagram} />
      <ControlButtons onDownloadGLB={handleDownloadGLB} onReset={handleReset} />
    </main>
  );
}
