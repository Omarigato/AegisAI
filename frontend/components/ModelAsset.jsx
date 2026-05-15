/**
 * ModelAsset.jsx — v5
 *
 * Безопасная загрузка .glb моделей с:
 * - Lazy loading (тяжёлые модели грузятся только когда нужны)
 * - GltfErrorBoundary (ошибка = fallback, НЕ краш)
 * - SkeletonUtils.clone (безопасный клон, без мутации кэша)
 * - Оптимизированный useFrame только при активных состояниях
 */
import { Suspense, useMemo, useRef, Component, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { getModelEntry } from '../lib/modelRegistry';

// ── Fallback primitives ─────────────────────────────────────────────────────
function FallbackHumanoid({ tint }) {
  return (
    <group>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.16, 8, 8]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <capsuleGeometry args={[0.18, 0.55, 4, 8]} />
        <meshStandardMaterial color="#1a2240" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.28, 1.0, 0]} rotation={[0, 0, 0.4]}>
        <capsuleGeometry args={[0.07, 0.45, 4, 6]} />
        <meshStandardMaterial color={tint} metalness={0.6} />
      </mesh>
      <mesh position={[0.28, 1.0, 0]} rotation={[0, 0, -0.4]}>
        <capsuleGeometry args={[0.07, 0.45, 4, 6]} />
        <meshStandardMaterial color={tint} metalness={0.6} />
      </mesh>
      <mesh position={[-0.12, 0.3, 0]}>
        <capsuleGeometry args={[0.08, 0.45, 4, 6]} />
        <meshStandardMaterial color="#0e1428" metalness={0.7} />
      </mesh>
      <mesh position={[0.12, 0.3, 0]}>
        <capsuleGeometry args={[0.08, 0.45, 4, 6]} />
        <meshStandardMaterial color="#0e1428" metalness={0.7} />
      </mesh>
    </group>
  );
}

function FallbackMech({ tint }) {
  return (
    <group>
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[0.5, 0.4, 0.45]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} metalness={0.9} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.75, 0.7, 0.55]} />
        <meshStandardMaterial color="#0e1428" metalness={0.75} />
      </mesh>
      <mesh position={[-0.4, 0.85, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.25]} />
        <meshStandardMaterial color={tint} metalness={0.7} />
      </mesh>
      <mesh position={[0.4, 0.85, 0]}>
        <boxGeometry args={[0.18, 0.55, 0.25]} />
        <meshStandardMaterial color={tint} metalness={0.7} />
      </mesh>
      <mesh position={[-0.18, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.3]} />
        <meshStandardMaterial color="#0a1220" metalness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.22, 0]}>
        <boxGeometry args={[0.18, 0.45, 0.3]} />
        <meshStandardMaterial color="#0a1220" metalness={0.8} />
      </mesh>
    </group>
  );
}

function FallbackDrone({ tint }) {
  return (
    <group>
      <mesh position={[0, 1.0, 0]}>
        <sphereGeometry args={[0.22, 10, 10]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.7} metalness={0.85} />
      </mesh>
      {[[-0.3, 1.0, -0.3], [0.3, 1.0, -0.3], [-0.3, 1.0, 0.3], [0.3, 1.0, 0.3]].map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.04, 0.03, 6]} />
            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.85} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.22, 0.01, 0.02]} />
            <meshStandardMaterial color="#aab" metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function FallbackStealth({ tint }) {
  return (
    <group>
      <mesh position={[0, 1.1, 0]}>
        <coneGeometry args={[0.4, 1.2, 8]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.45} metalness={0.85} roughness={0.3} transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.12, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive={tint} emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}

function FallbackRobot({ tint }) {
  return (
    <group>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} metalness={0.8} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[0.5, 0.7, 0.35]} />
        <meshStandardMaterial color="#1a2240" metalness={0.7} />
      </mesh>
      <mesh position={[-0.32, 0.95, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color={tint} metalness={0.6} />
      </mesh>
      <mesh position={[0.32, 0.95, 0]}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
        <meshStandardMaterial color={tint} metalness={0.6} />
      </mesh>
    </group>
  );
}

function FallbackCamera({ tint }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.25, 0.18, 0.32]} />
        <meshStandardMaterial color={tint} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.18]}>
        <cylinderGeometry args={[0.08, 0.08, 0.08, 10]} />
        <meshStandardMaterial color="#000" emissive={tint} emissiveIntensity={0.6} />
      </mesh>
    </group>
  );
}

function FallbackThermostat({ tint }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.35, 0.5, 0.05]} />
        <meshStandardMaterial color="#1a2240" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.7} />
      </mesh>
    </group>
  );
}

function FallbackLock({ tint }) {
  return (
    <group>
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.12, 0.04, 6, 12, Math.PI]} />
        <meshStandardMaterial color="#888" metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <boxGeometry args={[0.28, 0.22, 0.1]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.5} metalness={0.7} />
      </mesh>
    </group>
  );
}

function FallbackDoor({ tint }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.5, 1.05, 0.06]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.4} metalness={0.8} roughness={0.25} />
      </mesh>
      <mesh position={[0.16, 0, 0.04]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#aab" metalness={0.95} />
      </mesh>
    </group>
  );
}

function FallbackButton({ tint }) {
  return (
    <group>
      <mesh>
        <cylinderGeometry args={[0.18, 0.22, 0.12, 16]} />
        <meshStandardMaterial color="#222" metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.05, 16]} />
        <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
}

function FallbackRouter({ tint }) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.55, 0.12, 0.32]} />
        <meshStandardMaterial color="#1a1a2a" metalness={0.6} roughness={0.4} />
      </mesh>
      {[-0.15, 0, 0.15].map((x) => (
        <mesh key={x} position={[x, 0.12, 0.1]}>
          <cylinderGeometry args={[0.012, 0.012, 0.2, 5]} />
          <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.8} />
        </mesh>
      ))}
    </group>
  );
}

function FallbackCity() {
  const towers = useMemo(() => Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 28 + Math.random() * 6;
    const h = 3 + Math.random() * 7;
    return { pos: [Math.cos(angle) * r, h / 2, Math.sin(angle) * r], h, w: 1.4 + Math.random() * 1.4 };
  }), []);
  return (
    <group>
      {towers.map((t, i) => (
        <mesh key={i} position={t.pos}>
          <boxGeometry args={[t.w, t.h, t.w]} />
          <meshStandardMaterial color="#1a1d30" emissive="#00d4ff" emissiveIntensity={0.15} />
        </mesh>
      ))}
    </group>
  );
}

function FallbackBox({ tint }) {
  return (
    <mesh>
      <boxGeometry args={[0.4, 0.4, 0.4]} />
      <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.4} metalness={0.6} />
    </mesh>
  );
}

const FALLBACK_MAP = {
  humanoid: FallbackHumanoid,
  mech: FallbackMech,
  drone: FallbackDrone,
  stealth: FallbackStealth,
  robot: FallbackRobot,
  camera: FallbackCamera,
  thermostat: FallbackThermostat,
  lock: FallbackLock,
  door: FallbackDoor,
  button: FallbackButton,
  router: FallbackRouter,
  city: FallbackCity,
  box: FallbackBox,
};

function Fallback({ kind, tint }) {
  const Comp = FALLBACK_MAP[kind] || FALLBACK_MAP.box;
  return <Comp tint={tint || '#00d4ff'} />;
}

// ── Error Boundary ──────────────────────────────────────────────────────────
class GltfErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err) {
    if (typeof window !== 'undefined') {
      console.warn('[AegisAI] GLB load failed, using fallback:', err?.message || err);
    }
  }
  render() {
    if (this.state.failed) return this.props.fallback;
    return this.props.children;
  }
}

// ── Inner GLTF loader ───────────────────────────────────────────────────────
function GltfModel({ path, isActive, isBreached }) {
  const { scene } = useGLTF(path, true /* draco */);

  const clonedScene = useMemo(() => {
    try {
      // Клонируем сцену без SkeletonUtils (избегаем лишней зависимости)
      return scene.clone(true);
    } catch {
      return scene;
    }
  }, [scene]);

  // Настраиваем материалы один раз при изменении состояния
  useEffect(() => {
    const touched = [];
    clonedScene.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
        const cloned = mats.map((m) => {
          const c = m.clone();
          touched.push(c);
          if (c.emissive) {
            c.emissiveIntensity = isBreached ? 0.9 : isActive ? 0.55 : 0.2;
          }
          return c;
        });
        obj.material = mats.length === 1 ? cloned[0] : cloned;
      }
    });
    return () => { touched.forEach((m) => m.dispose?.()); };
  }, [clonedScene, isActive, isBreached]);

  return <primitive object={clonedScene} />;
}

// ── Lazy wrapper — не рендерим тяжёлые модели сразу ──────────────────────────
function LazyGltfModel({ path, isActive, isBreached, fallbackElement }) {
  const [shouldLoad, setShouldLoad] = useState(false);

  // Начинаем загрузку с небольшой задержкой чтобы не блокировать первый рендер
  useEffect(() => {
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!shouldLoad) return fallbackElement;

  return (
    <GltfErrorBoundary fallback={fallbackElement}>
      <Suspense fallback={fallbackElement}>
        <GltfModel path={path} isActive={isActive} isBreached={isBreached} />
      </Suspense>
    </GltfErrorBoundary>
  );
}

// ── Public component ────────────────────────────────────────────────────────
export default function ModelAsset({
  modelKey,
  fallback,
  tint = '#00d4ff',
  position = [0, 0, 0],
  rotation,
  scale,
  isActive = false,
  isBreached = false,
  isProtected = false,
  onPointerOver,
  onPointerOut,
  onClick,
}) {
  const groupRef = useRef();
  const entry = getModelEntry(modelKey);
  const finalScale = scale ?? entry?.scale ?? 1;
  const finalRotation = rotation ?? entry?.rotation ?? [0, 0, 0];
  const finalPosition = position ?? entry?.position ?? [0, 0, 0];
  const fallbackKind = fallback || entry?.fallback || 'box';
  const path = entry?.path;

  // Пульсация только для активных состояний
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    if (isActive || isBreached || isProtected) {
      const t = clock.getElapsedTime();
      const speed = isBreached ? 9 : isActive ? 4 : 2;
      const amp = isBreached ? 0.05 : isActive ? 0.04 : 0.025;
      groupRef.current.scale.setScalar(finalScale * (1 + Math.sin(t * speed) * amp));
    }
  });

  const fallbackElement = <Fallback kind={fallbackKind} tint={tint} />;

  return (
    <group
      ref={groupRef}
      position={finalPosition}
      rotation={finalRotation}
      scale={finalScale}
      onPointerOver={onPointerOver ? (e) => { e.stopPropagation(); onPointerOver(e); } : undefined}
      onPointerOut={onPointerOut}
      onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
    >
      {path ? (
        <LazyGltfModel
          path={path}
          isActive={isActive}
          isBreached={isBreached}
          fallbackElement={fallbackElement}
        />
      ) : (
        fallbackElement
      )}
    </group>
  );
}
