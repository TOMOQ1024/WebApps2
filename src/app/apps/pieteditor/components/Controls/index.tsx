import Core from "../../src/Core";
import Palette from "./Palette";
import ToolSelector from "./ToolSelector";
import RunnerButtons from "./Runner";
import styles from "../../page.module.scss";


export default function Controls({core}: {
  core: Core | undefined;
}) {
  return (
    <div className={`${styles.controls} ${styles.valid}`}>
      <Palette core={core} />
      <ToolSelector core={core} />
      <RunnerButtons core={core} />
    </div>
  );
}