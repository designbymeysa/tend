import type { ReactNode } from 'react'
import { IconCheck } from './Icons'
export function Sheet({ children, onClose, label, full }: { children: ReactNode; onClose: () => void; label: string; full?: boolean }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className={`sheet ${full ? 'sheet-full' : ''}`} role="dialog" aria-modal="true" aria-label={label} onClick={(e) => e.stopPropagation()}>
        <i className="grab" />{children}
      </div>
    </div>
  )
}
export function SheetHeader({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="sheet-head">
      <span className="label-mono" style={{ color: 'var(--accent-text,#1b1a19)' }}>{eyebrow}</span>
      <h2>{title}</h2>
      {sub && <p className="footnote" style={{ color: 'var(--text-secondary)' }}>{sub}</p>}
    </div>
  )
}
export function OptionRow({ icon, title, sub, selected, onClick }: { icon: ReactNode; title: string; sub: string; selected: boolean; onClick: () => void }) {
  return (
    <button className={`option ${selected ? 'sel' : ''}`} role="radio" aria-checked={selected} onClick={onClick}>
      <span className="opt-icon">{icon}</span>
      <span className="opt-text"><b>{title}</b><small>{sub}</small></span>
      <span className="radio">{selected && <IconCheck size={14} color="#fff" />}</span>
    </button>
  )
}
