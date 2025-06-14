import RawSvg from "@/components/RawSvg";
import SvgFilter from "@/components/SvgFilter";

export const metadata = {
  title: 'SVG Test',
  description: 'SVGの実験'
}

export default function Main () {
  const TEXT = (col='white') => (
    <div style={{color: col}}>
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
      The quick brown fox jumps over the lazy dog
    </div>
  );

  return (
    <main>
      <RawSvg src={'/resources/ex/svg/heart.svg'} />
      <RawSvg src={'/resources/ex/svg/sample.svg'} />
      <RawSvg src={'/resources/ex/svg/flip.svg'} />
      <RawSvg src={'/resources/ex/svg/filter/noiseDisplace.svg'} />
      <p>Filtering test:</p>
      <SvgFilter src={'/resources/ex/svg/filter/noiseDisplace.svg#filter'}>{TEXT()}</SvgFilter>
      <SvgFilter src={'/resources/ex/svg/filter/glitch.svg#filter'}>{TEXT()}</SvgFilter>
      <SvgFilter src={'/resources/ex/svg/filter/outline.svg#filter'}>{TEXT('black')}</SvgFilter>
      <SvgFilter src={'/resources/ex/svg/filter/shiftRB.svg#filter'}>{TEXT()}</SvgFilter>
    </main>
  )
}