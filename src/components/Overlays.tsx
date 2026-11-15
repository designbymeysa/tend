import { useEffect, useMemo, useState } from 'react'
import { Sheet, SheetHeader, OptionRow } from './Sheet'
import { IconCheck, IconContinue, IconFlag, IconLaptop, IconPause, IconPlus, IconRelease, IconRescope, IconSparkle, IconSplit, IconCalendar, IconList, IconBriefcase, IconBook, IconHeart } from './Icons'
import { CapacityBar } from './ui'
import { Choice, Group, Task, effortLabel, fmtDur, useTend } from '../state/store'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const WD = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
function nextDate(offset: number) { const d = new Date(); d.setDate(d.getDate() + offset); return `${DAYS[d.getDay()]} ${d.getDate()}` }
function dayOffset(word: string) { const i = WD.indexOf(word.slice(0, 3)); return (i - new Date().getDay() + 7) % 7 || 7 }

export function parseCapture(text: string) {
  let effort: number | undefined, planned: string | undefined, due: string | undefined
  const e = text.match(/~?\s*(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours|m|min|mins)\b/i)
  if (e) { const n = parseFloat(e[1]); effort = /^h/i.test(e[2]) ? Math.round(n * 60) : Math.round(n) }
  const dm = text.match(/\b(?:due|by)\s+(mon|tue|wed|thu|fri|sat|sun)[a-z]*/i)
  if (dm) due = nextDate(dayOffset(dm[1]))
  const clean = text.replace(/\b(?:due|by)\s+[a-z]+/gi, '')
  if (/\b(tmrw|tomorrow)\b/i.test(clean)) planned = nextDate(1)
  else if (/\btoday\b/i.test(clean)) planned = nextDate(0)
  else { const w = clean.match(/\b(mon|tue|wed|thu|fri|sat|sun)[a-z]*\b/i); if (w) planned = nextDate(dayOffset(w[1])) }
  return { effort, planned, due }
}

const GROUPS: { id: Group; label: string; icon: JSX.Element }[] = [
  { id: 'none', label: 'No group', icon: <IconList size={16} /> },
  { id: 'work', label: 'Work', icon: <IconBriefcase size={16} /> },
  { id: 'study', label: 'Study', icon: <IconBook size={16} /> },
  { id: 'personal', label: 'Personal', icon: <IconHeart size={16} /> },
  { id: 'lifestyle', label: 'Lifestyle', icon: <IconSparkle size={16} /> },
]

export function CaptureSheet({ onClose }: { onClose: () => void }) {
  const addTask = useTend((s) => s.addTask)
  const [text, setText] = useState('')
  const [group, setGroup] = useState<Group>('none')
  const p = useMemo(() => parseCapture(text), [text])
  const title = text.replace(/~?\s*\d+(?:\.\d+)?\s*(h|hr|hrs|hour|hours|m|min|mins)\b/i, '').replace(/\b(?:due|by)\s+[a-z]+/i, '').replace(/\b(tmrw|tomorrow|today)\b/i, '').replace(/\s+/g, ' ').trim()
  const add = () => {
    if (!text.trim()) return
    addTask({ title: title || text.trim(), group, effort: p.effort ?? 30, plannedFor: p.planned, due: p.due })
    onClose()
  }
  return (
    <Sheet onClose={onClose} label="Capture a task">
      <SheetHeader eyebrow="NEW TASK" title="What's on your mind?" sub="Just type it. We'll work out the rest." />
      <input className="capture-input" autoFocus value={text} placeholder="e.g. Slides for client tmrw ~2h due fri" onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} aria-label="Task" />
      {(p.effort || p.planned || p.due) && (
        <div className="understood">
          <span className="label-mono-sm muted">UNDERSTOOD AS</span>
          <div className="chips">
            {p.effort && <span className="chip chip-soft"><IconSparkle size={14} /><span className="label-mono">{effortLabel(p.effort)}</span></span>}
            {p.planned && <span className="chip chip-soft"><IconCalendar size={14} /><span className="label-mono">PLANNED {p.planned}</span></span>}
            {p.due && <span className="chip chip-deadline"><IconFlag size={14} color="#fff" /><span className="label-mono">DUE {p.due}</span></span>}
          </div>
        </div>
      )}
      <div className="understood">
        <span className="label-mono-sm muted">GROUP</span>
        <div className="chips" role="radiogroup" aria-label="Group">
          {GROUPS.map((g) => (
            <button key={g.id} role="radio" aria-checked={group === g.id} className={`gchip ${group === g.id ? 'on' : ''}`} style={{ ['--gs' as string]: g.id === 'none' ? 'var(--task-past-icon-bg)' : `var(--group-${g.id}-strong)`, ['--gb' as string]: g.id === 'none' ? 'var(--bg-surface-muted)' : `var(--group-${g.id}-bg)` }} onClick={() => setGroup(g.id)}>
              {group === g.id ? <IconCheck size={16} /> : g.icon}<span>{g.label}</span>
            </button>
          ))}
        </div>
      </div>
      <button className="btn primary" disabled={!text.trim()} onClick={add}><IconPlus size={18} color="#fff" /> Add task</button>
      <button className="link" onClick={onClose}>Not now</button>
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
          <circle cx="124" cy="124" r={R} fill="none" stroke="var(--brand-sprout)" strokeWidth="12" strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C * (1 - remaining / total)} transform="rotate(-90 124 124)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
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
  { id: 'defer', icon: <IconCalendar size={20} />, title: 'Defer to another day', sub: 'Move it out of today' },
  { id: 'release', icon: <IconRelease size={20} />, title: 'Release', sub: 'Let it go, no strings' },
]
export function TransitionSheet({ onClose }: { onClose: () => void }) {
  const { focusId, remaining, sessionMin, applyChoice, tasks, capacityMin } = useTend()
  const [choice, setChoice] = useState<Choice>('continue')
  const spent = Math.max(1, Math.round((sessionMin * 60 - remaining) / 60))
  const used = tasks.filter((t) => t.picked && t.status !== 'done').reduce((a, t) => a + t.effort, 0)
  const confirm = () => { if (focusId) applyChoice(focusId, choice); onClose() }
  return (
    <Sheet onClose={onClose} label="What feels right next">
      <SheetHeader eyebrow={`${spent} MIN OF FOCUS · PAUSED`} title="Paused here. What feels right next?" sub="Nothing is lost. Pick whatever fits the rest of your day." />
      <div className="options" role="radiogroup">
        {OPTIONS.map((o) => <OptionRow key={o.id} icon={o.icon} title={o.title} sub={o.sub} selected={choice === o.id} onClick={() => setChoice(o.id)} />)}
      </div>
      <CapacityBar used={used} total={capacityMin} fmt={fmtDur} />
      <button className="btn primary" onClick={confirm}>Confirm</button>
      <button className="link" onClick={onClose}>Decide later</button>
    </Sheet>
  )
}

export function DecisionSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const decide = useTend((s) => s.decide)
  const act = (to: 'today' | 'later' | 'release') => { decide(task.id, to); onClose() }
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label="Decide what to do with this task" onClick={(e) => e.stopPropagation()}>
        <i className="grab" />
        <p className="headline">{task.title}</p>
        <p className="footnote muted">No rush. Choose what fits, or leave it for now.</p>
        <button className="btn primary" onClick={() => act('today')}>Add to today</button>
        <button className="btn" onClick={() => act('later')}>Keep for later</button>
        <button className="btn" onClick={() => act('release')}>Let it go</button>
        <button className="link" onClick={onClose}>Leave it for now</button>
      </div>
    </div>
  )
}
