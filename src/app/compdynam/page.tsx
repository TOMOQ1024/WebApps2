import dynamic from 'next/dynamic';
import './app.scss';

export const metadata = {
  title: 'CompDynam',
  description: 'WebGLを使ったリアルタイムレンダリングで、複素力学系のアートを楽しもう！'
}

const MainWrapperNoSSR = dynamic(() => import('./components/MainWrapper'), {
  ssr: false
});

export default function Main(){
  return (
    <MainWrapperNoSSR/>
  )
}
