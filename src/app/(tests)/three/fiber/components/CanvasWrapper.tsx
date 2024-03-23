'use client';
import React from 'react';
import { Cube } from './Cube';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export default function CanvasWrapper() {
	return (
		<div className="canvas-wrapper">
			<Canvas
				camera={{
					fov: 45,
					near: 0.1,
					far: 1000,
					position: [0, 0, 5]
				}}
			>
				<Cube />
				<ambientLight args={[0xffffff]} intensity={0.2} />
				<directionalLight position={[1, 1, 1]} intensity={0.8} />
        <OrbitControls />
			</Canvas>
		</div>
	);
}