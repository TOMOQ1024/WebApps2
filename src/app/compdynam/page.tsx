import './app.scss';
import Controls from './components/Controls';
import GraphWrapper from "./components/GraphWrapper";

export const metadata = {
  title: 'CompDynam',
}

export default function Main(){
  return (
    <main id='compdynam-main'>
      <GraphWrapper/>
      <Controls/>
    </main>
  )
}
