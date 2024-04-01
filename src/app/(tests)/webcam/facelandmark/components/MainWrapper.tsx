'use client';
import * as THREE from 'three';
import { useEffect } from "react";
import { OrbitControls, RoomEnvironment, GLTFLoader, KTX2Loader } from 'three/examples/jsm/Addons';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';
import { GUI } from 'lil-gui';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
// import 'three/examples/jsm/libs/basis/basis_transcoder';

export default function MainWrapper() {
  useEffect(() => {
    const blendshapesMap: { [key: string]: string } = {
      // '_neutral': '',
      'browDownLeft': 'browDown_L',
      'browDownRight': 'browDown_R',
      'browInnerUp': 'browInnerUp',
      'browOuterUpLeft': 'browOuterUp_L',
      'browOuterUpRight': 'browOuterUp_R',
      'cheekPuff': 'cheekPuff',
      'cheekSquintLeft': 'cheekSquint_L',
      'cheekSquintRight': 'cheekSquint_R',
      'eyeBlinkLeft': 'eyeBlink_L',
      'eyeBlinkRight': 'eyeBlink_R',
      'eyeLookDownLeft': 'eyeLookDown_L',
      'eyeLookDownRight': 'eyeLookDown_R',
      'eyeLookInLeft': 'eyeLookIn_L',
      'eyeLookInRight': 'eyeLookIn_R',
      'eyeLookOutLeft': 'eyeLookOut_L',
      'eyeLookOutRight': 'eyeLookOut_R',
      'eyeLookUpLeft': 'eyeLookUp_L',
      'eyeLookUpRight': 'eyeLookUp_R',
      'eyeSquintLeft': 'eyeSquint_L',
      'eyeSquintRight': 'eyeSquint_R',
      'eyeWideLeft': 'eyeWide_L',
      'eyeWideRight': 'eyeWide_R',
      'jawForward': 'jawForward',
      'jawLeft': 'jawLeft',
      'jawOpen': 'jawOpen',
      'jawRight': 'jawRight',
      'mouthClose': 'mouthClose',
      'mouthDimpleLeft': 'mouthDimple_L',
      'mouthDimpleRight': 'mouthDimple_R',
      'mouthFrownLeft': 'mouthFrown_L',
      'mouthFrownRight': 'mouthFrown_R',
      'mouthFunnel': 'mouthFunnel',
      'mouthLeft': 'mouthLeft',
      'mouthLowerDownLeft': 'mouthLowerDown_L',
      'mouthLowerDownRight': 'mouthLowerDown_R',
      'mouthPressLeft': 'mouthPress_L',
      'mouthPressRight': 'mouthPress_R',
      'mouthPucker': 'mouthPucker',
      'mouthRight': 'mouthRight',
      'mouthRollLower': 'mouthRollLower',
      'mouthRollUpper': 'mouthRollUpper',
      'mouthShrugLower': 'mouthShrugLower',
      'mouthShrugUpper': 'mouthShrugUpper',
      'mouthSmileLeft': 'mouthSmile_L',
      'mouthSmileRight': 'mouthSmile_R',
      'mouthStretchLeft': 'mouthStretch_L',
      'mouthStretchRight': 'mouthStretch_R',
      'mouthUpperUpLeft': 'mouthUpperUp_L',
      'mouthUpperUpRight': 'mouthUpperUp_R',
      'noseSneerLeft': 'noseSneer_L',
      'noseSneerRight': 'noseSneer_R',
      // '': 'tongueOut'
    };


    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    // renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setSize(100, 100);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    document.body.innerHTML = '';
    document.body.appendChild(renderer.domElement);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 100);
    camera.position.z = 5;

    const scene = new THREE.Scene();
    scene.scale.x = - 1;

    const environment = new RoomEnvironment(renderer);
    const pmremGenerator = new THREE.PMREMGenerator(renderer);

    scene.background = new THREE.Color(0x666666);
    scene.environment = pmremGenerator.fromScene(environment).texture;

    const controls = new OrbitControls(camera, renderer.domElement);

    // Face

    let face: THREE.Mesh;
    let eyeL: THREE.Mesh;
    let eyeR: THREE.Mesh;
    const eyeRotationLimit = THREE.MathUtils.degToRad(30);

    const ktx2Loader = new KTX2Loader()
      .setTranscoderPath('basis/')
      .detectSupport(renderer);

    new GLTFLoader()
      .setKTX2Loader(ktx2Loader)
      .setMeshoptDecoder(MeshoptDecoder)
      .load('/models/facecap.glb', (gltf) => {

        const mesh = gltf.scene.children[0];
        scene.add(mesh);

        const head = mesh.getObjectByName('mesh_2') as THREE.Mesh;
        // head.material = new THREE.MeshNormalMaterial();
        head.material = new THREE.MeshLambertMaterial({
          color: '#fca'
        });
        const dl = new THREE.PointLight('white', 2);
        dl.position.z = 5;
        dl.decay = .2;
        scene.add(dl);


        face = mesh.getObjectByName('mesh_2') as THREE.Mesh;
        eyeL = mesh.getObjectByName('eyeLeft') as THREE.Mesh;
        eyeR = mesh.getObjectByName('eyeRight') as THREE.Mesh;

        // GUI

        const gui = new GUI();
        gui.close();

        const influences = head.morphTargetInfluences!;

        for (const [key, value] of Object.entries(head.morphTargetDictionary!)) {
          gui.add(influences, value.toString(), 0, 1, 0.01)
            .name(key.replace('blendShape1.', ''))
            .listen(influences ? true : false);
        }

      });

    // Video Texture
    const video = document.createElement('video');
    const texture = new THREE.VideoTexture(video);
    texture.colorSpace = THREE.SRGBColorSpace;

    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({ color: 'white', depthWrite: false });
    // const material = new THREE.MeshBasicMaterial({ map: texture, depthWrite: false });
    const videomesh = new THREE.Mesh(geometry, material);
    scene.add(videomesh);

    // MediaPipe
    (async () => {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );

      const faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU'
        },
        outputFaceBlendshapes: true,
        outputFacialTransformationMatrixes: true,
        runningMode: 'VIDEO',
        numFaces: 1
      });

      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {

        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
          .then(function (stream) {
            video.srcObject = stream;
            video.play();
          })
          .catch(function (error) {
            console.error('Unable to access the camera/webcam.', error);
          });

      }

      const transform = new THREE.Object3D();

      function animation() {

        if (video.readyState >= HTMLMediaElement.HAVE_METADATA) {
          const results = faceLandmarker.detectForVideo(video, Date.now());

          if (results.facialTransformationMatrixes.length > 0) {
            const facialTransformationMatrixes = results.facialTransformationMatrixes[0].data;

            transform.matrix.fromArray(facialTransformationMatrixes);
            transform.matrix.decompose(transform.position, transform.quaternion, transform.scale);

            const object = scene.getObjectByName('grp_transform')!;

            object.position.x = transform.position.x;
            object.position.y = transform.position.z + 40;
            object.position.z = - transform.position.y;

            object.rotation.x = transform.rotation.x;
            object.rotation.y = transform.rotation.z;
            object.rotation.z = - transform.rotation.y;
          }

          if (results.faceBlendshapes.length > 0) {
            const faceBlendshapes = results.faceBlendshapes[0].categories;

            // Morph values does not exist on the eye meshes, so we map the eyes blendshape score into rotation values
            const eyeScore = {
              leftHorizontal: 0,
              rightHorizontal: 0,
              leftVertical: 0,
              rightVertical: 0,
            };

            for (const blendshape of faceBlendshapes) {
              const categoryName = blendshape.categoryName;
              const score = blendshape.score;

              const index = face.morphTargetDictionary![blendshapesMap[categoryName]];

              if (index !== undefined) {
                face.morphTargetInfluences![index] = score;
              }

              // There are two blendshape for movement on each axis (up/down , in/out)
              // Add one and subtract the other to get the final score in -1 to 1 range
              switch (categoryName) {
                case 'eyeLookInLeft':
                  eyeScore.leftHorizontal += score;
                  break;
                case 'eyeLookOutLeft':
                  eyeScore.leftHorizontal -= score;
                  break;
                case 'eyeLookInRight':
                  eyeScore.rightHorizontal -= score;
                  break;
                case 'eyeLookOutRight':
                  eyeScore.rightHorizontal += score;
                  break;
                case 'eyeLookUpLeft':
                  eyeScore.leftVertical -= score;
                  break;
                case 'eyeLookDownLeft':
                  eyeScore.leftVertical += score;
                  break;
                case 'eyeLookUpRight':
                  eyeScore.rightVertical -= score;
                  break;
                case 'eyeLookDownRight':
                  eyeScore.rightVertical += score;
                  break;
              }
            }

            eyeL.rotation.z = eyeScore.leftHorizontal * eyeRotationLimit;
            eyeR.rotation.z = eyeScore.rightHorizontal * eyeRotationLimit;
            eyeL.rotation.x = eyeScore.leftVertical * eyeRotationLimit;
            eyeR.rotation.x = eyeScore.rightVertical * eyeRotationLimit;
          }
        }

        videomesh.scale.x = video.videoWidth / 100;
        videomesh.scale.y = video.videoHeight / 100;

        renderer.render(scene, camera);
        controls.update();
      }

      renderer.setAnimationLoop(animation);

      window.addEventListener('resize', function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    })();

  });

  return (
    <main id='main-wrapper'>
    </main>
  );
}
