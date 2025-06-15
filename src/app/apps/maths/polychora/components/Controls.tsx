import { useEffect, useState } from "react";
import Core from "../core/Core";
import style from "./Controls.module.scss";
import { Matrix4 } from "three";
import sleep from "@/src/Sleep";

export default function Controls({ core }: { core: Core | undefined }) {
  const [error, setError] = useState("");
  const [buildTime, setBuildTime] = useState(0);
  useEffect(() => {
    if (!core) return;
    // core._setError = setError;
    setTimeout(() => {
      setBuildTime(core.buildTime);
    }, 100);
  }, [core]);

  const tryBuild = async () => {
    if (!core) return false;
    core.diagram.dropCache();
    const det = await computeSchlafliMatrixDeterminant();
    if (core.diagram.isVolumeless()) {
      setError(
        "多胞体の次元が4未満です．低次元多胞体の生成は今後の開発で対応予定です．"
      );
    } else if (det <= 0) {
      setError("頂点数が有限ではありません");
    } else {
      setError("");
      setBuildTime(0);
      await sleep(10);
      core.setPolychoron();
      setBuildTime(core.buildTime);
    }
  };

  const computeSchlafliMatrixDeterminant = async () => {
    if (!core) return 0;
    const labels = core.diagram.labels;
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

  const handleInputChange = async (value: string, labelKey: string) => {
    if (!core) return;

    const prev = core.diagram.labels[labelKey];
    const rev = labelKey.split("").reverse().join("");

    const input = document.querySelector(`input.${rev}`) as HTMLInputElement;
    if (input) {
      input.value = value;
    }
    if (/^\d+$/.test(value)) {
      // 整数の場合
      core.diagram.labels[labelKey] = [+value, 1];
      core.diagram.labels[rev] = [+value, 1];
      await tryBuild();
    } else if (/^(\d+\/\d+)$/.test(value)) {
      // 分数の場合
      core.diagram.labels[labelKey] = value.split("/").map(Number) as [
        number,
        number
      ];
      core.diagram.labels[rev] = value.split("/").map(Number) as [
        number,
        number
      ];
      await tryBuild();
    } else {
      setError(`${labelKey}の入力が適切ではありません\n例: 1, 2, 5/2`);
    }
  };

  const renderInput = (labelKey: string) => {
    if (!core) return null;
    if (labelKey[0] === labelKey[1]) {
      return (
        <input
          className={`${style.input} ${labelKey}`}
          type="string"
          defaultValue="1"
          readOnly
        />
      );
    }
    const value = core.diagram.labels[labelKey];
    const displayValue = `${value[0]}${value[1] > 1 ? `/${value[1]}` : ""}`;

    return (
      <input
        className={`${style.input} ${
          !/^(\d+|\d+\/\d+)$/.test(displayValue) ? style.invalid : ""
        } ${labelKey}`}
        type="string"
        defaultValue={displayValue}
        onChange={(e) => handleInputChange(e.target.value, labelKey)}
      />
    );
  };

  const renderMarkupButton = (nodeKey: string) => {
    if (!core) return null;
    return (
      <input
        className={style.input}
        type="button"
        value={core.diagram.nodeMarks[nodeKey]}
        onClick={async (e) => {
          core.diagram.nodeMarks[nodeKey] = (
            {
              x: "o",
              o: "x",
            } as { [key: string]: string }
          )[core.diagram.nodeMarks[nodeKey]];
          (e.target as HTMLInputElement).value =
            core.diagram.nodeMarks[nodeKey];
          await tryBuild();
        }}
      />
    );
  };

  return (
    <div className={style.wrapper}>
      {core && (
        <>
          <div className={style.nodeMarks}>
            <table>
              <tbody>
                <tr>
                  <td className={style.nodeMark}>{renderMarkupButton("a")}</td>
                  <td className={style.nodeMark}>{renderMarkupButton("b")}</td>
                  <td className={style.nodeMark}>{renderMarkupButton("c")}</td>
                  <td className={style.nodeMark}>{renderMarkupButton("d")}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className={style.matrixContainer}>
            <span className={style.bracket}>(</span>
            <table className={style.matrix}>
              <tbody>
                <tr>
                  <td className={style.upperTriangular}>{renderInput("aa")}</td>
                  <td className={style.upperTriangular}>{renderInput("ab")}</td>
                  <td className={style.upperTriangular}>{renderInput("ac")}</td>
                  <td className={style.upperTriangular}>{renderInput("ad")}</td>
                </tr>
                <tr>
                  <td className={style.lowerTriangular}>{renderInput("ba")}</td>
                  <td className={style.upperTriangular}>{renderInput("bb")}</td>
                  <td className={style.upperTriangular}>{renderInput("bc")}</td>
                  <td className={style.upperTriangular}>{renderInput("bd")}</td>
                </tr>
                <tr>
                  <td className={style.lowerTriangular}>{renderInput("ca")}</td>
                  <td className={style.lowerTriangular}>{renderInput("cb")}</td>
                  <td className={style.upperTriangular}>{renderInput("cc")}</td>
                  <td className={style.upperTriangular}>{renderInput("cd")}</td>
                </tr>
                <tr>
                  <td className={style.lowerTriangular}>{renderInput("da")}</td>
                  <td className={style.lowerTriangular}>{renderInput("db")}</td>
                  <td className={style.lowerTriangular}>{renderInput("dc")}</td>
                  <td className={style.upperTriangular}>{renderInput("dd")}</td>
                </tr>
              </tbody>
            </table>
            <span className={style.bracket}>)</span>
          </div>
          <div className={`${style.error} ${error ? style.active : ""}`}>
            {error
              ? error.split("\n").map((line, i) => <p key={i}>{line}</p>)
              : buildTime > 0
              ? `多胞体の生成に成功しました(${buildTime.toFixed(2)}ms)`
              : "多胞体の生成中..."}
          </div>
        </>
      )}
    </div>
  );
}
