import { ThreeElements } from "@react-three/fiber";

// https://github.com/pmndrs/react-three-fiber/issues/3385#issuecomment-2446045646

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }
}
