import { useState } from 'react'
import { PageHeader, groupVar } from '../components/ui'
import { IconCalendar, IconChevronLeft, IconChevronRight, IconFlag } from '../components/Icons'
import { TaskSheet } from '../components/Overlays'
import { dayLabel, effortLabel, iso, todayIso, useTasks } from '../state/store'

export default function Month({ onProfile, onOpenDay }: { onProfile: () => void; onOpenDay: (day: string) => void }) {
  const tasks = useTasks().filter((t) => !t.done)
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
          <button className="week-step" aria-label="Previous month" onClick={() => setOff(off - 1)}><IconChevronLeft size={18} /></button>
          {off !== 0 && <button className="pill-btn label-mono" onClick={() => setOff(0)}>This month</button>}
          <button className="week-step" aria-label="Next month" onClick={() => setOff(off + 1)}><IconChevronRight size={18} /></button>
        </div>} />
      <div className="mgrid" role="grid" aria-label="Month at a glance">
        <div className="mrow" aria-hidden>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="wd label-mono-sm">{d}</span>)}</div>
        {weeks.map((week, w) => (
          <div key={w} className="mrow" role="row">
            {week.map((d) => {
              const id = iso(d), out = d.getMonth() !== m, isToday = id === today, flag = !out && deadlines.has(id), dot = !out && planned.has(id)
              return (
                <button key={id} role="gridcell" className={`mcell callout ${isToday ? 'today' : ''} ${out ? 'out' : ''}`} aria-current={isToday ? 'date' : undefined} onClick={() => onOpenDay(id)}
                  aria-label={`${d.toLocaleString('en', { month: 'long' })} ${d.getDate()}${isToday ? ', today' : ''}${flag ? ', deadline' : ''}${dot ? ', tasks planned' : ''}. Open this day`}>
                  <span>{d.getDate()}</span>
                  <span className="mk">{flag ? <IconFlag size={12} /> : dot ? <i className="dot" /> : null}</span>
                </button>
              )
            })}
          </div>
        ))}
      </div>
      <p className="footnote muted" style={{ textAlign: 'center', marginTop: -8 }}>Tap a day to open it and plan it.</p>
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
