import { create } from 'zustand'

export type Group = 'none' | 'work' | 'study' | 'personal' | 'lifestyle'
export type Task = {
  id: string; title: string; group: Group; effort: number // minutes
  picked: boolean          // chosen for today's focus
  status: 'planned' | 'in-focus' | 'done' | 'decision' | 'saved'
  start?: string           // "HH:MM" for timeline
  doneAt?: string
  plannedFor?: string      // e.g. "FRI"
  due?: string             // external deadline, e.g. "FRI 7"
}
export type Commitment = { id: string; title: string; start: string; end: string; group: Group }

const seed: Task[] = [
  { id: 't1', title: 'Prepare client presentation', group: 'work', effort: 120, picked: true, status: 'in-focus', start: '10:45' },
  { id: 't2', title: 'Book a yoga class for Thursday', group: 'lifestyle', effort: 15, picked: true, status: 'planned', start: '15:00' },
  { id: 't3', title: 'Read chapter 3 for Italian class', group: 'study', effort: 15, picked: true, status: 'done', start: '10:25', doneAt: '08:40' },
  { id: 't4', title: 'Submit weekly timesheet', group: 'work', effort: 15, picked: false, status: 'decision', plannedFor: 'FRI' },
  { id: 't5', title: 'Call the dentist', group: 'personal', effort: 15, picked: false, status: 'saved' },
  { id: 't6', title: 'Plan weekend trip', group: 'lifestyle', effort: 45, picked: false, status: 'saved' },
  { id: 't7', title: 'Reply to landlord', group: 'personal', effort: 15, picked: false, status: 'saved' },
  { id: 't8', title: 'Tidy the desk', group: 'lifestyle', effort: 15, picked: false, status: 'saved' },
]
export const commitments: Commitment[] = [
  { id: 'c1', title: 'Team stand-up', start: '09:15', end: '10:00', group: 'work' },
  { id: 'c2', title: 'Lunch', start: '13:00', end: '14:00', group: 'personal' },
  { id: 'c3', title: 'Client call', start: '14:00', end: '14:45', group: 'work' },
]

export type Choice = 'continue' | 'rescope' | 'split' | 'defer' | 'release'
type State = {
  tasks: Task[]; view: 'focus' | 'timeline'; capacityMin: number
  focusId: string | null; focusOpen: boolean; remaining: number; sessionMin: number
  openFocus: (id: string) => void; closeFocus: () => void; tick: () => void
  applyChoice: (id: string, c: Choice) => void
  setView: (v: 'focus' | 'timeline') => void
  toggleDone: (id: string) => void
  decide: (id: string, to: 'today' | 'later' | 'release') => void
  addTask: (t: Pick<Task, 'title' | 'group' | 'effort'> & Partial<Pick<Task, 'plannedFor' | 'due' | 'status'>>) => void
  reset: () => void
}
const load = (): Partial<State> => { try { return JSON.parse(localStorage.getItem('tend-demo') || '{}') } catch { return {} } }
const persist = (s: State) => { try { localStorage.setItem('tend-demo', JSON.stringify({ tasks: s.tasks, view: s.view })) } catch { /* ignore */ } }
const saved = load()

export const useTend = create<State>((set, get) => ({
  tasks: (saved.tasks as Task[]) ?? seed, view: (saved.view as State['view']) ?? 'focus', capacityMin: 210,
  focusId: 't1', focusOpen: false, remaining: 24 * 60 + 18, sessionMin: 45,
  openFocus: (id) => {
    const cur = get()
    const fresh = cur.focusId !== id
    set({ focusId: id, focusOpen: true, remaining: fresh ? cur.sessionMin * 60 : cur.remaining,
      tasks: cur.tasks.map((t) => t.id === id ? { ...t, picked: true, status: 'in-focus' as const } : t.status === 'in-focus' ? { ...t, status: 'planned' as const } : t) })
    persist(get())
  },
  closeFocus: () => set({ focusOpen: false }),
  tick: () => set((s) => ({ remaining: Math.max(0, s.remaining - 1) })),
  applyChoice: (id, c) => {
    set((s) => {
      const t = s.tasks.find((x) => x.id === id); if (!t) return s
      const rest = s.tasks.filter((x) => x.id !== id)
      const half = Math.max(15, Math.round(t.effort / 2 / 15) * 15)
      let next: Task[] = s.tasks
      if (c === 'continue') next = s.tasks.map((x) => x.id === id ? { ...x, status: 'planned' } : x)
      if (c === 'rescope') next = s.tasks.map((x) => x.id === id ? { ...x, status: 'planned', effort: half } : x)
      if (c === 'split') next = [...rest, { ...t, id: id + 'a', title: t.title + ' · part 1', effort: half, status: 'planned' as const }, { ...t, id: id + 'b', title: t.title + ' · part 2', effort: half, picked: false, status: 'saved' as const }]
      if (c === 'defer') next = s.tasks.map((x) => x.id === id ? { ...x, picked: false, status: 'saved', plannedFor: undefined } : x)
      if (c === 'release') next = rest
      return { tasks: next, focusId: s.focusId === id ? null : s.focusId }
    })
    persist(get())
  },
  setView: (view) => { set({ view }); persist(get()) },
  toggleDone: (id) => { set((s) => ({ tasks: s.tasks.map((t) => t.id !== id ? t : t.status === 'done' ? { ...t, status: 'planned', doneAt: undefined } : { ...t, status: 'done', doneAt: new Date().toTimeString().slice(0, 5) }) })); persist(get()) },
  decide: (id, to) => { set((s) => ({ tasks: s.tasks.flatMap((t) => t.id !== id ? [t] : to === 'release' ? [] : to === 'today' ? [{ ...t, picked: true, status: 'planned' as const, plannedFor: undefined }] : [{ ...t, status: 'saved' as const, plannedFor: undefined }]) })); persist(get()) },
  addTask: (t) => { set((s) => ({ tasks: [...s.tasks, { status: 'saved' as const, ...t, id: 'n' + Date.now(), picked: false }] })); persist(get()) },
  reset: () => { set({ tasks: seed, view: 'focus', focusId: 't1', remaining: 24 * 60 + 18 }); persist(get()) },
}))
export const fmtDur = (m: number) => { const h = Math.floor(m / 60), r = m % 60; return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${r}m` }
export const effortLabel = (m: number) => (m >= 60 && m % 60 === 0 ? `${m / 60}H` : `${m} MIN`)
export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const fromMin = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
