import type { CSSProperties, ReactNode } from 'react'
import { Group, Task, effortLabel } from '../state/store'
import { Doodle, IconBook, IconBriefcase, IconCalendar, IconCheck, IconChevronLeft, IconChevronRight, IconClock, IconFlag, IconHeart, IconList, IconPencil, IconPlus, IconSparkle } from './Icons'

export const groupVar = (g: Group) => g === 'none' ? { bg: 'var(--bg-surface-muted)', strong: 'var(--task-past-icon-bg)', text: 'var(--text-secondary)' } : ({ bg: `var(--group-${g}-bg)`, strong: `var(--group-${g}-strong)`, text: `var(--group-${g}-text)` })
const groupIcon = { none: IconList, work: IconBriefcase, study: IconBook, personal: IconHeart, lifestyle: IconSparkle }

export function EffortChip({ label }: { label: string }) {
  return <span className="chip"><IconClock size={14} /><span className="label-mono">{label}</span></span>
}
export function DateTag({ label }: { label: string }) {
  return <span className="chip"><IconCalendar size={14} /><span className="label-mono">{label}</span></span>
}
export function DeadlineTag({ label }: { label: string }) {
  return <span className="chip chip-deadline"><IconFlag size={14} color="#fff" /><span className="label-mono">{label}</span></span>
}
export function ProfileButton({ onClick }: { onClick?: () => void }) {
  return <button className="avatar" onClick={onClick} aria-label="Profile and settings">M</button>
}

export function TaskMeta({ task }: { task: Task }) {
  return (<>
    <EffortChip label={effortLabel(task.effort)} />
    {task.due && <DeadlineTag label={`DUE ${task.due}`} />}
    {task.plannedFor && <DateTag label={`${task.status === 'decision' ? 'PLANNED FOR' : 'PLANNED'} ${task.plannedFor}`} />}
  </>)
}
export function PageHeader({ title, sub, onProfile }: { title: string; sub?: string; onProfile: () => void }) {
  return <header className="header"><div className="top-right"><ProfileButton onClick={onProfile} /></div><h1>{title}</h1>{sub && <p className="sub">{sub}</p>}</header>
}
export const GROUP_LABEL: Record<Group, string> = { none: 'No group', work: 'Work', study: 'Study', personal: 'Personal', lifestyle: 'Lifestyle' }
export function Sticky({ group, tag, text, style }: { group: Exclude<Group, 'none'>; tag: string; text: string; style: CSSProperties }) {
  const g = groupVar(group)
  return <div className="sticky" style={{ ['--sb' as string]: g.bg, ['--ss' as string]: g.strong, ['--st' as string]: g.text, ...style }}><span className="tag label-mono-sm">{tag}</span>{text}</div>
}
export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button className="toggle" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />
}
export function SettingsRow({ label, helper, value, toggle, onClick }: { label: string; helper?: string; value?: string; toggle?: { on: boolean; onChange: (v: boolean) => void }; onClick?: () => void }) {
  const text = <span className="srow-text"><span className="callout">{label}</span>{helper && <span className="footnote" style={{ color: 'var(--text-secondary)' }}>{helper}</span>}</span>
  if (toggle) return <div className="srow">{text}<Toggle on={toggle.on} onChange={toggle.onChange} label={label} /></div>
  return <button className="srow" onClick={onClick}>{text}{value && <><span className="label-mono" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{value}</span><IconChevronRight size={20} /></>}</button>
}
export function TopBar({ label, onBack }: { label: string; onBack: () => void }) {
  return <div className="topbar"><button className="back" onClick={onBack}><IconChevronLeft size={24} />{label}</button></div>
}
export function GroupChips({ selected, custom, onToggle, onCustom }: { selected?: Group[]; custom?: boolean; onToggle?: (g: Group) => void; onCustom?: () => void }) {
  const items: [Group, string][] = [['work', 'Work'], ['study', 'Study'], ['personal', 'Personal'], ['lifestyle', 'Habits']]
  return (
    <div className="gchips">
      {items.map(([g, label]) => { const on = !!selected?.includes(g); return (
        <button key={g} className={`gc ${on ? 'on' : ''}`} aria-pressed={selected ? on : undefined} style={{ ['--gb' as string]: `var(--group-${g}-bg)`, ['--gs' as string]: `var(--group-${g}-strong)` }} onClick={() => onToggle?.(g)}>
          {on && <IconCheck size={14} />}{label}
        </button>) })}
      <button className={`gc ${custom ? 'on' : 'custom'}`} aria-pressed={selected ? !!custom : undefined} style={{ ['--gs' as string]: 'var(--group-work-strong)' }} onClick={onCustom}>{custom ? <IconCheck size={14} /> : <IconPlus size={14} />}Custom</button>
    </div>
  )
}
export const capacityNote = (m: number) => m <= 120 ? 'A little room · go easy' : m <= 300 ? 'Some room · a balanced day' : 'Plenty of room · a full day'
export function CapacitySlider({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const p = (value - 60) / 420, pos = `calc(4px + ${p} * (100% - 8px))`
  const h = value / 60
  return (
    <div className="cap-card">
      <div className="readout"><b>{Number.isInteger(h) ? `${h}h` : `${Math.floor(h)}h 30m`}</b><span className="callout" style={{ color: 'var(--text-secondary)' }}>{capacityNote(value)}</span></div>
      <div className="slider">
        <i className="trk" /><i className="fl" style={{ width: pos }} />
        {Array.from({ length: 8 }, (_, i) => <i key={i} className={`tk ${(i + 1) * 60 <= value ? 'on' : ''}`} style={{ left: `calc(2px + ${i / 7} * (100% - 8px))` }} />)}
        <i className="th" style={{ left: pos }} />
        <input type="range" min={60} max={480} step={30} value={value} onChange={(e) => onChange(+e.target.value)} aria-label="Focus hours per day" aria-valuetext={`${h} hours`} />
      </div>
      <div className="scale label-mono-sm"><span>1H · A LITTLE</span><span>8H · PLENTY</span></div>
    </div>
  )
}

type CardProps = { task: Task; onToggle?: () => void; onOpen?: () => void; meta?: ReactNode; label?: string }
export function TaskCard({ task, onToggle, onOpen, meta, label }: CardProps) {
  const g = groupVar(task.group); const Icon = groupIcon[task.group]
  const done = task.status === 'done', focus = task.status === 'in-focus', decision = task.status === 'decision'
  const plain = task.group === 'none' && !done && !decision && !focus
  const style: CSSProperties = done || plain ? {} : focus ? { background: g.strong } : decision ? {} : { background: g.bg }
  return (
    <div className={`card ${done ? 'card-done' : ''} ${decision ? 'card-decision' : ''} ${focus ? 'card-focus' : ''} ${plain ? 'card-plain' : ''}`} style={style} onClick={onOpen} role={onOpen ? 'button' : undefined}>
      <button className={`card-icon ${done ? 'is-done' : ''}`} style={decision || plain ? { background: 'var(--task-past-icon-bg)' } : undefined}
        onClick={(e) => { e.stopPropagation(); onToggle?.() }} aria-label={done ? 'Mark as not done' : 'Mark as done'} aria-pressed={done}>
        {done ? <IconCheck size={20} color="#fff" /> : <Icon size={20} />}
      </button>
      <div className="card-body">
        {label && <span className="label-mono" style={{ color: 'var(--accent-text,#1b1a19)' }}>{label}</span>}
        <p className={`card-title ${done ? 'struck' : ''}`}>{task.title}</p>
        <div className="meta">{meta ?? <TaskMeta task={task} />}</div>
      </div>
      {!done && !decision && !plain && <span className="doodle"><Doodle color={focus ? 'rgba(27,26,25,.55)' : g.text} /></span>}
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

export function CapacityBar({ used, total, fmt, onEdit }: { used: number; total: number; fmt: (m: number) => string; onEdit?: () => void }) {
  const over = used > total
  return (
    <div className="capacity">
      <div className="cap-head"><span className="headline">Today's capacity</span>
        {onEdit ? <button className="cap-edit callout" onClick={onEdit} aria-label={`Change today's capacity, now ${fmt(used)} of ${fmt(total)}`}>{fmt(used)} of {fmt(total)}<IconPencil size={16} /></button> : <span className="callout">{fmt(used)} of {fmt(total)}</span>}</div>
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
