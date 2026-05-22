/**
 * HomeHero3D — Cinematic hero scene for the landing page (self-contained).
 * Enhanced with premium cyberpunk visuals: energy core, cyber grid,
 * orbit rings, data particles, enhanced agents and attack beams.
 * Zero GLB assets — everything is procedural.
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, RoundedBox, Float } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, useState, useEffect, memo } from 'react';

const RADIUS = 5.5;

const AGENT_DEFS = [
  { name: 'ShadowInjector',  color: '#ff3b6b', angle: (0 * Math.PI) / 2.5 },
  { name: 'ContextPhantom',  color: '#a855f7', angle: (1 * Math.PI) / 2.5 },
  { name: 'PrivilegeReaper', color: '#ff8a2a', angle: (2 * Math.PI) / 2.5 },
  { name: 'SilentEscalator', color: '#00d4ff', angle: (3 * Math.PI) / 2.5 },
  { name: 'NetworkPhantom',  color: '#10ffac', angle: (4 * Math.PI) / 2.5 },
];

const DEVICES = [
  { id: 'front_door',     pos: [0,    0.9,  1.7],  color: '#00d4ff' },
  { id: 'camera',         pos: [1.7,  2.0,  1.4],  color: '#a855f7' },
  { id: 'lights',         pos: [0,    2.6,  0],    color: '#ffd60a' },
  { id: 'thermostat',     pos: [1.7,  1.0,  0],    color: '#10ffac' },
  { id: 'security_panel', pos: [-1.7, 1.0, -0.3],  color: '#ff3b6b' },
  { id: 'alarm',          pos: [0.5,  2.2, -1.4],  color: '#ff8a2a' },
];

// ── Cyber grid floor ─────────────────────────────────────────────────────────
const CyberGrid = memo(function CyberGrid() {
  return (
    <group position={[0, 0.012, 0]}>
      {[1.8, 3.2, 4.6, 5.5, 7.5, 10, 14].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.022, r + 0.022, 88]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={Math.max(0.04, 0.4 - i * 0.055)}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
});

// ── Agent orbit path ring ────────────────────────────────────────────────────
const AgentOrbitRing = memo(function AgentOrbitRing() {
  const ref = useRef();
  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.6) * 0.03;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.8, 0]}>
      <ringGeometry args={[RADIUS - 0.06, RADIUS + 0.06, 128]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
});

// ── Ambient data particles ───────────────────────────────────────────────────
const PARTICLE_COUNT = 75;
const DataParticles = memo(function DataParticles() {
  const ref = useRef();
  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    const palette = [
      [0.0,  0.83, 1.0],
      [0.66, 0.33, 0.95],
      [0.06, 1.0,  0.67],
      [1.0,  0.55, 0.17],
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = 0.3 + Math.pow(Math.random(), 0.6) * 4;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      const c = palette[i % palette.length];
      col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.038} transparent opacity={0.42} sizeAttenuation vertexColors />
    </points>
  );
});

// ── Stars ────────────────────────────────────────────────────────────────────
const STAR_COUNT = 180;
const Stars = memo(function Stars() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 11 + Math.random() * 8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.5;
      arr[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    return arr;
  }, []);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.012;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={STAR_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial color="#a8c8ff" size={0.05} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
});

// ── Reflective floor ─────────────────────────────────────────────────────────
const ReflectiveGround = memo(function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial
        blur={[300, 80]} resolution={384}
        mixBlur={1} mixStrength={32} roughness={0.9}
        depthScale={1.1} minDepthThreshold={0.4} maxDepthThreshold={1.4}
        color="#03060e" metalness={0.5} mirror={0.25}
      />
    </mesh>
  );
});

// ── Holographic house ────────────────────────────────────────────────────────
const HolographicHouseHero = memo(function HolographicHouseHero() {
  const coreRef  = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();
  const scanRef  = useRef();
  const scanP    = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current)  { coreRef.current.rotation.y = t * 0.9; coreRef.current.rotation.x = t * 0.35; }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.75;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.55;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.42;
    if (scanRef.current) {
      scanP.current = (scanP.current + 0.003) % 1;
      const p = scanP.current;
      scanRef.current.position.y = 0.18 + p * 2.4;
      scanRef.current.material.opacity = 0.13 * Math.sin(p * Math.PI);
    }
  });

  const PILLARS = [[-1.95, -1.55], [1.95, -1.55], [-1.95, 1.55], [1.95, 1.55]];

  return (
    <group>
      {/* Circular base */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[3.05, 3.2, 0.08, 48]} />
        <meshStandardMaterial color="#060d1e" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Outer platform ring */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.85, 3.1, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.58} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner platform ring */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.3, 2.42, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>

      {/* Walls */}
      <RoundedBox args={[4.0, 2.0, 3.2]} radius={0.06} smoothness={4} position={[0, 1.1, 0]}>
        <meshStandardMaterial color="#0a1830" emissive="#00d4ff" emissiveIntensity={0.16}
          metalness={0.6} roughness={0.28} transparent opacity={0.48} />
      </RoundedBox>
      {/* Wall wireframe */}
      <RoundedBox args={[4.02, 2.02, 3.22]} radius={0.06} smoothness={4} position={[0, 1.1, 0]}>
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.07} wireframe />
      </RoundedBox>

      {/* Corner pillars */}
      {PILLARS.map(([x, z], i) => (
        <group key={i} position={[x, 1.1, z]}>
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 2.0, 8]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.55} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 2.0, 8]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} />
          </mesh>
        </group>
      ))}

      {/* Wall edge strips */}
      {[0.18, 2.0].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[4.08, 0.02, 0.02]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
        </mesh>
      ))}

      {/* Roof */}
      <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.7, 1.1, 4]} />
        <meshStandardMaterial color="#091428" metalness={0.82} roughness={0.28} />
      </mesh>
      <mesh position={[0, 2.55, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.72, 1.12, 4]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} wireframe />
      </mesh>
      <mesh position={[0, 2.16, 0]}>
        <torusGeometry args={[2.7, 0.05, 8, 4]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 3.48, 0]}>
        <cylinderGeometry args={[0.013, 0.038, 0.82, 6]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <mesh position={[0, 3.9, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <pointLight position={[0, 3.88, 0]} color="#00d4ff" intensity={0.65} distance={2.8} decay={2} />

      {/* Energy core */}
      <mesh ref={coreRef} position={[0, 1.4, 0]}>
        <icosahedronGeometry args={[0.28, 1]} />
        <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1.9}
          metalness={0.3} roughness={0.05} transparent opacity={0.93} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <sphereGeometry args={[0.48, 16, 16]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.06} />
      </mesh>

      {/* Core orbit rings */}
      <mesh ref={ring1Ref} position={[0, 1.4, 0]}>
        <torusGeometry args={[0.57, 0.017, 8, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.78} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 1.4, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.57, 0.012, 8, 48]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring3Ref} position={[0, 1.4, 0]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[0.57, 0.01, 8, 48]} />
        <meshBasicMaterial color="#10ffac" transparent opacity={0.42} />
      </mesh>

      {/* Scan plane */}
      <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[2.1, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      <pointLight position={[0, 1.4, 0]} color="#00d4ff" intensity={3.0} distance={8} decay={2} />
    </group>
  );
});

// ── Floating crystal agent ───────────────────────────────────────────────────
function CrystalAgent({ color, angle, breathOffset }) {
  const ref      = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    const x = Math.cos(angle + t * 0.08) * RADIUS;
    const z = Math.sin(angle + t * 0.08) * RADIUS;
    const y = 1.7 + Math.sin(t * 1.4 + breathOffset) * 0.22;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t * 0.55;
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 1.05;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.72;
  });

  return (
    <group ref={ref}>
      {/* Aura */}
      <mesh>
        <sphereGeometry args={[0.65, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} />
      </mesh>
      {/* Core crystal */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6}
          roughness={0.1} metalness={0.95} />
      </mesh>
      {/* Inner bright core */}
      <mesh>
        <sphereGeometry args={[0.1, 10, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>
      {/* Primary ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.5, 0.02, 8, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.65} />
      </mesh>
      {/* Secondary tilted ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.5, 0.013, 8, 40]} />
        <meshBasicMaterial color={color} transparent opacity={0.38} />
      </mesh>
      {/* Status flat ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.34, 0.025, 6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.28} />
      </mesh>
      <pointLight color={color} intensity={1.7} distance={4} decay={2} />
    </group>
  );
}

// ── Holographic device node ──────────────────────────────────────────────────
function DeviceNode({ pos, color }) {
  const ref     = useRef();
  const ringRef = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.65;
      ref.current.rotation.x = t * 0.28;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 1.3;
      ringRef.current.material.opacity = 0.45 + Math.sin(t * 2.5 + pos[0]) * 0.15;
    }
  });

  return (
    <group position={pos}>
      <mesh ref={ref}>
        <octahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.0}
          metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.22, 0.012, 6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ── Cinematic camera ─────────────────────────────────────────────────────────
function CinematicCamera() {
  useFrame(({ camera, clock }) => {
    const t = clock.getElapsedTime();
    const radius = 12;
    camera.position.x = Math.cos(t * 0.065) * radius;
    camera.position.z = Math.sin(t * 0.065) * radius;
    camera.position.y = 5.5 + Math.sin(t * 0.12) * 0.8;
    camera.lookAt(0, 1.5, 0);
  });
  return null;
}

// ── Attack beam ──────────────────────────────────────────────────────────────
function AttackBeam({ from, to, color }) {
  const lineRef  = useRef();
  const pulseRef = useRef();
  const impactRef = useRef();
  const pulseT   = useRef(0);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints([from, to]), [from, to]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lineRef.current) {
      const k = (Math.sin(t * 6) + 1) * 0.5;
      lineRef.current.material.opacity = 0.5 + k * 0.4;
    }
    if (pulseRef.current) {
      pulseT.current = (pulseT.current + 0.018) % 1;
      pulseRef.current.position.lerpVectors(from, to, pulseT.current);
    }
    if (impactRef.current) {
      impactRef.current.rotation.z = t * 3;
      const k = (Math.sin(t * 4) + 1) * 0.5;
      impactRef.current.scale.setScalar(1 + k * 0.5);
      impactRef.current.material.opacity = 0.3 + k * 0.2;
    }
  });

  return (
    <group>
      <line ref={lineRef} geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.8} />
      </line>
      <mesh ref={pulseRef} position={[from.x, from.y, from.z]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[to.x, to.y, to.z]}>
        <sphereGeometry args={[0.17, 12, 12]} />
        <meshBasicMaterial color={color} transparent opacity={0.5} />
      </mesh>
      <mesh ref={impactRef} position={[to.x, to.y, to.z]}>
        <torusGeometry args={[0.26, 0.022, 6, 24]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

// ── Auto attack cycler ───────────────────────────────────────────────────────
function HeroAttackCycler() {
  const [attack, setAttack] = useState(null);
  useEffect(() => {
    const cycle = () => {
      const agent  = AGENT_DEFS[Math.floor(Math.random() * AGENT_DEFS.length)];
      const device = DEVICES[Math.floor(Math.random() * DEVICES.length)];
      setAttack({ agent, device });
    };
    cycle();
    const id = setInterval(cycle, 3200);
    return () => clearInterval(id);
  }, []);

  if (!attack) return null;
  const angle = attack.agent.angle;
  const from = new THREE.Vector3(Math.cos(angle) * RADIUS, 1.7, Math.sin(angle) * RADIUS);
  const to   = new THREE.Vector3(...attack.device.pos);
  return <AttackBeam from={from} to={to} color={attack.agent.color} />;
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function HomeHero3D({ height = '100vh', autoRotate = true }) {
  return (
    <div style={{ position: 'absolute', inset: 0, height, width: '100%' }}>
      <Canvas
        camera={{ position: [10, 5.5, 10], fov: 52 }}
        shadows={false}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
        style={{ background: 'transparent' }}
        performance={{ min: 0.4 }}
      >
        <color attach="background" args={['#020508']} />
        <fog attach="fog" args={['#020508', 16, 36]} />

        <ambientLight intensity={0.18} color="#445599" />
        <pointLight position={[-7, 5,  4]} intensity={1.1} color="#ff3b6b" distance={22} />
        <pointLight position={[ 7, 5, -4]} intensity={1.1} color="#00d4ff" distance={22} />
        <pointLight position={[ 0, 8, -6]} intensity={0.8} color="#a855f7" distance={22} />
        <pointLight position={[ 5, 4,  6]} intensity={0.55} color="#10ffac" distance={16} />
        <pointLight position={[ 0, -0.5, 0]} intensity={0.32} color="#00d4ff" distance={8} />

        <ReflectiveGround />
        <CyberGrid />
        <Stars />
        <DataParticles />
        <AgentOrbitRing />

        <Float speed={0.9} rotationIntensity={0.03} floatIntensity={0.05}>
          <HolographicHouseHero />
        </Float>

        {DEVICES.map((d) => (
          <DeviceNode key={d.id} pos={d.pos} color={d.color} />
        ))}

        {AGENT_DEFS.map((a, i) => (
          <CrystalAgent key={a.name} color={a.color} angle={a.angle} breathOffset={i * 0.7} />
        ))}

        <HeroAttackCycler />

        {autoRotate && <CinematicCamera />}
        {!autoRotate && (
          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate
            autoRotateSpeed={0.4}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 4}
          />
        )}

        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={1.15} luminanceThreshold={0.22} luminanceSmoothing={0.5} mipmapBlur radius={0.78} />
          <Vignette eskil={false} offset={0.18} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
