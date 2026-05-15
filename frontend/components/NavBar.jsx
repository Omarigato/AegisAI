/**
 * NavBar.jsx — v2
 * - Полная i18n через useTranslation
 * - Переключатель тем (dark / light / bw)
 * - Подключение LLM статуса
 */
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Zap, Activity, BarChart3, FileText, Users, Skull, Shield, Sun, Moon, Contrast } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';

const LANG_LABELS = { en: 'EN', ru: 'RU', kz: 'KZ' };

const THEME_ICONS = {
  dark:  { icon: Moon,     next: 'light' },
  light: { icon: Sun,      next: 'bw' },
  bw:    { icon: Contrast, next: 'dark' },
};

export default function NavBar({ live = false, currentRound = 0 }) {
  const { t, lang, setLang } = useTranslation();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  const ThemeIcon = THEME_ICONS[theme]?.icon || Moon;
  const nextTheme = THEME_ICONS[theme]?.next || 'dark';

  const links = [
    { href: '/',              label: t('nav.home'),          icon: Zap },
    { href: '/battle',        label: t('nav.simulation'),    icon: Activity },
    { href: '/dashboard',     label: t('nav.results'),       icon: BarChart3 },
    { href: '/agents',        label: t('nav.agents'),        icon: Skull },
    { href: '/attacks',       label: t('nav.attacks'),       icon: Shield },
    { href: '/documentation', label: t('nav.documentation'), icon: FileText },
    { href: '/team',          label: t('nav.team'),          icon: Users },
  ];

  return (
    <nav className="wv-nav">
      <div className="wv-nav-inner">
        {/* Logo */}
        <Link href="/" className="wv-nav-logo">
          <Zap size={18} strokeWidth={2.5} />
          <span>AegisAI</span>
        </Link>

        {/* Links */}
        <ul className="wv-nav-links">
          {links.map(({ href, label, icon: Icon }) => {
            const isActive = router.pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`wv-nav-link${isActive ? ' active' : ''}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Icon size={13} strokeWidth={2} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Live badge */}
          {live && (
            <span className="wv-badge wv-badge-green" style={{ fontSize: 10 }}>
              <span className="wv-live-dot" />
              Live · R{currentRound}
            </span>
          )}

          {/* Lang switcher */}
          <div style={{
            display: 'flex',
            gap: 2,
            background: 'var(--wv-surface)',
            border: '1px solid var(--wv-border)',
            borderRadius: 6,
            padding: 2,
          }}>
            {['en', 'ru', 'kz'].map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  padding: '4px 8px',
                  border: 'none',
                  borderRadius: 4,
                  background: lang === l ? 'var(--wv-cyan)' : 'transparent',
                  color: lang === l ? '#000' : 'var(--wv-text-2)',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                  fontFamily: 'JetBrains Mono, monospace',
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {LANG_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(nextTheme)}
            title={`Switch theme (current: ${theme})`}
            style={{
              width: 32, height: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--wv-surface)',
              border: '1px solid var(--wv-border)',
              borderRadius: 8,
              cursor: 'pointer',
              color: 'var(--wv-text-2)',
              transition: 'background 0.15s, border-color 0.15s',
            }}
          >
            <ThemeIcon size={14} />
          </button>
        </div>
      </div>
    </nav>
  );
}
