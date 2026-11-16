import { useState } from 'react'
import { PageHeader, SectionHeader, TaskCard, groupVar } from '../components/ui'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconFlag, IconPlus } from '../components/Icons'
import { TaskSheet } from '../components/Overlays'
import { capacityFor, dayLabel, dayName, effortLabel, fmtDur, iso, todayIso, usedOn, useTasks, useTend } from '../state/store'

export default function Month({ onProfile, onOpenDay, onAdd }: { onProfile: () => void; onOpenDay: (day: string) => void; onAdd: (day: string) => void }) {
  const all = useTasks(), tasks = all.filter((t) => !t.done)
  const toggleDone = useTend((s) => s.toggleDone)
  const [sel, setSel] = useState<string | null>(todayIso()) // the day whose tasks are shown under the grid
  const [off, setOff] = useState(0) // months away from the current one
  const [sheet, setSheet] = useState<string | null>(null)
  const now = new Date(), first = new Date(now.getFullYear(), now.getMonth() + off, 1), y = first.getFullYear(), m = first.getMonth()
  const today = todayIso(), prefix = iso(first).slice(0, 7), here = (d?: string) => !!d && d.startsWith(prefix)
  const deadlines = new Set(tasks.map((t) => t.due).filter(here)), planned = new Set(tasks.map((t) => t.date).filter(here))
  const lead = (first.getDay() + 6) % 7
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => new Date(y, m, 1 - lead + w * 7 + d)))
  const from = off === 0 ? today : iso(first)
  // Fixed: has a deadline or a set time. Flexible: planned for a day this month, nothing pinning it down.
  const fixed = tasks.filter((t) => (here(t.due) && t.due! >= from) || (here(t.date) && t.date! > today && t.date! >= from && !!t.start)).sort((a, b) => (a.due ?? a.date!).localeCompare(b.due ?? b.date!))
  const flexible = tasks.filter((t) => here(t.date) && t.date! >= from && !fixed.includes(t)).sort((a, b) => a.date!.localeCompare(b.date!))

  return (
    <div className="screen">
      <PageHeader title={first.toLocaleString('en', { month: 'long' }) + (y !== now.getFullYear() ? ` ${y}` : '')} onProfile={onProfile} extra={
        <div className="month-nav">
          <button className="week-step" aria-label="Previous month" onClick={() => { setOff(off - 1); setSel(null) }}><IconChevronLeft size={18} /></button>
          {off !== 0 && <button className="pill-btn label-mono" onClick={() => { setOff(0); setSel(todayIso()) }}>This month</button>}
          <button className="week-step" aria-label="Next month" onClick={() => { setOff(off + 1); setSel(null) }}><IconChevronRight size={18} /></button>
        </div>} />
      <div className="mgrid" role="grid" aria-label="Month at a glance">
        <div className="mrow" aria-hidden>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="wd label-mono-sm">{d}</span>)}</div>
        {weeks.map((week, w) => (
          <div key={w} className="mrow" role="row">
            {week.map((d) => {
              const id = iso(d), out = d.getMonth() !== m, isToday = id === today, picked = id === sel, flag = !out && deadlines.has(id), dot = !out && planned.has(id)
              return (
                <button key={id} role="gridcell" className={`mcell callout ${isToday ? 'today' : ''} ${out ? 'out' : ''} ${picked ? 'picked' : ''}`} aria-current={isToday ? 'date' : undefined} aria-selected={picked} onClick={() => setSel(picked ? null : id)}
                  aria-label={`${d.toLocaleString('en', { month: 'long' })} ${d.getDate()}${isToday ? ', today' : ''}${flag ? ', deadline' : ''}${dot ? ', tasks planned' : ''}`}>
                  <span>{d.getDate()}</span>
                  <span className="mk">{flag ? <IconFlag size={12} /> : dot ? <i className="dot" /> : null}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      {sel ? <DayPanel day={sel} onOpenDay={onOpenDay} onAdd={onAdd} onOpen={setSheet} onToggle={toggleDone} all={all} /> : <p className="footnote muted" style={{ textAlign: 'center', marginTop: -8 }}>Tap a day to see what is planned for it.</p>}
      <section className="sec" style={{ gap: 8 }}>
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>FIXED DATES THIS MONTH</span>
        {fixed.length ? fixed.map((t) => (
          <button key={t.id} className="fixed" onClick={() => setSheet(t.id)}>
            <IconCalendar size={16} />
            <div className="fixed-text">
              {t.due && here(t.due)
                ? <span className="chip chip-deadline"><IconFlag size={14} color="#fff" /><span className="label-mono">DUE {dayLabel(t.due)}</span></span>
                : <span className="chip"><IconCalendar size={14} /><span className="label-mono">PLANNED {dayLabel(t.date!)} · {t.start}</span></span>}
              <p className="footnote">{t.title}</p>
            </div>
          </button>
        )) : <p className="footnote muted">No deadlines or timed tasks ahead this month.</p>}
      </section>
      <section className="sec" style={{ gap: 8 }}>
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>FLEXIBLE THIS MONTH</span>
        {flexible.length ? (
          <div className="tpills">
            {flexible.map((t) => (
              <button key={t.id} className="tpill" style={{ background: groupVar(t.group).bg }} onClick={() => setSheet(t.id)}>
                <div className="tpill-row"><i className="gdot" style={{ background: groupVar(t.group).strong, marginTop: 5 }} /><p className="footnote">{t.title}</p></div>
                <span className="label-mono-sm" style={{ color: 'var(--text-secondary)' }}>{dayLabel(t.date!)} · {effortLabel(t.effort).replace(' MIN', 'M')}</span>
              </button>
            ))}
          </div>
        ) : <p className="footnote muted">Nothing else planned ahead this month.</p>}
      </section>
      {sheet && <TaskSheet id={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}

function DayPanel({ day, all, onOpen, onToggle, onAdd, onOpenDay }: { day: string; all: ReturnType<typeof useTasks>; onOpen: (id: string) => void; onToggle: (id: string) => void; onAdd: (d: string) => void; onOpenDay: (d: string) => void }) {
  const total = useTend((s) => capacityFor(s, day)), past = day < todayIso()
  const order = { 'in-focus': 0, planned: 1, decision: 1, saved: 1, done: 2 }
  const list = all.filter((t) => t.date === day).sort((a, b) => order[a.status] - order[b.status] || (a.start ?? '99').localeCompare(b.start ?? '99'))
  const used = usedOn(all, day), due = all.filter((t) => t.due === day && t.date !== day && !t.done)
  return (
    <section className="sec day-panel" aria-label={`Tasks for ${dayName(day)}`}>
      <SectionHeader title={dayName(day)} aside={list.length ? `${list.length} ${list.length === 1 ? 'task' : 'tasks'}${past ? '' : ` · ${fmtDur(used)} of ${fmtDur(total)}`}` : undefined} />
      {list.length ? list.map((t) => <TaskCard key={t.id} task={t} onOpen={() => onOpen(t.id)} onToggle={() => onToggle(t.id)} />) : <p className="footnote muted">{past ? 'Nothing was planned that day.' : 'Nothing planned yet. This day is wide open.'}</p>}
      {due.length > 0 && <p className="footnote muted">Deadline today: {due.map((t) => t.title).join(', ')}</p>}
      {!past && <button className="add-row callout" onClick={() => onAdd(day)}><IconPlus size={18} /> Add a task for {dayName(day).toLowerCase()}</button>}
      <button className="link" onClick={() => onOpenDay(day)}>Open {dayName(day).toLowerCase()} in Today view →</button>
    </section>
  )
}
