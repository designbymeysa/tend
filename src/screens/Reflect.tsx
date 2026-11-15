import { useState } from 'react'
import { GROUP_LABEL, PageHeader, SectionHeader, Sticky, TaskCard, groupVar } from '../components/ui'
import { DecisionSheet } from '../components/Overlays'
import { Group, Task, fmtDur, useTend } from '../state/store'

const RHYTHM: [string, number][] = [['MON', 76], ['TUE', 57], ['WED', 0], ['THU', 63], ['FRI', 57], ['SAT', 0], ['SUN', 0]]
const TIME: [Exclude<Group, 'none'>, number][] = [['work', 220], ['study', 100], ['personal', 50], ['lifestyle', 30]]
const TOTAL = TIME.reduce((a, [, m]) => a + m, 0)

function useWeek() {
  const now = new Date(), mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sun = new Date(mon); sun.setDate(mon.getDate() + 6)
  const thu = new Date(mon); thu.setDate(mon.getDate() + 3)
  const week = 1 + Math.round((thu.getTime() - new Date(thu.getFullYear(), 0, 4).getTime()) / 6048e5 + ((new Date(thu.getFullYear(), 0, 4).getDay() + 6) % 7 - 3) / 7)
  return { label: `${mon.toLocaleString('en', { month: 'short' }).toUpperCase()} · WEEK ${week}`, range: `${mon.getDate()}–${sun.getDate()}` }
}

export default function Reflect({ onProfile }: { onProfile: () => void }) {
  const tasks = useTend((s) => s.tasks)
  const [sheet, setSheet] = useState<Task | null>(null)
  const [showDone, setShowDone] = useState(false)
  const { label, range } = useWeek()
  const decisions = tasks.filter((t) => t.status === 'decision')
  const done = tasks.filter((t) => t.status === 'done')
  const completed = 8 + done.length // earlier days of the sample week + what is done today
  const n = (c: number) => `${c} ${c === 1 ? 'task' : 'tasks'}`

  return (
    <div className="screen roomy">
      <PageHeader title="Reflect" sub="A quiet look back at the week. Decide what comes with you." onProfile={onProfile} />
      <section className="sec" style={{ gap: 22 }}>
        <SectionHeader title="Your week" />
        <div className="note" style={{ padding: 20, gap: 16 }}>
          <div><span className="label-mono-sm muted">{label}</span><p className="title1">{range}</p></div>
          <div className="tiles">
            <div className="tile" style={{ background: 'var(--accent-subtle)' }}><b>{fmtDur(TOTAL)}</b><span className="label-mono-sm">FOCUSED WORK</span></div>
            <div className="tile" style={{ background: 'var(--group-lifestyle-bg)' }}><b>3 tasks</b><span className="label-mono-sm">CARRIED OVER</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="label-mono-sm muted">MAIN THEMES</span><span className="callout">Work, Italian study</span></div>
        </div>
        <p className="footnote muted" style={{ textAlign: 'center' }}>No scores or streaks, just where your time went.</p>
      </section>

      <section className="sec" style={{ gap: 14 }}>
        <SectionHeader title="Noticed this week" />
        <div className="stage-notes" style={{ height: 290 }}>
          <Sticky group="personal" tag="PAUSE" text="You paused twice and came back both times." style={{ left: 2, top: 27, width: 158, transform: 'rotate(4deg)' }} />
          <Sticky group="study" tag="REST" text="Wednesday was a rest day. That counts too." style={{ left: 181, top: 4, width: 156, transform: 'rotate(-4deg)' }} />
          <Sticky group="work" tag="CALM" text={`${fmtDur(TOTAL)} of focus. No scores, no streaks.`} style={{ left: 76, top: 155, width: 196, transform: 'rotate(2deg)' }} />
        </div>
      </section>

      <section className="sec">
        <SectionHeader title="Your rhythm" aside="focus per day" />
        <div className="wcard">
          <div className="days" role="img" aria-label="Focus per day: most on Monday, rest on Wednesday and the weekend">
            {RHYTHM.map(([d, h]) => <div key={d} className="day"><div className="bar">{h > 0 && <i style={{ height: h }} />}</div><span className="label-mono-sm muted">{d}</span></div>)}
          </div>
          <p className="footnote" style={{ color: 'var(--text-secondary)' }}>Wednesday was a rest day. That counts too.</p>
        </div>
      </section>

      <section className="sec">
        <SectionHeader title="Where your time went" aside={fmtDur(TOTAL)} />
        <div className="wcard">
          <div className="gbar" aria-hidden>{TIME.map(([g, m]) => <i key={g} style={{ flexGrow: m, background: groupVar(g).strong }} />)}</div>
          <div className="legend">
            {TIME.map(([g, m]) => <div key={g}><i className="gdot" style={{ width: 10, height: 10, background: groupVar(g).strong }} /><span className="callout">{GROUP_LABEL[g]}</span><span className="footnote" style={{ color: 'var(--text-secondary)' }}>{fmtDur(m)}</span></div>)}
          </div>
        </div>
      </section>

      <section className="sec" style={{ gap: 14 }}>
        <SectionHeader title="This week" />
        <div className="notes-row">
          <button className="note sm" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}>
            <span className="label-mono-sm muted">COMPLETED THIS WEEK</span><span className="title1">{n(completed)}</span><span className="footnote muted">{showDone ? 'Tap to hide them' : 'Tap to show them'}</span>
          </button>
          <div className="note sm"><span className="label-mono-sm muted">DEFERRED INTENTIONALLY</span><span className="title1">2 tasks</span><span className="footnote muted">Put aside on purpose</span></div>
          <div className="note sm"><span className="label-mono-sm muted">LONG-RUNNING</span><span className="title1">1 task</span><span className="footnote muted">Still in progress</span></div>
        </div>
        {showDone && (done.length ? done.map((t) => <TaskCard key={t.id} task={t} />) : <p className="footnote muted">Nothing finished today yet. Earlier days are already tucked away.</p>)}
      </section>

      {decisions.length > 0 && (
        <section className="sec">
          <SectionHeader title="Needs a decision" aside={n(decisions.length)} />
          <p className="footnote muted">No rush. These wait until you decide.</p>
          {decisions.map((t) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t)} onToggle={() => setSheet(t)} />)}
        </section>
      )}
      {sheet && <DecisionSheet task={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
