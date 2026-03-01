'use client'

import { useState, useTransition, useRef } from 'react'
import { Plus, GripVertical, Eye, X, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { updateVideoStage, addYouTubeVideo, deleteYouTubeVideo } from '@/app/actions/youtube'
import Modal, { FormField, FieldInput, FieldTextarea } from '@/components/ui/Modal'

type Stage = 'idea' | 'scripting' | 'recording' | 'editing' | 'scheduled' | 'published'

interface Video {
  id: string
  title: string
  stage?: string
  description?: string
  tags?: string[]
  views?: number
  published_at?: string
  created_at?: string
}

const STAGE_CONFIG: Record<Stage, { label: string; color: string; bg: string }> = {
  idea:       { label: 'Idea',       color: '#94A3B8', bg: 'rgba(100,116,139,0.08)' },
  scripting:  { label: 'Scripting',  color: '#FBBF24', bg: 'rgba(245,158,11,0.08)'  },
  recording:  { label: 'Recording',  color: '#FB923C', bg: 'rgba(249,115,22,0.08)'  },
  editing:    { label: 'Editing',    color: '#60A5FA', bg: 'rgba(59,130,246,0.08)'  },
  scheduled:  { label: 'Scheduled',  color: '#A78BFA', bg: 'rgba(167,139,250,0.08)' },
  published:  { label: 'Published',  color: '#22C55E', bg: 'rgba(34,197,94,0.08)'   },
}

const STAGES: Stage[] = ['idea', 'scripting', 'recording', 'editing', 'scheduled', 'published']

export default function YoutubeKanban({
  initialVideos,
  isLive,
}: {
  initialVideos: Video[]
  isLive: boolean
}) {
  const [videos, setVideos] = useState<Video[]>(initialVideos)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', description: '', stage: 'idea' as Stage })
  const [formError, setFormError] = useState('')
  const [isPending, startTransition] = useTransition()

  // Drag state
  const dragId  = useRef<string | null>(null)
  const [dragOver, setDragOver] = useState<Stage | null>(null)

  const onDragStart = (videoId: string) => {
    dragId.current = videoId
  }

  const onDragOver = (e: React.DragEvent, stage: Stage) => {
    e.preventDefault()
    setDragOver(stage)
  }

  const onDrop = (e: React.DragEvent, toStage: Stage) => {
    e.preventDefault()
    setDragOver(null)
    const id = dragId.current
    if (!id || !isLive) return
    const video = videos.find(v => v.id === id)
    if (!video || video.stage === toStage) return

    // Optimistic update
    setVideos(prev => prev.map(v => v.id === id ? { ...v, stage: toStage } : v))

    startTransition(async () => {
      try {
        await updateVideoStage(id, toStage)
      } catch {
        // Rollback
        setVideos(prev => prev.map(v => v.id === id ? { ...v, stage: video.stage } : v))
      }
    })
  }

  const handleAdd = () => {
    if (!form.title.trim()) { setFormError('Title is required'); return }
    if (!isLive) { setFormError('Supabase not configured'); return }
    startTransition(async () => {
      try {
        await addYouTubeVideo({ title: form.title.trim(), stage: form.stage, description: form.description || undefined })
        const newVideo: Video = {
          id: `temp-${Date.now()}`,
          title: form.title.trim(),
          stage: form.stage,
          description: form.description || undefined,
          created_at: new Date().toISOString(),
        }
        setVideos(prev => [newVideo, ...prev])
        setForm({ title: '', description: '', stage: 'idea' })
        setAddOpen(false)
        setFormError('')
      } catch (e) {
        setFormError(e instanceof Error ? e.message : 'Failed to add')
      }
    })
  }

  const handleDelete = (id: string) => {
    if (!isLive) return
    startTransition(async () => {
      try {
        await deleteYouTubeVideo(id)
        setVideos(prev => prev.filter(v => v.id !== id))
        setDeleteId(null)
      } catch (e) {
        setFormError(e instanceof Error ? e.message : 'Delete failed')
      }
    })
  }

  const totalPipeline = videos.filter(v => v.stage !== 'published').length

  return (
    <>
      <div className="card" style={{ overflow: 'hidden', marginBottom: 16 }}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>Content Pipeline</h2>
            <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', background: 'rgba(255,255,255,0.04)', padding: '2px 8px', borderRadius: 99 }}>
              {totalPipeline} in progress
            </span>
            {isPending && <Loader2 size={12} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />}
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setAddOpen(true); setFormError('') }}
            disabled={!isLive}
          >
            <Plus size={13} /> Add Video
          </button>
        </div>

        {/* Demo banner */}
        {!isLive && (
          <div style={{ padding: '8px 20px', background: 'rgba(251,191,36,0.06)', borderBottom: '1px solid rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', gap: 7, fontSize: 12, color: '#FBBF24' }}>
            <AlertCircle size={12} /> Demo mode — configure Supabase in Settings to enable drag-and-drop
          </div>
        )}

        {/* Kanban columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', minHeight: 280, overflowX: 'auto' }}>
          {STAGES.map((stage, si) => {
            const cfg   = STAGE_CONFIG[stage]
            const items = videos.filter(v => (v.stage ?? 'idea') === stage)
            const isOver = dragOver === stage
            return (
              <div
                key={stage}
                onDragOver={e => onDragOver(e, stage)}
                onDragLeave={() => setDragOver(null)}
                onDrop={e => onDrop(e, stage)}
                style={{
                  borderRight: si < STAGES.length - 1 ? '1px solid var(--border)' : 'none',
                  background: isOver ? `${cfg.color}08` : 'transparent',
                  transition: 'background 120ms',
                }}
              >
                {/* Column header */}
                <div style={{
                  padding: '9px 12px',
                  borderBottom: '1px solid var(--border)',
                  background: cfg.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, display: 'inline-block', flexShrink: 0 }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                      {cfg.label}
                    </span>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{items.length}</span>
                </div>

                {/* Cards */}
                <div style={{ padding: '8px 7px', display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120 }}>
                  {items.map(video => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      cfg={cfg}
                      isLive={isLive}
                      onDragStart={() => onDragStart(video.id)}
                      onDelete={() => setDeleteId(video.id)}
                    />
                  ))}
                  {items.length === 0 && (
                    <div
                      style={{
                        flex: 1, minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: `1px dashed ${isOver ? cfg.color : 'var(--border)'}`,
                        borderRadius: 7, fontSize: 11, color: isOver ? cfg.color : 'var(--border-hover)',
                        transition: 'all 120ms',
                      }}
                    >
                      {isOver ? 'Drop here' : 'Empty'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Add Video Modal ── */}
      {addOpen && (
        <Modal open title="Add to Pipeline" onClose={() => { setAddOpen(false); setFormError('') }}>
          {formError && (
            <div style={{ marginBottom: 14, padding: '9px 12px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, fontSize: 13, color: '#F87171', display: 'flex', gap: 8 }}>
              <AlertCircle size={13} style={{ flexShrink: 0, marginTop: 1 }} /> {formError}
            </div>
          )}
          <FormField label="Video title" required>
            <FieldInput
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. How I built my personal OS"
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
            />
          </FormField>
          <FormField label="Notes / description">
            <FieldTextarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Angle, key points, target audience…"
              rows={2}
            />
          </FormField>
          <FormField label="Starting stage">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7 }}>
              {STAGES.map(s => {
                const c = STAGE_CONFIG[s]
                const sel = form.stage === s
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, stage: s }))}
                    style={{
                      padding: '7px 10px', borderRadius: 8,
                      border: `1.5px solid ${sel ? c.color : 'var(--border)'}`,
                      background: sel ? c.bg : 'transparent',
                      color: sel ? c.color : 'var(--text-muted)',
                      fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 120ms',
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </FormField>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
            <button className="btn btn-ghost" onClick={() => { setAddOpen(false); setFormError('') }} disabled={isPending}>Cancel</button>
            <button className="btn btn-primary" onClick={handleAdd} disabled={isPending}>
              {isPending ? 'Adding…' : 'Add to Pipeline'}
            </button>
          </div>
        </Modal>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <Modal open onClose={() => setDeleteId(null)} title="Remove from pipeline?" width={380}>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            This video will be removed from your pipeline. This cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button className="btn btn-ghost" onClick={() => setDeleteId(null)}>Cancel</button>
            <button
              className="btn"
              style={{ background: 'rgba(248,113,113,0.12)', color: '#F87171', border: '1px solid rgba(248,113,113,0.25)' }}
              onClick={() => handleDelete(deleteId!)}
              disabled={isPending}
            >
              {isPending ? 'Removing…' : 'Yes, remove'}
            </button>
          </div>
        </Modal>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}

// ── Video card (draggable) ──────────────────────────────────────────────────
function VideoCard({
  video,
  cfg,
  isLive,
  onDragStart,
  onDelete,
}: {
  video: Video
  cfg: { color: string; bg: string }
  isLive: boolean
  onDragStart: () => void
  onDelete: () => void
}) {
  return (
    <div
      draggable={isLive}
      onDragStart={onDragStart}
      className="kanban-card"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 7,
        padding: '9px 10px',
        cursor: isLive ? 'grab' : 'default',
        position: 'relative',
        userSelect: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
        {isLive && (
          <GripVertical
            size={12}
            color="var(--text-muted)"
            style={{ flexShrink: 0, marginTop: 2, opacity: 0.5 }}
          />
        )}
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45, flex: 1, minWidth: 0 }}>
          {video.title}
        </span>
        {isLive && (
          <button
            className="kanban-del"
            onClick={onDelete}
            style={{ opacity: 0, background: 'none', border: 'none', cursor: 'pointer', padding: '1px 2px', borderRadius: 3, flexShrink: 0 }}
          >
            <X size={10} color="var(--text-muted)" />
          </button>
        )}
      </div>

      {video.views != null && video.views > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 10, color: cfg.color, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          <Eye size={9} /> {(video.views / 1000).toFixed(1)}k views
        </div>
      )}

      {video.published_at && !video.views && (
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 5, fontFamily: 'var(--font-mono)' }}>
          {typeof video.published_at === 'string' && video.published_at.includes('T')
            ? new Date(video.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : video.published_at}
        </div>
      )}

      <style>{`.kanban-card:hover .kanban-del { opacity: 1 !important; } .kanban-card:active { cursor: grabbing; opacity: 0.8; }`}</style>
    </div>
  )
}
