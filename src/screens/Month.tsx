import { PageHeader, groupVar } from '../components/ui'
import { IconCalendar, IconFlag } from '../components/Icons'
import { Group } from '../state/store'

const DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
// Sample fixed dates, placed relative to today so the demo always has something ahead.
const FIXED = [
  { off: 5, due: true, title: 'Submit weekly timesheet (repeats Fridays)' },
  { off: 5, due: true, title: 'Send presentation to client' },
  { off: 9, due: false, time: '14:00', title: 'Portfolio review' },
  { off: 12, due: true, title: 'Case study first draft' },
]
const PLANNED = [1, 2, 3, 7, 8, 9]
const FLEX: { group: Exclude<Group, 'none'>; title: string; meta: string }[] = [
  { group: 'work', title: 'Case study outline', meta: '3H' }, { group: 'study', title: 'Italian theory quiz', meta: '1H' },
  { group: 'personal', title: 'Book dentist', meta: '30M' }, { group: 'lifestyle', title: 'Weekend yoga', meta: '1H' },
]

export default function Month({ onProfile }: { onProfile: () => void }) {
  const now = new Date(), y = now.getFullYear(), m = now.getMonth()
  const at = (off: number) => new Date(y, m, now.getDate() + off)
  const inMonth = (d: Date) => d.getMonth() === m
  const fixed = FIXED.map((f) => ({ ...f, date: at(f.off) })).filter((f) => inMonth(f.date))
  const deadlines = new Set(fixed.filter((f) => f.due).map((f) => f.date.getDate()))
  const planned = new Set([...PLANNED.map(at), ...fixed.filter((f) => !f.due).map((f) => f.date)].filter(inMonth).map((d) => d.getDate()))
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const weeks = Array.from({ length: 6 }, (_, w) => Array.from({ length: 7 }, (_, d) => new Date(y, m, 1 - lead + w * 7 + d)))

  return (
    <div className="screen">
      <PageHeader title={now.toLocaleString('en', { month: 'long' })} onProfile={onProfile} />
      <div className="mgrid" role="grid" aria-label="Month at a glance">
        <div className="mrow" aria-hidden>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i} className="wd label-mono-sm">{d}</span>)}</div>
        {weeks.map((week, w) => (
          <div key={w} className="mrow" role="row">
            {week.map((d) => {
              const out = !inMonth(d), n = d.getDate(), today = !out && n === now.getDate()
              const flag = !out && deadlines.has(n), dot = !out && (today || planned.has(n))
              return (
                <div key={d.toDateString()} role="gridcell" className={`mcell callout ${today ? 'today' : ''} ${out ? 'out' : ''}`} aria-current={today ? 'date' : undefined}
                  aria-label={`${d.toLocaleString('en', { month: 'long' })} ${n}${today ? ', today' : ''}${flag ? ', deadline' : dot ? ', focus planned' : ''}`}>
                  <span>{n}</span>
                  <span className="mk">{flag ? <IconFlag size={12} /> : dot ? <i className="dot" /> : null}</span>
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <section className="sec" style={{ gap: 8 }}>
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>FIXED DATES THIS MONTH</span>
        {fixed.length ? fixed.map((f, i) => (
          <div key={i} className="fixed">
            <IconCalendar size={16} />
            <div className="fixed-text">
              {f.due
                ? <span className="chip chip-deadline"><IconFlag size={14} color="#fff" /><span className="label-mono">DUE {DAYS[f.date.getDay()]} {f.date.getDate()}</span></span>
                : <span className="chip"><IconCalendar size={14} /><span className="label-mono">PLANNED {DAYS[f.date.getDay()]} {f.date.getDate()} · {f.time}</span></span>}
              <p className="footnote">{f.title}</p>
            </div>
          </div>
        )) : <p className="footnote muted">Nothing fixed for the rest of this month.</p>}
      </section>
      <section className="sec" style={{ gap: 8 }}>
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>FLEXIBLE THIS MONTH</span>
        <div className="tpills">
          {FLEX.map((t) => (
            <div key={t.title} className="tpill" style={{ background: groupVar(t.group).bg }}>
              <div className="tpill-row"><i className="gdot" style={{ background: groupVar(t.group).strong, marginTop: 5 }} /><p className="footnote">{t.title}</p></div>
              <span className="label-mono-sm" style={{ color: 'var(--text-secondary)' }}>{t.meta}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
