'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Play, Trash2, Square } from 'lucide-react'

interface OutputLine { text: string; type: 'log' | 'error' | 'info' }

interface Props {
  code: string
  language: 'javascript' | 'html'
  onCodeChange: (v: string) => void
  onLanguageChange: (l: 'javascript' | 'html') => void
}

export default function CodeRunner({ code, language, onCodeChange, onLanguageChange }: Props) {
  const [output, setOutput]   = useState<OutputLine[]>([])
  const [running, setRunning] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const outputRef = useRef<HTMLDivElement>(null)

  // Listen for messages from iframe sandbox
  const handleMessage = useCallback((e: MessageEvent) => {
    if (!e.data || typeof e.data !== 'object') return
    const { type, msg } = e.data as { type: string; msg: string }
    if (type === 'log')   setOutput(p => [...p, { text: msg, type: 'log'   }])
    if (type === 'error') setOutput(p => [...p, { text: msg, type: 'error' }])
    if (type === 'done')  setRunning(false)
  }, [])

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Auto-scroll output
  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight
  }, [output])

  const run = () => {
    setOutput([])
    setRunning(true)

    if (!iframeRef.current) return

    if (language === 'html') {
      // HTML mode — just render the HTML
      iframeRef.current.srcdoc = code
      setRunning(false)
      return
    }

    // JavaScript mode — sandboxed execution, capture console.log
    const escaped = code
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$')

    iframeRef.current.srcdoc = `<!DOCTYPE html><html><head><script>
(function() {
  const _toStr = (a) => {
    try {
      return typeof a === 'object' && a !== null ? JSON.stringify(a, null, 2) : String(a)
    } catch { return String(a) }
  }
  console.log = (...args) => parent.postMessage({ type: 'log', msg: args.map(_toStr).join(' ') }, '*')
  console.error = (...args) => parent.postMessage({ type: 'error', msg: args.map(_toStr).join(' ') }, '*')
  console.warn = (...args) => parent.postMessage({ type: 'log', msg: '⚠ ' + args.map(_toStr).join(' ') }, '*')
  window.onerror = (msg, _src, line) => {
    parent.postMessage({ type: 'error', msg: msg + (line ? ' (line ' + line + ')' : '') }, '*')
    return true
  }
  window.addEventListener('load', () => {
    try {
      ;(function() { \`${escaped}\` })
      // Actually eval the code
      const fn = new Function(\`${escaped}\`)
      fn()
    } catch(e) {
      parent.postMessage({ type: 'error', msg: e.toString() }, '*')
    }
    parent.postMessage({ type: 'done' }, '*')
  })
})()
<\/script></head><body></body></html>`
  }

  const clear = () => {
    setOutput([])
    if (iframeRef.current) iframeRef.current.srcdoc = ''
  }

  const isHtml = language === 'html'

  return (
    <div className="code-runner">
      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderBottom: '1px solid var(--border)', background: 'rgba(0,0,0,0.2)' }}>
        {/* Language tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 6, padding: 2, gap: 2 }}>
          {(['javascript', 'html'] as const).map(lang => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              style={{
                padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                fontFamily: 'var(--font-mono)', transition: 'all 120ms',
                background: language === lang ? 'rgba(139,92,246,0.35)' : 'transparent',
                color: language === lang ? '#C4B5FD' : 'var(--text-muted)',
              }}
            >
              {lang === 'javascript' ? 'JS' : 'HTML'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {output.length > 0 && (
          <button onClick={clear} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '3px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
            <Trash2 size={11} /> Clear
          </button>
        )}
        <button
          onClick={running ? clear : run}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '5px 12px', borderRadius: 6, border: 'none', cursor: 'pointer',
            background: running ? 'rgba(248,113,113,0.15)' : 'rgba(139,92,246,0.2)',
            color: running ? '#FCA5A5' : '#C4B5FD',
            fontSize: 12, fontWeight: 600, transition: 'all 120ms',
          }}
        >
          {running ? <><Square size={11} /> Stop</> : <><Play size={11} /> Run</>}
        </button>
      </div>

      {/* Code textarea */}
      <textarea
        className="code-editor"
        value={code}
        onChange={e => onCodeChange(e.target.value)}
        placeholder={isHtml ? '<!-- Write your HTML here -->' : '// Write JavaScript here\nconsole.log("Hello!")'}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        style={{ minHeight: isHtml && output.length > 0 ? 120 : 120 }}
        onKeyDown={e => {
          // Tab key inserts spaces
          if (e.key === 'Tab') {
            e.preventDefault()
            const t = e.currentTarget
            const start = t.selectionStart
            const end = t.selectionEnd
            const newVal = t.value.substring(0, start) + '  ' + t.value.substring(end)
            onCodeChange(newVal)
            requestAnimationFrame(() => { t.selectionStart = t.selectionEnd = start + 2 })
          }
        }}
      />

      {/* Output panel (JS) or Preview (HTML) */}
      {isHtml ? (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ padding: '6px 12px', fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', background: 'rgba(0,0,0,0.2)' }}>
            Preview
          </div>
          <iframe
            ref={iframeRef}
            style={{ width: '100%', height: 200, border: 'none', background: '#fff' }}
            sandbox="allow-scripts"
            title="HTML Preview"
          />
        </div>
      ) : (
        <>
          <iframe ref={iframeRef} style={{ display: 'none' }} sandbox="allow-scripts" title="JS Sandbox" />
          {output.length > 0 && (
            <div className="code-output" ref={outputRef}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Output</div>
              {output.map((line, i) => (
                <div key={i} className={line.type === 'error' ? 'code-output-error' : 'code-output-log'} style={{ marginBottom: 2, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {line.type === 'error' ? '✗ ' : '› '}{line.text}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
