import { useState } from 'react'
import Today from './screens/Today'
import { TabBar, Tab } from './components/TabBar'
import { CaptureSheet, FocusSheet, TransitionSheet } from './components/Overlays'
import { useTend } from './state/store'

function Soon({ name }: { name: string }) {
  return <div className="screen"><header className="header"><h1>{name}</h1></header><p className="callout muted">This screen is next in the build.</p></div>
}
export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [capture, setCapture] = useState(false)
  const [transition, setTransition] = useState(false)
  const { focusOpen, closeFocus } = useTend()
  return (
    <div className="stage">
      <div className="phone">
        <div className="scroll">
          {tab === 'today' ? <Today onProfile={() => {}} /> : <Soon name={tab[0].toUpperCase() + tab.slice(1)} />}
        </div>
        <TabBar active={tab} onChange={setTab} onCapture={() => setCapture(true)} />
        {capture && <CaptureSheet onClose={() => setCapture(false)} />}
        {focusOpen && <FocusSheet onClose={closeFocus} onPause={() => { closeFocus(); setTransition(true) }} />}
        {transition && <TransitionSheet onClose={() => setTransition(false)} />}
      </div>
    </div>
  )
}
