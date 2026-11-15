import { IconList, IconMonth, IconPlus, IconReflect, IconSun } from './Icons'
export type Tab = 'today' | 'plan' | 'month' | 'reflect'
const tabs: { id: Tab; label: string; Icon: typeof IconSun }[] = [
  { id: 'today', label: 'Today', Icon: IconSun }, { id: 'plan', label: 'Plan', Icon: IconList },
  { id: 'month', label: 'Month', Icon: IconMonth }, { id: 'reflect', label: 'Reflect', Icon: IconReflect },
]
export function TabBar({ active, onChange, onCapture }: { active: Tab; onChange: (t: Tab) => void; onCapture: () => void }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabs">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} className={active === id ? 'on' : ''} onClick={() => onChange(id)} aria-current={active === id ? 'page' : undefined}>
            <Icon size={22} /><span>{label}</span>
          </button>
        ))}
      </div>
      <button className="capture" onClick={onCapture} aria-label="Capture a task"><IconPlus size={26} color="#fff" /></button>
    </nav>
  )
}
