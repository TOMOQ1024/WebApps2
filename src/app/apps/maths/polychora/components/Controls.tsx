import { useEffect, useState } from "react";
import Core from "../Core";
import style from "./Controls.module.scss";

export default function Controls({ core }: { core: Core | undefined }) {
  const [error, setError] = useState("");

  useEffect(() => {
    if (!core) return;
    // core._setError = setError;
  }, [core]);

  return (
    <div className={style.wrapper}>
      <div className={style.matrixContainer}>
        <span className={style.bracket}>(</span>
        <table className={style.matrix}>
          <tbody>
            <tr>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
            </tr>
            <tr>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
            </tr>
            <tr>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
            </tr>
            <tr>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.lowerTriangular}>1</td>
              <td className={style.upperTriangular}>1</td>
            </tr>
          </tbody>
        </table>
        <span className={style.bracket}>)</span>
      </div>
    </div>
  );
}
