"use client"
import { useEffect, useState } from "react"
import CanvasWrapper from "./CanvasWrapper";
import * as THREE from 'three'

export default function MainWrapper(){
  useEffect(() => {
    const cvs = document.getElementById('cvs') as HTMLCanvasElement;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(
      75,
      cvs.width / cvs.height,
      0.1,
      1000
    );

    const renderer = new THREE.WebGLRenderer({
      canvas: cvs,
      antialias: true,
      alpha: true
    });
    renderer.setSize(cvs.width, cvs.height);
    renderer.setPixelRatio(devicePixelRatio);

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const boxMaterial = new THREE.MeshLambertMaterial({
      color: '#2497f0'
    });
    const box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.z = -5;
    box.rotation.set(10, 10, 10);
    scene.add(box);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.0);
    pointLight.position.set(1, 2, 3);
    scene.add(pointLight);

    const clock = new THREE.Clock();
    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      box.rotation.x = elapsedTime;
      box.rotation.y = elapsedTime;
      requestAnimationFrame(tick);
      renderer.render(scene, camera);
    }
    tick()


    const onResize = () => {
      const wrapper = cvs.parentElement!;
      const rect = wrapper.getBoundingClientRect();
      cvs.width = rect.width;
      cvs.height = rect.height;
      camera.aspect = cvs.width / cvs.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height);
      renderer.setPixelRatio(devicePixelRatio);
    }

    onResize();
    console.log(THREE);

    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
    }
  }, []);

  return (
    <main id='main-wrapper'>
      <CanvasWrapper/>
    </main>
  )
}
