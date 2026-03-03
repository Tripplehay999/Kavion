'use client'

import { useState, useRef, useCallback, useEffect, useTransition, useMemo } from 'react'
import {
  GripVertical, Plus, Trash2,
  Type, Heading1, Heading2, CheckSquare, List, ListOrdered,
  Code2, Minus, Lightbulb, Quote as QuoteIcon,
} from 'lucide-react'
import { addBlock, updateBlock, deleteBlock, reorderBlocks } from '@/app/actions/workspace'
import type { Block, BlockType, BlockLanguage } from '@/app/actions/workspace'
import CodeRunner from './CodeRunner'

const BLOCK_TYPES: { type: BlockType; icon: React.ElementType; label: string }[] = [
  { type: 'text',     icon: Type,         label: 'Text'      },
  { type: 'h1',       icon: Heading1,     label: 'Heading 1' },
  { type: 'h2',       icon: Heading2,     label: 'Heading 2' },
  { type: 'todo',     icon: CheckSquare,  label: 'To-do'     },
  { type: 'bullet',   icon: List,         label: 'Bullet'    },
  { type: 'numbered', icon: ListOrdered,  label: 'Numbered'  },
  { type: 'code',     icon: Code2,        label: 'Code'      },
  { type: 'divider',  icon: Minus,        label: 'Divider'   },
  { type: 'callout',  icon: Lightbulb,    label: 'Callout'   },
  { type: 'quote',    icon: QuoteIcon,    label: 'Quote'     },
]

export default function WorkspaceClient({
  initialBlocks,
  isLive,
}: {
  initialBlocks: Block[]
  isLive: boolean
}) {
  const [blocks, setBlocks]     = useState<Block[]>(initialBlocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [pickerIdx, setPickerIdx] = useState(0)
  const [dragOver, setDragOver]   = useState<string | null>(null)

  const dragId       = useRef<string | null>(null)
  const saveTimers   = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const textareaRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})
  const blocksRef    = useRef<Block[]>(blocks)
  const [, startTransition] = useTransition()

  useEffect(() => { blocksRef.current = blocks }, [blocks])

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }

  const scheduleSave = useCallback((id: string, patch: { content?: string; checked?: boolean; language?: BlockLanguage; type?: BlockType }) => {
    if (!isLive) return
    clearTimeout(saveTimers.current[id])
    saveTimers.current[id] = setTimeout(() => {
      startTransition(async () => { try { await updateBlock(id, patch) } catch {} })
    }, 600)
  }, [isLive])

  const flushSave = useCallback((id: string, patch: { content?: string }) => {
    if (!isLive) return
    clearTimeout(saveTimers.current[id])
    startTransition(async () => { try { await updateBlock(id, patch) } catch {} })
  }, [isLive])

  const handleContentChange = useCallback((id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b))
    scheduleSave(id, { content })
    const el = textareaRefs.current[id]
    if (el) autoResize(el)
  }, [scheduleSave])

  const handleAddBlock = useCallback((afterId: string, type: BlockType = 'text') => {
    if (!isLive) return
    startTransition(async () => {
      try {
        const newBlock = await addBlock(type)
        const current = blocksRef.current
        const idx = current.findIndex(b => b.id === afterId)
        const next = [...current]
        next.splice(idx === -1 ? next.length : idx + 1, 0, newBlock)
        setBlocks(next)
        reorderBlocks(next.map(b => b.id)).catch(() => {})
        setTimeout(() => {
          const el = textareaRefs.current[newBlock.id]
          if (el) { el.focus(); autoResize(el) }
        }, 50)
      } catch {}
    })
  }, [isLive])

  const handleDeleteBlock = useCallback((id: string) => {
    if (!isLive) return
    const current = blocksRef.current
    const idx = current.findIndex(b => b.id === id)
    const prevBlock = current[idx - 1]
    clearTimeout(saveTimers.current[id])
    setBlocks(prev => prev.filter(b => b.id !== id))
    if (prevBlock) {
      setTimeout(() => {
        const el = textareaRefs.current[prevBlock.id]
        if (el) { el.focus(); el.selectionStart = el.selectionEnd = el.value.length }
      }, 20)
    }
    startTransition(async () => { try { await deleteBlock(id) } catch {} })
  }, [isLive])

  const handleToggle = useCallback((id: string, checked: boolean) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, checked } : b))
    if (isLive) startTransition(async () => { try { await updateBlock(id, { checked }) } catch {} })
  }, [isLive])

  const handleChangeType = useCallback((id: string, type: BlockType) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, type } : b))
    setPickerFor(null)
    if (isLive) startTransition(async () => { try { await updateBlock(id, { type }) } catch {} })
    setTimeout(() => textareaRefs.current[id]?.focus(), 20)
  }, [isLive])

  const handleLanguageChange = useCallback((id: string, language: BlockLanguage) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, language } : b))
    if (isLive) startTransition(async () => { try { await updateBlock(id, { language }) } catch {} })
  }, [isLive])

  // Pre-compute numbered-block indices (1-based) for the whole list
  const numberedIdx = useMemo(() => {
    let n = 0
    const map: Record<string, number> = {}
    blocks.forEach(b => { if (b.type === 'numbered') map[b.id] = ++n })
    return map
  }, [blocks])

  // Inline handlers (recreated each render so they always capture fresh state)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>, block: Block) => {
    // Picker navigation
    if (pickerFor === block.id) {
      if (e.key === 'Escape')    { e.preventDefault(); setPickerFor(null); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setPickerIdx(i => Math.min(i + 1, BLOCK_TYPES.length - 1)); return }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setPickerIdx(i => Math.max(i - 1, 0)); return }
      if (e.key === 'Enter') {
        e.preventDefault()
        const chosen = BLOCK_TYPES[pickerIdx]
        if (chosen) { handleChangeType(block.id, chosen.type); handleContentChange(block.id, '') }
        return
      }
    }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddBlock(block.id); return }
    if (e.key === 'Backspace' && block.content === '' && blocks.length > 1) {
      e.preventDefault(); handleDeleteBlock(block.id); return
    }
    if (e.key === 'Tab') {
      e.preventDefault()
      const t = e.currentTarget
      const s = t.selectionStart, en = t.selectionEnd
      const val = t.value.slice(0, s) + '  ' + t.value.slice(en)
      handleContentChange(block.id, val)
      requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = s + 2 })
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>, blockId: string) => {
    const val = e.target.value
    handleContentChange(blockId, val)
    if (val.startsWith('/') && val.length <= 20) {
      setPickerFor(blockId); setPickerIdx(0)
    } else if (pickerFor === blockId && !val.startsWith('/')) {
      setPickerFor(null)
    }
  }

  // HTML5 DnD (matches YoutubeKanban pattern)
  const onDragStart = (blockId: string) => { dragId.current = blockId }
  const onDragOver  = (e: React.DragEvent, blockId: string) => { e.preventDefault(); setDragOver(blockId) }
  const onDragLeave = () => setDragOver(null)
  const onDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    setDragOver(null)
    const id = dragId.current
    dragId.current = null
    if (!id || id === targetId) return
    const current = blocksRef.current
    const from = current.findIndex(b => b.id === id)
    const to   = current.findIndex(b => b.id === targetId)
    if (from === -1 || to === -1) return
    const next = [...current]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setBlocks(next)
    if (isLive) reorderBlocks(next.map(b => b.id)).catch(() => {})
  }

  // Resize all textareas after mount
  useEffect(() => {
    Object.values(textareaRefs.current).forEach(el => { if (el) autoResize(el) })
  }, [])

  return (
    <div>
      {blocks.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '60px 20px', fontSize: 14 }}>
          {isLive
            ? <>Click <strong style={{ color: 'var(--text-secondary)' }}>New block</strong> below to get started.</>
            : 'Configure Supabase to start adding blocks.'}
        </div>
      )}

      {blocks.map(block => {
        const isDivider = block.type === 'divider'
        const isCode    = block.type === 'code'
        const isCallout = block.type === 'callout'
        const isQuote   = block.type === 'quote'

        return (
          <div
            key={block.id}
            className={`workspace-block${dragOver === block.id ? ' drag-over' : ''}`}
            draggable
            onDragStart={() => onDragStart(block.id)}
            onDragOver={e  => onDragOver(e, block.id)}
            onDragLeave={onDragLeave}
            onDrop={e      => onDrop(e, block.id)}
          >
            {/* Drag handle */}
            <div className="block-handle">
              <GripVertical size={14} />
            </div>

            {/* Content area */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {isDivider ? (
                <div style={{ borderTop: '1px solid var(--border)', margin: '8px 0' }} />
              ) : isCode ? (
                <CodeRunner
                  code={block.content}
                  language={block.language}
                  onCodeChange={code => handleContentChange(block.id, code)}
                  onLanguageChange={lang => handleLanguageChange(block.id, lang)}
                />
              ) : (
                <div className={isCallout ? 'block-callout-wrap' : isQuote ? 'block-quote-wrap' : ''}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                    {block.type === 'todo' && (
                      <input
                        type="checkbox"
                        checked={block.checked}
                        onChange={e => handleToggle(block.id, e.target.checked)}
                        style={{ marginTop: 5, flexShrink: 0, accentColor: '#8B5CF6', cursor: 'pointer', width: 14, height: 14 }}
                      />
                    )}
                    {block.type === 'bullet' && (
                      <span style={{ color: 'var(--text-secondary)', marginTop: 3, flexShrink: 0, fontSize: 16, lineHeight: '1.4' }}>•</span>
                    )}
                    {block.type === 'numbered' && (
                      <span style={{ color: 'var(--text-muted)', marginTop: 3, flexShrink: 0, fontSize: 13, lineHeight: '1.6', minWidth: 18 }}>
                        {numberedIdx[block.id]}.
                      </span>
                    )}
                    {isCallout && (
                      <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>💡</span>
                    )}
                    <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                      <textarea
                        ref={el => { textareaRefs.current[block.id] = el }}
                        className={`block-content-area block-${block.type}${block.checked ? ' block-todo-done' : ''}`}
                        value={block.content}
                        onChange={e => handleInput(e, block.id)}
                        onKeyDown={e => handleKeyDown(e, block)}
                        onFocus={() => setActiveId(block.id)}
                        onBlur={() => {
                          setActiveId(null)
                          const b = blocksRef.current.find(x => x.id === block.id)
                          if (b) flushSave(b.id, { content: b.content })
                          // Small delay lets picker onMouseDown fire before we close it
                          setTimeout(() => { if (pickerFor === block.id) setPickerFor(null) }, 150)
                        }}
                        placeholder={getPlaceholder(block.type)}
                        rows={1}
                        spellCheck={false}
                        autoComplete="off"
                      />
                      {pickerFor === block.id && (
                        <div className="block-type-picker">
                          {BLOCK_TYPES.map((bt, i) => (
                            <button
                              key={bt.type}
                              className={`block-type-option${pickerIdx === i ? ' selected' : ''}`}
                              onMouseDown={e => {
                                e.preventDefault()
                                handleChangeType(block.id, bt.type)
                                handleContentChange(block.id, '')
                              }}
                            >
                              <bt.icon size={13} />
                              <span>{bt.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Row actions — visible on hover via CSS */}
            {isLive && (
              <div className="block-actions">
                <button className="block-action-btn" onClick={() => handleAddBlock(block.id)} title="Add block below">
                  <Plus size={12} />
                </button>
                <button className="block-action-btn" onClick={() => handleDeleteBlock(block.id)} title="Delete block">
                  <Trash2 size={12} />
                </button>
              </div>
            )}
          </div>
        )
      })}

      {isLive && (
        <button
          className="add-block-btn"
          onClick={() => handleAddBlock(blocks[blocks.length - 1]?.id ?? '')}
        >
          <Plus size={13} /> New block
        </button>
      )}
    </div>
  )
}

function getPlaceholder(type: BlockType): string {
  switch (type) {
    case 'h1':       return 'Heading 1'
    case 'h2':       return 'Heading 2'
    case 'todo':     return 'To-do item'
    case 'bullet':   return 'List item'
    case 'numbered': return 'List item'
    case 'callout':  return 'Note or highlight...'
    case 'quote':    return 'Quote...'
    default:         return "Type '/' for commands, or just start writing..."
  }
}
