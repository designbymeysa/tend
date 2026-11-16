import { useTend } from '../state/store'

/** First screen: pick which kind of user to try the prototype as. */
export default function Welcome() {
  const start = useTend((s) => s.startScenario)
  return (
    <div className="welcome">
      <div className="welcome-top">
        <img className="welcome-icon" src={`${import.meta.env.BASE_URL}brand/app-icon-dark.svg`} alt="" width={72} height={72} />
        <h1>Welcome to Tend</h1>
        <p className="sub">A calm place to plan your days. How would you like to try it?</p>
      </div>
      <div className="welcome-options">
        <button className="wopt" onClick={() => start('new')}>
          <span className="label-mono-sm muted">FROM SCRATCH</span>
          <b>Try as a new user</b>
          <span className="footnote">An empty app and a short setup first. Add your own tasks.</span>
        </button>
        <button className="wopt" onClick={() => start('demo')}>
          <span className="label-mono-sm muted">SAMPLE WEEK</span>
          <b>Try as someone with tasks planned</b>
          <span className="footnote">Skip setup and land on a day already underway.</span>
        </button>
      </div>
      <p className="footnote muted" style={{ textAlign: 'center' }}>Everything stays in this browser. You can switch any time in Settings.</p>
    </div>
  )
}
