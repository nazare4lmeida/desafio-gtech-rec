import { useRef, useState, useEffect } from 'react'

interface CodeEditorProps {
  value: string
  onChange: (v: string) => void
  onBlockAttempt: () => void
}

export default function CodeEditor({ value, onChange, onBlockAttempt }: CodeEditorProps) {
  const taRef = useRef<HTMLTextAreaElement>(null)
  const [lineCount, setLineCount] = useState(3)

  useEffect(() => {
    setLineCount(Math.max(value.split('\n').length, 3))
  }, [value])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const blocked = (e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())
    if (blocked) { e.preventDefault(); onBlockAttempt(); return }
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = taRef.current!
      const s = ta.selectionStart
      const newVal = value.slice(0, s) + '  ' + value.slice(ta.selectionEnd)
      onChange(newVal)
      requestAnimationFrame(() => { ta.selectionStart = ta.selectionEnd = s + 2 })
    }
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#30363d] font-mono" style={{ background: '#0d1117' }}>
      {/* Topbar */}
      <div className="flex items-center gap-2 px-3.5 py-2 border-b border-[#30363d]" style={{ background: '#161b22' }}>
        <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
        <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        <span className="text-[.7rem] text-[#8b949e] ml-2">solucao.js</span>
      </div>

      {/* Body */}
      <div className="flex">
        {/* Line numbers */}
        <div
          className="px-2.5 py-3 text-right text-[.78rem] leading-[1.72] select-none border-r border-[#30363d] min-w-[38px]"
          style={{ background: '#161b22', color: '#484f58' }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          ref={taRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onContextMenu={e => { e.preventDefault(); onBlockAttempt() }}
          spellCheck={false}
          placeholder={'// Escreva aqui...\nfunction somaArray(arr) {\n  // seu código\n}'}
          className="code-textarea"
        />
      </div>
    </div>
  )
}
