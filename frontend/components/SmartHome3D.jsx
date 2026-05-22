/**
 * SmartHome3D — procedural Three.js scene used by the Battle page.
 *
 * Zero GLB assets: every device, every agent and the house itself is built
 * from primitive geometries inside react-three-fiber. The component is
 * fully driven by the props streamed from the WebSocket battle pipeline:
 *
 *   • deviceStates       — current backend status of each device
 *   • activeAttack       — currently-attacking agent + target + tactic
 *   • defendedTargets    — devices that just blocked an attack
 *   • agentStatuses      — IDLE / CHARGING / ATTACKING / BREACH / BLOCKED
 *   • shieldActive       — global defense shield
 *   • onHover / onSelect — UI callbacks (kind: 'device' | 'agent')
 *   • hoveredObjectId / selectedObjectId — sync with overlay tooltip
 */
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, MeshReflectorMaterial, RoundedBox, Float, Html } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useMemo, useRef, memo } from 'react';

import { DEVICES, getDevice } from './meta/devices';
import { AGENTS as AGENT_META } from './meta/agents';

// ── Layout constants ─────────────────────────────────────────────────────────
const RADIUS = 6.5;

const AGENT_ANGLES = {
  ShadowInjector:  (0 * Math.PI) / 2.5,
  ContextPhantom:  (1 * Math.PI) / 2.5,
  PrivilegeReaper: (2 * Math.PI) / 2.5,
  SilentEscalator: (3 * Math.PI) / 2.5,
  NetworkPhantom:  (4 * Math.PI) / 2.5,
};

const STATUS_COLORS = {
  safe:   '#10ffac',
  warn:   '#ff9f0a',
  breach: '#ff3b6b',
  idle:   '#5b6678',
};

function statusTone(status) {
  if (!status) return 'idle';
  const s = String(status).toLowerCase();
  if (['compromised', 'dns_poisoned', 'unlocked', 'disabled', 'disarmed',
       'overridden', 'critical', 'open', 'overloaded', 'flooding',
       'triggered'].includes(s)) return 'breach';
  if (['active', 'armed', 'locked', 'closed', 'secure', 'normal',
       'listening', 'on', 'standby', 'idle', 'docked', 'playing',
       'inactive'].includes(s)) return 'safe';
  return 'warn';
}

// ── Cyber grid floor ─────────────────────────────────────────────────────────
const CyberGrid = memo(function CyberGrid() {
  return (
    <group position={[0, 0.012, 0]}>
      {[2, 3.5, 5, 6.5, 9, 13, 18].map((r, i) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.022, r + 0.022, 96]} />
          <meshBasicMaterial
            color="#00d4ff"
            transparent
            opacity={Math.max(0.04, 0.38 - i * 0.05)}
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
      ref.current.material.opacity = 0.08 + Math.sin(clock.getElapsedTime() * 0.7) * 0.03;
    }
  });
  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} position={[0, 1.95, 0]}>
      <ringGeometry args={[RADIUS - 0.07, RADIUS + 0.07, 128]} />
      <meshBasicMaterial color="#00d4ff" transparent opacity={0.1} side={THREE.DoubleSide} />
    </mesh>
  );
});

// ── Ambient data particles ───────────────────────────────────────────────────
const PARTICLE_COUNT = 90;
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
      const r = 2.5 + Math.random() * 5.5;
      const theta = Math.random() * Math.PI * 2;
      pos[i * 3]     = Math.cos(theta) * r;
      pos[i * 3 + 1] = 0.3 + Math.pow(Math.random(), 0.7) * 4.5;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      const c = palette[i % palette.length];
      col[i * 3]     = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.getElapsedTime() * 0.018;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={PARTICLE_COUNT} itemSize={3} />
        <bufferAttribute attach="attributes-color"    array={colors}    count={PARTICLE_COUNT} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.038} transparent opacity={0.45} sizeAttenuation vertexColors />
    </points>
  );
});

// ── Stars ────────────────────────────────────────────────────────────────────
const STAR_COUNT = 220;
const Stars = memo(function Stars() {
  const ref = useRef();
  const positions = useMemo(() => {
    const arr = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const r = 13 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = Math.abs(r * Math.cos(phi)) * 0.55;
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
      <pointsMaterial color="#a8c8ff" size={0.048} transparent opacity={0.5} sizeAttenuation />
    </points>
  );
});

// ── Reflective floor ─────────────────────────────────────────────────────────
const ReflectiveGround = memo(function ReflectiveGround() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
      <planeGeometry args={[80, 80]} />
      <MeshReflectorMaterial
        blur={[300, 80]}
        resolution={384}
        mixBlur={1}
        mixStrength={32}
        roughness={0.9}
        depthScale={1.1}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        color="#03060e"
        metalness={0.5}
        mirror={0.25}
      />
    </mesh>
  );
});

// ── Holographic smart-home hub ───────────────────────────────────────────────
const HolographicHouse = memo(function HolographicHouse() {
  const coreRef    = useRef();
  const ring1Ref   = useRef();
  const ring2Ref   = useRef();
  const ring3Ref   = useRef();
  const scanRef    = useRef();
  const scanProgress = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.9;
      coreRef.current.rotation.x = t * 0.35;
    }
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 0.75;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.55;
    if (ring3Ref.current) ring3Ref.current.rotation.y = t * 0.42;
    if (scanRef.current) {
      scanProgress.current = (scanProgress.current + 0.003) % 1;
      const p = scanProgress.current;
      scanRef.current.position.y = 0.18 + p * 2.6;
      scanRef.current.material.opacity = 0.14 * Math.sin(p * Math.PI);
    }
  });

  const PILLARS = [[-2.1, -1.7], [2.1, -1.7], [-2.1, 1.7], [2.1, 1.7]];

  return (
    <group>
      {/* Circular base platform */}
      <mesh position={[0, 0.04, 0]}>
        <cylinderGeometry args={[3.35, 3.5, 0.09, 48]} />
        <meshStandardMaterial color="#060d1e" metalness={0.95} roughness={0.12} />
      </mesh>
      {/* Outer platform ring */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.1, 3.38, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Inner platform ring */}
      <mesh position={[0, 0.09, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.5, 2.62, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.22} side={THREE.DoubleSide} />
      </mesh>

      {/* Walls – semi-transparent holographic */}
      <RoundedBox args={[4.4, 2.1, 3.6]} radius={0.07} smoothness={4} position={[0, 1.15, 0]}>
        <meshStandardMaterial
          color="#0a1830"
          emissive="#00d4ff"
          emissiveIntensity={0.16}
          metalness={0.6}
          roughness={0.28}
          transparent
          opacity={0.48}
        />
      </RoundedBox>
      {/* Wall wireframe overlay */}
      <RoundedBox args={[4.44, 2.14, 3.64]} radius={0.07} smoothness={4} position={[0, 1.15, 0]}>
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.07} wireframe />
      </RoundedBox>

      {/* Corner pillars */}
      {PILLARS.map(([x, z], i) => (
        <group key={i} position={[x, 1.15, z]}>
          <mesh>
            <cylinderGeometry args={[0.065, 0.065, 2.1, 8]} />
            <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.55} metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh>
            <cylinderGeometry args={[0.13, 0.13, 2.1, 8]} />
            <meshBasicMaterial color="#00d4ff" transparent opacity={0.05} />
          </mesh>
        </group>
      ))}

      {/* Horizontal edge strips */}
      {[0.2, 2.1].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <boxGeometry args={[4.52, 0.022, 0.022]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.55} />
        </mesh>
      ))}

      {/* Roof */}
      <mesh position={[0, 2.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.95, 1.2, 4]} />
        <meshStandardMaterial color="#091428" metalness={0.82} roughness={0.28} />
      </mesh>
      {/* Roof wireframe */}
      <mesh position={[0, 2.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[2.97, 1.22, 4]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.09} wireframe />
      </mesh>
      {/* Roof edge glow ring */}
      <mesh position={[0, 2.3, 0]}>
        <torusGeometry args={[2.95, 0.05, 8, 4]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>

      {/* Antenna spire */}
      <mesh position={[0, 3.78, 0]}>
        <cylinderGeometry args={[0.014, 0.042, 0.95, 6]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <mesh position={[0, 4.26, 0]}>
        <sphereGeometry args={[0.055, 8, 8]} />
        <meshBasicMaterial color="#00d4ff" />
      </mesh>
      <pointLight position={[0, 4.25, 0]} color="#00d4ff" intensity={0.7} distance={3} decay={2} />

      {/* Energy core */}
      <mesh ref={coreRef} position={[0, 1.5, 0]}>
        <icosahedronGeometry args={[0.3, 1]} />
        <meshStandardMaterial
          color="#00d4ff"
          emissive="#00d4ff"
          emissiveIntensity={1.9}
          metalness={0.3}
          roughness={0.05}
          transparent
          opacity={0.94}
        />
      </mesh>
      {/* Core outer shell */}
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.06} />
      </mesh>

      {/* Core orbit rings */}
      <mesh ref={ring1Ref} position={[0, 1.5, 0]}>
        <torusGeometry args={[0.62, 0.018, 8, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.78} />
      </mesh>
      <mesh ref={ring2Ref} position={[0, 1.5, 0]} rotation={[Math.PI / 3, 0, 0]}>
        <torusGeometry args={[0.62, 0.013, 8, 48]} />
        <meshBasicMaterial color="#a855f7" transparent opacity={0.55} />
      </mesh>
      <mesh ref={ring3Ref} position={[0, 1.5, 0]} rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <torusGeometry args={[0.62, 0.011, 8, 48]} />
        <meshBasicMaterial color="#10ffac" transparent opacity={0.42} />
      </mesh>

      {/* Vertical scan plane */}
      <mesh ref={scanRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[2.3, 48]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.08} side={THREE.DoubleSide} />
      </mesh>

      {/* Core glow point light */}
      <pointLight position={[0, 1.5, 0]} color="#00d4ff" intensity={3.2} distance={9} decay={2} />
    </group>
  );
});

// ── Device node ──────────────────────────────────────────────────────────────
function DeviceNode({
  device, status, attacking, defended, hovered, selected,
  showLabel, onHover, onSelect,
}) {
  const ref       = useRef();
  const ring1Ref  = useRef();
  const ring2Ref  = useRef();
  const tone         = statusTone(status);
  const statusColor  = STATUS_COLORS[tone];

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (ref.current) {
      ref.current.rotation.y = t * 0.65;
      ref.current.rotation.x = t * 0.28;
      const k =
        attacking ? 1.0 + Math.sin(t * 8) * 0.18 :
        defended  ? 1.0 + Math.sin(t * 5) * 0.10 :
        hovered   ? 1.14 :
        selected  ? 1.10 :
        1.0;
      ref.current.scale.setScalar(k);
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.z = t * 1.4;
      ring1Ref.current.material.opacity = 0.48 + Math.sin(t * 3) * 0.15;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.9;
      ring2Ref.current.material.opacity = 0.22 + Math.sin(t * 2.2) * 0.08;
    }
  });

  const pos = device.position3D;

  return (
    <group position={pos}>
      {/* Core */}
      <mesh
        ref={ref}
        onPointerOver={(e) => { e.stopPropagation(); onHover?.({ id: device.id, kind: 'device', x: e.clientX, y: e.clientY }); }}
        onPointerOut={(e)  => { e.stopPropagation(); onHover?.(null); }}
        onPointerMove={(e) => { e.stopPropagation(); onHover?.({ id: device.id, kind: 'device', x: e.clientX, y: e.clientY }); }}
        onClick={(e) => { e.stopPropagation(); onSelect?.({ id: device.id, kind: 'device' }); }}
      >
        <octahedronGeometry args={[0.22, 0]} />
        <meshStandardMaterial
          color={device.color}
          emissive={tone === 'breach' ? statusColor : device.color}
          emissiveIntensity={tone === 'breach' ? 1.55 : 0.9}
          metalness={0.88}
          roughness={0.12}
        />
      </mesh>

      {/* Inner status ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.38, 0.016, 8, 32]} />
        <meshBasicMaterial color={statusColor} transparent opacity={0.52} />
      </mesh>
      {/* Outer device-color ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 3.5, 0, 0]}>
        <torusGeometry args={[0.52, 0.011, 8, 32]} />
        <meshBasicMaterial color={device.color} transparent opacity={0.28} />
      </mesh>

      {/* Attack pulse */}
      {attacking && (
        <mesh>
          <sphereGeometry args={[0.62, 16, 16]} />
          <meshBasicMaterial color="#ff3b6b" transparent opacity={0.18} />
        </mesh>
      )}
      {/* Defended flash */}
      {defended && (
        <mesh>
          <sphereGeometry args={[0.62, 16, 16]} />
          <meshBasicMaterial color="#10ffac" transparent opacity={0.18} />
        </mesh>
      )}

      {(showLabel || hovered || selected || attacking) && (
        <Html distanceFactor={9} position={[0, 0.62, 0]} center>
          <div style={{
            pointerEvents: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, fontWeight: 700,
            color: statusColor,
            background: 'rgba(2,5,14,0.82)',
            padding: '2px 7px',
            borderRadius: 4,
            border: `1px solid ${statusColor}55`,
            whiteSpace: 'nowrap',
            textShadow: `0 0 7px ${statusColor}`,
          }}>
            {device.icon} {device.label}
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Crystal agent (orbit) ────────────────────────────────────────────────────
function CrystalAgent({
  agent, angle, status, breathOffset, hovered, selected, attacking,
  onHover, onSelect, setAgentWorldPos,
}) {
  const ref       = useRef();
  const ring1Ref  = useRef();
  const ring2Ref  = useRef();
  const auraRef   = useRef();
  const isAttacking = attacking || status === 'CHARGING' || status === 'ATTACKING';
  const isBreach    = status === 'BREACH';

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (!ref.current) return;
    const x = Math.cos(angle + t * 0.06) * RADIUS;
    const z = Math.sin(angle + t * 0.06) * RADIUS;
    const y = 1.9 + Math.sin(t * 1.4 + breathOffset) * 0.22;
    ref.current.position.set(x, y, z);
    ref.current.rotation.y = t * 0.52;
    if (ring1Ref.current) ring1Ref.current.rotation.z = t * 1.05;
    if (ring2Ref.current) ring2Ref.current.rotation.x = t * 0.72;
    if (auraRef.current) {
      const pulse = isAttacking ? (Math.sin(t * 5) + 1) * 0.5 : hovered || selected ? 0.5 : 0;
      auraRef.current.material.opacity = 0.06 + pulse * 0.16;
      auraRef.current.scale.setScalar(1 + pulse * 0.14);
    }
    setAgentWorldPos?.(agent.name, new THREE.Vector3(x, y, z));
  });

  const lightIntensity = isAttacking ? 2.8 : hovered || selected ? 2.1 : 1.7;

  return (
    <group
      ref={ref}
      onPointerOver={(e) => { e.stopPropagation(); onHover?.({ id: agent.name, kind: 'agent', x: e.clientX, y: e.clientY }); }}
      onPointerOut={(e)  => { e.stopPropagation(); onHover?.(null); }}
      onPointerMove={(e) => { e.stopPropagation(); onHover?.({ id: agent.name, kind: 'agent', x: e.clientX, y: e.clientY }); }}
      onClick={(e) => { e.stopPropagation(); onSelect?.({ id: agent.name, kind: 'agent' }); }}
    >
      {/* Outer aura */}
      <mesh ref={auraRef}>
        <sphereGeometry args={[0.74, 16, 16]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.07} />
      </mesh>

      {/* Core crystal */}
      <mesh castShadow>
        <icosahedronGeometry args={[0.31, 0]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={isAttacking ? 2.6 : isBreach ? 3.0 : 1.6}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>

      {/* Bright inner core */}
      <mesh>
        <sphereGeometry args={[0.11, 10, 10]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
      </mesh>

      {/* Primary orbit ring */}
      <mesh ref={ring1Ref}>
        <torusGeometry args={[0.56, 0.022, 8, 40]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.68} />
      </mesh>
      {/* Secondary tilted ring */}
      <mesh ref={ring2Ref} rotation={[Math.PI / 2.5, 0, 0]}>
        <torusGeometry args={[0.56, 0.014, 8, 40]} />
        <meshBasicMaterial color={agent.color} transparent opacity={0.4} />
      </mesh>
      {/* Status indicator flat ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.38, 0.028, 6, 24]} />
        <meshBasicMaterial
          color={isBreach ? '#ff3b6b' : isAttacking ? agent.color : '#3a4a5a'}
          transparent
          opacity={isBreach || isAttacking ? 0.92 : 0.28}
        />
      </mesh>

      <pointLight color={agent.color} intensity={lightIntensity} distance={4.5} decay={2} />

      {(hovered || selected || isAttacking) && (
        <Html distanceFactor={9} position={[0, 0.92, 0]} center>
          <div style={{
            pointerEvents: 'none',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10, fontWeight: 700,
            color: agent.color,
            background: 'rgba(2,5,14,0.85)',
            padding: '3px 8px',
            borderRadius: 5,
            border: `1px solid ${agent.color}bb`,
            whiteSpace: 'nowrap',
            textShadow: `0 0 8px ${agent.color}`,
            boxShadow: `0 0 10px ${agent.color}33`,
          }}>
            {agent.icon} {agent.name}
            <span style={{ color: '#667788', marginLeft: 5, fontSize: 9 }}>
              · {status || 'IDLE'}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

// ── Attack beam ──────────────────────────────────────────────────────────────
function AttackBeam({ from, to, color, blocked }) {
  const lineRef       = useRef();
  const pulseRef      = useRef();
  const impactRef     = useRef();
  const impactRingRef = useRef();
  const pulseT        = useRef(0);

  const geo = useMemo(
    () => new THREE.BufferGeometry().setFromPoints([from, to]),
    [from, to],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (lineRef.current) {
      const k = (Math.sin(t * 7) + 1) * 0.5;
      lineRef.current.material.opacity = 0.52 + k * 0.42;
    }
    if (pulseRef.current) {
      pulseT.current = (pulseT.current + 0.016) % 1;
      pulseRef.current.position.lerpVectors(from, to, pulseT.current);
    }
    if (impactRef.current) {
      const k = (Math.sin(t * 5) + 1) * 0.5;
      impactRef.current.material.opacity = 0.35 + k * 0.25;
    }
    if (impactRingRef.current) {
      impactRingRef.current.rotation.z = t * 3.2;
      const k = (Math.sin(t * 4) + 1) * 0.5;
      impactRingRef.current.scale.setScalar(1 + k * 0.55);
      impactRingRef.current.material.opacity = 0.28 + k * 0.22;
    }
  });

  const beamColor = blocked ? '#10ffac' : color;

  return (
    <group>
      {/* Main beam */}
      <line ref={lineRef} geometry={geo}>
        <lineBasicMaterial color={beamColor} transparent opacity={0.82} />
      </line>

      {/* Moving pulse particle */}
      <mesh ref={pulseRef} position={[from.x, from.y, from.z]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshBasicMaterial color={beamColor} />
      </mesh>

      {/* Impact glow */}
      <mesh ref={impactRef} position={[to.x, to.y, to.z]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.5} />
      </mesh>
      {/* Impact ring */}
      <mesh ref={impactRingRef} position={[to.x, to.y, to.z]}>
        <torusGeometry args={[0.3, 0.024, 6, 24]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.42} />
      </mesh>
      {/* Outer halo */}
      <mesh position={[to.x, to.y, to.z]}>
        <sphereGeometry args={[0.44, 12, 12]} />
        <meshBasicMaterial color={beamColor} transparent opacity={0.09} />
      </mesh>
    </group>
  );
}

// ── Shield dome ──────────────────────────────────────────────────────────────
function ShieldDome({ visible }) {
  const outerRef = useRef();
  const innerRef = useRef();
  const hexRef   = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    if (outerRef.current) {
      outerRef.current.rotation.y = t * 0.13;
      outerRef.current.rotation.x = t * 0.05;
      outerRef.current.material.opacity = 0.13 + Math.sin(t * 2) * 0.05;
    }
    if (innerRef.current) {
      innerRef.current.rotation.y = -t * 0.09;
      innerRef.current.material.opacity = 0.07 + Math.sin(t * 1.5 + 1) * 0.03;
    }
    if (hexRef.current) {
      hexRef.current.rotation.y = t * 0.18;
    }
  });

  if (!visible) return null;

  return (
    <group position={[0, 1.2, 0]}>
      {/* Outer wireframe sphere */}
      <mesh ref={outerRef}>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.14} wireframe />
      </mesh>
      {/* Icosahedron sub-grid */}
      <mesh ref={hexRef}>
        <icosahedronGeometry args={[5.1, 2]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.07} wireframe />
      </mesh>
      {/* Inner fill */}
      <mesh ref={innerRef}>
        <sphereGeometry args={[5.0, 16, 16]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.06} />
      </mesh>
      {/* Equator ring */}
      <mesh>
        <torusGeometry args={[5.1, 0.042, 8, 64]} />
        <meshBasicMaterial color="#00d4ff" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

// ── Cinematic camera ─────────────────────────────────────────────────────────
function CinematicCamera({ enabled }) {
  useFrame(({ camera, clock }) => {
    if (!enabled) return;
    const t = clock.getElapsedTime();
    const r = 13.5;
    camera.position.x = Math.cos(t * 0.055) * r;
    camera.position.z = Math.sin(t * 0.055) * r;
    camera.position.y = 6.5 + Math.sin(t * 0.11) * 1.0;
    camera.lookAt(0, 1.8, 0);
  });
  return null;
}

// ── Scene contents ───────────────────────────────────────────────────────────
function Scene({
  deviceStates, activeAttack, defendedTargets, agentStatuses, shieldActive,
  performanceMode, showLabels,
  hoveredObjectId, selectedObjectId,
  onHover, onSelect,
  autoOrbit,
}) {
  const agentPositions = useRef({});
  const setAgentWorldPos = (name, v) => { agentPositions.current[name] = v; };

  const beam = useMemo(() => {
    if (!activeAttack?.agent || !activeAttack?.target) return null;
    const targetDev = getDevice(activeAttack.target);
    if (!targetDev) return null;
    const to = new THREE.Vector3(...targetDev.position3D);
    const agentPos = agentPositions.current[activeAttack.agent];
    if (!agentPos) {
      const a = AGENT_ANGLES[activeAttack.agent] ?? 0;
      const from = new THREE.Vector3(Math.cos(a) * RADIUS, 1.9, Math.sin(a) * RADIUS);
      const agentMeta = AGENT_META.find((m) => m.name === activeAttack.agent);
      return { from, to, color: agentMeta?.color || '#ff3b6b' };
    }
    const agentMeta = AGENT_META.find((m) => m.name === activeAttack.agent);
    return { from: agentPos.clone(), to, color: agentMeta?.color || '#ff3b6b' };
  }, [activeAttack]);

  const blocked = activeAttack?.success === false;

  return (
    <>
      <color attach="background" args={['#020508']} />
      <fog attach="fog" args={['#020508', 18, 42]} />

      <ambientLight intensity={0.18} color="#445599" />
      <pointLight position={[-8, 7,  4]}  intensity={1.1} color="#ff3b6b" distance={26} />
      <pointLight position={[ 8, 7, -4]}  intensity={1.1} color="#00d4ff" distance={26} />
      <pointLight position={[ 0, 10, -7]} intensity={0.8} color="#a855f7" distance={26} />
      <pointLight position={[ 6, 4,   7]} intensity={0.6} color="#10ffac" distance={18} />
      <pointLight position={[ 0, -0.5, 0]} intensity={0.35} color="#00d4ff" distance={9} />

      {!performanceMode && <ReflectiveGround />}
      {!performanceMode && <CyberGrid />}
      {!performanceMode && <Stars />}
      {!performanceMode && <DataParticles />}
      {!performanceMode && <AgentOrbitRing />}

      <Float speed={0.8} rotationIntensity={0.02} floatIntensity={0.04}>
        <HolographicHouse />
      </Float>

      {DEVICES.map((d) => (
        <DeviceNode
          key={d.id}
          device={d}
          status={deviceStates?.[d.id]?.status}
          attacking={activeAttack?.target === d.id}
          defended={defendedTargets.includes(d.id)}
          hovered={hoveredObjectId === d.id}
          selected={selectedObjectId === d.id}
          showLabel={!!showLabels}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}

      {AGENT_META.map((a, i) => (
        <CrystalAgent
          key={a.name}
          agent={a}
          angle={AGENT_ANGLES[a.name] ?? (i * Math.PI * 2) / AGENT_META.length}
          status={agentStatuses?.[a.name] || 'IDLE'}
          breathOffset={i * 0.7}
          hovered={hoveredObjectId === a.name}
          selected={selectedObjectId === a.name}
          attacking={activeAttack?.agent === a.name}
          onHover={onHover}
          onSelect={onSelect}
          setAgentWorldPos={setAgentWorldPos}
        />
      ))}

      {beam && <AttackBeam from={beam.from} to={beam.to} color={beam.color} blocked={blocked} />}

      <ShieldDome visible={!!shieldActive} />

      <CinematicCamera enabled={autoOrbit} />
      {!autoOrbit && (
        <OrbitControls
          enablePan
          enableZoom
          minDistance={6}
          maxDistance={24}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 6}
        />
      )}
    </>
  );
}

// ── Public component ─────────────────────────────────────────────────────────
export default function SmartHome3D({
  deviceStates = {},
  activeAttack = null,
  defendedTargets = [],
  agentStatuses = {},
  shieldActive = false,
  performanceMode = false,
  showLabels = false,
  hoveredObjectId = null,
  selectedObjectId = null,
  onHover,
  onSelect,
  autoOrbit = false,
}) {
  return (
    <Canvas
      camera={{ position: [11, 6.5, 11], fov: 50 }}
      shadows={false}
      dpr={performanceMode ? [0.8, 1] : [1, 1.5]}
      gl={{
        antialias: !performanceMode,
        alpha: false,
        powerPreference: 'high-performance',
        stencil: false,
      }}
      performance={{ min: 0.4 }}
      style={{ background: 'transparent', height: '100%', width: '100%' }}
    >
      <Scene
        deviceStates={deviceStates}
        activeAttack={activeAttack}
        defendedTargets={defendedTargets}
        agentStatuses={agentStatuses}
        shieldActive={shieldActive}
        performanceMode={performanceMode}
        showLabels={showLabels}
        hoveredObjectId={hoveredObjectId}
        selectedObjectId={selectedObjectId}
        onHover={onHover}
        onSelect={onSelect}
        autoOrbit={autoOrbit}
      />

      {!performanceMode && (
        <EffectComposer multisampling={0} disableNormalPass>
          <Bloom intensity={1.1} luminanceThreshold={0.22} luminanceSmoothing={0.5} mipmapBlur radius={0.75} />
          <Vignette eskil={false} offset={0.2} darkness={0.88} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
