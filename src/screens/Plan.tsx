import { useEffect, useState } from 'react'
import { GROUP_LABEL, PageHeader, SectionHeader, Sticky, TaskCard, groupVar } from '../components/ui'
import { IconSearch } from '../components/Icons'
import { TaskSheet } from '../components/Overlays'
import { Group, TaskView, dayName, todayIso, useTasks } from '../state/store'

const GROUPS: Exclude<Group, 'none'>[] = ['work', 'study', 'personal', 'lifestyle']
type When = 'all' | 'timed' | 'planned' | 'whenever' | 'done'
const WHEN: [When, string][] = [['all', 'All'], ['timed', 'Timed'], ['planned', 'Planned'], ['whenever', 'Whenever'], ['done', 'Done']]
const GROUP_FILTERS: [Group | 'any', string][] = [['any', 'Any group'], ['work', 'Work'], ['study', 'Study'], ['personal', 'Personal'], ['lifestyle', 'Lifestyle'], ['none', 'No group']]
const byDay = (a: TaskView, b: TaskView) => (a.date ?? '9999').localeCompare(b.date ?? '9999') || (a.start ?? '99').localeCompare(b.start ?? '99') || a.title.localeCompare(b.title)

export default function Plan({ onProfile, reveal }: { onProfile: () => void; reveal?: { group: Group; id: string; n: number } }) {
  const tasks = useTasks()
  const [q, setQ] = useState('')
  const [view, setView] = useState<'overview' | 'all'>('overview')
  const [when, setWhen] = useState<When>('all')
  const [grp, setGrp] = useState<Group | 'any'>('any')
  const [open, setOpen] = useState<Group | null>('work')
  const [allPast, setAllPast] = useState(false)
  const [sheet, setSheet] = useState<string | null>(null)
  const today = todayIso()
  useEffect(() => {
    if (!reveal) return
    setQ(''); setOpen(reveal.group)
    const t = setTimeout(() => document.querySelector(`[data-task-id="${reveal.id}"]`)?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 80)
    return () => clearTimeout(t)
  }, [reveal])
  const live = tasks.filter((t) => !t.done)
  // Coming up: anything with a future day, plus ungrouped tasks that carry a deadline
  const isComing = (t: TaskView) => (!!t.date && t.date > today) || (!t.date && t.group === 'none' && !!t.due)
  const coming = live.filter(isComing).sort((a, b) => (a.date ?? a.due!).localeCompare(b.date ?? b.due!))
  const undated = live.filter((t) => !t.date && !isComing(t))
  const whenever = undated.filter((t) => t.group === 'none')
  const past = live.filter((t) => t.status === 'decision')
  const card = (t: TaskView) => <TaskCard key={t.id} task={t} onOpen={() => setSheet(t.id)} onToggle={() => setSheet(t.id)} />
  const query = q.trim().toLowerCase()
  const inWhen = (t: TaskView, w: When) => w === 'done' ? t.done : !t.done && (w === 'all' || (w === 'timed' ? !!t.start : w === 'planned' ? !!t.date : !t.date))
  const matches = (t: TaskView) => (!query || t.title.toLowerCase().includes(query) || GROUP_LABEL[t.group].toLowerCase().includes(query) || (!!t.date && dayName(t.date).toLowerCase().includes(query)))
    && (grp === 'any' || t.group === grp) && (view === 'all' ? inWhen(t, when) : !t.done)
  const filtering = view === 'all' || !!query
  const results = filtering ? tasks.filter(matches).sort(byDay) : []
  const anyFilter = !!query || when !== 'all' || grp !== 'any'
  const clear = () => { setQ(''); setWhen('all'); setGrp('any') }
  const count = (w: When) => tasks.filter((t) => inWhen(t, w)).length

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

      <div className="viewswitch" role="tablist" aria-label="Plan view">
        {(['overview', 'all'] as const).map((v) => <button key={v} role="tab" aria-selected={view === v} className={view === v ? 'on' : ''} onClick={() => setView(v)}>{v === 'overview' ? 'Overview' : `All tasks · ${count('all')}`}</button>)}
      </div>
      {view === 'all' && (
        <div className="filters">
          <div className="fchips" role="radiogroup" aria-label="Show">{WHEN.map(([id, label]) => <button key={id} role="radio" aria-checked={when === id} className={`pchip ${when === id ? 'on' : ''}`} onClick={() => setWhen(id)}>{label}<span className="fcount label-mono-sm">{count(id)}</span></button>)}</div>
          <div className="fchips" role="radiogroup" aria-label="Group">{GROUP_FILTERS.map(([id, label]) => <button key={id} role="radio" aria-checked={grp === id} className={`pchip ${grp === id ? 'on' : ''}`} onClick={() => setGrp(id)}>{id !== 'any' && id !== 'none' && <i className="gdot" style={{ background: groupVar(id).strong }} />}{label}</button>)}</div>
        </div>
      )}

      {filtering ? (
        <section className="sec">
          <SectionHeader title={view === 'all' ? (when === 'done' ? 'Done' : 'All tasks') : 'Results'} aside={`${results.length} ${results.length === 1 ? 'task' : 'tasks'}`} />
          {results.length ? results.map(card) : (
            <div className="sec"><p className="footnote muted">{anyFilter ? 'Nothing matches that yet.' : 'No tasks yet. Tap + to add one.'}</p>
              {anyFilter && <button className="link" onClick={clear}>Clear search and filters</button>}</div>
          )}
        </section>
      ) : (<>
        {coming.length > 0 && <section className="sec"><SectionHeader title="Coming up" />{coming.map(card)}</section>}
        {whenever.length > 0 && <section className="sec"><SectionHeader title="Whenever" />{whenever.map(card)}</section>}
        <section className="sec">
          {GROUPS.map((g) => {
            const list = undated.filter((t) => t.group === g); if (!list.length) return null
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
        {live.length === 0 && <p className="callout muted">Nothing here yet. Tap + to add your first task.</p>}
      </>)}
      {sheet && <TaskSheet id={sheet} onClose={() => setSheet(null)} />}
    </div>
  )
}
