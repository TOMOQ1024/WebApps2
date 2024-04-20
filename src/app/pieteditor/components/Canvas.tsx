import Core from "../src/Core";

export default function Canvas ({ core }: {
  core: Core | undefined
}) {
  const getPos = (e: React.MouseEvent) => {
    if (!core) return { X: -1, Y: -1 };
    const cvs = e.target as HTMLCanvasElement;
    const rect = cvs.getBoundingClientRect();
    const X = Math.floor((e.clientX - rect.left) / rect.width * core.size.x);
    const Y = Math.floor((e.clientY - rect.top) / rect.height * core.size.y);
    return { X, Y };
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!core) return;
    const { X, Y } = getPos(e);
    const F = e.buttons&2 ? true : false;
    if (core.fillCodel(X, Y, F)) core.draw();
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!core || !e.buttons) return;
    const { X, Y } = getPos(e);
    const F = e.buttons&2 ? true : false;
    if (core.fillCodel(X, Y, F)) core.draw();
  }

  return (
    <canvas
      id='cvs'
      width={400}
      height={400}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
    />
  )
}