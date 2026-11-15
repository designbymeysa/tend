import type { CSSProperties, ReactNode } from 'react'
import { Group, Task, effortLabel } from '../state/store'
import { Doodle, IconBook, IconBriefcase, IconCalendar, IconCheck, IconClock, IconHeart, IconSparkle } from './Icons'

export const groupVar = (g: Group) => ({ bg: `var(--group-${g}-bg)`, strong: `var(--group-${g}-strong)`, text: `var(--group-${g}-text)` })
const groupIcon = { work: IconBriefcase, study: IconBook, personal: IconHeart, lifestyle: IconSparkle }

export function EffortChip({ label }: { label: string }) {
  return <span className="chip"><IconClock size={14} /><span className="label-mono">{label}</span></span>
}
export function DateTag({ label }: { label: string }) {
  return <span className="chip"><IconCalendar size={14} /><span className="label-mono">{label}</span></span>
}
export function ProfileButton({ onClick }: { onClick?: () => void }) {
  return <button className="avatar" onClick={onClick} aria-label="Profile and settings">M</button>
}

type CardProps = { task: Task; onToggle?: () => void; onOpen?: () => void; meta?: ReactNode; label?: string }
export function TaskCard({ task, onToggle, onOpen, meta, label }: CardProps) {
  const g = groupVar(task.group); const Icon = groupIcon[task.group]
  const done = task.status === 'done', focus = task.status === 'in-focus', decision = task.status === 'decision'
  const style: CSSProperties = done ? {} : focus ? { background: g.strong } : decision ? {} : { background: g.bg }
  return (
    <div className={`card ${done ? 'card-done' : ''} ${decision ? 'card-decision' : ''} ${focus ? 'card-focus' : ''}`} style={style} onClick={onOpen} role={onOpen ? 'button' : undefined}>
      <button className={`card-icon ${done ? 'is-done' : ''}`} style={decision ? { background: 'var(--task-past-icon-bg)' } : undefined}
        onClick={(e) => { e.stopPropagation(); onToggle?.() }} aria-label={done ? 'Mark as not done' : 'Mark as done'} aria-pressed={done}>
        {done ? <IconCheck size={20} color="#fff" /> : <Icon size={20} />}
      </button>
      <div className="card-body">
        {label && <span className="label-mono" style={{ color: 'var(--accent-text,#1b1a19)' }}>{label}</span>}
        <p className={`card-title ${done ? 'struck' : ''}`}>{task.title}</p>
        <div className="meta">{meta ?? <EffortChip label={effortLabel(task.effort)} />}</div>
      </div>
      {!done && !decision && <span className="doodle"><Doodle color={focus ? 'rgba(27,26,25,.55)' : g.text} /></span>}
    </div>
  )
}

export function ViewSwitch({ value, onChange }: { value: 'focus' | 'timeline'; onChange: (v: 'focus' | 'timeline') => void }) {
  return (
    <div className="viewswitch" role="tablist" aria-label="Today view">
      {(['focus', 'timeline'] as const).map((v) => (
        <button key={v} role="tab" aria-selected={value === v} className={value === v ? 'on' : ''} onClick={() => onChange(v)}>{v === 'focus' ? 'Focus' : 'Timeline'}</button>
      ))}
    </div>
  )
}

export function DayPill({ day, date, planned, selected, onClick }: { day: string; date: number; planned?: boolean; selected?: boolean; onClick?: () => void }) {
  return (
    <button className={`daypill ${selected ? 'sel' : ''}`} onClick={onClick} aria-pressed={selected}>
      <span className="label-mono-sm">{day}</span><span className="callout">{date}</span>
      {(planned || selected) && <i className="dot" />}
    </button>
  )
}

export function CapacityBar({ used, total, fmt }: { used: number; total: number; fmt: (m: number) => string }) {
  const over = used > total
  return (
    <div className="capacity">
      <div className="cap-head"><span className="headline">Today's capacity</span><span className="callout">{fmt(used)} of {fmt(total)}</span></div>
      <div className="track"><div className="fill" style={{ width: `${Math.min(100, (used / total) * 100)}%` }} /></div>
      <p className="footnote" style={{ color: 'var(--text-secondary)' }}>
        {over ? 'That is more than fits today. Want to move one for later?' : `${fmt(total - used)} free for whatever comes up`}
      </p>
    </div>
  )
}

export function SectionHeader({ title, aside, mono }: { title: string; aside?: string; mono?: boolean }) {
  return (
    <div className="sec-head">
      {mono ? <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>{title}</span> : <span className="headline">{title}</span>}
      {aside && <span className="footnote" style={{ color: 'var(--text-muted)' }}>{aside}</span>}
    </div>
  )
}
