import { useState } from 'react'
import { CapacitySlider, GroupChips, SettingsRow, TopBar } from '../components/ui'
import { IconChevronLeft, IconGear } from '../components/Icons'
import { Sheet, SheetHeader } from '../components/Sheet'
import { Settings as S, effortLabel, fmtDur, useTend } from '../state/store'

const next = <T,>(list: T[], cur: T) => list[(list.indexOf(cur) + 1) % list.length]
const WORK = ['MON–FRI · 9–18', 'MON–FRI · 8–17', 'MON–FRI · 10–19', 'MON–SAT · 9–15']
const QUIET = ['21:00–08:00', '22:00–07:00', '23:00–08:00']
const FOCUS = [25, 45, 60, 90]

export function Profile({ onBack, onSettings }: { onBack: () => void; onSettings: () => void }) {
  const { settings, setSetting, sessionMin, setSessionMin, capacityMin, setCapacity } = useTend()
  const [cap, setCap] = useState(false)
  return (
    <div className="page">
      <TopBar label="Back" onBack={onBack} />
      <div className="who">
        <div className="who-row"><span className="avatar-xl" aria-hidden>M</span><button className="icon-btn" onClick={onSettings} aria-label="Settings"><IconGear size={24} /></button></div>
        <h1>Meysa</h1>
      </div>
      <section className="group">
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>YOUR RHYTHM</span>
        <div className="scard">
          <SettingsRow label="Working hours" helper="Sets how much focus fits each day" value={settings.workingHours} onClick={() => setSetting('workingHours', next(WORK, settings.workingHours))} />
          <SettingsRow label="Usual focus length" helper="Learned from your last 12 sessions" value={effortLabel(sessionMin)} onClick={() => setSessionMin(next(FOCUS, sessionMin))} />
          <SettingsRow label="Realistic focus a day" helper="What the capacity bar measures against" value={fmtDur(capacityMin)} onClick={() => setCap(true)} />
        </div>
      </section>
      <section className="group">
        <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>YOUR GROUPS</span>
        <GroupChips />
        <p className="footnote muted">Colours label a group, never a status. Tap one to rename it or change its colour.</p>
      </section>
      {cap && (
        <Sheet onClose={() => setCap(false)} label="Realistic focus a day">
          <SheetHeader eyebrow="YOUR RHYTHM" title="How much room is in your day?" sub="A starting point, not a target." />
          <CapacitySlider value={capacityMin} onChange={setCapacity} />
          <button className="btn primary" onClick={() => setCap(false)}>Done</button>
        </Sheet>
      )}
    </div>
  )
}

export function Settings({ onBack }: { onBack: () => void }) {
  const { settings, setSetting, sessionMin, setSessionMin, reset, tasks } = useTend()
  const [note, setNote] = useState('')
  const tog = (k: 'reduceMotion' | 'showTimer' | 'holdNotifications' | 'morningPrompt') => ({ on: settings[k], onChange: (v: boolean) => setSetting(k, v) })
  const exportCsv = () => {
    const q = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const csv = ['title,group,effort_min,done,planned_day,start_time,deadline,done_on', ...tasks.map((t) => [t.title, t.group, t.effort, t.done ? 'yes' : 'no', t.date, t.start, t.due, t.doneOn].map(q).join(','))].join('\n')
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'tend-tasks.csv'; a.click(); URL.revokeObjectURL(a.href)
    setNote('Your tasks were saved as tend-tasks.csv.')
  }
  const themes: [S['theme'], string][] = [['light', 'Light'], ['dark', 'Dark'], ['match', 'Match phone']]
  const label = (t: string) => <span className="label-mono" style={{ color: 'var(--text-secondary)' }}>{t}</span>
  return (
    <div className="page">
      <TopBar label="Profile" onBack={onBack} />
      <h1>Settings</h1>
      <section className="group">
        {label('APPEARANCE')}
        <div className="seg" role="radiogroup" aria-label="Appearance" style={{ marginBottom: 4 }}>
          {themes.map(([id, name]) => <button key={id} role="radio" aria-checked={settings.theme === id} className={settings.theme === id ? 'on' : ''} onClick={() => setSetting('theme', id)}>{name}</button>)}
        </div>
        <div className="scard"><SettingsRow label="Reduce motion" helper="Removes non-essential animation" toggle={tog('reduceMotion')} /></div>
      </section>
      <section className="group">
        {label('FOCUS')}
        <div className="scard">
          <SettingsRow label="Default focus length" helper="Suggested from your usual sessions" value={effortLabel(sessionMin)} onClick={() => setSessionMin(next(FOCUS, sessionMin))} />
          <SettingsRow label="Show the timer" helper="Turn off for a timer-free session" toggle={tog('showTimer')} />
          <SettingsRow label="Hold notifications during focus" toggle={tog('holdNotifications')} />
        </div>
      </section>
      <section className="group">
        {label('QUIET HOURS')}
        <div className="scard">
          <SettingsRow label="Quiet hours" helper="No prompts in this window" value={settings.quietHours} onClick={() => setSetting('quietHours', next(QUIET, settings.quietHours))} />
          <SettingsRow label="Morning planning prompt" helper="One gentle nudge at 9:30" toggle={tog('morningPrompt')} />
        </div>
      </section>
      <section className="group">
        {label('DATA')}
        <div className="scard">
          <SettingsRow label="Reset demo data" helper="Brings back the sample week. Your settings stay." onClick={() => { reset(); setNote('The sample week is back.') }} />
          <SettingsRow label="Export my tasks" helper="Download everything as a .csv file" onClick={exportCsv} />
        </div>
        <p className="footnote muted" role="status">{note}</p>
      </section>
    </div>
  )
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { settings, setSetting, capacityMin, setCapacity } = useTend()
  const [step, setStep] = useState(0)
  const filled = [2, 4, 5][step]
  const count = settings.groups.length + (settings.custom ? 1 : 0)
  const toggle = (g: S['groups'][number]) => setSetting('groups', settings.groups.includes(g) ? settings.groups.filter((x) => x !== g) : [...settings.groups, g])
  const forward = () => (step < 2 ? setStep(step + 1) : onDone())
  return (
    <div className="onb">
      <div className="onb-body">
        <div className="onb-top">
          <div className="steps" role="progressbar" aria-valuemin={1} aria-valuemax={5} aria-valuenow={filled} aria-label="Setup progress">{[1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= filled ? 'on' : ''} />)}</div>
          <button className="callout" style={{ color: 'var(--text-secondary)' }} onClick={onDone}>Skip</button>
        </div>
        <span style={{ height: 8, flex: 'none' }} />
        {step === 0 && (<>
          <h2 className="title1">What would you like to tend?</h2>
          <p className="sub">Pick the parts of life you want to plan. You can rename or add more later.</p>
          <GroupChips selected={settings.groups} custom={settings.custom} onToggle={toggle} onCustom={() => setSetting('custom', !settings.custom)} />
          <span className="label-mono muted">{count} SELECTED · CHANGE ANY TIME</span>
        </>)}
        {step === 1 && (<>
          <h2 className="title1">How much room is in your day?</h2>
          <p className="sub">Tend uses this to keep plans realistic. It’s a starting point, not a target.</p>
          <CapacitySlider value={capacityMin} onChange={setCapacity} />
          <span className="label-mono muted">DRAG TO ADJUST · YOU CAN CHANGE THIS DAY BY DAY</span>
        </>)}
        {step === 2 && (<>
          <h2 className="title1">How should Tend check in?</h2>
          <p className="sub">Everything here is optional. Tend stays quiet unless you ask.</p>
          <div className="scard plain">
            <SettingsRow label="Morning planning prompt" helper="One friendly nudge at 9:30" toggle={{ on: settings.morningPrompt, onChange: (v) => setSetting('morningPrompt', v) }} />
            <SettingsRow label="Quiet hours" helper="Tend stays quiet during these hours" value={settings.quietHours} onClick={() => setSetting('quietHours', next(QUIET, settings.quietHours))} />
            <SettingsRow label="Mute pings while you focus" helper="Notifications wait until you’re done" toggle={{ on: settings.holdNotifications, onChange: (v) => setSetting('holdNotifications', v) }} />
          </div>
        </>)}
      </div>
      <div className="onb-foot">
        <button className="btn primary" onClick={forward}>Next</button>
        {step === 1 && <button className="btn quiet" onClick={() => setStep(0)}><IconChevronLeft size={20} /> Back</button>}
        {step === 2 && <button className="btn quiet" onClick={onDone}>Decide later</button>}
      </div>
    </div>
  )
}
