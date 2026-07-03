import { ThreeElements } from "@react-three/fiber";

// https://github.com/pmndrs/react-three-fiber/issues/3385#issuecomment-2446045646

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements extends ThreeElements {}
    }
  }

  // WebXR Type Definitions
  interface XRSystem {
    isSessionSupported(mode: XRSessionMode): Promise<boolean>;
    requestSession(
      mode: XRSessionMode,
      options?: XRSessionInit,
    ): Promise<XRSession>;
  }

  interface Navigator {
    xr?: XRSystem;
  }

  interface XRSession {
    end(): Promise<void>;
  }

  type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

  interface XRSessionInit {
    requiredFeatures?: string[];
    optionalFeatures?: string[];
  }
}
