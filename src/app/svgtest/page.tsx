import Image from "next/image";

export const metadata = {
  title: 'SVG Test',
  description: 'SVGの実験'
}

export default function Main () {
  return (
    <main>
      <object
        type="image/svg+xml"
        data="resources/svgtest/heart.svg"
        width="100"
        height="100"
        style={{background: "transparent"}}
        >
      </object>
      <object
        type="image/svg+xml"
        data="resources/svgtest/sample.svg"
        width="100"
        height="100"
        >
      </object>
      <object
        type="image/svg+xml"
        data="resources/svgtest/flip.svg"
        width="100"
        height="100"
        >
      </object>
      <object
        type="image/svg+xml"
        data="resources/svgtest/filter.svg"
        width="100"
        height="100"
        >
      </object>
      <p>Filtering test:</p>
      <div
        style={{
          filter: `url("/resources/svgtest/filter.svg#noiseEffect")`
        }}
      >
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
        The quick brown fox jumps over the lazy dog
      </div>
    </main>
  )
}