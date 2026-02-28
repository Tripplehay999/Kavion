import Link from 'next/link'
import {
  LayoutDashboard, FolderKanban, TrendingUp, Lightbulb,
  Target, Code2, Building2, Server, Youtube,
  Zap, ArrowRight, CheckCircle2,
} from 'lucide-react'

const FEATURES = [
  { icon: LayoutDashboard, name: 'Command Center',     desc: 'One unified view of your entire operation — stats, activity, and focus — at a glance.',       color: '#7C3AED', bg: 'rgba(124,58,237,0.08)'  },
  { icon: FolderKanban,    name: 'Project Tracker',    desc: 'Status, progress, priority, and stack tags across every build you\'re running.',               color: '#3B82F6', bg: 'rgba(59,130,246,0.08)'  },
  { icon: TrendingUp,      name: 'Revenue Dashboard',  desc: 'MRR, ARR, growth rate, and every income stream on one screen. Know your numbers cold.',        color: '#10B981', bg: 'rgba(16,185,129,0.08)'  },
  { icon: Lightbulb,       name: 'Ideas Vault',        desc: 'Capture, score, and track startup ideas before they slip away. Rate them 1–10 and build.',     color: '#F59E0B', bg: 'rgba(245,158,11,0.08)'  },
  { icon: Target,          name: 'Habit Tracking',     desc: 'Streak tracking, 28-day heatmaps, and daily accountability. Consistency compounds.',           color: '#EC4899', bg: 'rgba(236,72,153,0.08)'  },
  { icon: Code2,           name: 'Snippet Vault',      desc: 'Your private code library, searchable and tagged by language. Never Google the same snippet.',  color: '#06B6D4', bg: 'rgba(6,182,212,0.08)'   },
  { icon: Building2,       name: 'Acquisition Radar',  desc: 'Watch micro-SaaS deals with full financial breakdowns — price, revenue, profit, multiple.',     color: '#F97316', bg: 'rgba(249,115,22,0.08)'  },
  { icon: Server,          name: 'Server Monitor',     desc: 'Uptime, CPU, memory, and response time for every server. Alerts when things go sideways.',      color: '#22C55E', bg: 'rgba(34,197,94,0.08)'   },
  { icon: Youtube,         name: 'YouTube Automation', desc: 'Content pipeline from idea to published, visualized. Script, record, edit, ship — tracked.',   color: '#EF4444', bg: 'rgba(239,68,68,0.08)'   },
]

export default function HomePage() {
  return (
    <div className="landing-page">

      {/* ══ NAV ══════════════════════════════════════ */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--border)',
        background: 'rgba(7,7,15,0.82)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto', padding: '0 32px',
          height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 28, height: 28,
              background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
              borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 14px rgba(124,58,237,0.5)',
            }}>
              <Zap size={14} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              KAVION
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            {[['Features', '#features'], ['Why', '#why'], ['Stack', '#stack']].map(([l, h]) => (
              <a key={h} href={h} style={{ fontSize: 13.5, color: 'var(--text-secondary)', textDecoration: 'none' }}>
                {l}
              </a>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/login"  className="btn btn-ghost"   style={{ fontSize: 13 }}>Sign In</Link>
            <Link href="/signup" className="btn btn-primary" style={{ fontSize: 13 }}>Get Started</Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══════════════════════════════════════ */}
      <section style={{
        maxWidth: 1080, margin: '0 auto', padding: '88px 32px 100px',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center',
      }}>

        {/* Left — Copy */}
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '4px 12px', borderRadius: 99,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            fontSize: 12, color: 'var(--violet-light)', fontWeight: 500, marginBottom: 22,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#A78BFA', boxShadow: '0 0 6px #8B5CF6', display: 'inline-block' }} />
            Personal OS for Founders
          </div>

          <h1 className="hero-headline" style={{
            fontSize: 54, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1.08, marginBottom: 22,
          }}>
            Your Personal<br />Command Center
          </h1>

          <p style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 36, maxWidth: 440 }}>
            Projects, revenue, habits, ideas, servers — every part of your founder life tracked, measured, and optimized from one premium dashboard.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <Link href="/signup" className="btn btn-primary" style={{
              fontSize: 14.5, padding: '10px 22px',
              boxShadow: '0 0 24px rgba(124,58,237,0.35)',
            }}>
              Get Started Free <ArrowRight size={15} />
            </Link>
            <Link href="/login" className="btn btn-ghost" style={{ fontSize: 14.5, padding: '10px 22px' }}>
              Sign In
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              'No credit card required',
              '9 modules, zero context switching',
              'Your data, your Supabase, your control',
            ].map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-muted)' }}>
                <CheckCircle2 size={13} color="#22C55E" />
                {p}
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dashboard Mockup */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', position: 'relative' }}>
          <div style={{
            position: 'absolute', inset: -60, pointerEvents: 'none',
            background: 'radial-gradient(ellipse 70% 60% at 55% 50%, rgba(124,58,237,0.12) 0%, transparent 70%)',
          }} />
          <div className="mockup-float" style={{
            width: 520, borderRadius: 14, overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.09)',
            boxShadow: '0 0 0 1px rgba(124,58,237,0.15), 0 40px 80px rgba(0,0,0,0.75)',
            background: '#07070F', display: 'flex', position: 'relative', zIndex: 1,
          }}>
            {/* Mockup Sidebar */}
            <div style={{ width: 76, background: '#07070F', borderRight: '1px solid rgba(255,255,255,0.055)', padding: '12px 7px', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14, paddingLeft: 3 }}>
                <div style={{ width: 15, height: 15, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 4, boxShadow: '0 0 7px rgba(124,58,237,0.5)' }} />
                <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.1em', color: '#F0F4FF', fontFamily: 'monospace' }}>KAVION</span>
              </div>
              {[
                { l: 'Dashboard', c: '#7C3AED', a: true  },
                { l: 'Projects',  c: '#3B82F6', a: false },
                { l: 'Revenue',   c: '#10B981', a: false },
                { l: 'Ideas',     c: '#F59E0B', a: false },
                { l: 'Habits',    c: '#EC4899', a: false },
                { l: 'Snippets',  c: '#06B6D4', a: false },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '5px 5px', borderRadius: 5, marginBottom: 1,
                  background: item.a ? 'rgba(124,58,237,0.1)' : 'transparent',
                  position: 'relative',
                }}>
                  {item.a && <div style={{ position: 'absolute', left: -7, top: '50%', transform: 'translateY(-50%)', width: 2, height: '54%', background: '#8B5CF6', borderRadius: '0 2px 2px 0' }} />}
                  <div style={{ width: 4, height: 4, borderRadius: '50%', flexShrink: 0, background: item.a ? item.c : 'rgba(255,255,255,0.18)', boxShadow: item.a ? `0 0 4px ${item.c}` : 'none' }} />
                  <span style={{ fontSize: 7, color: item.a ? '#F0F4FF' : 'rgba(255,255,255,0.3)' }}>{item.l}</span>
                </div>
              ))}
            </div>

            {/* Mockup Main */}
            <div style={{ flex: 1, padding: '14px', overflow: 'hidden' }}>
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 9.5, fontWeight: 600, color: '#F0F4FF', marginBottom: 2 }}>Good morning, Kavion</div>
                <div style={{ fontSize: 7, color: '#3D4559' }}>Thursday · 14-day streak on track</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 5, marginBottom: 9 }}>
                {[
                  { l: 'PROJECTS', v: '6',      c: '#3B82F6' },
                  { l: 'MRR',      v: '$12.4k',  c: '#10B981' },
                  { l: 'STREAK',   v: '14d',     c: '#EC4899' },
                  { l: 'SERVERS',  v: '8/9',     c: '#22C55E' },
                ].map((s) => (
                  <div key={s.l} style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 5, padding: '5px 6px' }}>
                    <div style={{ fontSize: 5.5, color: '#3D4559', fontWeight: 500, letterSpacing: '0.04em', marginBottom: 3 }}>{s.l}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: s.c, fontFamily: 'monospace', letterSpacing: '-0.02em' }}>{s.v}</div>
                  </div>
                ))}
              </div>
              <div style={{ background: '#0D0D1A', border: '1px solid rgba(255,255,255,0.055)', borderRadius: 6, overflow: 'hidden', marginBottom: 7 }}>
                <div style={{ padding: '5px 8px', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 7, fontWeight: 600, color: '#F0F4FF' }}>Recent Projects</div>
                {[
                  { n: 'Kavion OS',    p: 35, c: '#3B82F6' },
                  { n: 'Revenue API',  p: 72, c: '#3B82F6' },
                  { n: 'Habit Engine', p: 48, c: '#64748B' },
                ].map((p, i) => (
                  <div key={i} style={{ padding: '5px 8px', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 7, color: '#94A3B8' }}>{p.n}</span>
                      <span style={{ fontSize: 6.5, color: '#3D4559', fontFamily: 'monospace' }}>{p.p}%</span>
                    </div>
                    <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', borderRadius: 99 }}>
                      <div style={{ height: '100%', width: `${p.p}%`, background: p.c, borderRadius: 99 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {['🧠 Deep Work ✓', '💪 Exercise ✓', '📚 Reading…'].map((h, i) => (
                  <div key={i} style={{
                    fontSize: 7, padding: '3px 6px', borderRadius: 4, whiteSpace: 'nowrap',
                    background: i < 2 ? 'rgba(236,72,153,0.1)' : 'rgba(255,255,255,0.04)',
                    color:      i < 2 ? '#F472B6'              : '#64748B',
                    border: `1px solid ${i < 2 ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.06)'}`,
                  }}>{h}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FEATURES ══════════════════════════════════ */}
      <section id="features" style={{ borderTop: '1px solid var(--border)', padding: '88px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 12px',
              borderRadius: 99, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
              fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500,
              letterSpacing: '0.07em', textTransform: 'uppercase' as const, marginBottom: 18,
            }}>
              9 Modules
            </div>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.15 }}>
              Everything you need to run your operation
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)', maxWidth: 480, margin: '0 auto', lineHeight: 1.65 }}>
              Built for solo founders who think in systems. Every module wired together, every metric visible.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14 }}>
            {FEATURES.map((f) => (
              <div key={f.name} className="feature-card">
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 14,
                }}>
                  <f.icon size={18} color={f.color} strokeWidth={1.8} />
                </div>
                <h3 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 7, letterSpacing: '-0.02em' }}>
                  {f.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY ═══════════════════════════════════════ */}
      <section id="why" style={{ borderTop: '1px solid var(--border)', padding: '88px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <h2 style={{ fontSize: 38, fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--text-primary)', marginBottom: 12, lineHeight: 1.15 }}>
              Built for builders who think in systems
            </h2>
            <p style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Not just a dashboard — a forcing function.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
            {[
              { num: '01', title: 'Architect properly', desc: 'Designing Kavion forces you to think about data models, relationships, and system design before you build a single feature.' },
              { num: '02', title: 'Build real backend',  desc: 'Every module connects to Supabase. Real auth, real database, real queries — not toys. Your entire stack is production grade.' },
              { num: '03', title: 'Think in systems',    desc: 'When you see projects, revenue, habits, and servers in one place, you stop thinking in tasks and start thinking in leverage.' },
            ].map((item) => (
              <div key={item.num} className="card" style={{ padding: '28px' }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, color: 'var(--violet-light)', letterSpacing: '0.1em', marginBottom: 14 }}>
                  {item.num}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ STACK ═════════════════════════════════════ */}
      <section id="stack" style={{ borderTop: '1px solid var(--border)', padding: '64px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', textAlign: 'center' }}>
          <p style={{ fontSize: 11.5, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase' as const, marginBottom: 26 }}>
            Built with
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, flexWrap: 'wrap' as const }}>
            {[
              { name: 'Next.js 16',   bg: 'rgba(255,255,255,0.05)', color: '#F0F4FF' },
              { name: 'Supabase',     bg: 'rgba(62,207,142,0.08)',  color: '#3ECF8E' },
              { name: 'Tailwind v4',  bg: 'rgba(56,189,248,0.08)',  color: '#38BDF8' },
              { name: 'TypeScript',   bg: 'rgba(96,165,250,0.08)',  color: '#60A5FA' },
              { name: 'Lucide React', bg: 'rgba(124,58,237,0.08)', color: '#A78BFA' },
              { name: 'Zustand',      bg: 'rgba(251,146,60,0.08)',  color: '#FB923C' },
            ].map((t) => (
              <div key={t.name} style={{
                padding: '8px 18px', borderRadius: 8,
                background: t.bg, border: '1px solid rgba(255,255,255,0.06)',
                fontSize: 13, fontWeight: 500, color: t.color,
                fontFamily: 'var(--font-mono)', letterSpacing: '-0.01em',
              }}>
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA BANNER ════════════════════════════════ */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '100px 32px', textAlign: 'center' }}>
        <div style={{ maxWidth: 560, margin: '0 auto' }}>
          <div style={{
            width: 52, height: 52,
            background: 'linear-gradient(135deg, #7C3AED, #A78BFA)',
            borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 26px', boxShadow: '0 0 40px rgba(124,58,237,0.45)',
          }}>
            <Zap size={24} color="#fff" strokeWidth={2.5} />
          </div>
          <h2 style={{ fontSize: 40, fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text-primary)', marginBottom: 14, lineHeight: 1.12 }}>
            Start building your<br />command center today
          </h2>
          <p style={{ fontSize: 16, color: 'var(--text-secondary)', marginBottom: 34 }}>
            One dashboard to run your entire operation.
          </p>
          <Link href="/signup" className="btn btn-primary" style={{
            fontSize: 15, padding: '12px 28px',
            boxShadow: '0 0 32px rgba(124,58,237,0.4)', display: 'inline-flex',
          }}>
            Get Started Free <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════ */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 20, height: 20, background: 'linear-gradient(135deg, #7C3AED, #A78BFA)', borderRadius: 5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={10} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-muted)' }}>KAVION</span>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Your Personal OS</span>
        </div>
      </footer>

    </div>
  )
}
