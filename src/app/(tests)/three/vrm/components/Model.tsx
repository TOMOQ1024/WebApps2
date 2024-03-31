import { useLoader } from '@react-three/fiber'
import { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

export default function Model() {
  useEffect (() => {
    (async () => {
      
    })
  });
  const gltf = useLoader(GLTFLoader, '/resources/diceroll/models/d4.glb');
  return <primitive object={gltf.scene} />
}




// // gltfの読み込み

// import { useLoader } from '@react-three/fiber'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'

// export default function Model() {
//   const gltf = useLoader(GLTFLoader, '/resources/diceroll/models/d4.glb');
//   return <primitive object={gltf.scene} />
// }
