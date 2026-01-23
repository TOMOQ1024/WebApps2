import { Canvas } from "@react-three/fiber";
import { useTheme } from "@/hooks/useTheme";

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
    <button
      type="button"
      onClick={toggleTheme}
      className="w-8 h-8 p-0 border-2 border-[var(--border-color)] bg-transparent cursor-pointer overflow-hidden transition-transform duration-200 hover:scale-110 [&_canvas]:!w-full [&_canvas]:!h-full"
    >
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <ThemeCube />
      </Canvas>
    </button>
  );
}
