import { create } from 'zustand'

export type Group = 'work' | 'study' | 'personal' | 'lifestyle'
export type Task = {
  id: string; title: string; group: Group; effort: number // minutes
  picked: boolean          // chosen for today's focus
  status: 'planned' | 'in-focus' | 'done' | 'decision' | 'saved'
  start?: string           // "HH:MM" for timeline
  doneAt?: string
  plannedFor?: string      // e.g. "FRI"
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

type State = {
  tasks: Task[]; view: 'focus' | 'timeline'; capacityMin: number
  setView: (v: 'focus' | 'timeline') => void
  toggleDone: (id: string) => void
  decide: (id: string, to: 'today' | 'later' | 'release') => void
  addTask: (t: Pick<Task, 'title' | 'group' | 'effort'>) => void
  reset: () => void
}
const load = (): Partial<State> => { try { return JSON.parse(localStorage.getItem('tend-demo') || '{}') } catch { return {} } }
const persist = (s: State) => { try { localStorage.setItem('tend-demo', JSON.stringify({ tasks: s.tasks, view: s.view })) } catch { /* ignore */ } }
const saved = load()

export const useTend = create<State>((set, get) => ({
  tasks: (saved.tasks as Task[]) ?? seed, view: (saved.view as State['view']) ?? 'focus', capacityMin: 210,
  setView: (view) => { set({ view }); persist(get()) },
  toggleDone: (id) => { set((s) => ({ tasks: s.tasks.map((t) => t.id !== id ? t : t.status === 'done' ? { ...t, status: 'planned', doneAt: undefined } : { ...t, status: 'done', doneAt: new Date().toTimeString().slice(0, 5) }) })); persist(get()) },
  decide: (id, to) => { set((s) => ({ tasks: s.tasks.flatMap((t) => t.id !== id ? [t] : to === 'release' ? [] : to === 'today' ? [{ ...t, picked: true, status: 'planned' as const, plannedFor: undefined }] : [{ ...t, status: 'saved' as const, plannedFor: undefined }]) })); persist(get()) },
  addTask: (t) => { set((s) => ({ tasks: [...s.tasks, { ...t, id: 'n' + Date.now(), picked: false, status: 'saved' }] })); persist(get()) },
  reset: () => { set({ tasks: seed, view: 'focus' }); persist(get()) },
}))
export const fmtDur = (m: number) => { const h = Math.floor(m / 60), r = m % 60; return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${r}m` }
export const effortLabel = (m: number) => (m >= 60 && m % 60 === 0 ? `${m / 60}H` : `${m} MIN`)
export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const fromMin = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
