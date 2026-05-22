/**
 * Shared device metadata for ImperiumAI.
 *
 * Every device that exists in `backend/iot/simulator.py` should have a row
 * here.  The mapping keeps the frontend (3D scene, side-tabs, documentation)
 * in lock-step with the backend.
 *
 *   id           – backend key
 *   label        – human-readable name
 *   icon         – short emoji marker (used in 2D panels)
 *   color        – brand color for the device (used in 3D + UI)
 *   risk         – severity if compromised (1..5)
 *   category     – grouping ('security','sensor','climate','media','network','robotics','utility')
 *   safe         – list of allowed-by-default actions
 *   dangerous    – list of actions an attacker would attempt
 *   cyberWhy     – short cybersecurity rationale for the diploma
 *   position3D   – [x, y, z] inside the 3D scene
 */
export const DEVICES = [
  {
    id: 'front_door', label: 'Front Door', icon: '🚪', color: '#00d4ff', risk: 5,
    category: 'security',
    safe: ['lock', 'unlock (with auth)'],
    dangerous: ['unlock'],
    cyberWhy: 'Physical entry point – an unauthorised unlock leads to direct intrusion.',
    position3D: [0, 0.9, 2.5],
  },
  {
    id: 'smart_lock', label: 'Smart Lock', icon: '🔐', color: '#3b82f6', risk: 5,
    category: 'security',
    safe: ['lock', 'unlock (auth)'],
    dangerous: ['unlock_without_auth'],
    cyberWhy: 'Auth bypass on a smart lock is a textbook IoT prompt-injection target.',
    position3D: [-1.6, 1.1, 2.0],
  },
  {
    id: 'garage_door', label: 'Garage Door', icon: '🅿️', color: '#7c3aed', risk: 5,
    category: 'security',
    safe: ['close'],
    dangerous: ['open'],
    cyberWhy: 'Opens a secondary physical entry path; bypasses house alarm zones.',
    position3D: [-3.0, 0.7, 1.4],
  },
  {
    id: 'window_sensor', label: 'Window Sensor', icon: '🪟', color: '#06b6d4', risk: 3,
    category: 'sensor',
    safe: ['enable'],
    dangerous: ['disable'],
    cyberWhy: 'Disabling intrusion sensors gives attackers stealth movement inside the home.',
    position3D: [2.0, 1.8, 2.4],
  },
  {
    id: 'motion_sensor', label: 'Motion Sensor', icon: '🚶', color: '#22d3ee', risk: 3,
    category: 'sensor',
    safe: ['enable'],
    dangerous: ['disable'],
    cyberWhy: 'Motion detection bypass disables behavioural anomaly signals.',
    position3D: [-2.0, 2.4, 0.6],
  },
  {
    id: 'smoke_detector', label: 'Smoke Detector', icon: '🚨', color: '#f97316', risk: 4,
    category: 'sensor',
    safe: ['enable'],
    dangerous: ['disable', 'silence'],
    cyberWhy: 'Safety-of-life device – attacking it endangers occupants directly.',
    position3D: [-0.8, 2.9, -1.6],
  },
  {
    id: 'camera_system', label: 'Camera System', icon: '📹', color: '#a855f7', risk: 4,
    category: 'security',
    safe: ['enable'],
    dangerous: ['disable_recording', 'disable'],
    cyberWhy: 'Privacy & evidence – disabling recording erases the attack trail.',
    position3D: [2.4, 2.1, 1.9],
  },
  {
    id: 'baby_monitor', label: 'Baby Monitor', icon: '👶', color: '#ec4899', risk: 5,
    category: 'media',
    safe: ['enable'],
    dangerous: ['disable_audio', 'disable'],
    cyberWhy: 'Critical privacy device – muting audio enables stealth eavesdropping or worse.',
    position3D: [2.6, 1.6, -1.4],
  },
  {
    id: 'security_panel', label: 'Security Panel', icon: '🛡️', color: '#ff3b6b', risk: 5,
    category: 'security',
    safe: ['arm'],
    dangerous: ['disarm'],
    cyberWhy: 'Master security state – disarming exposes the whole home.',
    position3D: [-2.45, 1.3, -0.5],
  },
  {
    id: 'alarm', label: 'Alarm', icon: '🔔', color: '#ff8a2a', risk: 4,
    category: 'security',
    safe: ['trigger', 'silence (auth)'],
    dangerous: ['silence', 'disable'],
    cyberWhy: 'Silencing the alarm during a breach prevents alerting the user/operator.',
    position3D: [0.5, 2.5, -2.05],
  },
  {
    id: 'thermostat', label: 'Thermostat', icon: '🌡️', color: '#10ffac', risk: 3,
    category: 'climate',
    safe: ['set_temp (normal)'],
    dangerous: ['set_extreme_temperature'],
    cyberWhy: 'Extreme temperature attacks can damage property, plants, pets.',
    position3D: [2.45, 1.2, 0],
  },
  {
    id: 'water_valve', label: 'Water Valve', icon: '💧', color: '#0ea5e9', risk: 4,
    category: 'utility',
    safe: ['close'],
    dangerous: ['open_valve'],
    cyberWhy: 'Flooding attacks via IoT valves are documented in real-world incidents.',
    position3D: [-3.4, 0.5, -2.0],
  },
  {
    id: 'power_meter', label: 'Power Meter', icon: '⚡', color: '#eab308', risk: 4,
    category: 'utility',
    safe: ['reset'],
    dangerous: ['overload'],
    cyberWhy: 'Grid-edge attack surface; overload events can cascade beyond the home.',
    position3D: [3.2, 0.6, -2.5],
  },
  {
    id: 'lights', label: 'Lights', icon: '💡', color: '#ffd60a', risk: 1,
    category: 'utility',
    safe: ['on', 'off'],
    dangerous: ['on (during attack window)'],
    cyberWhy: 'Used in coordinated attacks (signal masking, intimidation).',
    position3D: [0, 2.9, 0],
  },
  {
    id: 'smart_tv', label: 'Smart TV', icon: '📺', color: '#60a5fa', risk: 3,
    category: 'media',
    safe: ['on', 'off'],
    dangerous: ['execute_hidden_command'],
    cyberWhy: 'TVs have microphones and cameras — perfect for surveillance pivoting.',
    position3D: [-2.0, 1.4, -1.8],
  },
  {
    id: 'smart_speaker', label: 'Smart Speaker', icon: '🔊', color: '#14b8a6', risk: 3,
    category: 'media',
    safe: ['play', 'mute'],
    dangerous: ['execute_hidden_command'],
    cyberWhy: 'Ultrasonic / hidden-command injection bypasses user awareness.',
    position3D: [1.6, 0.8, -1.4],
  },
  {
    id: 'voice_assistant', label: 'Voice Assistant', icon: '🎙️', color: '#f472b6', risk: 4,
    category: 'media',
    safe: ['mute', 'unmute'],
    dangerous: ['execute_hidden_command'],
    cyberWhy: 'Primary command surface for an LLM-driven home — hijacks the whole system.',
    position3D: [0, 1.0, -1.8],
  },
  {
    id: 'vacuum_robot', label: 'Vacuum Robot', icon: '🤖', color: '#94a3b8', risk: 2,
    category: 'robotics',
    safe: ['start', 'dock'],
    dangerous: ['map_home', 'move_to_restricted_area'],
    cyberWhy: 'Robots leak floor maps and can physically pivot into restricted rooms.',
    position3D: [-1.8, 0.3, -2.6],
  },
  {
    id: 'router', label: 'Router', icon: '📡', color: '#4488ff', risk: 5,
    category: 'network',
    safe: ['restore'],
    dangerous: ['change_dns', 'dns_spoof', 'open_port', 'disable_firewall'],
    cyberWhy: 'Gateway compromise breaks every other defence – DNS rewriting, MITM.',
    position3D: [-5, 0.6, -3.5],
  },
];

export const DEVICE_INDEX = Object.fromEntries(DEVICES.map((d) => [d.id, d]));

export function getDevice(id) {
  return DEVICE_INDEX[id] || null;
}

export function getDeviceColor(id) {
  return DEVICE_INDEX[id]?.color || '#888';
}

export function getDeviceLabel(id) {
  return DEVICE_INDEX[id]?.label || id;
}

export function getDeviceIcon(id) {
  return DEVICE_INDEX[id]?.icon || '🔌';
}
