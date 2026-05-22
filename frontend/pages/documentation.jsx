/**
 * Documentation page — ImperiumAI diploma.
 *
 * - Sticky left sidebar with anchor navigation.
 * - 20 academic sections covering the framework end-to-end.
 * - Diploma .docx download (graceful fallback if missing).
 * - Cyber-security styling — borrowed tokens from `wv-*` design system.
 */
import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen, Download, FileText, Layers, Cpu, Shield, Plug, Activity, Radio,
  Skull, GitBranch, Beaker, FlaskConical, Wrench, Sparkles, Network, AlertTriangle,
  Target, Brain, Code as CodeIcon, Github, Library,
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { AGENTS } from '../components/meta/agents';
import { DEVICES } from '../components/meta/devices';

const DIPLOMA_DOCX = '/docs/ImperiumAI_Diploma.docx';
const DIPLOMA_PDF  = '/docs/ImperiumAI_Diploma.pdf';
const README_PDF   = '/docs/ImperiumAI_README.pdf';
const REPO_URL     = 'https://github.com/Omarigato/ImperiumAI';

const SECTIONS = [
  { id: 'overview',     title: '01 · Project Overview',         icon: BookOpen },
  { id: 'problem',      title: '02 · Problem Statement',        icon: AlertTriangle },
  { id: 'relevance',    title: '03 · Research Relevance',       icon: Target },
  { id: 'architecture', title: '04 · System Architecture',      icon: Layers },
  { id: 'threat-model', title: '05 · Threat Model',             icon: Skull },
  { id: 'agents',       title: '06 · Red Team Agents',          icon: Brain },
  { id: 'techniques',   title: '07 · Attack Techniques',        icon: GitBranch },
  { id: 'llm',          title: '08 · LLM Integration',          icon: Cpu },
  { id: 'policy',       title: '09 · Policy Engine',            icon: Shield },
  { id: 'iot',          title: '10 · IoT Simulator',            icon: Plug },
  { id: 'risk',         title: '11 · Risk Scoring',             icon: Activity },
  { id: 'ws-flow',      title: '12 · WebSocket Event Flow',     icon: Radio },
  { id: 'battle',       title: '13 · Battle Page Explained',    icon: Network },
  { id: 'defense',      title: '14 · Defense Controls',         icon: Shield },
  { id: 'experiments',  title: '15 · Experimental Scenarios',   icon: FlaskConical },
  { id: 'results',      title: '16 · Results / Metrics',        icon: Beaker },
  { id: 'limits',       title: '17 · Limitations',              icon: Wrench },
  { id: 'future',       title: '18 · Future Work',              icon: Sparkles },
  { id: 'run',          title: '19 · How to Run',               icon: CodeIcon },
  { id: 'downloads',    title: '20 · Diploma Downloads',        icon: Download },
  { id: 'credits',      title: '21 · Visual Assets',            icon: Library },
];

export default function DocumentationPage() {
  const [active, setActive] = useState('overview');
  const [docxAvailable, setDocxAvailable] = useState(null); // null = unknown, true/false after probe

  // Probe the Word document with a HEAD request so we can show a
  // "available / coming soon" notice without breaking the page.
  useEffect(() => {
    let cancelled = false;
    fetch(DIPLOMA_DOCX, { method: 'HEAD' })
      .then((r) => { if (!cancelled) setDocxAvailable(r.ok); })
      .catch(() => { if (!cancelled) setDocxAvailable(false); });
    return () => { cancelled = true; };
  }, []);

  // Spy on scroll to highlight active anchor
  useEffect(() => {
    const onScroll = () => {
      const offsets = SECTIONS.map((s) => {
        const el = document.getElementById(s.id);
        if (!el) return [s.id, Number.POSITIVE_INFINITY];
        const rect = el.getBoundingClientRect();
        return [s.id, Math.abs(rect.top - 140)];
      });
      offsets.sort((a, b) => a[1] - b[1]);
      setActive(offsets[0][0]);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const techniqueCount = useMemo(
    () => AGENTS.reduce((sum, a) => sum + a.techniques.length, 0),
    [],
  );

  return (
    <div className="wv">
      <NavBar />

      <div className="wv-page" style={{ paddingTop: 24 }}>
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="wv-page-header" style={{ marginBottom: 16 }}>
          <div>
            <div className="wv-eyebrow" style={{ marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <BookOpen size={11} /> documentation
            </div>
            <h1 className="wv-h1">ImperiumAI — Diploma Documentation</h1>
            <p className="wv-body" style={{ marginTop: 8, maxWidth: 760, lineHeight: 1.6 }}>
              <b>ImperiumAI</b> is an AI-Based Red Teaming Framework for security testing of
              Large Language Models that control Smart-Home / IoT systems. It combines a
              multi-agent adversarial system, a policy engine, IoT simulation, and risk
              scoring into a single, presentable diploma artefact.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
              <a
                href={DIPLOMA_DOCX}
                download
                className="wv-btn wv-btn-primary wv-btn-sm"
                aria-disabled={docxAvailable === false}
                onClick={(e) => { if (docxAvailable === false) e.preventDefault(); }}
              >
                <Download size={13} /> Download Diploma (.docx)
              </a>
              <a href={REPO_URL} target="_blank" rel="noreferrer" className="wv-btn wv-btn-ghost wv-btn-sm">
                <Github size={13} /> Source on GitHub
              </a>
            </div>
            {docxAvailable === false && (
              <div className="wv-body" style={{
                marginTop: 10,
                padding: '8px 12px',
                background: 'rgba(255, 159, 10, 0.10)',
                border: '1px solid rgba(255, 159, 10, 0.35)',
                borderRadius: 8,
                fontSize: 12,
                color: 'var(--wv-orange, #ff9f0a)',
                maxWidth: 760,
              }}>
                Diploma document will be available after adding{' '}
                <code className="wv-mono">ImperiumAI_Diploma.docx</code> to{' '}
                <code className="wv-mono">frontend/public/docs/</code>.
              </div>
            )}
          </div>
        </div>

        {/* ── KPI strip ──────────────────────────────────────────────────── */}
        <div className="wv-grid" style={{ marginBottom: 16 }}>
          <Kpi label="Sections"      value={SECTIONS.length} />
          <Kpi label="Red Team Agents" value={AGENTS.length} />
          <Kpi label="Attack Techniques" value={techniqueCount} />
          <Kpi label="IoT Devices"   value={DEVICES.length} />
        </div>

        {/* ── 2-column body: sidebar + content ───────────────────────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(220px, 260px) 1fr',
          gap: 16,
          alignItems: 'flex-start',
        }}>
          {/* Sidebar */}
          <nav
            aria-label="Documentation sections"
            style={{
              position: 'sticky',
              top: 88,
              maxHeight: 'calc(100vh - 110px)',
              overflowY: 'auto',
              border: '1px solid var(--wv-border)',
              borderRadius: 12,
              padding: 10,
              background: 'var(--wv-bg)',
            }}
          >
            <div className="wv-eyebrow" style={{ marginBottom: 8, padding: '4px 6px' }}>
              Contents
            </div>
            <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {SECTIONS.map(({ id, title, icon: Icon }) => {
                const isActive = active === id;
                return (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '7px 10px',
                        borderRadius: 8,
                        textDecoration: 'none',
                        color: isActive ? 'var(--wv-cyan, #00d4ff)' : 'var(--wv-text-2, #aab)',
                        background: isActive ? 'rgba(0,212,255,0.10)' : 'transparent',
                        border: `1px solid ${isActive ? 'rgba(0,212,255,0.35)' : 'transparent'}`,
                        fontSize: 12,
                        fontWeight: 500,
                        transition: 'background 0.15s, color 0.15s',
                      }}
                    >
                      <Icon size={12} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {title}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <Section id="overview" title="01 · Project Overview">
              <p>
                ImperiumAI is a research-grade red-teaming framework that <i>attacks</i> an
                LLM-controlled smart home from the inside.  Five autonomous adversarial
                agents take turns trying to break the home, while a policy engine
                evaluates every action and a risk engine quantifies the damage.  The
                whole pipeline streams to a Next.js + Three.js front-end where a
                3D battle arena visualises what is happening in real time.
              </p>
              <Bullets items={[
                'Multi-agent Red Team simulation (5 adversarial roles).',
                '15+ attack tactics covering OWASP LLM Top-10 categories.',
                '19 IoT devices (locks, sensors, network, robotics, multimedia).',
                'Policy engine with stealth-bypass modelling and per-tactic learning.',
                'Risk scoring with calm → critical mood signalling.',
                'Live WebSocket telemetry of every pipeline stage.',
              ]} />
            </Section>

            <Section id="problem" title="02 · Problem Statement">
              <p>
                LLMs are increasingly embedded into IoT control surfaces (Alexa,
                Google Home, custom assistants).  These systems trust natural-language
                input that an attacker controls.  Existing security tooling does
                <b> not</b> stress-test LLMs in this physical-impact context.
              </p>
              <p>
                ImperiumAI addresses the gap by combining classical red-team methodology
                with LLM-specific attack vectors (prompt injection, context poisoning,
                privilege escalation, gradual boundary erosion, network-level injection).
              </p>
            </Section>

            <Section id="relevance" title="03 · Research Relevance">
              <Bullets items={[
                'OWASP Top-10 for LLM Applications (2023) lists prompt injection as #1 risk.',
                'IoT Analytics: 16B+ connected devices globally — the attack surface keeps growing.',
                'ETSI EN 303 645 mandates security baselines for consumer IoT.',
                'Real-world incidents: Ring camera hijacks, smart-lock bypasses, smart-fridge MITM.',
                'ImperiumAI provides a reproducible benchmark for measuring LLM IoT robustness.',
              ]} />
            </Section>

            <Section id="architecture" title="04 · System Architecture">
              <p>The framework has 6 cooperating modules:</p>
              <Diagram lines={[
                '┌────────────────────────────────────────────────────────────────────┐',
                '│  Next.js + React + Three.js  (Battle, Dashboard, Documentation)    │',
                '└────────────────────────▲───────────────────────────────────────────┘',
                '                         │  WebSocket /ws  (live events)',
                '┌────────────────────────┴───────────────────────────────────────────┐',
                '│  FastAPI backend                                                   │',
                '│   ┌──────────┐  ┌─────────┐  ┌───────────┐  ┌────────┐  ┌────────┐ │',
                '│   │  Agents  │→→│  LLM    │→→│  Policy   │→→│  IoT    │→→│  Risk  │ │',
                '│   │  (5)     │  │ Router  │  │  Engine   │  │  Sim    │  │  Engine│ │',
                '│   └──────────┘  └─────────┘  └───────────┘  └────────┘  └────────┘ │',
                '│                              ▲                                     │',
                '│                              │   Attack memory (SQLite)            │',
                '└────────────────────────────────────────────────────────────────────┘',
              ]} />
            </Section>

            <Section id="threat-model" title="05 · Threat Model">
              <p><b>Assets:</b> physical safety (locks, alarms, water valves), privacy (cameras, baby monitor, voice assistant), connectivity (router, DNS).</p>
              <p><b>Adversary:</b> remote attacker controlling user-supplied prompts to the LLM gateway.</p>
              <p><b>Attack surface:</b> any text that ultimately reaches the LLM — chat, voice transcription, sensor labels, network metadata.</p>
              <p><b>Out of scope:</b> hardware exploits, physical access, supply-chain compromise of the IoT firmware.</p>
            </Section>

            <Section id="agents" title="06 · Red Team Agents">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
                {AGENTS.map((a) => (
                  <div key={a.name} style={{
                    border: `1px solid ${a.color}55`,
                    borderRadius: 10,
                    padding: 12,
                    background: 'var(--wv-bg)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 18 }}>{a.icon}</span>
                      <div>
                        <div className="wv-mono" style={{ fontSize: 13, fontWeight: 700, color: a.color }}>{a.name}</div>
                        <div className="wv-body" style={{ fontSize: 10, opacity: 0.7 }}>{a.category}</div>
                      </div>
                    </div>
                    <div className="wv-body" style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.55 }}>
                      <b>Goal: </b>{a.goal}
                    </div>
                    <div className="wv-body" style={{ fontSize: 12, marginBottom: 6, lineHeight: 1.55 }}>
                      <b>Risk: </b>{a.risk}
                    </div>
                    <div style={{
                      padding: 6,
                      borderRadius: 6,
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--wv-border)',
                      fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                      color: 'var(--wv-text-2)',
                      marginBottom: 6,
                    }}>{a.example}</div>
                    <div className="wv-body" style={{ fontSize: 11, opacity: 0.85, lineHeight: 1.55 }}>
                      {a.explanation}
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
                      {a.techniques.map((t) => (
                        <span key={t} className="wv-mono" style={{
                          fontSize: 9, padding: '2px 6px', borderRadius: 4,
                          background: `${a.color}22`, color: a.color,
                        }}>{t}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            <Section id="techniques" title="07 · Attack Techniques">
              <p>Tactics are derived from the OWASP LLM Top-10 + classic network red-team techniques.</p>
              <Table
                head={['Tactic family', 'Examples', 'Detection difficulty']}
                rows={[
                  ['Prompt Injection',         'direct_injection, instruction_override, nested_injection, delimiter_confusion', 'Low–Medium'],
                  ['Context Manipulation',     'role_confusion, context_poisoning, memory_poisoning, semantic_drift',          'Medium–High'],
                  ['Privilege Escalation',     'admin_impersonation, token_forgery, sudo_injection, permission_bypass',        'Medium'],
                  ['Boundary Erosion',         'incremental_trust, boundary_erosion, jailbreak_roleplay',                      'High'],
                  ['Network MITM',             'dns_spoofing, mitm_interception, arp_poisoning, traffic_injection',            'Medium'],
                ]}
              />
            </Section>

            <Section id="llm" title="08 · LLM Integration">
              <p>
                The framework can talk to multiple LLM back-ends through{' '}
                <code className="wv-mono">LLMRouter</code>: OpenAI GPT-4o, Google
                Gemini, DeepSeek and a built-in deterministic simulation provider.
                The simulation provider is the default for the diploma demo because
                it removes API keys / network dependencies from the defence loop.
              </p>
              <Bullets items={[
                'Hot-swap LLM defender via /api/llm/switch.',
                'Multi-LLM mode: each red-team agent can use its own model.',
                'Every LLM decision returns {action, target, authorized, reasoning}.',
                'Reasoning is forwarded to the Policy Engine for downstream checks.',
              ]} />
            </Section>

            <Section id="policy" title="09 · Policy Engine">
              <p>
                <code className="wv-mono">backend/security/policy_engine.py</code> uses
                25+ regex patterns to detect injection markers, plus a list of
                dangerous (action, target) pairs.  Critical combos
                (unlock + smart_lock, change_dns + router, …) escalate severity.
              </p>
              <p>
                A novel feature is the <b>tactic stealth profile</b>: subtle tactics
                like <code className="wv-mono">incremental_trust</code> have a
                non-zero probability of slipping past pattern detection.  Each
                successful block <i>hardens</i> the engine for future rounds.
              </p>
            </Section>

            <Section id="iot" title="10 · IoT Simulator">
              <p>
                {DEVICES.length} simulated devices with safe defaults and a curated
                set of allowed / dangerous actions.  Each device has a 3D position,
                a colour, a risk level (1–5) and a written cybersecurity rationale.
              </p>
              <Table
                head={['Device', 'Risk', 'Dangerous actions', 'Why it matters']}
                rows={DEVICES.map((d) => [
                  `${d.icon} ${d.label}`,
                  String(d.risk),
                  d.dangerous.join(', '),
                  d.cyberWhy,
                ])}
              />
            </Section>

            <Section id="risk" title="11 · Risk Scoring">
              <p>
                Each round mutates a single 0–100 risk score.  Levels:
              </p>
              <Bullets items={[
                '0–30  · safe (calm scene mood)',
                '31–60 · elevated (warning rim lights)',
                '61–80 · critical (danger lights, glitch on breach)',
                '81–100 · breach / chaos (full postprocessing)',
              ]} />
              <p>
                The same score also drives reactive visual effects in the 3D scene
                — so a viewer can immediately tell how badly the home is doing.
              </p>
            </Section>

            <Section id="ws-flow" title="12 · WebSocket Event Flow">
              <p>The backend emits a deterministic sequence per round:</p>
              <Bullets items={[
                'attack_launched  — agent / target / tactic / prompt',
                'llm_response     — action / authorized / reasoning',
                'policy_check     — violations / allowed / severity / bypassed',
                'iot_result       — device state mutation + message',
                'risk_update      — score / delta / level',
                'round_complete   — final outcome for the round',
                'battle_end       — aggregated summary',
              ]} />
            </Section>

            <Section id="battle" title="13 · Battle Page Explained">
              <p>The Battle page is a 3-column live cockpit:</p>
              <Bullets items={[
                'LEFT — agent list with status (idle / charging / attacking / breach / blocked).',
                'CENTER — 3D cyber battle arena + Attack Pipeline strip + Risk Meter.',
                'RIGHT — Side Tabs: Overview / Flow / Prompt / Policy / Devices / Logs / Explain.',
              ]} />
              <p>
                Every WebSocket event is captured into the corresponding tab so a
                viewer can answer the diploma's seven core questions at a glance:
              </p>
              <Bullets items={[
                'Who is attacking?  → Left panel + active-attack overlay.',
                'Which technique?   → Overview / Prompt tabs.',
                'What was sent to the LLM? → Prompt tab.',
                'What did the LLM say? → Prompt tab.',
                'How did the policy engine decide? → Policy tab.',
                'Which device was attacked? → Devices tab.',
                'Was it blocked? Risk delta? → Overview tab + risk meter.',
                'What is happening under the hood? → Flow tab + Explanation tab.',
              ]} />
            </Section>

            <Section id="defense" title="14 · Defense Controls">
              <p>Two interactive defenses are available during a battle:</p>
              <Bullets items={[
                'Shield — raises a 3-round shield that intercepts every attack regardless of policy result.',
                'Counter — emergency risk reduction (-20 points) representing remediation playbooks.',
              ]} />
              <p>Both have visible UI cooldowns to keep gameplay fair.</p>
            </Section>

            <Section id="experiments" title="15 · Experimental Scenarios">
              <p>The dashboard / batch-battles endpoint runs N independent battles to study aggregate behaviour:</p>
              <Bullets items={[
                'Single-LLM run vs. multi-LLM run — does a model mix help?',
                'Shield enabled vs. disabled — defensive ROI.',
                'With learning memory vs. without — does the engine actually harden?',
                'Per-tactic success rate over 10–50 battles.',
              ]} />
            </Section>

            <Section id="results" title="16 · Results / Metrics">
              <p>The Dashboard renders these metrics live:</p>
              <Bullets items={[
                'Total battles, red-team win rate, defense win rate.',
                'Average final risk score, average rounds per battle.',
                'Per-agent and per-tactic success rate.',
                'Distribution of compromised devices.',
              ]} />
            </Section>

            <Section id="limits" title="17 · Limitations">
              <Bullets items={[
                'Simulated IoT — no real device firmware is attacked.',
                'Pattern-based detection — modern LLM red-teaming uses ML classifiers; out of scope here.',
                'Single-tenant — multi-user contexts (family members) are not modelled.',
                'No hardware-side privilege model — every IoT command is treated equally above the LLM.',
              ]} />
            </Section>

            <Section id="future" title="18 · Future Work">
              <Bullets items={[
                'Integrate a Matter / Zigbee2MQTT bridge for real-device testing.',
                'Replace regex policies with a fine-tuned guardrail model.',
                'Multi-tenant household model (parent, child, guest).',
                'Cross-LLM benchmark report (GPT-4o vs. Gemini vs. Llama).',
                'Adaptive red-team RL: agents learn from each blocked attempt.',
              ]} />
            </Section>

            <Section id="run" title="19 · How to Run">
              <p><b>Backend</b></p>
              <Code text={`cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000`} />
              <p><b>Frontend</b></p>
              <Code text={`cd frontend
npm install
npm run dev
# open http://localhost:3000/battle`} />
            </Section>

            <Section id="downloads" title="20 · Diploma Downloads">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                <DownloadCard
                  href={DIPLOMA_DOCX}
                  available={docxAvailable}
                  title="Diploma Document"
                  subtitle="Word .docx"
                  hint={docxAvailable === false
                    ? 'Drop ImperiumAI_Diploma.docx into frontend/public/docs/.'
                    : 'Download the latest version of the diploma.'}
                />
                <DownloadCard
                  href={DIPLOMA_PDF}
                  available={null}
                  title="Diploma Document"
                  subtitle="PDF (optional)"
                  hint="If a PDF export exists in /public/docs it will download here."
                />
                <DownloadCard
                  href={README_PDF}
                  available={null}
                  title="Project README"
                  subtitle="PDF (optional)"
                  hint="If a PDF README exists in /public/docs it will download here."
                />
                <DownloadCard
                  href={REPO_URL}
                  external
                  available={true}
                  title="Source Code"
                  subtitle="GitHub repository"
                  hint="Browse the full source on GitHub."
                />
              </div>
            </Section>

            <Section id="credits" title="21 · Visual Assets">
              <p>
                ImperiumAI ships <b>without any third-party GLB models</b>. Both 3D scenes —
                the landing-page hero (<code className="wv-mono">components/HomeHero3D.jsx</code>)
                and the Battle scene (<code className="wv-mono">components/SmartHome3D.jsx</code>) —
                are fully procedural, generated at runtime from primitive Three.js
                geometries. No proprietary or NoAI-restricted assets are credited.
              </p>
              <Table
                head={['Component', 'Type', 'Source', 'License']}
                rows={[
                  ['HomeHero3D',     'Procedural Three.js scene (landing page)',
                                     'Original — written for ImperiumAI', 'Project license'],
                  ['SmartHome3D',    'Procedural Three.js scene (Battle page)',
                                     'Original — written for ImperiumAI', 'Project license'],
                  ['SceneTooltip',   'DOM overlay tooltip for the 3D scene',
                                     'Original — written for ImperiumAI', 'Project license'],
                  ['Icon set',       'lucide-react',
                                     'https://lucide.dev/', 'ISC'],
                  ['Charts',         'recharts',
                                     'https://recharts.org/', 'MIT'],
                  ['Three.js stack', '@react-three/fiber, drei, postprocessing',
                                     'https://github.com/pmndrs', 'MIT'],
                ]}
              />
            </Section>

            <Section id="refs" title="References" icon={Library}>
              <ol style={{ paddingLeft: 24, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <Ref n="1" body="OWASP. (2023). OWASP Top 10 for Large Language Model Applications." />
                <Ref n="2" body="Perez, E., & Ribeiro, M. T. (2022). Ignore Previous Prompt. arXiv:2211.09527." />
                <Ref n="3" body="Greshake, K., et al. (2023). Not What You've Signed Up For. arXiv:2302.12173." />
                <Ref n="4" body="ETSI. (2020). ETSI EN 303 645 – Cyber Security for Consumer IoT." />
                <Ref n="5" body="NIST. (2018). Cybersecurity Framework, v1.1." />
                <Ref n="6" body="Liu, Y., et al. (2023). Prompt Injection Attacks and Defenses in LLM-Integrated Applications. arXiv:2310.12815." />
                <Ref n="7" body="Zou, A., et al. (2023). Universal and Transferable Adversarial Attacks on Aligned LLMs. arXiv:2307.15043." />
                <Ref n="8" body="Deng, G., et al. (2023). Jailbreaker. arXiv:2307.08715." />
                <Ref n="9" body="Bhatt, U., et al. (2023). Purple Llama CyberSecEval. arXiv:2312.04724." />
                <Ref n="10" body="IoT Analytics. (2023). State of IoT 2023." />
              </ol>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Section helpers ─────────────────────────────────────────────────────────
function Section({ id, title, children, icon: Icon = FileText }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.25 }}
      style={{
        scrollMarginTop: 100,
        padding: 18,
        borderRadius: 12,
        border: '1px solid var(--wv-border)',
        background: 'var(--wv-bg)',
      }}
    >
      <h2 className="wv-h3" style={{
        display: 'flex', alignItems: 'center', gap: 8,
        margin: 0, marginBottom: 12,
      }}>
        <Icon size={14} /> {title}
      </h2>
      <div className="wv-body" style={{ fontSize: 13, lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </motion.section>
  );
}

function Bullets({ items }) {
  return (
    <ul style={{ paddingLeft: 18, margin: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

function Diagram({ lines }) {
  return (
    <pre style={{
      padding: 12,
      background: 'rgba(0,0,0,0.35)',
      border: '1px solid var(--wv-border)',
      borderRadius: 8,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 11,
      lineHeight: 1.5,
      overflowX: 'auto',
      color: 'var(--wv-text)',
    }}>
      {lines.join('\n')}
    </pre>
  );
}

function Code({ text }) {
  return (
    <pre style={{
      padding: 12,
      background: 'rgba(0, 0, 0, 0.35)',
      border: '1px solid var(--wv-border)',
      borderRadius: 8,
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 12,
      lineHeight: 1.6,
      overflowX: 'auto',
      color: 'var(--wv-text)',
    }}>
      {text}
    </pre>
  );
}

function Table({ head, rows }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%', borderCollapse: 'collapse', fontSize: 12,
        border: '1px solid var(--wv-border)',
      }}>
        <thead>
          <tr>
            {head.map((h, i) => (
              <th key={i} style={{
                textAlign: 'left',
                padding: '8px 10px',
                background: 'var(--wv-surface, #0e1320)',
                borderBottom: '1px solid var(--wv-border)',
                color: 'var(--wv-text-2)',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((c, ci) => (
                <td key={ci} style={{
                  padding: '7px 10px',
                  borderBottom: '1px solid var(--wv-border)',
                  verticalAlign: 'top',
                  lineHeight: 1.5,
                }}>{c}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Kpi({ label, value }) {
  return (
    <div className="wv-col-3">
      <div className="wv-card">
        <div className="wv-eyebrow">{label}</div>
        <div className="wv-kpi-value" style={{ marginTop: 10 }}>{value}</div>
      </div>
    </div>
  );
}

function Ref({ n, body }) {
  return (
    <li className="wv-body" style={{ fontSize: 12, lineHeight: 1.6 }}>
      <b style={{ marginRight: 4 }}>[{n}]</b>{body}
    </li>
  );
}

function DownloadCard({ href, available, title, subtitle, hint, external = false }) {
  const disabled = available === false;
  return (
    <a
      href={href}
      download={!external}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      onClick={(e) => { if (disabled) e.preventDefault(); }}
      style={{
        display: 'flex', flexDirection: 'column', gap: 6,
        padding: 14,
        borderRadius: 10,
        border: `1px solid ${disabled ? 'var(--wv-border)' : 'rgba(0, 212, 255, 0.35)'}`,
        background: disabled ? 'transparent' : 'rgba(0, 212, 255, 0.06)',
        textDecoration: 'none',
        color: 'inherit',
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Download size={14} style={{ color: 'var(--wv-cyan, #00d4ff)' }} />
        <div className="wv-mono" style={{ fontSize: 12, fontWeight: 700 }}>{title}</div>
      </div>
      <div className="wv-eyebrow" style={{ fontSize: 9 }}>{subtitle}</div>
      <div className="wv-body" style={{ fontSize: 11, lineHeight: 1.5 }}>{hint}</div>
    </a>
  );
}
