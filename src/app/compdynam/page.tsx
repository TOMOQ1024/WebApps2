import './app.scss';
import MainWrapper from './components/MainWrapper';

export const metadata = {
  title: 'CompDynam',
  description: 'WebGLを使ったリアルタイムレンダリングで、複素力学系のアートを楽しもう！'
}

export default function Main(){
  return <MainWrapper/>;
}
