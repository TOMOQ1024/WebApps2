export default function RawSvg ({ src, width=100, height=100 }: {
  src: string;
  width?: number;
  height?: number;
}) {
  return (
    <object
      type="image/svg+xml"
      data={src}
      width={width}
      height={height}
      >
    </object>
  )
}