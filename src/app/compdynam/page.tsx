import MainCanvas from "./components/MainCanvas"

export const metadata = {
  title: 'CompDynam',
}

export default function Main(){
  return (
    <main
      style={{
        textAlign: 'center'
      }}
    >
      <MainCanvas/>
    </main>
  )
}
