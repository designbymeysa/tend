import { useMemo, useState } from 'react'
import { CapacityBar, DateTag, DayPill, EffortChip, ProfileButton, SectionHeader, TaskCard, ViewSwitch, groupVar } from '../components/ui'
import { IconCalendar } from '../components/Icons'
import { Task, commitments, effortLabel, fmtDur, fromMin, toMin, useTend } from '../state/store'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
function useWeek() {
  return useMemo(() => {
    const now = new Date(); const start = new Date(now); start.setDate(now.getDate() - now.getDay())
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(start); d.setDate(start.getDate() + i); return { day: DAYS[i], date: d.getDate(), isToday: d.toDateString() === now.toDateString(), planned: i === 2 || i === 4 } })
  }, [])
}

export default function Today({ onProfile }: { onProfile: () => void }) {
  const { tasks, view, setView, toggleDone, capacityMin } = useTend()
  const week = useWeek()
  const [sheet, setSheet] = useState<Task | null>(null)
  const [showAll, setShowAll] = useState(false)
  const picked = tasks.filter((t) => t.picked)
  const used = picked.filter((t) => t.status !== 'done').reduce((a, t) => a + t.effort, 0)
  const decisions = tasks.filter((t) => t.status === 'decision')
  const later = tasks.filter((t) => t.status === 'saved').length
  const planned = tasks.filter((t) => !t.picked && t.status === 'planned')
  const today = week.find((w) => w.isToday)!

  return (
    <div className="screen">
      <header className="header"><div className="top-right"><ProfileButton onClick={onProfile} /></div><h1>Today</h1></header>
      <ViewSwitch value={view} onChange={setView} />
      <div className="week">{week.map((w) => <DayPill key={w.day} day={w.day} date={w.date} planned={w.planned} selected={w.isToday} />)}</div>

      {view === 'focus' ? (
        <>
          <CapacityBar used={used} total={capacityMin} fmt={fmtDur} />
          <section className="stack">
            <SectionHeader title="Focus for today" aside={`${picked.length} picked`} />
            {picked.map((t) => (
              <TaskCard key={t.id} task={t} onToggle={() => toggleDone(t.id)}
                label={t.status === 'in-focus' ? '● In focus · 24 min left' : undefined}
                meta={t.status === 'done' ? <><EffortChip label={`DONE · ${effortLabel(t.effort)}`} /><DateTag label={`TODAY ${t.doneAt ?? ''}`} /></> : undefined} />
            ))}
            <button className="link" onClick={() => setShowAll(!showAll)}>{showAll ? 'Hide other planned tasks ↑' : 'Show all tasks planned for today ↓'}</button>
            {showAll && (planned.length ? planned.map((t) => <TaskCard key={t.id} task={t} onToggle={() => toggleDone(t.id)} />) : <p className="footnote muted">Nothing else is planned for today.</p>)}
          </section>
          {decisions.length > 0 && (
            <section className="stack">
              <SectionHeader title="Waiting for a decision" />
              {decisions.map((t) => (
                <TaskCard key={t.id} task={t} onOpen={() => setSheet(t)} onToggle={() => setSheet(t)}
                  meta={<><EffortChip label={effortLabel(t.effort)} /><DateTag label={`PLANNED FOR ${t.plannedFor}`} /></>} />
              ))}
            </section>
          )}
          <p className="callout muted">{later} more tasks are saved for later, out of sight.</p>
        </>
      ) : (
        <Timeline onDecide={setSheet} />
      )}

      {sheet && <DecisionSheet task={sheet} onClose={() => setSheet(null)} />}
      <span hidden>{today.date}</span>
    </div>
  )
}

const T0 = 9 * 60, PX = 72 / 60 // 72px per hour
function Timeline({ onDecide }: { onDecide: (t: Task) => void }) {
  const { tasks } = useTend()
  const nowM = (() => { const d = new Date(); return d.getHours() * 60 + d.getMinutes() })()
  const y = (m: number) => (m - T0) * PX + 6
  const hours = Array.from({ length: 10 }, (_, i) => 9 + i)
  const decisions = tasks.filter((t) => t.status === 'decision')
  const placed = tasks.filter((t) => t.picked && t.start)
  const nowVisible = nowM >= T0 && nowM <= 18 * 60
  return (
    <>
      {decisions.length > 0 && (
        <section className="stack">
          <SectionHeader title="No time chosen" mono />
          {decisions.map((t) => <TaskCard key={t.id} task={t} onOpen={() => onDecide(t)} onToggle={() => onDecide(t)} />)}
        </section>
      )}
      <section className="stack">
        <SectionHeader title="Today by the hour" aside="9:00–18:00" />
        <div className="timeline" style={{ height: 662 }}>
          {hours.map((h) => (
            <div key={h}><span className="label-mono-sm hour" style={{ top: y(h * 60) - 6 }}>{h}:00</span><i className="hline" style={{ top: y(h * 60) }} /></div>
          ))}
          {commitments.map((c) => {
            const h = (toMin(c.end) - toMin(c.start)) * PX - 4
            return (
              <div key={c.id} className="commit" style={{ top: y(toMin(c.start)) + (c.group === 'work' ? 0 : 0), height: h, background: c.group === 'work' ? 'var(--group-work-bg)' : 'var(--bg-surface)' }}>
                <IconCalendar size={16} />
                <div><span className="label-mono-sm" style={{ color: c.group === 'work' ? 'var(--group-work-text)' : 'var(--text-secondary)' }}>{c.start}–{c.end}</span><p className="footnote">{c.title}</p></div>
              </div>
            )
          })}
          {placed.map((t) => {
            const s = toMin(t.start!); const g = groupVar(t.group); const done = t.status === 'done', focus = t.status === 'in-focus'
            const h = Math.max(32, t.effort * PX - 4)
            const range = `${fromMin(s)}–${fromMin(s + t.effort)}`
            return (
              <div key={t.id} className={`block ${done ? 'bd' : ''}`} style={{ top: y(s), height: h, background: done ? 'var(--task-past-bg)' : focus ? g.strong : g.bg }}>
                {focus ? (<>
                  <span className="label-mono-sm" style={{ color: 'var(--text-primary)' }}>● IN FOCUS · 24 MIN LEFT</span>
                  <p className="headline row-title">{t.title}</p>
                  <span className="label-mono-sm" style={{ color: 'var(--text-secondary)' }}>{range} · {effortLabel(t.effort).replace(' MIN', 'M')}</span>
                </>) : (
                  <div className="row"><i style={{ background: done ? 'var(--task-past-icon-bg)' : g.strong }} /><p className="callout row-title" style={{ color: done ? 'var(--text-muted)' : undefined }}>{t.title}</p>
                    <span className="label-mono-sm" style={{ color: done ? 'var(--text-muted)' : 'var(--text-secondary)' }}>{done ? `DONE · ${t.doneAt ?? ''}` : `${t.start} · ${effortLabel(t.effort).replace(' MIN', 'M')}`}</span></div>
                )}
              </div>
            )
          })}
          <div className="free" style={{ top: y(15 * 60 + 30), height: 86 }}><span className="label-mono-sm">1H 15M FREE · FOR WHATEVER COMES UP</span></div>
          {nowVisible && <div className="now" style={{ top: y(nowM) - 6 }}><span className="label-mono-sm">{fromMin(nowM)}</span><i /><b /></div>}
        </div>
      </section>
    </>
  )
}

function DecisionSheet({ task, onClose }: { task: Task; onClose: () => void }) {
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
