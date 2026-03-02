'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Menu, Zap } from 'lucide-react'
import Sidebar from './Sidebar'
import type { NavCounts } from '@/app/actions/nav'

export default function AppShellClient({
  children,
  userEmail,
  displayName,
  avatarColor,
  navCounts,
}: {
  children: React.ReactNode
  userEmail: string
  displayName?: string | null
  avatarColor?: string
  navCounts?: NavCounts
}) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Close sidebar whenever the route changes
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {open && (
        <div className="sidebar-backdrop" onClick={() => setOpen(false)} />
      )}

      <Sidebar userEmail={userEmail} displayName={displayName} avatarColor={avatarColor} navCounts={navCounts} mobileOpen={open} onMobileClose={() => setOpen(false)} />

      <main style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Mobile top bar */}
        <div className="mobile-header">
          <button className="mobile-menu-btn" onClick={() => setOpen(true)} aria-label="Open navigation">
            <Menu size={20} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, background: 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(124,58,237,0.4)' }}>
              <Zap size={12} color="#fff" strokeWidth={2.5} />
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13.5, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>
              KAVION
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  )
}
