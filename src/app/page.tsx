import Link from "next/link";

export default function Home() {
  return (
    <main>
      <Link href="/games">Games</Link>
      <Link href="/playground">Playground</Link>
    </main>
  )
}
