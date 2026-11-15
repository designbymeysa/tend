import { useState } from 'react'
import { CapacityBar, DayPill, PageHeader, SectionHeader, TaskCard, ViewSwitch, groupVar } from '../components/ui'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconPlus } from '../components/Icons'
import { CapacitySheet, TaskSheet } from '../components/Overlays'
import { TaskView, addDays, capacityFor, commitments, dayName, effortLabel, fmtDur, fromMin, iso, parseIso, toMin, todayIso, usedOn, useTasks, useTend, weekday } from '../state/store'

export default function Today({ onProfile, onAdd }: { onProfile: () => void; onAdd: (day: string) => void }) {
  const { view, setView, toggleDone, day, setDay, remaining } = useTend()
  const tasks = useTasks()
  const [sheet, setSheet] = useState<string | null>(null)
  const [capOpen, setCapOpen] = useState(false)
  const today = todayIso(), isToday = day === today, past = day < today
  const start = addDays(day, -parseIso(day).getDay())
  const week = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const mine = tasks.filter((t) => t.date === day)
  const order = { 'in-focus': 0, planned: 1, decision: 1, saved: 1, done: 2 }
  const list = [...mine].sort((a, b) => order[a.status] - order[b.status] || (a.start ?? '99').localeCompare(b.start ?? '99'))
  const used = usedOn(tasks, day), total = useTend((s) => capacityFor(s, day))
  const waiting = tasks.filter((t) => t.status === 'decision')
  const later = tasks.filter((t) => t.status === 'saved').length
  const name = dayName(day)
  const open = (t: TaskView) => setSheet(t.id)
  const card = (t: TaskView) => <TaskCard key={t.id} task={t} onToggle={() => toggleDone(t.id)} onOpen={() => open(t)} label={t.status === 'in-focus' ? `● In focus · ${Math.ceil(remaining / 60)} min left` : undefined} />

  return (
    <div className="screen">
      <PageHeader title={name} onProfile={onProfile} extra={!isToday && <button className="pill-btn label-mono" style={{ marginRight: 'auto' }} onClick={() => setDay(today)}>← Back to today</button>} />
      <ViewSwitch value={view} onChange={setView} />
      <div className="week-nav">
        <button className="week-step" aria-label="Previous week" onClick={() => setDay(addDays(day, -7))}><IconChevronLeft size={18} /></button>
        <div className="week">{week.map((d) => <DayPill key={d} day={weekday(d)} date={parseIso(d).getDate()} planned={tasks.some((t) => t.date === d && !t.done)} selected={d === day} today={d === today} onClick={() => setDay(d)} />)}</div>
        <button className="week-step" aria-label="Next week" onClick={() => setDay(addDays(day, 7))}><IconChevronRight size={18} /></button>
      </div>

      {view === 'focus' ? (
        <>
          {!past && <CapacityBar title={isToday ? "Today's capacity" : `Capacity for ${name}`} used={used} total={total} fmt={fmtDur} onEdit={() => setCapOpen(true)} />}
          <section className="stack">
            <SectionHeader title={isToday ? 'Focus for today' : past ? `From ${name}` : `Planned for ${name}`} aside={mine.length ? `${mine.length} ${past ? (mine.length === 1 ? 'task' : 'tasks') : 'picked'}` : undefined} />
            {list.length ? list.map(card) : <p className="footnote muted">{past ? 'Nothing was planned that day.' : isToday ? 'Nothing picked yet. Add something small, or bring one over from Plan.' : 'Nothing planned yet. This day is wide open.'}</p>}
            {!past && <button className="add-row callout" onClick={() => onAdd(day)}><IconPlus size={18} /> Add a task for {isToday ? 'today' : name}</button>}
          </section>
          {isToday && waiting.length > 0 && (
            <section className="stack">
              <SectionHeader title="Waiting for a decision" />
              {waiting.map((t) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t.id)} onToggle={() => setSheet(t.id)} />)}
            </section>
          )}
          {isToday && <p className="callout muted">{later} more {later === 1 ? 'task is' : 'tasks are'} saved for later, out of sight.</p>}
        </>
      ) : (
        <Timeline day={day} tasks={mine} onOpen={open} />
      )}

      {capOpen && <CapacitySheet day={day} onClose={() => setCapOpen(false)} />}
      {sheet && <TaskSheet id={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}

const T0 = 9 * 60, T1 = 18 * 60, PX = 72 / 60 // 72px per hour
function Timeline({ day, tasks, onOpen }: { day: string; tasks: TaskView[]; onOpen: (t: TaskView) => void }) {
  const remaining = useTend((s) => s.remaining)
  const isToday = day === iso(new Date())
  const nowM = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() })()
  const y = (m: number) => (m - T0) * PX + 6
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i)
  const placed = tasks.filter((t) => t.start && toMin(t.start) >= T0 && toMin(t.start) < T1)
  const loose = tasks.filter((t) => !placed.includes(t) && !t.done)
  const nowVisible = isToday && nowM >= T0 && nowM <= T1
  return (
    <>
      {loose.length > 0 && (
        <section className="stack">
          <SectionHeader title="No time chosen" mono />
          {loose.map((t) => <TaskCard key={t.id} task={t} onOpen={() => onOpen(t)} onToggle={() => onOpen(t)} />)}
        </section>
      )}
      <section className="stack">
        <SectionHeader title={isToday ? 'Today by the hour' : 'By the hour'} aside="9:00–18:00" />
        <div className="timeline" style={{ height: 662 }}>
          {hours.map((h) => (
            <div key={h}><span className="label-mono-sm hour" style={{ top: y(h * 60) - 6 }}>{h}:00</span><i className="hline" style={{ top: y(h * 60) }} /></div>
          ))}
          {isToday && commitments.map((c) => (
            <div key={c.id} className="commit" style={{ top: y(toMin(c.start)), height: (toMin(c.end) - toMin(c.start)) * PX - 4, background: c.group === 'work' ? 'var(--group-work-bg)' : 'var(--bg-surface)' }}>
              <IconCalendar size={16} />
              <div><span className="label-mono-sm" style={{ color: c.group === 'work' ? 'var(--group-work-text)' : 'var(--text-secondary)' }}>{c.start}–{c.end}</span><p className="footnote">{c.title}</p></div>
            </div>
          ))}
          {placed.map((t) => {
            const s = toMin(t.start!); const g = groupVar(t.group); const done = t.status === 'done', focus = t.status === 'in-focus'
            const h = Math.max(32, Math.min(t.effort, T1 - s) * PX - 4), short = effortLabel(t.effort).replace(' MIN', 'M')
            return (
              <button key={t.id} className="block" onClick={() => onOpen(t)} style={{ top: y(s), height: h, background: done ? 'var(--task-past-bg)' : focus ? g.strong : g.bg }}>
                {focus ? (<>
                  <span className="label-mono-sm" style={{ color: 'var(--text-primary)' }}>● IN FOCUS · {Math.ceil(remaining / 60)} MIN LEFT</span>
                  <p className="headline row-title">{t.title}</p>
                  <span className="label-mono-sm" style={{ color: 'var(--text-secondary)' }}>{fromMin(s)}–{fromMin(s + t.effort)} · {short}</span>
                </>) : (
                  <div className="row"><i style={{ background: done ? 'var(--task-past-icon-bg)' : g.strong }} /><p className="callout row-title" style={{ color: done ? 'var(--text-muted)' : undefined }}>{t.title}</p>
                    <span className="label-mono-sm" style={{ color: done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{done ? `DONE · ${t.doneAt ?? ''}` : `${t.start} · ${short}`}</span></div>
                )}
              </button>
            )
          })}
          {nowVisible && <div className="now" style={{ top: y(nowM) - 6 }}><span className="label-mono-sm">{fromMin(nowM)}</span><i /><b /></div>}
        </div>
        <p className="footnote muted">Tap a task to give it a time of day. Calendar events here are samples.</p>
      </section>
    </>
  )
}
