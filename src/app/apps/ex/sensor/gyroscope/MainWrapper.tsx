'use client';

import { useEffect, useState } from "react";

export default function MainWrapper() {
  const [text, setText] = useState('');

  useEffect(() => {
    setText(s => s+`\n${window.DeviceMotionEvent}`);
    setText(s => s+`\n${window.DeviceOrientationEvent}`);
    
    const handleDeviceOrientation = (e: DeviceOrientationEvent) => {
      setText(s => s+`\nORI: ${e.alpha} ${e.beta} ${e.gamma}`);
      console.log(e);
    }
    const handleDeviceMotion = (e: DeviceMotionEvent) => {
      setText(s => s+`\nACC: ${e.acceleration}`);
      console.log(e);
    }

    window.addEventListener("deviceorientation", handleDeviceOrientation);
    window.addEventListener("devicemotion", handleDeviceMotion);
    
    return () => {
      window.removeEventListener("deviceorientation", handleDeviceOrientation);
      window.removeEventListener("devicemotion", handleDeviceMotion);
    }
  }, []);

  return (
    <main>
      {text.split('\n').map((s,i)=><div key={i}>{s}</div>)}
    </main>
  )
}
