import './app.scss';
import MainWrapper from './components/MainWrapper';

export const metadata = {
  title: 'Cubes',
  description: 'ルービックキューブの表示と操作'
}

export default function Main(){
  return <MainWrapper/>;
}
