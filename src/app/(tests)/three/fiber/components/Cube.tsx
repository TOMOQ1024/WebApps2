import { useRef } from "react";
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function Cube() {
	const cubeRef = useRef<Mesh>(null);
	useFrame(() => {
		const cube = cubeRef.current;
		if (!cube) return;
		cube.rotation.x += 0.01;
		cube.rotation.y += 0.01;
	});
	
	return (
		<mesh ref={cubeRef}>
			<boxGeometry args={[1, 1, 1]} />
			<meshPhongMaterial color="aqua" />
		</mesh>
	);
};