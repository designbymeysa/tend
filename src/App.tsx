import { useEffect, useRef, useState } from 'react'
import Today from './screens/Today'
import Plan from './screens/Plan'
import Month from './screens/Month'
import Reflect from './screens/Reflect'
import { Onboarding, Profile, Settings } from './screens/Profile'
import { TabBar, Tab } from './components/TabBar'
import { CaptureSheet, FocusSheet, TransitionSheet } from './components/Overlays'
import { useTend } from './state/store'

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [page, setPage] = useState<null | 'profile' | 'settings'>(null)
  const [capture, setCapture] = useState(false)
  const [transition, setTransition] = useState(false)
  const { focusOpen, closeFocus, onboarded, finishOnboarding, settings } = useTend()
  // #onboarding replays the first-run flow at any time
  const [replay, setReplay] = useState(() => location.hash === '#onboarding')
  const scroll = useRef<HTMLDivElement>(null)
  useEffect(() => { scroll.current?.scrollTo(0, 0) }, [tab, page])
  const profile = () => setPage('profile')
  const endOnboarding = () => { finishOnboarding(); setReplay(false); if (location.hash) history.replaceState(null, '', location.pathname + location.search) }
  const screens = { today: Today, plan: Plan, month: Month, reflect: Reflect }
  const Screen = screens[tab]
  return (
    <div className="stage">
      <div className={`phone ${settings.reduceMotion ? 'reduce-motion' : ''}`}>
        {!onboarded || replay ? <Onboarding onDone={endOnboarding} /> : (<>
          <div className="scroll" ref={scroll}>
            {page === 'profile' ? <Profile onBack={() => setPage(null)} onSettings={() => setPage('settings')} />
              : page === 'settings' ? <Settings onBack={() => setPage('profile')} />
              : <Screen onProfile={profile} />}
          </div>
          {!page && <TabBar active={tab} onChange={setTab} onCapture={() => setCapture(true)} />}
          {capture && <CaptureSheet onClose={() => setCapture(false)} />}
          {focusOpen && <FocusSheet onClose={closeFocus} onPause={() => { closeFocus(); setTransition(true) }} />}
          {transition && <TransitionSheet onClose={() => setTransition(false)} />}
        </>)}
      </div>
    </div>
  )
}
