'use client'

import { useState, useTransition } from 'react'
import { CheckCircle2, AlertCircle, Loader2, User, Lock, Info } from 'lucide-react'
import { updateProfile, changePassword } from '@/app/actions/profile'
import type { UserProfile } from '@/app/actions/profile'

const AVATAR_COLORS = [
  '#7C3AED', '#3B82F6', '#10B981', '#F59E0B',
  '#EC4899', '#06B6D4', '#F97316', '#EF4444',
]

function Avatar({ name, email, color, size = 64 }: { name?: string | null; email: string; color: string; size?: number }) {
  const initial = (name?.trim() || email)[0]?.toUpperCase() ?? '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: `linear-gradient(135deg, ${color} 0%, ${color}99 100%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#fff',
      boxShadow: `0 0 24px ${color}55`, flexShrink: 0,
    }}>
      {initial}
    </div>
  )
}

interface Props {
  profile: UserProfile | null
  email: string
  memberSince: string
}

export default function ProfileClient({ profile, email, memberSince }: Props) {
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarColor, setAvatarColor] = useState(profile?.avatar_color ?? '#7C3AED')

  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwdMsg, setPwdMsg]         = useState<{ ok: boolean; text: string } | null>(null)

  const [profilePending, startProfileTransition] = useTransition()
  const [pwdPending, startPwdTransition] = useTransition()

  const handleSaveProfile = () => {
    setProfileMsg(null)
    startProfileTransition(async () => {
      try {
        await updateProfile({ display_name: displayName, bio, avatar_color: avatarColor })
        setProfileMsg({ ok: true, text: 'Profile saved' })
      } catch (e) {
        setProfileMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed to save' })
      }
    })
  }

  const handleChangePwd = () => {
    setPwdMsg(null)
    if (newPwd !== confirmPwd) {
      setPwdMsg({ ok: false, text: 'Passwords do not match' })
      return
    }
    startPwdTransition(async () => {
      try {
        await changePassword(newPwd)
        setPwdMsg({ ok: true, text: 'Password updated' })
        setNewPwd('')
        setConfirmPwd('')
      } catch (e) {
        setPwdMsg({ ok: false, text: e instanceof Error ? e.message : 'Failed to update password' })
      }
    })
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 560 }}>

      {/* ── Card 1: Identity ── */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <User size={15} color="#A78BFA" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Identity</span>
        </div>

        {/* Avatar + color picker */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 20 }}>
          <Avatar name={displayName} email={email} color={avatarColor} size={64} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8 }}>Avatar color</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setAvatarColor(c)}
                  title={c}
                  style={{
                    width: 22, height: 22, borderRadius: '50%', background: c, border: 'none', cursor: 'pointer',
                    outline: avatarColor === c ? `2px solid ${c}` : '2px solid transparent',
                    outlineOffset: 2, transition: 'outline 100ms',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Display name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              placeholder="Your name"
              maxLength={60}
              className="field-input"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Bio <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({bio.length}/200)</span>
            </label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="A short bio about you..."
              maxLength={200}
              rows={3}
              className="field-input"
              style={{ ...inputStyle, resize: 'vertical', minHeight: 72, fontFamily: 'inherit', fontSize: 13 }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              onClick={handleSaveProfile}
              disabled={profilePending}
            >
              {profilePending ? <Loader2 size={13} className="spin" /> : null}
              Save Profile
            </button>
            {profileMsg && (
              <span style={{ fontSize: 12, color: profileMsg.ok ? '#22C55E' : '#F87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                {profileMsg.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {profileMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Card 2: Account Info ── */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Info size={15} color="#06B6D4" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Account Info</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>Email</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{email}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>Email changes require re-verification via Supabase.</div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>Member since</div>
            <div style={{ fontSize: 13, color: 'var(--text-primary)' }}>{memberSince}</div>
          </div>
          <div style={{ height: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 4 }}>Plan</div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99,
              background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
              border: '1px solid rgba(124,58,237,0.2)',
            }}>
              Personal
            </span>
          </div>
        </div>
      </div>

      {/* ── Card 3: Security ── */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Lock size={15} color="#F59E0B" />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Security</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              New password
            </label>
            <input
              type="password"
              value={newPwd}
              onChange={e => setNewPwd(e.target.value)}
              placeholder="At least 8 characters"
              className="field-input"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>
              Confirm password
            </label>
            <input
              type="password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Repeat password"
              className="field-input"
              style={inputStyle}
              autoComplete="new-password"
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              className="btn btn-primary"
              style={{ fontSize: 13 }}
              onClick={handleChangePwd}
              disabled={pwdPending || !newPwd || !confirmPwd}
            >
              {pwdPending ? <Loader2 size={13} className="spin" /> : <Lock size={13} />}
              Change Password
            </button>
            {pwdMsg && (
              <span style={{ fontSize: 12, color: pwdMsg.ok ? '#22C55E' : '#F87171', display: 'flex', alignItems: 'center', gap: 5 }}>
                {pwdMsg.ok ? <CheckCircle2 size={13} /> : <AlertCircle size={13} />}
                {pwdMsg.text}
              </span>
            )}
          </div>
        </div>
      </div>

    </div>
  )
}
