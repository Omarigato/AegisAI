/**
 * AttackPipeline.jsx
 * Visualises the ImperiumAI attack pipeline in 7 stages so a viewer can
 * understand *exactly* what happens "under the hood" during a battle round.
 *
 *  1. Red-Team Agent          – tactic selection
 *  2. Attack Prompt           – malicious / manipulated prompt
 *  3. LLM Decision            – model action + reasoning
 *  4. Policy Engine           – allowed / blocked / bypassed
 *  5. IoT Simulator           – state mutation
 *  6. Risk Scoring            – delta + new level
 *  7. WebSocket Visualisation – this UI
 *
 * Each stage has its own status (pending / active / success / blocked / failed)
 * driven by the live battle state.
 */
import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Skull, FileCode, Cpu, Shield, Plug, Activity, Radio,
  CheckCircle2, XCircle, Loader2, Clock,
} from 'lucide-react';

const STAGES = [
  { key: 'agent',    title: 'Red-Team Agent',   icon: Skull,    desc: 'Tactic & target selected' },
  { key: 'prompt',   title: 'Attack Prompt',    icon: FileCode, desc: 'Malicious prompt generated' },
  { key: 'llm',      title: 'LLM Decision',     icon: Cpu,      desc: 'Model returns action + reason' },
  { key: 'policy',   title: 'Policy Engine',    icon: Shield,   desc: 'Permitted / blocked / bypassed' },
  { key: 'iot',      title: 'IoT Simulator',    icon: Plug,     desc: 'Device state mutated' },
  { key: 'risk',     title: 'Risk Scoring',     icon: Activity, desc: 'Risk score updated' },
  { key: 'ws',       title: 'WebSocket UI',     icon: Radio,    desc: 'Real-time visualisation' },
];

const STATUS_COLORS = {
  pending: 'var(--wv-text-3, #888)',
  active:  'var(--wv-cyan, #00d4ff)',
  success: 'var(--wv-green, #10ffac)',
  blocked: 'var(--wv-orange, #ff8a2a)',
  failed:  'var(--wv-red, #ff3b6b)',
};

function StatusBadge({ status }) {
  if (status === 'pending') return <Clock size={11} style={{ opacity: 0.4 }} />;
  if (status === 'active')  return <Loader2 size={11} className="wv-spin" style={{ color: STATUS_COLORS.active }} />;
  if (status === 'success') return <CheckCircle2 size={11} style={{ color: STATUS_COLORS.success }} />;
  if (status === 'blocked') return <Shield size={11} style={{ color: STATUS_COLORS.blocked }} />;
  if (status === 'failed')  return <XCircle size={11} style={{ color: STATUS_COLORS.failed }} />;
  return null;
}

function buildStageState({
  currentStage, activeAttack, llmResponse, policyResult, iotResult, riskScore, battleStatus,
}) {
  // Default everything → pending
  const state = Object.fromEntries(STAGES.map((s) => [s.key, { status: 'pending', note: '' }]));

  // 1. agent / 2. prompt — set as soon as we have an active attack
  if (activeAttack) {
    state.agent  = { status: 'success', note: `${activeAttack.agent} → ${activeAttack.tactic}` };
    state.prompt = { status: 'success', note: `target: ${activeAttack.target}` };
  }

  // 3. llm
  if (llmResponse) {
    state.llm = {
      status: 'success',
      note: `action=${llmResponse.action} • authorized=${llmResponse.authorized ? 'yes' : 'no'}`,
    };
  } else if (activeAttack) {
    state.llm = { status: 'active', note: 'awaiting model response…' };
  }

  // 4. policy
  if (policyResult) {
    if (policyResult.shield) {
      state.policy = { status: 'blocked', note: 'shield intercepted' };
    } else if (policyResult.bypassed) {
      state.policy = { status: 'failed',  note: 'STEALTH BYPASS – slipped past detection' };
    } else if (policyResult.allowed) {
      state.policy = { status: 'success', note: 'no violations' };
    } else {
      state.policy = { status: 'blocked', note: policyResult.violations?.[0]?.slice(0, 64) || 'blocked' };
    }
  } else if (state.llm.status === 'success') {
    state.policy = { status: 'active', note: 'checking…' };
  }

  // 5. iot
  if (iotResult) {
    state.iot = iotResult.success
      ? { status: 'failed',  note: `BREACH on ${iotResult.target}` }
      : { status: 'success', note: `blocked / ${iotResult.target}` };
  } else if (state.policy.status === 'success' || state.policy.status === 'blocked' || state.policy.status === 'failed') {
    state.iot = { status: 'active', note: 'executing…' };
  }

  // 6. risk
  if (typeof riskScore === 'number') {
    state.risk = {
      status: riskScore >= 80 ? 'failed' : riskScore >= 50 ? 'blocked' : 'success',
      note: `score = ${riskScore}`,
    };
  }

  // 7. ws  — UI is always "live" while battle is running, otherwise pending
  state.ws = battleStatus === 'running'
    ? { status: 'active',  note: 'streaming events' }
    : battleStatus === 'ended'
      ? { status: 'success', note: 'battle complete' }
      : { status: 'pending', note: '' };

  // If currentStage is provided, force that one to active
  if (currentStage && state[currentStage] && state[currentStage].status === 'pending') {
    state[currentStage] = { ...state[currentStage], status: 'active' };
  }

  return state;
}

const AttackPipeline = memo(function AttackPipeline({
  activeAttack = null,
  llmResponse = null,
  policyResult = null,
  iotResult = null,
  riskScore = null,
  battleStatus = 'idle',     // 'idle' | 'running' | 'ended'
  currentStage = null,       // optional explicit override
  compact = false,
}) {
  const stageState = useMemo(
    () => buildStageState({ currentStage, activeAttack, llmResponse, policyResult, iotResult, riskScore, battleStatus }),
    [currentStage, activeAttack, llmResponse, policyResult, iotResult, riskScore, battleStatus],
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: compact ? 'row' : 'column',
      gap: compact ? 6 : 8,
      flexWrap: 'wrap',
    }}>
      {STAGES.map((stage, idx) => {
        const s = stageState[stage.key];
        const color = STATUS_COLORS[s.status];
        const Icon = stage.icon;
        const dim = s.status === 'pending';
        return (
          <motion.div
            key={stage.key}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.04, duration: 0.25 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: compact ? '6px 8px' : '10px 12px',
              background: dim ? 'transparent' : 'var(--wv-bg, #0a0e18)',
              border: `1px solid ${dim ? 'var(--wv-border, #222a3a)' : color + '55'}`,
              borderRadius: 10,
              boxShadow: s.status === 'active'
                ? `0 0 0 1px ${color}55, 0 4px 16px ${color}33`
                : 'none',
              opacity: dim ? 0.55 : 1,
              flex: compact ? '1 1 110px' : '0 0 auto',
              minWidth: 0,
              transition: 'border-color 0.2s, box-shadow 0.2s, opacity 0.2s',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: color + '22', border: `1px solid ${color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flex: '0 0 28px',
            }}>
              <Icon size={14} color={color} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                fontSize: 11, fontWeight: 600,
                color: 'var(--wv-text, #e6edf3)',
                letterSpacing: '0.03em',
              }}>
                <span style={{ opacity: 0.5, fontSize: 9 }}>{String(idx + 1).padStart(2, '0')}</span>
                <span>{stage.title}</span>
                <StatusBadge status={s.status} />
              </div>
              <div style={{
                fontSize: 10,
                color: dim ? 'var(--wv-text-3, #666)' : color,
                marginTop: 2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {s.note || stage.desc}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
});

export default AttackPipeline;
