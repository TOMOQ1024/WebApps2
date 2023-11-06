import AppCard from "../components/appcard";

export default function Playground(){
  return (
    <main>
      <AppCard
        name='Sierpinski gasket'
      />
      <AppCard
        name='Recursive Tree'
      />
      <AppCard
        name='WebGL Test'
      />
      <AppCard
        name='Mandelbrot Set'
      />
      <AppCard
        name='Life Game'
      />
      <AppCard
        name='WebGPU'
      />
    </main>
  )
}