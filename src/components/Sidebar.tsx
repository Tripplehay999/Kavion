'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  TrendingUp,
  Lightbulb,
  Target,
  Code2,
  Building2,
  Server,
  Youtube,
  Settings,
  Zap,
  LogOut,
  Loader2,
  X,
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import type { NavCounts } from '@/app/actions/nav'

const NAV = [
  { href: '/dashboard',    icon: LayoutDashboard, label: 'Dashboard',    color: '#7C3AED', countKey: null        },
  { href: '/projects',     icon: FolderKanban,    label: 'Projects',     color: '#3B82F6', countKey: 'projects'  },
  { href: '/revenue',      icon: TrendingUp,      label: 'Revenue',      color: '#10B981', countKey: null        },
  { href: '/ideas',        icon: Lightbulb,       label: 'Ideas',        color: '#F59E0B', countKey: 'ideas'     },
  { href: '/habits',       icon: Target,          label: 'Habits',       color: '#EC4899', countKey: 'habits'    },
  { href: '/snippets',     icon: Code2,           label: 'Snippets',     color: '#06B6D4', countKey: 'snippets'  },
  { href: '/acquisitions', icon: Building2,       label: 'Acquisitions', color: '#F97316', countKey: null        },
  { href: '/servers',      icon: Server,          label: 'Servers',      color: '#22C55E', countKey: 'servers'   },
  { href: '/youtube',      icon: Youtube,         label: 'YouTube',      color: '#EF4444', countKey: null        },
]

export default function Sidebar({
  userEmail,
  displayName,
  avatarColor = '#7C3AED',
  navCounts,
  mobileOpen = false,
  onMobileClose,
}: {
  userEmail: string
  displayName?: string | null
  avatarColor?: string
  navCounts?: NavCounts
  mobileOpen?: boolean
  onMobileClose?: () => void
}) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  const label   = displayName?.trim() || userEmail || 'Personal OS'
  const initial = label[0]?.toUpperCase() ?? 'U'

  return (
    <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
      {/* ── Logo ── */}
      <div style={{
        padding: '20px 14px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        borderBottom: '1px solid var(--border)',
        marginBottom: 8,
      }}>
        <div style={{
          width: 28,
          height: 28,
          background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
          borderRadius: 7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 16px rgba(124, 58, 237, 0.45)',
          flexShrink: 0,
        }}>
          <Zap size={14} color="#fff" strokeWidth={2.5} />
        </div>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: '0.08em',
          color: 'var(--text-primary)',
          flex: 1,
        }}>
          KAVION
        </span>
        <button className="sidebar-close-btn" onClick={onMobileClose} aria-label="Close menu">
          <X size={16} />
        </button>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '4px 0', overflowY: 'auto' }}>
        {NAV.map(({ href, icon: Icon, label, color, countKey }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          const count = countKey ? (navCounts?.[countKey as keyof NavCounts] ?? 0) : null
          return (
            <Link
              key={href}
              href={href}
              className={`nav-item${active ? ' active' : ''}`}
            >
              <Icon
                size={15}
                strokeWidth={active ? 2.2 : 1.8}
                style={{ color: active ? color : 'currentColor', flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{label}</span>
              {count !== null && count > 0 && (
                <span style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-mono)',
                  color: 'var(--text-muted)',
                  background: 'rgba(255,255,255,0.055)',
                  padding: '1px 6px',
                  borderRadius: 99,
                }}>
                  {count}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '10px 7px 12px' }}>
        <Link
          href="/settings"
          className={`nav-item${pathname === '/settings' ? ' active' : ''}`}
        >
          <Settings size={15} strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <span>Settings</span>
        </Link>

        {/* User pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '8px 10px',
          marginTop: 4,
          borderRadius: 9,
          background: 'rgba(255,255,255,0.022)',
          border: '1px solid var(--border)',
        }}>
          <Link href="/profile" title="Edit profile" style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0, textDecoration: 'none' }}>
            <div style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${avatarColor} 0%, ${avatarColor}99 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 700,
              color: '#fff',
              flexShrink: 0,
            }}>
              {initial}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{
                fontSize: 11.5,
                fontWeight: 500,
                color: 'var(--text-primary)',
                lineHeight: 1.3,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {label}
              </div>
            </div>
          </Link>
          <button
            onClick={() => startTransition(async () => { await logout() })}
            disabled={isPending}
            title="Log out"
            style={{
              background: 'none',
              border: 'none',
              cursor: isPending ? 'not-allowed' : 'pointer',
              padding: 4,
              color: 'var(--text-muted)',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              borderRadius: 5,
              transition: 'color 150ms',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#F87171' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
          >
            {isPending ? <Loader2 size={13} className="spin" /> : <LogOut size={13} />}
          </button>
        </div>
      </div>
    </aside>
  )
}
