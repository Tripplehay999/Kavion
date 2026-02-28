import Link from 'next/link'
import {
  LayoutDashboard, FolderKanban, TrendingUp, Lightbulb,
  Target, Code2, Building2, Server, Youtube,
  Zap, ArrowRight, CheckCircle2, BarChart3,
  Layers, GitBranch, Cpu, Flame, Star,
} from 'lucide-react'

const TICKER_ITEMS = [
  '⚡ Live Supabase Data',
  '📁 Projects CRUD',
  '💰 MRR Tracking',
  '🎯 Habit Streaks',
  '🖥  Server Monitor',
  '▶  YouTube Pipeline',
  '💡 Ideas Vault',
  '💻 Code Snippets',
  '🏢 Acquisition Radar',
  '🔐 Auth Built-in',
  '📊 Real-time Charts',
  '🗄  Self-hosted Data',
]

const FEATURES = [
  {
    icon: LayoutDashboard,
    name: 'Command Center',
    desc: 'One unified view: stats, active projects, today\'s habits, live activity. Everything at a glance, nothing missed.',
    color: '#7C3AED',
    bg: 'rgba(124,58,237,0.08)',
    stat: '4 live metrics',
  },
  {
    icon: FolderKanban,
    name: 'Project Tracker',
    desc: 'Status, progress, priority, and stack tags across every build. Add, edit, and track every project end-to-end.',
    color: '#3B82F6',
    bg: 'rgba(59,130,246,0.08)',
    stat: 'Full CRUD',
  },
  {
    icon: TrendingUp,
    name: 'Revenue Dashboard',
    desc: 'MRR, ARR, growth rate, every income stream charted. Connect Stripe or log manually — your numbers, live.',
    color: '#10B981',
    bg: 'rgba(16,185,129,0.08)',
    stat: 'Recharts powered',
  },
  {
    icon: Lightbulb,
    name: 'Ideas Vault',
    desc: 'Capture, score 1–10, and track startup ideas before they escape. Tag, filter, and graduate ideas to projects.',
    color: '#F59E0B',
    bg: 'rgba(245,158,11,0.08)',
    stat: 'Scored system',
  },
  {
    icon: Target,
    name: 'Habit Tracking',
    desc: 'Daily checkboxes, streak tracking, 28-day heatmaps. Toggle habits live. Consistency compounds — track it.',
    color: '#EC4899',
    bg: 'rgba(236,72,153,0.08)',
    stat: '28-day heatmap',
  },
  {
    icon: Code2,
    name: 'Snippet Vault',
    desc: 'Your private code library — searchable by language, tagged, and copy-ready. Never Google the same thing twice.',
    color: '#06B6D4',
    bg: 'rgba(6,182,212,0.08)',
    stat: 'Multi-language',
  },
  {
    icon: Building2,
    name: 'Acquisition Radar',
    desc: 'Watch micro-SaaS deals with full financials. Price, revenue, profit, multiple — plus live TrustMRR listings.',
    color: '#F97316',
    bg: 'rgba(249,115,22,0.08)',
    stat: 'TrustMRR feed',
  },
  {
    icon: Server,
    name: 'Server Monitor',
    desc: 'Uptime, CPU, memory, and response time for every server. Status dots, alert banners, real infrastructure view.',
    color: '#22C55E',
    bg: 'rgba(34,197,94,0.08)',
    stat: 'Live status',
  },
  {
    icon: Youtube,
    name: 'YouTube Automation',
    desc: 'Full content pipeline: idea → scripting → recording → editing → published. Plus channel analytics via YT API.',
    color: '#EF4444',
    bg: 'rgba(239,68,68,0.08)',
    stat: 'YouTube API',
  },
]

const SCATTERED_TOOLS = [
  { name: 'Notion',          sub: 'Projects & Notes',  color: '#F0F4FF', bg: 'rgba(255,255,255,0.04)', rotate: '-2deg'   },
  { name: 'Baremetrics',     sub: 'Revenue',           color: '#10B981', bg: 'rgba(16,185,129,0.06)',  rotate: '1.5deg'  },
  { name: 'Linear',          sub: 'Project Tracking',  color: '#818CF8', bg: 'rgba(99,102,241,0.06)',  rotate: '-1deg'   },
  { name: 'Stripe Dashboard',sub: 'MRR',               color: '#818CF8', bg: 'rgba(99,102,241,0.06)',  rotate: '2deg'    },
  { name: 'Uptime Robot',    sub: 'Server Uptime',     color: '#3B82F6', bg: 'rgba(59,130,246,0.06)',  rotate: '-3deg'   },
  { name: 'GitHub Gist',     sub: 'Code Snippets',     color: '#94A3B8', bg: 'rgba(148,163,184,0.06)', rotate: '0.5deg'  },
  { name: 'Acquire.com',     sub: 'M&A Deals',         color: '#F97316', bg: 'rgba(249,115,22,0.06)',  rotate: '-1.5deg' },
  { name: 'ProductHunt',     sub: 'Ideas Discovery',   color: '#F97316', bg: 'rgba(249,115,22,0.06)',  rotate: '2.5deg'  },
  { name: 'YouTube Studio',  sub: 'Content Pipeline',  color: '#EF4444', bg: 'rgba(239,68,68,0.06)',   rotate: '-2.5deg' },
  { name: 'Airtable',        sub: 'Data Tracking',     color: '#FBBF24', bg: 'rgba(251,191,36,0.06)',  rotate: '1deg'    },
  { name: 'Habits App',      sub: 'Daily Routines',    color: '#EC4899', bg: 'rgba(236,72,153,0.06)',  rotate: '-1deg'   },
  { name: 'Spreadsheets',    sub: 'Everything else',   color: '#64748B', bg: 'rgba(100,116,139,0.06)', rotate: '3deg'    },
]

export default function HomePage() {
  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS]

  return (
    <div className="landing-page">

      {/* ══ NAV ══════════════════════════════════════════ */}
      <nav className="landing-nav">
        <div className="landing-container" style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="nav-logo-icon">
              <Zap size={15} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              KAVION
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['Features', '#features'], ['How it Works', '#how'], ['Why', '#why'], ['Stack', '#stack']].map(([l, h]) => (
              <a key={h} href={h} style={{ fontSize: 13.5, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: 13 }}>Sign In</Link>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: 13, boxShadow: '0 0 18px rgba(124,58,237,0.3)' }}>
              Get Started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ TICKER BAR ═══════════════════════════════════ */}
      <div className="ticker-bar">
        <div className="ticker-fade-left" />
        <div className="ticker-fade-right" />
        <div className="ticker-track">
          {tickerDouble.map((item, i) => (
            <span key={i} className="ticker-item">
              {item}
              <span className="ticker-dot" />
            </span>
          ))}
        </div>
      </div>

      {/* ══ HERO ═════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="hero-grid-bg" />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
          <div style={{ position: 'absolute', top: '-15%', left: '5%', width: 700, height: 700, background: 'radial-gradient(ellipse, rgba(124,58,237,0.11) 0%, transparent 65%)', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '20%', right: '-10%', width: 500, height: 500, background: 'radial-gradient(ellipse, rgba(6,182,212,0.055) 0%, transparent 65%)', borderRadius: '50%' }} />
        </div>

        <div className="landing-container" style={{
          padding: '96px 32px 108px',
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: 80, alignItems: 'center', position: 'relative', zIndex: 1,
        }}>

          {/* ── Left: Copy ── */}
          <div>
            <div className="hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 8px #8B5CF6', display: 'inline-block', flexShrink: 0 }} />
              Personal OS for Founders &amp; Builders
              <span style={{ background: 'var(--violet)', color: '#fff', fontSize: 10, padding: '1px 7px', borderRadius: 99, fontWeight: 700, letterSpacing: '0.05em' }}>BETA</span>
            </div>

            <h1 className="hero-headline" style={{ fontSize: 60, fontWeight: 800, letterSpacing: '-0.045em', lineHeight: 1.04, marginBottom: 24 }}>
              Run Your<br />Entire Life<br />From One Tab
            </h1>

            <p style={{ fontSize: 17.5, lineHeight: 1.72, color: 'var(--text-secondary)', marginBottom: 38, maxWidth: 460 }}>
              Projects, revenue, habits, ideas, servers, acquisitions, snippets, YouTube — every part of your operation tracked, measured, and optimized from one premium dashboard.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
              <Link href="/signup" className="btn btn-primary" style={{ fontSize: 15, padding: '11px 24px', boxShadow: '0 0 32px rgba(124,58,237,0.4)' }}>
                Start for Free <ArrowRight size={15} />
              </Link>
              <Link href="/login" className="btn btn-ghost" style={{ fontSize: 15, padding: '11px 24px' }}>
                Sign In
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {[
                'No credit card — your Supabase, your data, your control',
                '9 fully connected modules, zero tab switching',
                'Built with Next.js 16, TypeScript + Tailwind v4',
              ].map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: 'var(--text-muted)' }}>
                  <CheckCircle2 size={14} color="#22C55E" style={{ flexShrink: 0, marginTop: 1 }} />
                  {p}
                </div>
              ))}
            </div>
          </div>

          {/* ── Right: Dashboard Mockup ── */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
            <div style={{
              position: 'absolute', inset: -80, pointerEvents: 'none',
              background: 'radial-gradient(ellipse 75% 65% at 55% 50%, rgba(124,58,237,0.14) 0%, transparent 70%)',
            }} />
            <div className="mockup-float" style={{
              width: 540, borderRadius: 16, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.10)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.18), 0 48px 96px rgba(0,0,0,0.8)',
              background: '#07070F', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1,
            }}>
              {/* Window Chrome */}
              <div style={{ height: 30, background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', padding: '0 10px', gap: 5, flexShrink: 0 }}>
                {['#F87171', '#FBBF24', '#22C55E'].map((c, i) => (
                  <div key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.7 }} />
                ))}
                <div style={{ flex: 1, textAlign: 'center', fontSize: 9, color: 'rgba(255,255,255,0.2)', fontFamily: 'monospace' }}>kavion.app/dashboard</div>
              </div>

              {/* App content */}
              <div style={{ display: 'flex', flex: 1 }}>
                {/* Sidebar */}
                <div style={{ width: 84, background: '#07070F', borderRight: '1px solid rgba(255,255,255,0.055)', padding: '12px 7px', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 16, paddingLeft: 2 }}>
                    <div style={{ width: 16, height: 16, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 4, boxShadow: '0 0 8px rgba(124,58,237,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Zap size={8} color="#fff" strokeWidth={2.5} />
                    </div>
                    <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: '0.1em', color: '#F0F4FF', fontFamily: 'monospace' }}>KAVION</span>
                  </div>
                  {[
                    { l: 'Dashboard',  c: '#7C3AED', a: true  },
                    { l: 'Projects',   c: '#3B82F6', a: false },
                    { l: 'Revenue',    c: '#10B981', a: false },
                    { l: 'Ideas',      c: '#F59E0B', a: false },
                    { l: 'Habits',     c: '#EC4899', a: false },
                    { l: 'Snippets',   c: '#06B6D4', a: false },
                    { l: 'Acquis.',    c: '#F97316', a: false },
                    { l: 'Servers',    c: '#22C55E', a: false },
                    { l: 'YouTube',    c: '#EF4444', a: false },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 5px', borderRadius: 5, marginBottom: 1, background: item.a ? 'rgba(124,58,237,0.12)' : 'transparent', position: 'relative' }}>
                      {item.a && <div style={{ position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)', width: 2, height: '55%', background: '#8B5CF6', borderRadius: '0 2px 2px 0' }} />}
                      <div style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: item.a ? item.c : 'rgba(255,255,255,0.15)', boxShadow: item.a ? `0 0 5px ${item.c}` : 'none' }} />
                      <span style={{ fontSize: 7, color: item.a ? '#F0F4FF' : 'rgba(255,255,255,0.28)' }}>{item.l}</span>
                    </div>
                  ))}
                </div>

                {/* Main content */}
                <div style={{ flex: 1, padding: '14px', overflow: 'hidden' }}>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9.5, fontWeight: 700, color: '#F0F4FF', marginBottom: 2 }}>Good morning, Kavion ⚡</div>
                    <div style={{ fontSize: 6.5, color: '#3D4559' }}>Friday · 14-day streak · 2 projects due this week</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 4, marginBottom: 8 }}>
                    {[
                      { l: 'PROJECTS', v: '6',     c: '#3B82F6' },
                      { l: 'MRR',      v: '$12.4k', c: '#10B981' },
                      { l: 'STREAK',   v: '14d',    c: '#EC4899' },
                      { l: 'SERVERS',  v: '8/9',    c: '#22C55E' },
                    ].map((s) => (
                      <div key={s.l} style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 5, padding: '5px 6px' }}>
                        <div style={{ fontSize: 5, color: '#3D4559', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 3 }}>{s.l}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: s.c, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{s.v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 6, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 7, fontWeight: 600, color: '#F0F4FF' }}>Active Projects</div>
                    {[
                      { n: 'Kavion OS',    p: 35, c: '#3B82F6' },
                      { n: 'Revenue API',  p: 72, c: '#10B981' },
                      { n: 'Habit Engine', p: 48, c: '#64748B' },
                    ].map((p, i) => (
                      <div key={i} style={{ padding: '5px 8px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 7, color: '#94A3B8' }}>{p.n}</span>
                          <span style={{ fontSize: 6, color: p.c, fontFamily: 'monospace' }}>{p.p}%</span>
                        </div>
                        <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                          <div style={{ height: '100%', width: `${p.p}%`, background: p.c, borderRadius: 99 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 3 }}>
                    {[
                      { t: '🧠 Deep Work', d: true  },
                      { t: '💪 Exercise',  d: true  },
                      { t: '📚 Reading',   d: false },
                    ].map((h, i) => (
                      <div key={i} style={{
                        fontSize: 6.5, padding: '3px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                        background: h.d ? 'rgba(236,72,153,0.12)' : 'rgba(255,255,255,0.04)',
                        color:      h.d ? '#F472B6'               : '#64748B',
                        border: `1px solid ${h.d ? 'rgba(236,72,153,0.22)' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: 4,
                      }}>
                        {h.d && <span style={{ color: '#22C55E', fontWeight: 700 }}>✓</span>}
                        {h.t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROBLEM SECTION ══════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '92px 32px', background: 'rgba(255,255,255,0.008)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px',
              borderRadius: 99, background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.18)',
              fontSize: 11.5, color: '#F87171', fontWeight: 500, letterSpacing: '0.06em',
              textTransform: 'uppercase' as const, marginBottom: 18,
            }}>
              The Problem
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.1 }}>
              Your founder tools are<br />scattered everywhere
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 500, margin: '0 auto', lineHeight: 1.65 }}>
              You have 12 tabs open right now. Three spreadsheets. Two project managers. A habit app. A revenue tracker. And none of them talk to each other.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, maxWidth: 780, margin: '0 auto 52px' }}>
            {SCATTERED_TOOLS.map((tool, i) => (
              <div key={i} style={{
                background: tool.bg,
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, padding: '12px 14px',
                transform: `rotate(${tool.rotate})`,
              }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: tool.color, marginBottom: 2 }}>{tool.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{tool.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, color: 'var(--text-muted)', marginBottom: 20 }}>↓</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 14,
              padding: '16px 28px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(124,58,237,0.14), rgba(6,182,212,0.07))',
              border: '1px solid rgba(124,58,237,0.25)', marginBottom: 24,
            }}>
              <div style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 22px rgba(124,58,237,0.45)', flexShrink: 0 }}>
                <Zap size={17} color="#fff" strokeWidth={2.5} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: 15.5, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.025em' }}>Kavion — One Screen</div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>All 12 tools replaced. Zero tabs. One OS.</div>
              </div>
            </div>
            <div>
              <Link href="/signup" className="btn btn-primary" style={{ fontSize: 14, padding: '10px 22px' }}>
                Replace them all <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══ METRICS BAR ═══════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '72px 32px' }}>
        <div className="landing-container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { num: '9',  label: 'Modules',       sub: 'wired together',      color: '#A78BFA' },
              { num: '0',  label: 'Tab Switches',   sub: 'needed per morning',  color: '#34D399' },
              { num: '1',  label: 'Codebase',       sub: 'to rule them all',    color: '#60A5FA' },
              { num: '∞',  label: 'Leverage',       sub: 'from compounding',    color: '#FBBF24' },
            ].map((m, i) => (
              <div key={i} style={{
                textAlign: 'center', padding: '32px 24px',
                borderRight: i < 3 ? '1px solid var(--border)' : 'none',
              }}>
                <div className="num" style={{ fontSize: 64, fontWeight: 800, color: m.color, letterSpacing: '-0.05em', lineHeight: 1, marginBottom: 10 }}>
                  {m.num}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{m.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════════ */}
      <section id="features" style={{ borderTop: '1px solid var(--border)', padding: '92px 32px', background: 'rgba(255,255,255,0.008)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px',
              borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500,
              letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 18,
            }}>
              9 Modules, Fully Connected
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.1 }}>
              Everything you need to<br />run your operation
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              Built for solo founders who think in systems. Every module wired together, every metric visible, every action one click away.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.name} className="feature-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 11, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${f.color}22` }}>
                    <f.icon size={18} color={f.color} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: f.color, background: f.bg, padding: '3px 8px', borderRadius: 99, border: `1px solid ${f.color}22` }}>
                    {f.stat}
                  </span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8, letterSpacing: '-0.025em' }}>{f.name}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════ */}
      <section id="how" style={{ borderTop: '1px solid var(--border)', padding: '92px 32px' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px',
              borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500,
              letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 18,
            }}>
              How It Works
            </div>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.1 }}>
              Zero to OS in<br />three steps
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 24, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 40, left: '18%', right: '18%', height: 1, background: 'linear-gradient(to right, rgba(124,58,237,0.4), rgba(59,130,246,0.4), rgba(16,185,129,0.4))', zIndex: 0 }} />
            {[
              { num: '01', icon: Zap,       color: '#7C3AED', title: 'Sign up & connect',    desc: 'Create your account and add your Supabase credentials. Your data lives in your own database — Kavion never touches it.' },
              { num: '02', icon: Layers,    color: '#3B82F6', title: 'Populate your OS',     desc: 'Add projects, log habits, record revenue streams, save snippets. Every module works independently or as one system.' },
              { num: '03', icon: BarChart3, color: '#10B981', title: 'Run your operation',   desc: 'Open Kavion every morning. Check your metrics, tick your habits, review your pipeline. One screen. Zero tabs. Pure leverage.' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ padding: 28, position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: `${step.color}15`, border: `1px solid ${step.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <step.icon size={20} color={step.color} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: step.color, letterSpacing: '0.08em' }}>{step.num}</span>
                </div>
                <h3 style={{ fontSize: 16.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.025em' }}>{step.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY ═══════════════════════════════════════════ */}
      <section id="why" style={{ borderTop: '1px solid var(--border)', padding: '92px 32px', background: 'rgba(255,255,255,0.008)' }}>
        <div className="landing-container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 42, fontWeight: 800, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.1 }}>
              Built for builders who<br />think in systems
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Not just a dashboard — a forcing function that makes you better.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { num: '01', icon: GitBranch, color: '#7C3AED', title: 'Architect properly',  desc: 'Designing Kavion forces you to think about data models, relationships, and system design before you build a single feature. That thinking transfers everywhere.' },
              { num: '02', icon: Cpu,       color: '#3B82F6', title: 'Build real backend',  desc: 'Every module connects to Supabase. Real auth, real database, real queries — not toys. Row-level security, real-time subscriptions, production-grade from day one.' },
              { num: '03', icon: Flame,     color: '#10B981', title: 'Think in leverage',   desc: 'When you see projects, revenue, habits, and servers in one place, you stop thinking in tasks and start thinking in leverage. That mental model compounds fast.' },
            ].map((item) => (
              <div key={item.num} className="card" style={{ padding: '28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 9, background: `${item.color}15`, border: `1px solid ${item.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <item.icon size={16} color={item.color} strokeWidth={1.8} />
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: '0.1em' }}>{item.num}</span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.025em' }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ QUOTE ══════════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '88px 32px', background: 'rgba(124,58,237,0.025)' }}>
        <div className="landing-container" style={{ maxWidth: 780, textAlign: 'center' }}>
          <div style={{ fontSize: 80, color: 'rgba(124,58,237,0.22)', lineHeight: 0.75, marginBottom: 28, fontFamily: 'Georgia, serif', fontWeight: 400 }}>&ldquo;</div>
          <blockquote style={{ fontSize: 26, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.48, letterSpacing: '-0.025em', marginBottom: 36 }}>
            The best founders I know track everything. Revenue, projects, habits — in one place. Not scattered across twelve tabs. Kavion is that one screen.
          </blockquote>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={17} color="#fff" strokeWidth={2} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Kavion Builder</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Solo Founder &amp; Builder</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ STACK ══════════════════════════════════════════ */}
      <section id="stack" style={{ borderTop: '1px solid var(--border)', padding: '64px 32px' }}>
        <div className="landing-container" style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 28 }}>
            Built with the best stack
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap' as const, marginBottom: 20 }}>
            {[
              { name: 'Next.js 16',   bg: 'rgba(255,255,255,0.05)', color: '#F0F4FF' },
              { name: 'Supabase',     bg: 'rgba(62,207,142,0.08)',  color: '#3ECF8E' },
              { name: 'Tailwind v4',  bg: 'rgba(56,189,248,0.08)',  color: '#38BDF8' },
              { name: 'TypeScript',   bg: 'rgba(96,165,250,0.08)',  color: '#60A5FA' },
              { name: 'React 19',     bg: 'rgba(6,182,212,0.08)',   color: '#22D3EE' },
              { name: 'Recharts',     bg: 'rgba(16,185,129,0.08)',  color: '#34D399' },
              { name: 'Lucide React', bg: 'rgba(124,58,237,0.08)',  color: '#A78BFA' },
              { name: 'Zustand',      bg: 'rgba(251,146,60,0.08)',  color: '#FB923C' },
            ].map((t) => (
              <div key={t.name} style={{ padding: '8px 16px', borderRadius: 8, background: t.bg, border: '1px solid rgba(255,255,255,0.06)', fontSize: 13, fontWeight: 500, color: t.color, fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em' }}>
                {t.name}
              </div>
            ))}
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
            Production-grade architecture. Your Supabase, your code, your infrastructure. No vendor lock-in, ever.
          </p>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '108px 32px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(ellipse 65% 75% at 50% 50%, rgba(124,58,237,0.09) 0%, transparent 70%)' }} />
        <div className="landing-container" style={{ maxWidth: 620, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 62, height: 62, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 56px rgba(124,58,237,0.55)' }}>
            <Zap size={28} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 50, fontWeight: 800, letterSpacing: '-0.045em', color: 'var(--text-primary)', marginBottom: 16, lineHeight: 1.06 }}>
            Start building your<br />command center today
          </h2>
          <p style={{ fontSize: 17, color: 'var(--text-secondary)', marginBottom: 40, lineHeight: 1.65 }}>
            One dashboard. Nine modules. Zero excuses.<br />Your personal OS is waiting.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: 15.5, padding: '13px 30px', boxShadow: '0 0 40px rgba(124,58,237,0.5)', display: 'inline-flex' }}>
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: 15.5, padding: '13px 24px' }}>
              Sign In
            </Link>
          </div>
          <p style={{ fontSize: 12.5, color: 'var(--text-muted)', marginTop: 22 }}>No credit card · Your data, your Supabase · Built with TypeScript</p>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '28px 32px' }}>
        <div className="landing-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 22, height: 22, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={11} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>KAVION</span>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Features', '#features'], ['How it Works', '#how'], ['Why', '#why'], ['Stack', '#stack']].map(([l, h]) => (
              <a key={h} href={h} style={{ fontSize: 12.5, color: 'var(--text-muted)', textDecoration: 'none' }}>{l}</a>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your Personal OS · Next.js + Supabase</span>
        </div>
      </footer>

    </div>
  )
}
