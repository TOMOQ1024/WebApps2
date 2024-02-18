"use client"
import { useEffect, useState } from "react"
import CanvasWrapper from "./CanvasWrapper";
import DRCore from "../DiceRollCore";
import Controls from "./Controls";

export default function MainWrapper(){
  const [core, setCore] = useState<DRCore>();
  useEffect(() => {
    if (!core) {
      setCore(new DRCore());
      return;
    }
    const cvs = core.cvs;

    core.beginLoop();

    // const scene = new THREE.Scene();

    // const camera = new THREE.PerspectiveCamera(
    //   75,
    //   cvs.width / cvs.height,
    //   0.1,
    //   1000
    // );
    // camera.translateZ(15);
    // camera.translateY(15);
    // camera.rotateX(-1);

    // const renderer = new THREE.WebGLRenderer({
    //   canvas: cvs,
    //   antialias: true,
    //   alpha: true
    // });
    // renderer.setSize(cvs.width, cvs.height);
    // renderer.setPixelRatio(devicePixelRatio);

    // const textureLoader = new THREE.TextureLoader()
    // const boxGeometry = new THREE.BoxGeometry();
    // const boxMaterials = [
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/1.png'),
    //   }),
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/6.png'),
    //   }),
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/2.png'),
    //   }),
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/5.png'),
    //   }),
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/3.png'),
    //   }),
    //   new THREE.MeshLambertMaterial({
    //     map: textureLoader.load('resources/diceroll/images/d6/4.png'),
    //   }),
    // ];
    // const box = new THREE.Mesh(boxGeometry, boxMaterials);
    // box.rotation.set(10, 10, 10);
    // scene.add(box);

    // const plane = new THREE.Mesh(
    //   new THREE.PlaneGeometry(30, 30),
    //   new THREE.MeshLambertMaterial({color: '#004400'}),
    // );
    // plane.rotateX(-Math.PI/2)
    // plane.translateZ(-10);
    // scene.add(plane);

    // const ambientLight = new THREE.AmbientLight();
    // scene.add(ambientLight);
    // const directionalLight = new THREE.DirectionalLight();
    // directionalLight.rotation.x -= Math.PI/2;
    // scene.add(directionalLight);

    // const clock = new THREE.Clock();
    // const tick = () => {
    //   const elapsedTime = clock.getElapsedTime();
    //   box.rotation.x = elapsedTime;
    //   box.rotation.y = elapsedTime;
    //   requestAnimationFrame(tick);
    //   renderer.render(scene, camera);
    // }
    // tick()


    const onMouseDown = () => {
      console.clear();
      core.diceMgr.roll(1, 4);
    }

    const onResize = () => {
      const wrapper = cvs.parentElement!;
      const rect = wrapper.getBoundingClientRect();
      cvs.width = rect.width;
      cvs.height = rect.height;
      core.camera.aspect = cvs.width / cvs.height;
      core.camera.updateProjectionMatrix();
      core.renderer.setSize(rect.width, rect.height);
      core.renderer.setPixelRatio(devicePixelRatio);
    }

    onResize();

    cvs.addEventListener('mousedown', onMouseDown);
    window.addEventListener('resize', onResize);
    return () => {
      cvs.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('resize', onResize);
    }
  }, [core]);

  return (
    <main id='main-wrapper'>
      <CanvasWrapper/>
      <Controls core={core!}/>
    </main>
  )
}
