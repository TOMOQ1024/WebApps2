export default function MainCanvas(
  {width=1024, height=1024}:{
    width?: number
    height?: number
  }){
  return (
    <canvas
      id='cvs'
      width={width}
      height={height}
      style={{
        width: width>height ? `${width}px` : 'none',
        height: width<height ? `${height}px` : 'none',
        maxWidth: `min(90vw,${90/height*width}vh)`,
        maxHeight: `min(${90/width*height}vw,90vh)`,
        margin: '10px',
      }}
    />
  )
}