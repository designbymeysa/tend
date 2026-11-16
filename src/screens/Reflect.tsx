import { useState } from 'react'
import { GROUP_LABEL, PageHeader, SectionHeader, Sticky, TaskCard, groupVar } from '../components/ui'
import { TaskSheet } from '../components/Overlays'
import { Group, addDays, fmtDur, parseIso, todayIso, useTasks, weekday } from '../state/store'

const GROUPS: Group[] = ['work', 'study', 'personal', 'lifestyle', 'none']

export default function Reflect({ onProfile }: { onProfile: () => void }) {
  const tasks = useTasks()
  const [sheet, setSheet] = useState<string | null>(null)
  const [showDone, setShowDone] = useState(false)
  const today = todayIso(), days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const done = tasks.filter((t) => t.done && t.doneOn && t.doneOn >= days[0] && t.doneOn <= today).sort((a, b) => b.doneOn!.localeCompare(a.doneOn!))
  const sum = (list: typeof tasks) => list.reduce((a, t) => a + t.effort, 0)
  const total = sum(done)
  const perDay = days.map((d) => sum(done.filter((t) => t.doneOn === d))), peak = Math.max(...perDay, 1)
  const rest = perDay.filter((m) => m === 0).length
  const byGroup = GROUPS.map((g) => [g, sum(done.filter((t) => t.group === g))] as const).filter(([, m]) => m > 0)
  const themes = [...byGroup].sort((a, b) => b[1] - a[1]).slice(0, 2).map(([g]) => GROUP_LABEL[g]).join(', ')
  const decisions = tasks.filter((t) => t.status === 'decision')
  const ahead = tasks.filter((t) => !t.done && t.date && t.date > today).length, saved = tasks.filter((t) => t.status === 'saved').length
  const n = (c: number) => `${c} ${c === 1 ? 'task' : 'tasks'}`
  const a = parseIso(days[0]), b = parseIso(today)
  const restNote = rest === 0 ? 'Focus every day this week. Remember to rest too.' : rest === 1 ? `${parseIso(days[perDay.indexOf(0)]).toLocaleDateString('en', { weekday: 'long' })} was a rest day. That counts too.` : `${rest} rest days this week. They count too.`

  return (
    <div className="screen roomy">
      <PageHeader title="Reflect" sub="A quiet look back at the week. Decide what comes with you." onProfile={onProfile} />
      <section className="sec" style={{ gap: 22 }}>
        <SectionHeader title="Your week" />
        <div className="note" style={{ padding: 20, gap: 16 }}>
          <div><span className="label-mono-sm muted">{b.toLocaleString('en', { month: 'short' }).toUpperCase()} · LAST 7 DAYS</span><p className="title1">{a.getDate()}–{b.getDate()}</p></div>
          <div className="tiles">
            <div className="tile" style={{ background: 'var(--accent-subtle)' }}><b>{fmtDur(total)}</b><span className="label-mono-sm">FOCUSED WORK</span></div>
            <div className="tile" style={{ background: 'var(--group-lifestyle-bg)' }}><b>{n(decisions.length)}</b><span className="label-mono-sm">CARRIED OVER</span></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="label-mono-sm muted">MAIN THEMES</span><span className="callout">{themes || 'Nothing finished yet'}</span></div>
        </div>
        <p className="footnote muted" style={{ textAlign: 'center' }}>No scores or streaks, just where your time went.</p>
      </section>

      <section className="sec" style={{ gap: 14 }}>
        <SectionHeader title="Noticed this week" />
        <div className="stage-notes" style={{ height: 290 }}>
          <Sticky id="reflect-pause" group="personal" tag="DONE" text={done.length ? `You finished ${n(done.length)}. Each one counts.` : 'A quiet week so far. That is allowed.'} style={{ left: 2, top: 27, width: 158 }} rot={4} />
          <Sticky id="reflect-rest" group="study" tag="REST" text={restNote} style={{ left: 181, top: 4, width: 156 }} rot={-4} />
          <Sticky id="reflect-calm" group="work" tag="CALM" text={`${fmtDur(total)} of focus. No scores, no streaks.`} style={{ left: 76, top: 155, width: 196 }} rot={2} />
        </div>
      </section>

      <section className="sec">
        <SectionHeader title="Your rhythm" aside="focus per day" />
        <div className="wcard">
          <div className="days" role="img" aria-label={`Focus per day: ${days.map((d, i) => `${weekday(d)} ${fmtDur(perDay[i])}`).join(', ')}`}>
            {days.map((d, i) => <div key={d} className="day"><div className="bar">{perDay[i] > 0 && <i style={{ height: Math.max(30, (perDay[i] / peak) * 76) }} />}</div><span className="label-mono-sm muted">{weekday(d)}</span></div>)}
          </div>
          <p className="footnote" style={{ color: 'var(--text-secondary)' }}>{restNote}</p>
        </div>
      </section>

      <section className="sec">
        <SectionHeader title="Where your time went" aside={fmtDur(total)} />
        <div className="wcard">
          {byGroup.length ? (<>
            <div className="gbar" aria-hidden>{byGroup.map(([g, m]) => <i key={g} style={{ flexGrow: m, background: groupVar(g).strong }} />)}</div>
            <div className="legend">
              {byGroup.map(([g, m]) => <div key={g}><i className="gdot" style={{ width: 10, height: 10, background: groupVar(g).strong }} /><span className="callout">{GROUP_LABEL[g]}</span><span className="footnote" style={{ color: 'var(--text-secondary)' }}>{fmtDur(m)}</span></div>)}
            </div>
          </>) : <p className="footnote muted">Finished tasks will show up here by group.</p>}
        </div>
      </section>

      <section className="sec" style={{ gap: 14 }}>
        <SectionHeader title="This week" />
        <div className="notes-row">
          <button className="note sm" onClick={() => setShowDone(!showDone)} aria-expanded={showDone}>
            <span className="label-mono-sm muted">COMPLETED THIS WEEK</span><span className="title1">{n(done.length)}</span><span className="footnote muted">{showDone ? 'Tap to hide them' : 'Tap to show them'}</span>
          </button>
          <div className="note sm"><span className="label-mono-sm muted">PLANNED AHEAD</span><span className="title1">{n(ahead)}</span><span className="footnote muted">Waiting on their day</span></div>
          <div className="note sm"><span className="label-mono-sm muted">SAVED FOR LATER</span><span className="title1">{n(saved)}</span><span className="footnote muted">No date, no pressure</span></div>
        </div>
        {showDone && (done.length ? done.map((t) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t.id)} />) : <p className="footnote muted">Nothing finished in the last 7 days yet.</p>)}
      </section>

      {decisions.length > 0 && (
        <section className="sec">
          <SectionHeader title="Needs a decision" aside={n(decisions.length)} />
          <p className="footnote muted">No rush. These wait until you decide.</p>
          {decisions.map((t) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t.id)} onToggle={() => setSheet(t.id)} />)}
        </section>
      )}
      {sheet && <TaskSheet id={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
