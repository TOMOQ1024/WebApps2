// import dynamic from "next/dynamic";
import MainWrapper from "./components/MainWrapper";

export const metadata = {
  title: "GLSL Filter",
};

// const MainWrapperNoSSR = dynamic(() => import('./components/MainWrapper'), {
//   ssr: false
// });

export default function Main() {
  return <MainWrapper />;
}
