import { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetHeader, OptionRow } from './Sheet'
import { IconCheck, IconContinue, IconFlag, IconLaptop, IconPause, IconPlay, IconPlus, IconRelease, IconRescope, IconSparkle, IconSplit, IconCalendar, IconList, IconBriefcase, IconBook, IconHeart, IconChevronDown } from './Icons'
import { CapacityBar, CapacitySlider, DayPicker, GROUP_LABEL } from './ui'
import { Choice, Group, Task, addDays, capacityFor, dayLabel, dayName, effortLabel, fmtDur, statusOf, todayIso, usedOn, useTend } from '../state/store'

const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const dayOffset = (word: string) => { const i = WD.indexOf(word.slice(0, 3).toLowerCase()); return (i - new Date().getDay() + 7) % 7 || 7 }
const EFFORT_RE = /~?\s*(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins)\b/i

/** Reads effort, planned day and deadline out of free text like "Slides for client tmrw ~2h due fri". */
export function parseCapture(text: string) {
  let effort: number | undefined, planned: string | undefined, due: string | undefined
  const T = todayIso()
  const e = text.match(EFFORT_RE)
  if (e) { const n = parseFloat(e[1]); effort = /^h/i.test(e[2]) ? Math.round(n * 60) : Math.round(n) }
  const dm = text.match(/\b(?:due|by)\s+(mon|tue|wed|thu|fri|sat|sun|today|tmrw|tomorrow)[a-z]*/i)
  if (dm) due = /^tod/i.test(dm[1]) ? T : /^(tmrw|tom)/i.test(dm[1]) ? addDays(T, 1) : addDays(T, dayOffset(dm[1]))
  const clean = text.replace(/\b(?:due|by)\s+[a-z]+/gi, '')
  if (/\b(tmrw|tomorrow)\b/i.test(clean)) planned = addDays(T, 1)
  else if (/\btoday\b/i.test(clean)) planned = T
  else { const w = clean.match(/\b(mon|tue|wed|thu|fri|sat|sun)(day|sday|nesday|rsday|urday)?\b/i); if (w) planned = addDays(T, dayOffset(w[1])) }
  const title = clean.replace(EFFORT_RE, '').replace(/\b(tmrw|tomorrow|today)\b/i, '').replace(/\b(?:on\s+)?(mon|tue|wed|thu|fri|sat|sun)(day|sday|nesday|rsday|urday)?\b/i, '').replace(/\s+/g, ' ').trim()
  return { effort, planned, due, title }
}

const GROUPS: { id: Group; label: string; icon: JSX.Element }[] = [
  { id: 'none', label: 'No group', icon: <IconList size={16} /> },
  { id: 'work', label: 'Work', icon: <IconBriefcase size={16} /> },
  { id: 'study', label: 'Study', icon: <IconBook size={16} /> },
  { id: 'personal', label: 'Personal', icon: <IconHeart size={16} /> },
  { id: 'lifestyle', label: 'Lifestyle', icon: <IconSparkle size={16} /> },
]
function GroupPicker({ value, onChange }: { value: Group; onChange: (g: Group) => void }) {
  return (
    <div className="chips" role="radiogroup" aria-label="Group">
      {GROUPS.map((g) => (
        <button key={g.id} type="button" role="radio" aria-checked={value === g.id} className={`gchip ${value === g.id ? 'on' : ''}`} style={{ ['--gs' as string]: g.id === 'none' ? 'var(--task-past-icon-bg)' : `var(--group-${g.id}-strong)`, ['--gb' as string]: g.id === 'none' ? 'var(--bg-surface-muted)' : `var(--group-${g.id}-bg)` }} onClick={() => onChange(g.id)}>
          {value === g.id ? <IconCheck size={16} /> : g.icon}<span>{g.label}</span>
        </button>
      ))}
    </div>
  )
}
const EFFORTS = [15, 30, 45, 60, 90, 120]
function EffortPicker({ value, onChange }: { value: number; onChange: (m: number) => void }) {
  const list = EFFORTS.includes(value) ? EFFORTS : [...EFFORTS, value].sort((a, b) => a - b)
  return <div className="chips" role="radiogroup" aria-label="Effort">{list.map((m) => <button key={m} type="button" role="radio" aria-checked={value === m} className={`pchip label-mono ${value === m ? 'on' : ''}`} onClick={() => onChange(m)}>{effortLabel(m)}</button>)}</div>
}
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => <div className="understood"><span className="label-mono-sm muted">{label}</span>{children}</div>

/** New task. `day` pre-selects the planned day (e.g. when adding from a future day). */
export function CaptureSheet({ onClose, day, onAdded }: { onClose: () => void; day?: string; onAdded?: (t: Task) => void }) {
  const addTask = useTend((s) => s.addTask)
  const [text, setText] = useState('')
  const [group, setGroup] = useState<Group>('none')
  const [when, setWhen] = useState<{ v?: string } | null>(day ? { v: day } : null) // null = follow what was typed
  const p = useMemo(() => parseCapture(text), [text])
  const date = when ? when.v : p.planned
  const add = () => {
    if (!text.trim()) return
    const t = addTask({ title: p.title || text.trim(), group, effort: p.effort ?? 30, date, due: p.due })
    onClose(); onAdded?.(t)
  }
  return (
    <Sheet onClose={onClose} label="Capture a task">
      <SheetHeader eyebrow="NEW TASK" title="What's on your mind?" sub="Just type it. We'll work out the rest." />
      <input className="capture-input" autoFocus value={text} placeholder="e.g. Slides for client tmrw ~2h due fri" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="Task" />
      {(p.effort || p.due) && (
        <Field label="UNDERSTOOD AS">
          <div className="chips">
            {p.effort && <span className="chip chip-soft"><IconSparkle size={14} /><span className="label-mono">{effortLabel(p.effort)}</span></span>}
            {p.due && <span className="chip chip-deadline"><IconFlag size={14} color="#fff" /><span className="label-mono">DUE {dayLabel(p.due)}</span></span>}
          </div>
        </Field>
      )}
      <Field label="WHEN"><DayPicker label="When" none="Whenever" value={date} onChange={(v) => setWhen({ v })} /></Field>
      <Field label="GROUP"><GroupPicker value={group} onChange={setGroup} /></Field>
      <button className="btn primary" disabled={!text.trim()} onClick={add}><IconPlus size={18} color="#fff" /> Add task</button>
      <button className="link" onClick={onClose}>Not now</button>
    </Sheet>
  )
}

/** Everything about one task. Quick actions on top, details as a short list of rows that open one at a time. Edits save as you go. */
type Row = 'when' | 'effort' | 'group' | 'due' | 'time'
export function TaskSheet({ id, onClose }: { id: string; onClose: () => void }) {
  const { tasks, focusId, updateTask, deleteTask, toggleDone, openFocus } = useTend()
  const [confirm, setConfirm] = useState(false)
  const [open, setOpen] = useState<Row | null>(null)
  const task = tasks.find((t) => t.id === id)
  useEffect(() => { if (!task) onClose() }, [task, onClose])
  if (!task) return null
  const status = statusOf(task, focusId), today = todayIso()
  const up = (p: Parameters<typeof updateTask>[1]) => updateTask(id, p)
  const eyebrow = status === 'done' ? 'DONE' : status === 'decision' ? `WAITING · WAS ${dayName(task.date!).toUpperCase()}` : status === 'saved' ? 'SAVED FOR LATER' : `PLANNED · ${dayName(task.date!).toUpperCase()}`
  const row = (key: Row, label: string, value: string, body: React.ReactNode) => (
    <div className="trow">
      <button className="srow" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>
        <span className="srow-text"><span className="callout">{label}</span></span>
        <span className="footnote" style={{ color: 'var(--text-secondary)' }}>{value}</span>
        <span className={`chev ${open === key ? 'flip' : ''}`}><IconChevronDown size={18} /></span>
      </button>
      {open === key && <div className="trow-body">{body}</div>}
    </div>
  )
  return (
    <Sheet onClose={onClose} label="Task details">
      <div className="sheet-head">
        <span className="label-mono">{eyebrow}</span>
        <input className="title-input" value={task.title} onChange={(e) => up({ title: e.target.value })} onBlur={(e) => !e.target.value.trim() && up({ title: 'Untitled task' })} aria-label="Task name" />
        {status === 'decision' && <p className="footnote" style={{ color: 'var(--text-secondary)' }}>Not late, just waiting. Bring it along, move it, or let it go.</p>}
      </div>
      <div className="actions">
        {!task.done && <button className="btn primary" onClick={() => { onClose(); openFocus(id) }}><IconPlay size={18} color="#fff" /> {focusId === id ? 'Resume focus' : 'Start focus'}</button>}
        <button className="btn" onClick={() => { toggleDone(id); onClose() }}><IconCheck size={18} /> {task.done ? 'Not done' : 'Done'}</button>
      </div>
      <div className="scard">
        {row('when', 'Day', task.date ? dayName(task.date) : 'Whenever', <DayPicker label="Day" none="Whenever" value={task.date} onChange={(v) => up({ date: v, start: v ? task.start : undefined })} />)}
        {row('effort', 'Effort', effortLabel(task.effort), <EffortPicker value={task.effort} onChange={(m) => up({ effort: m })} />)}
        {row('group', 'Group', GROUP_LABEL[task.group], <GroupPicker value={task.group} onChange={(g) => up({ group: g })} />)}
        {row('due', 'Deadline', task.due ? dayLabel(task.due) : 'None', <DayPicker label="Deadline" none="No deadline" quick={false} value={task.due} onChange={(v) => up({ due: v })} />)}
        {task.date && row('time', 'Time of day', task.start ?? 'Any time', (
          <div className="chips">
            <button type="button" className={`pchip ${!task.start ? 'on' : ''}`} aria-pressed={!task.start} onClick={() => up({ start: undefined })}>Any time</button>
            <label className={`pchip date ${task.start ? 'on' : ''}`}>{task.start ?? 'Pick a time'}<input type="time" aria-label="Start time" value={task.start ?? ''} onChange={(e) => up({ start: e.target.value || undefined })} onClick={(e) => { try { e.currentTarget.showPicker() } catch { /* not supported */ } }} /></label>
          </div>
        ))}
      </div>
      {confirm
        ? <div className="confirm"><span className="footnote">Delete this task for good?</span><button className="btn" onClick={() => setConfirm(false)}>Keep it</button><button className="btn primary" onClick={() => deleteTask(id)}>Delete</button></div>
        : <button className="link danger" onClick={() => setConfirm(true)}>Delete task</button>}
    </Sheet>
  )
}

export function FocusSheet({ onClose, onPause }: { onClose: () => void; onPause: () => void }) {
  const { tasks, focusId, remaining, sessionMin, tick, toggleDone } = useTend()
  const task = tasks.find((t) => t.id === focusId)
  const showTimer = useTend((s) => s.settings.showTimer)
  useEffect(() => { const i = setInterval(tick, 1000); return () => clearInterval(i) }, [tick])
  if (!task) return null
  const total = sessionMin * 60, R = 112, C = 2 * Math.PI * R
  const mm = String(Math.floor(remaining / 60)).padStart(2, '0'), ss = String(remaining % 60).padStart(2, '0')
  const finish = () => { toggleDone(task.id); onClose() }
  return (
    <Sheet onClose={onClose} label="Focus session" full>
      <SheetHeader eyebrow="FOCUS SESSION" title="One thing, for now." />
      <div className="ring" role="timer" aria-label={`${mm} minutes ${ss} seconds left`}>
        <svg width="248" height="248" viewBox="0 0 248 248" aria-hidden>
          <circle cx="124" cy="124" r={R} fill="none" stroke="var(--accent-track)" strokeWidth="12" />
          <circle cx="124" cy="124" r={R} fill="none" stroke="var(--brand-sprout)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - Math.min(1, remaining / total))} transform="rotate(-90 124 124)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
        </svg>
        <div className="ring-in"><IconLaptop size={28} />{showTimer ? <><b className="time">{mm}:{ss}</b><span className="label-mono-sm muted">LEFT OF {sessionMin} MIN</span></> : <span className="label-mono-sm muted">TIMER HIDDEN</span>}</div>
      </div>
      <p className="headline" style={{ textAlign: 'center' }}>{task.title}</p>
      <div className="round-row">
        <button className="round white" aria-label="Mark as done" onClick={finish}><IconCheck size={28} /></button>
        <button className="round ink" aria-label="Pause" onClick={onPause}><IconPause size={28} color="#fff" /></button>
      </div>
      <p className="footnote muted" style={{ textAlign: 'center' }}>Stopping early opens your options, never a "late" label.</p>
    </Sheet>
  )
}

const OPTIONS: { id: Choice; icon: JSX.Element; title: string; sub: string }[] = [
  { id: 'continue', icon: <IconContinue size={20} />, title: 'Continue later today', sub: 'Keep it in today, pick it up when ready' },
  { id: 'rescope', icon: <IconRescope size={20} />, title: 'Rescope', sub: 'Shrink it to what fits' },
  { id: 'split', icon: <IconSplit size={20} />, title: 'Split', sub: 'Do part now, part later' },
  { id: 'defer', icon: <IconCalendar size={20} />, title: 'Defer to another day', sub: 'Move it to tomorrow' },
  { id: 'release', icon: <IconRelease size={20} />, title: 'Release', sub: 'Let it go, no strings' },
]
export function TransitionSheet({ onClose }: { onClose: () => void }) {
  const { focusId, remaining, sessionMin, applyChoice, tasks } = useTend()
  const [choice, setChoice] = useState<Choice>('continue')
  const spent = Math.max(1, Math.round((sessionMin * 60 - remaining) / 60))
  const used = usedOn(tasks, todayIso()), total = useTend((s) => capacityFor(s, todayIso()))
  const confirm = () => { if (focusId) applyChoice(focusId, choice); onClose() }
  return (
    <Sheet onClose={onClose} label="What feels right next">
      <SheetHeader eyebrow={`${spent} MIN OF FOCUS · PAUSED`} title="Paused here. What feels right next?" sub="Nothing is lost. Pick whatever fits the rest of your day." />
      <div className="options" role="radiogroup">
        {OPTIONS.map((o) => <OptionRow key={o.id} icon={o.icon} title={o.title} sub={o.sub} selected={choice === o.id} onClick={() => setChoice(o.id)} />)}
      </div>
      <CapacityBar used={used} total={total} fmt={fmtDur} />
      <button className="btn primary" onClick={confirm}>Confirm</button>
      <button className="link" onClick={onClose}>Decide later</button>
    </Sheet>
  )
}

/** One-day capacity override; the usual amount lives in Profile. */
export function CapacitySheet({ day, onClose }: { day: string; onClose: () => void }) {
  const { capacityMin, setCapacityFor } = useTend()
  const total = useTend((s) => capacityFor(s, day))
  const isToday = day === todayIso()
  return (
    <Sheet onClose={onClose} label="Change capacity for this day">
      <SheetHeader eyebrow={isToday ? 'JUST FOR TODAY' : `JUST FOR ${dayName(day).toUpperCase()}`} title={isToday ? 'How much room is there today?' : 'How much room is there that day?'} sub="This only changes this one day. Your usual amount stays in your profile." />
      <CapacitySlider value={Math.min(480, Math.max(60, total))} onChange={(m) => setCapacityFor(day, m)} />
      <button className="btn primary" onClick={onClose}>Done</button>
      {total !== capacityMin && <button className="link" onClick={() => setCapacityFor(day, null)}>Back to my usual {fmtDur(capacityMin)}</button>}
    </Sheet>
  )
}
