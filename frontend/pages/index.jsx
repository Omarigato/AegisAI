import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import {
  Activity, AlertTriangle, BarChart3, Bot, FileText,
  Network, Play, Shield, Skull, Zap,
} from 'lucide-react';
import NavBar from '../components/NavBar';
import { useLang } from '../contexts/LanguageContext';

const HomeHero3D = dynamic(
  () =>
    import('../components/HomeHero3D').catch((err) => {
      if (typeof window !== 'undefined' && /ChunkLoadError|Loading chunk/i.test(String(err))) {
        if (!sessionStorage.getItem('imperium-3d-reloaded')) {
          sessionStorage.setItem('imperium-3d-reloaded', '1');
          window.location.reload();
          return { default: () => null };
        }
      }
      return {
        default: () => (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'rgba(0,212,255,0.5)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          }}>
            3D scene failed to load — check console
          </div>
        ),
      };
    }),
  {
    ssr: false,
    loading: () => (
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(0,212,255,0.35)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
      }}>
        Loading 3D scene…
      </div>
    ),
  },
);

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ── Animated counter ─────────────────────────────────────────────────────────
function KpiCounter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf;
    const start = performance.now();
    const dur = 1400;
    const step = (now) => {
      const progress = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{display}{suffix}</span>;
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function IndexPage() {
  const { t } = useLang();
  const h = t.home;

  const [llmStatus, setLlmStatus] = useState(null);
  useEffect(() => {
    fetch(`${API}/api/llm/status`).then((r) => r.json()).then(setLlmStatus).catch(() => {});
  }, []);

  const availableLLMs = llmStatus?.providers
    ? Object.entries(llmStatus.providers).filter(([, v]) => v.available).length
    : 0;

  const STATS = [
    { icon: Bot,     label: h.kpiAgents,  value: 5 },
    { icon: Skull,   label: h.kpiTactics, value: 22 },
    { icon: Network, label: h.kpiDevices, value: 19 },
    { icon: Zap,     label: h.kpiLLMs,    value: availableLLMs || 4 },
  ];

  return (
    <div className="modern-bg" style={{ minHeight: '100vh', color: '#e6edf3' }}>
      <NavBar />

      {/* ── HERO: full viewport with 3D background ────────────────────── */}
      <section style={{
        position: 'relative',
        height: 'calc(100vh - 56px)',
        minHeight: 520,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* 3D background layer */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <HomeHero3D autoRotate />
        </div>

        {/* Radial gradient overlay — keeps center slightly visible */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 1,
          background:
            'radial-gradient(ellipse 90% 80% at center, transparent 0%, rgba(3,5,12,0.42) 45%, rgba(3,5,12,0.86) 100%)',
          pointerEvents: 'none',
        }} />

        {/* Bottom fade into next section */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 1,
          height: 140,
          background: 'linear-gradient(to bottom, transparent, #030608)',
          pointerEvents: 'none',
        }} />

        {/* Hero content */}
        <div style={{
          position: 'relative', zIndex: 2,
          textAlign: 'center',
          padding: '0 24px',
          maxWidth: 980,
          width: '100%',
        }}>
          {/* Live badge */}
          <div style={{ marginBottom: 22 }}>
            <span className="hero-v2-badge">
              <span className="dot" />
              {h.badge}
            </span>
          </div>

          {/* Main title */}
          <h1 className="hero-v2-title" style={{ marginBottom: 18 }}>
            {h.titleLine1}
          </h1>

          {/* Subtitle */}
          <p className="hero-v2-subtitle" style={{ marginBottom: 36 }}>
            {h.titleLine2}
          </p>

          {/* CTA buttons */}
          <div className="btn-modern-cta-row">
            <Link href="/battle" className="btn-modern-primary">
              <Play size={16} strokeWidth={2.5} />
              {h.startBtn}
            </Link>
            <Link href="/dashboard" className="btn-modern-ghost">
              <BarChart3 size={16} />
              {h.dashboardBtn}
            </Link>
          </div>

          {/* Stats row */}
          <div className="stats-row">
            {STATS.map(({ icon: Icon, label, value }) => (
              <div key={label} className="stat-card">
                <div className="stat-value">
                  <KpiCounter value={value} />
                </div>
                <div className="stat-label" style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 5, marginTop: 6,
                }}>
                  <Icon size={10} style={{ opacity: 0.55 }} />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BELOW FOLD ────────────────────────────────────────────────────── */}
      <div style={{ background: '#030608', position: 'relative' }}>

        {/* ── Section: Arena overview + System status ────────────────── */}
        <section style={{ padding: '72px 32px 60px', maxWidth: 1200, margin: '0 auto' }}>

          {/* Section header */}
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <div className="section-eyebrow" style={{ marginBottom: 10 }}>
              {h.arenaTitle}
            </div>
            <h2 className="section-title-v2">
              {h.arenaSub
                .replace('{agents}', 5)
                .replace('{tactics}', 22)
                .replace('{llms}', availableLLMs || '–')}
            </h2>
          </div>

          <div className="feature-grid">
            {/* Left: System status */}
            <div className="feature-card">
              <div className="feature-card-heading">
                <Activity size={12} />
                {h.sysStatus}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                <Row
                  label={h.backendLabel}
                  status={llmStatus ? 'online' : 'offline'}
                  onlineLabel={h.online}
                  offlineLabel={h.offline}
                />
                <Row
                  label={h.activeLLM}
                  value={(llmStatus?.active || '—').toUpperCase()}
                />
                <Row
                  label={h.multiLLMMode}
                  value={llmStatus?.multi_llm ? h.enabled : h.off}
                  status={llmStatus?.multi_llm ? 'online' : null}
                  onlineLabel={h.enabled}
                />
              </div>

              {/* Divider */}
              <div style={{
                height: 1,
                background: 'rgba(0,212,255,0.12)',
                marginBottom: 20,
              }} />

              <Link href="/battle" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '11px 20px',
                background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
                color: '#050811',
                fontWeight: 700,
                fontSize: 14,
                borderRadius: 10,
                textDecoration: 'none',
                letterSpacing: '0.01em',
                transition: 'opacity 0.2s, transform 0.2s',
              }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
              >
                <Play size={14} strokeWidth={2.5} />
                {h.startBattleBtn}
              </Link>
            </div>

            {/* Right: Research info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="feature-card" style={{ borderLeft: '3px solid #00d4ff' }}>
                <div className="feature-card-heading" style={{ color: '#00d4ff' }}>
                  <Shield size={12} />
                  {h.researchGoal}
                </div>
                <p className="feature-card-text">{h.goalText}</p>
              </div>
              <div className="feature-card" style={{ borderLeft: '3px solid #ff9f0a' }}>
                <div className="feature-card-heading" style={{ color: '#ff9f0a' }}>
                  <AlertTriangle size={12} />
                  {h.researchMethod}
                </div>
                <p className="feature-card-text">{h.descText}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div style={{
          height: 1,
          margin: '0 32px',
          background: 'linear-gradient(to right, transparent, rgba(0,212,255,0.12), transparent)',
        }} />

        {/* ── Section: Thesis structure ──────────────────────────────── */}
        <section style={{ padding: '64px 32px', maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div className="section-eyebrow" style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', gap: 7, marginBottom: 0,
            }}>
              <FileText size={11} />
              {h.structure}
            </div>
          </div>

          <div className="thesis-structure-v2">
            {h.structureItems.map((item) => (
              <div key={item.num} className="thesis-item">
                <div className="thesis-num">{item.num}</div>
                <div>
                  <div className="thesis-title">{item.title}</div>
                  <div className="thesis-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div style={{
          height: 1,
          margin: '0 32px',
          background: 'linear-gradient(to right, transparent, rgba(168,85,247,0.12), transparent)',
        }} />

        {/* ── Section: Final CTA ──────────────────────────────────────── */}
        <section style={{
          padding: '72px 32px 96px',
          textAlign: 'center',
        }}>
          <div style={{ maxWidth: 640, margin: '0 auto' }}>
            {/* Glow orb behind text */}
            <div style={{
              position: 'relative',
              display: 'inline-block',
              marginBottom: 6,
            }}>
              <div style={{
                position: 'absolute',
                top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 300, height: 300,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div className="section-eyebrow" style={{ position: 'relative', marginBottom: 14 }}>
                {h.readyEyebrow}
              </div>
            </div>

            <h2 style={{
              fontFamily: 'Space Grotesk, Inter, sans-serif',
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              color: '#f0f6fc',
              marginBottom: 32,
            }}>
              {h.ctaTitle}
            </h2>

            <Link href="/battle" className="btn-modern-primary" style={{ fontSize: '1rem' }}>
              <Play size={17} strokeWidth={2.5} />
              {h.startBtn}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

// ── Row helper ───────────────────────────────────────────────────────────────
function Row({ label, value, status, onlineLabel = 'ONLINE', offlineLabel = 'OFFLINE' }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', fontSize: 13,
    }}>
      <span style={{ color: 'rgba(230,237,243,0.55)', fontFamily: 'Inter, sans-serif' }}>
        {label}
      </span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        {status === 'online' && (
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#10ffac', boxShadow: '0 0 8px #10ffac',
            animation: 'wv-pulse 1.6s ease-in-out infinite',
            display: 'inline-block',
          }} />
        )}
        {status === 'offline' && (
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ff3b6b', display: 'inline-block' }} />
        )}
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 12,
          fontWeight: 600,
          color:
            status === 'online'  ? '#10ffac' :
            status === 'offline' ? '#ff3b6b' :
            'rgba(230,237,243,0.85)',
        }}>
          {value || (status === 'online' ? onlineLabel : status === 'offline' ? offlineLabel : '—')}
        </span>
      </span>
    </div>
  );
}
