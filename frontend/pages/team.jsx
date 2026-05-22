import Link from 'next/link';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, MapPin, GraduationCap, User, Code, Play } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useLang } from '../contexts/LanguageContext';

// Non-translatable team metadata — names (transliterated identifiers),
// IDs, photo file ids, brand colour, skill tags, and contact info.
// The translatable parts (role, bio) come from `t.team.members.<id>`.
const TEAM_META = [
  {
    id: '1',
    name:   'Аким Омар',
    nameEn: 'Akim Omar',
    studentId: '34732',
    skills: ['Python', 'FastAPI', 'React', 'Next.js', 'Three.js', 'AI/ML', 'Cybersecurity', 'WebSocket'],
    contacts: {
      email: '34732@iitu.edu.kz',
      telegram: '@Omarigato',
      university: 'IITU, Almaty, Kazakhstan',
    },
    color: '#00E5FF',
  },
  {
    id: '2',
    name:   'Тажибаев Арнур',
    nameEn: 'Tazhibayev Arnur',
    studentId: 'IITU Student',
    skills: ['Cybersecurity', 'Prompt Engineering', 'Threat Modeling', 'LLM Safety', 'IoT Security'],
    contacts: {
      email: '35634@iitu.edu.kz',
      telegram: '@Arrnurrchiik',
      university: 'IITU, Almaty, Kazakhstan',
    },
    color: '#FF9F0A',
  },
  {
    id: '3',
    name:   'Кайсенов Жанторе',
    nameEn: 'Kaisenov Zhantore',
    studentId: 'IITU Student',
    skills: ['Three.js', 'React', 'UI/UX', 'IoT Systems', 'Frontend Architecture'],
    contacts: {
      email: '34952@iitu.edu.kz',
      telegram: '@Zhantoreeee',
      university: 'IITU, Almaty, Kazakhstan',
    },
    color: '#BF5AF2',
  },
];

// Non-translatable technology stack (technical strings).
const PROJECT_TECHS = [
  { name: 'Frontend',  tech: 'Next.js 14 + React 18 + Three.js + Framer Motion' },
  { name: 'Backend',   tech: 'FastAPI + Python + WebSocket' },
  { name: 'AI/LLM',    tech: 'Groq (Llama 3.3) · Gemini · OpenRouter · GPT-4o' },
  { name: '3D Scene',  tech: '@react-three/fiber + @react-three/drei + postprocessing' },
  { name: 'Analytics', tech: 'Recharts + Real-time WebSocket data' },
  { name: 'Security',  tech: 'Policy Engine + Risk Scoring + Stealth model' },
];

function MemberCard({ member, translated, index, skillsLabel }) {
  const [photoError, setPhotoError] = useState(false);
  return (
    <motion.div
      className="wv-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      style={{ borderColor: `${member.color}33` }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Top: Avatar + name */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', flex: '0 0 88px',
            border: `2px solid ${member.color}66`,
            background: `${member.color}1F`,
            overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 24px ${member.color}33`,
          }}>
            {!photoError ? (
              <img
                src={`/team/${member.id}.jpg`}
                alt={member.nameEn}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={() => setPhotoError(true)}
              />
            ) : (
              <User size={36} color={member.color} strokeWidth={1.5} />
            )}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="wv-h2" style={{ color: member.color, fontSize: 22 }}>
              {member.nameEn}
            </div>
            <div className="wv-mono" style={{ fontSize: 12, color: 'var(--wv-text-2)', marginTop: 2 }}>
              {member.name}
            </div>
            <div style={{
              marginTop: 8, display: 'inline-block', padding: '4px 10px',
              background: `${member.color}1F`, border: `1px solid ${member.color}55`,
              borderRadius: 6, color: member.color, fontSize: 12, fontWeight: 600,
            }}>
              {translated.role}
            </div>
            <div className="wv-body" style={{ fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GraduationCap size={12} color="var(--wv-text-2)" />
              {member.contacts.university} · ID {member.studentId}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="wv-body" style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-line' }}>
          {translated.bio}
        </p>

        {/* Skills */}
        <div>
          <div className="wv-eyebrow" style={{ marginBottom: 8, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Code size={11} /> {skillsLabel}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {member.skills.map((s) => (
              <span
                key={s}
                className="wv-badge"
                style={{ borderColor: `${member.color}55`, color: member.color, background: `${member.color}1F` }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <a
            href={`mailto:${member.contacts.email}`}
            className="wv-btn wv-btn-ghost wv-btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <Mail size={13} />
            {member.contacts.email}
          </a>
          <span className="wv-btn wv-btn-ghost wv-btn-sm" style={{ cursor: 'default' }}>
            <Send size={13} />
            {member.contacts.telegram}
          </span>
          <span className="wv-btn wv-btn-ghost wv-btn-sm" style={{ cursor: 'default' }}>
            <MapPin size={13} />
            {member.contacts.university}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamPage() {
  const { t } = useLang();
  const tm = t.team;

  return (
    <div className="wv">
      <NavBar />

      <div className="wv-page">
        {/* Header */}
        <div className="wv-page-header">
          <div>
            <div className="wv-eyebrow" style={{ marginBottom: 6, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <User size={11} /> {tm.eyebrow}
            </div>
            <h1 className="wv-h1">{tm.title}</h1>
            <p className="wv-body" style={{ marginTop: 8, maxWidth: 760 }}>
              {tm.info.year} · {tm.info.type} · {tm.info.university}
            </p>
          </div>
          <Link href="/battle" className="wv-btn wv-btn-primary">
            <Play size={14} strokeWidth={2.5} />
            {tm.tryBtn}
          </Link>
        </div>

        {/* Project info card */}
        <div className="wv-card" style={{ marginBottom: 16 }}>
          <div className="wv-eyebrow" style={{ marginBottom: 8 }}>{tm.about}</div>
          <h2 className="wv-h2" style={{ marginBottom: 8 }}>{tm.info.title}</h2>
          <p className="wv-body" style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 16 }}>
            {tm.info.description}
          </p>

          <div className="wv-eyebrow" style={{ marginBottom: 12 }}>{tm.techStack}</div>
          <div className="wv-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 8 }}>
            {PROJECT_TECHS.map((row) => (
              <div key={row.name} style={{
                padding: 12,
                background: 'var(--wv-bg)',
                border: '1px solid var(--wv-border)',
                borderRadius: 10,
              }}>
                <div className="wv-mono" style={{ fontSize: 10, color: 'var(--wv-cyan)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  {row.name}
                </div>
                <div className="wv-body" style={{ fontSize: 13, color: 'var(--wv-text)' }}>{row.tech}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Team grid */}
        <div className="wv-grid">
          {TEAM_META.map((m, i) => (
            <div key={m.id} className="wv-col-4">
              <MemberCard
                member={m}
                translated={tm.members[m.id]}
                index={i}
                skillsLabel={tm.skills}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
