import dynamic from 'next/dynamic';
import './app.scss';

export const metadata = {
  title: 'Maths Renderer 2D',
}

const MainWrapperNoSSR = dynamic(() => import('./components/MainWrapper'), {
  ssr: false
});

export default function Main(){
  return (
    <MainWrapperNoSSR/>
  )
}
