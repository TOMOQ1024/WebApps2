import MainCanvas from "@/components/maincanvas";

export default function CanvasWrapper() {
  return (
    <div id='canvas-wrapper'>
      <canvas
        id='cvs'
        width={1024}
        height={1024}
      />
    </div>
  );
}