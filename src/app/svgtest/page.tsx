import RawSvg from "@/components/RawSvg";
import SvgFilter from "@/components/SvgFilter";

export const metadata = {
  title: 'SVG Test',
  description: 'SVGの実験'
}

export default function Main () {
  return (
    <main>
      <RawSvg src={'/resources/svgtest/heart.svg'} />
      <RawSvg src={'/resources/svgtest/sample.svg'} />
      <RawSvg src={'/resources/svgtest/flip.svg'} />
      <RawSvg src={'/resources/svgtest/filter.svg'} />
      <p>Filtering test:</p>
      <SvgFilter src={'/resources/svgtest/filter.svg#noiseEffect'}>
        <div>
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
          The quick brown fox jumps over the lazy dog
        </div>
      </SvgFilter>
    </main>
  )
}