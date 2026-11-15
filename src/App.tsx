import { useState } from 'react'
import Today from './screens/Today'
import { TabBar, Tab } from './components/TabBar'

function Soon({ name }: { name: string }) {
  return <div className="screen"><header className="header"><h1>{name}</h1></header><p className="callout muted">This screen is next in the build.</p></div>
}
export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  return (
    <div className="stage">
      <div className="phone">
        <div className="scroll">
          {tab === 'today' ? <Today onProfile={() => {}} /> : <Soon name={tab[0].toUpperCase() + tab.slice(1)} />}
        </div>
        <TabBar active={tab} onChange={setTab} onCapture={() => {}} />
      </div>
    </div>
  )
}
