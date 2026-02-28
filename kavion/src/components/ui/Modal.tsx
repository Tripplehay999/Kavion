'use client'

import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: number
}

export default function Modal({ open, onClose, title, children, width = 480 }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        ref={panelRef}
        style={{
          width: '100%', maxWidth: width,
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-hover)',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(124,58,237,0.12)',
          overflow: 'hidden',
          animation: 'fade-up 180ms ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '18px 22px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 7,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--text-muted)',
              transition: 'all 140ms',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px' }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ── Reusable form field ─────────────────────── */
export function FormField({ label, children, required }: {
  label: string; children: React.ReactNode; required?: boolean
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{
        display: 'block', fontSize: 12, fontWeight: 500,
        color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.01em',
      }}>
        {label}{required && <span style={{ color: '#F87171', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

export function FieldInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 8, fontSize: 13.5, color: 'var(--text-primary)',
        outline: 'none', fontFamily: 'inherit',
        transition: 'border-color 150ms',
        ...props.style,
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)')}
    />
  )
}

export function FieldSelect(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 8, fontSize: 13.5, color: 'var(--text-primary)',
        outline: 'none', fontFamily: 'inherit', cursor: 'pointer',
        ...props.style,
      }}
    />
  )
}

export function FieldTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width: '100%', padding: '9px 12px',
        background: 'var(--bg-input)', border: '1px solid var(--border)',
        borderRadius: 8, fontSize: 13.5, color: 'var(--text-primary)',
        outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: 80,
        transition: 'border-color 150ms',
        ...props.style,
      }}
      onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.5)')}
      onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.055)')}
    />
  )
}
