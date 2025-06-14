import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/hooks/useTheme";
import styles from "./index.module.scss";

const ThemeCube = () => {
  const { theme } = useTheme();

  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        color={
          theme === "dark"
            ? "#ffffff"
            : theme === "light"
            ? "#000000"
            : "#666666"
        }
        metalness={0.5}
        roughness={0.5}
      />
    </mesh>
  );
};

export default function ThemeToggle() {
  const { toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className={styles.themeToggle}>
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ThemeCube />
      </Canvas>
    </button>
  );
}
