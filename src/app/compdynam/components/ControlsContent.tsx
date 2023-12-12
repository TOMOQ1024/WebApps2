import { ConfigTab } from "../Definitions"

export default function ControlsContent({selected}: {
  selected: ConfigTab;
}) {
  return (
    <div id='controls-content' className={`cc-s${selected}`}>
      {/* 詳細設定 */}
      <div>Under Construction...</div>
      {/* プリセット選択 */}
      <div>Under Construction...</div>
      {/* 数式編集 */}
      <div>Under Construction...</div>
    </div>
  )
}