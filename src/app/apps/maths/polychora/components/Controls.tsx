import { useEffect, useState } from "react";
import Core from "../Core";
import style from "./Controls.module.scss";
import { Matrix4 } from "three";

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

  const computeSchlafliMatrixDeterminant = () => {
    if (!core) return false;
    const mat = new Matrix4(
      2,
      -2 * Math.cos((Math.PI / core.labels.ab[0]) * core.labels.ab[1]),
      -2 * Math.cos((Math.PI / core.labels.ac[0]) * core.labels.ac[1]),
      -2 * Math.cos((Math.PI / core.labels.ad[0]) * core.labels.ad[1]),

      -2 * Math.cos((Math.PI / core.labels.ab[0]) * core.labels.ab[1]),
      2,
      -2 * Math.cos((Math.PI / core.labels.bc[0]) * core.labels.bc[1]),
      -2 * Math.cos((Math.PI / core.labels.bd[0]) * core.labels.bd[1]),

      -2 * Math.cos((Math.PI / core.labels.ac[0]) * core.labels.ac[1]),
      -2 * Math.cos((Math.PI / core.labels.bc[0]) * core.labels.bc[1]),
      2,
      -2 * Math.cos((Math.PI / core.labels.cd[0]) * core.labels.cd[1]),

      -2 * Math.cos((Math.PI / core.labels.ad[0]) * core.labels.ad[1]),
      -2 * Math.cos((Math.PI / core.labels.bd[0]) * core.labels.bd[1]),
      -2 * Math.cos((Math.PI / core.labels.cd[0]) * core.labels.cd[1]),
      2
    );
    const det = mat.determinant();
    return det > 0;
  };

  const handleInputChange = async (value: string, labelKey: string) => {
    if (!core) return;

    const prev = core.labels[labelKey];
    const rev = labelKey.split("").reverse().join("");

    const input = document.querySelector(`input.${rev}`) as HTMLInputElement;
    if (input) {
      input.value = value;
    }
    if (/^\d+$/.test(value)) {
      setError("");
      core.labels[labelKey] = [+value, 1];
      core.labels[rev] = [+value, 1];
      if (!computeSchlafliMatrixDeterminant()) {
        setError("頂点数が有限ではありません");
      } else {
        await core.setPolychoron();
        setBuildTime(core.buildTime);
      }
    } else if (/^(\d+\/\d+)$/.test(value)) {
      setError("");
      core.labels[labelKey] = value.split("/").map(Number) as [number, number];
      core.labels[rev] = value.split("/").map(Number) as [number, number];
      if (!computeSchlafliMatrixDeterminant()) {
        setError("頂点数が有限ではありません");
      } else {
        await core.setPolychoron();
        setBuildTime(core.buildTime);
      }
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
    const value = core.labels[labelKey];
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
        value={core.nodeMarks[nodeKey]}
        onClick={async (e) => {
          core.nodeMarks[nodeKey] = (
            {
              x: "o",
              o: "x",
            } as { [key: string]: string }
          )[core.nodeMarks[nodeKey]];
          (e.target as HTMLInputElement).value = core.nodeMarks[nodeKey];
          if (!error) {
            await core.setPolychoron();
            setBuildTime(core.buildTime);
          }
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
              : `多胞体の生成に成功しました(${buildTime.toFixed(2)}ms)`}
          </div>
        </>
      )}
    </div>
  );
}
