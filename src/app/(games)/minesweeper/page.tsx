import MainWrapper from "./components/MainWrapper";
import dynamic from "next/dynamic";
import './app.scss';

export const metadata = {
  title: 'Minesweeper'
};

const MainWrapperNoSSR = dynamic(() => import('./components/MainWrapper'), {
  ssr: false
});

export default function Main(){
  return (
    <MainWrapperNoSSR/>
  )
}
