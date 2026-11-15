import { useState } from 'react'
import { GROUP_LABEL, PageHeader, SectionHeader, Sticky, TaskCard, groupVar } from '../components/ui'
import { IconSearch } from '../components/Icons'
import { DecisionSheet } from '../components/Overlays'
import { Group, Task, useTend } from '../state/store'

const GROUPS: Exclude<Group, 'none'>[] = ['work', 'study', 'personal', 'lifestyle']

export default function Plan({ onProfile }: { onProfile: () => void }) {
  const tasks = useTend((s) => s.tasks)
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<Group | null>('work')
  const [allPast, setAllPast] = useState(false)
  const [sheet, setSheet] = useState<Task | null>(null)
  const saved = tasks.filter((t) => t.status === 'saved')
  const loose = saved.filter((t) => t.group === 'none')
  const coming = loose.filter((t) => t.due || t.plannedFor), whenever = loose.filter((t) => !t.due && !t.plannedFor)
  const past = tasks.filter((t) => t.status === 'decision')
  const card = (t: Task) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t)} onToggle={() => setSheet(t)} />
  const query = q.trim().toLowerCase()
  const hits = query ? [...saved, ...past].filter((t) => t.title.toLowerCase().includes(query) || GROUP_LABEL[t.group].toLowerCase().includes(query)) : []

  return (
    <div className="screen roomy">
      <PageHeader title="Plan" sub="Everything you're holding. Pick what fits." onProfile={onProfile} />
      <section className="sec" style={{ gap: 14 }}>
        <SectionHeader title="Remember that" />
        <div className="stage-notes" style={{ height: 150 }}>
          <Sticky group="lifestyle" tag="ENOUGH" text="You only need a few of these today." style={{ left: 10, top: 10, width: 160, transform: 'rotate(-3deg)' }} />
          <Sticky group="study" tag="NO RUSH" text="The rest will wait for you." style={{ left: 173, top: 44, width: 160, transform: 'rotate(3deg)' }} />
        </div>
      </section>
      <label className="search">
        <IconSearch size={20} />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tasks, groups or projects" aria-label="Search tasks, groups or projects" />
      </label>

      {query ? (
        <section className="sec">
          <SectionHeader title="Results" aside={`${hits.length} ${hits.length === 1 ? 'task' : 'tasks'}`} />
          {hits.length ? hits.map(card) : <p className="footnote muted">Nothing matches that yet.</p>}
        </section>
      ) : (<>
        {coming.length > 0 && <section className="sec"><SectionHeader title="Coming up" />{coming.map(card)}</section>}
        {whenever.length > 0 && <section className="sec"><SectionHeader title="Whenever" />{whenever.map(card)}</section>}
        <section className="sec">
          {GROUPS.map((g) => {
            const list = saved.filter((t) => t.group === g); if (!list.length) return null
            const count = `${list.length} ${list.length === 1 ? 'TASK' : 'TASKS'}`, dot = <i className="gdot" style={{ background: groupVar(g).strong }} />
            return open === g ? (
              <div key={g} className="sec">
                <button className="ghead label-mono" aria-expanded onClick={() => setOpen(null)}>{dot}<span>{GROUP_LABEL[g]}</span><span className="grow-1" /><span>{count}</span><span className="muted">HIDE ↑</span></button>
                {list.map(card)}
              </div>
            ) : (
              <button key={g} className="grow" aria-expanded={false} onClick={() => setOpen(g)}>{dot}<span className="callout">{GROUP_LABEL[g]}</span><span className="grow-1" /><span className="label-mono">{count}</span><span className="label-mono muted">SHOW ↓</span></button>
            )
          })}
        </section>
        {past.length > 0 && (
          <section className="sec">
            <div className="sec-head"><span className="headline">From past days</span>{past.length > 1 && <button className="pill-btn label-mono" onClick={() => setAllPast(!allPast)}>{allPast ? 'Show less' : 'View all'}</button>}</div>
            <p className="footnote muted">Not late, just waiting. Bring one along or let it go.</p>
            {(allPast ? past : past.slice(0, 1)).map(card)}
          </section>
        )}
      </>)}
      {sheet && <DecisionSheet task={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
