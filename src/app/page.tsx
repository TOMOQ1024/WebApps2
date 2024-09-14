import AppCard from "@/components/appcard";

export const metadata = {
  title: 'tomoq apps'
};

export default function Home() {
  return (
    <main>
      <AppCard
        name='Tic Tac Toe'
      />
      <AppCard
        name='Nessy'
      />
      <AppCard
        name='Flappy Pigeon'
      />
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
      <AppCard
        name='CompDynam'
      />
      <AppCard
        name='RayMarching'
      />
      <AppCard
        name='Chaos Game'
      />
      <AppCard
        name='DiceRoll'
      />
      <AppCard
        name='Minesweeper'
      />
    </main>
  )
}
