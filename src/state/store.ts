import { useMemo } from 'react'
import { create } from 'zustand'

export type Group = 'none' | 'work' | 'study' | 'personal' | 'lifestyle'
export type Task = {
  id: string; title: string; group: Group; effort: number // minutes
  date?: string    // ISO day you plan to do it; none = saved for later
  due?: string     // ISO external deadline
  start?: string   // "HH:MM" on the timeline
  done: boolean; doneOn?: string; doneAt?: string
}
export type Status = 'planned' | 'in-focus' | 'done' | 'decision' | 'saved'
export type TaskView = Task & { status: Status }
export type Commitment = { id: string; title: string; start: string; end: string; group: Group }

// ---- dates (local time, ISO yyyy-mm-dd strings so they compare and persist cleanly)
const pad = (n: number) => String(n).padStart(2, '0')
const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
export const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const parseIso = (s: string) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d) }
export const todayIso = () => iso(new Date())
export const addDays = (s: string, n: number) => { const d = parseIso(s); d.setDate(d.getDate() + n); return iso(d) }
export const weekday = (s: string) => WD[parseIso(s).getDay()]
export const dayLabel = (s: string) => {
  const t = todayIso(); if (s === t) return 'TODAY'; if (s === addDays(t, 1)) return 'TOMORROW'
  const d = parseIso(s), far = d.getMonth() !== new Date().getMonth()
  return `${WD[d.getDay()]} ${d.getDate()}${far ? ' ' + d.toLocaleString('en', { month: 'short' }).toUpperCase() : ''}`
}
export const dayName = (s: string) => { const t = todayIso(); return s === t ? 'Today' : s === addDays(t, 1) ? 'Tomorrow' : s === addDays(t, -1) ? 'Yesterday' : `${parseIso(s).toLocaleDateString('en', { weekday: 'long' })} ${parseIso(s).getDate()}` }
export const statusOf = (t: Task, focusId: string | null): Status => {
  const today = todayIso()
  return t.done ? 'done' : t.date === today && focusId === t.id ? 'in-focus' : t.date && t.date < today ? 'decision' : t.date ? 'planned' : 'saved'
}

const makeSeed = (): Task[] => {
  const T = todayIso(), d = (n: number) => addDays(T, n)
  const open = (id: string, title: string, group: Group, effort: number, extra: Partial<Task> = {}): Task => ({ id, title, group, effort, done: false, ...extra })
  const did = (id: string, title: string, group: Group, effort: number, off: number, at = '11:20'): Task => ({ id, title, group, effort, done: true, date: d(off), doneOn: d(off), doneAt: at })
  return [
    open('t1', 'Prepare client presentation', 'work', 120, { date: T, start: '10:45' }),
    open('t2', 'Book a yoga class for Thursday', 'lifestyle', 15, { date: T, start: '15:00' }),
    { ...did('t3', 'Read chapter 3 for Italian class', 'study', 15, 0, '08:40'), start: '10:25' },
    open('t4', 'Submit weekly timesheet', 'work', 15, { date: d(-2) }),
    open('t9', 'Read chapter 4 for Italian class', 'study', 45, { date: d(-3) }),
    did('d1', 'Outline the case study', 'work', 90, -1), did('d2', 'Italian grammar exercises', 'study', 60, -2), did('d3', 'Reply to client emails', 'work', 30, -2),
    did('d4', 'Design review prep', 'work', 100, -4), did('d5', 'Call mum', 'personal', 20, -4),
    did('d6', 'Vocabulary flashcards', 'study', 40, -5), did('d7', 'Gym session', 'lifestyle', 30, -5), did('d8', 'Sort receipts', 'personal', 30, -5),
    open('n1', 'Call the landlord', 'none', 15, { due: d(4) }),
    open('n2', 'Send thank-you note to Sara', 'none', 10, { date: d(6) }),
    open('f1', 'Portfolio review', 'work', 60, { date: d(9), start: '14:00' }),
    open('f2', 'Case study first draft', 'study', 120, { due: d(12) }),
    open('n3', 'Water the plants', 'none', 10), open('n4', 'Tidy up the desk', 'none', 30),
    open('w1', 'Send invoice to the studio', 'work', 15, { due: d(5) }),
    open('w2', 'Draft brief for the spring project', 'work', 60), open('w3', "Reply to the client's feedback", 'work', 30),
    open('s1', 'Italian theory quiz', 'study', 60), open('s2', 'Case study outline', 'study', 180),
    open('s3', 'Review vocabulary flashcards', 'study', 15), open('s4', 'Watch lecture recording', 'study', 45),
    open('p1', 'Book a dentist appointment', 'personal', 15), open('p2', 'Reply to landlord', 'personal', 15),
    open('l1', 'Plan weekend trip', 'lifestyle', 45), open('l2', 'Weekend yoga', 'lifestyle', 60), open('l3', 'Try the new bakery', 'lifestyle', 30),
  ]
}
// Sample calendar for today's timeline
export const commitments: Commitment[] = [
  { id: 'c1', title: 'Team stand-up', start: '09:15', end: '10:00', group: 'work' },
  { id: 'c2', title: 'Lunch', start: '13:00', end: '14:00', group: 'personal' },
  { id: 'c3', title: 'Client call', start: '14:00', end: '14:45', group: 'work' },
]

export type Choice = 'continue' | 'rescope' | 'split' | 'defer' | 'release'
export type Settings = {
  theme: 'light' | 'dark' | 'match'; reduceMotion: boolean; showTimer: boolean; holdNotifications: boolean; morningPrompt: boolean
  quietHours: string; workingHours: string; groups: Group[]; custom: boolean
}
const defaultSettings: Settings = { theme: 'light', reduceMotion: false, showTimer: true, holdNotifications: true, morningPrompt: true, quietHours: '21:00–08:00', workingHours: 'MON–FRI · 9–18', groups: ['work'], custom: false }
type State = {
  tasks: Task[]; view: 'focus' | 'timeline'; day: string // the day shown on the Today tab
  capacityMin: number; capacityByDay: Record<string, number> // usual capacity + one-day overrides
  settings: Settings; onboarded: boolean
  focusId: string | null; focusOpen: boolean; remaining: number; sessionMin: number
  addTask: (t: Pick<Task, 'title'> & Partial<Task>) => Task
  updateTask: (id: string, patch: Partial<Task>) => void
  deleteTask: (id: string) => void
  toggleDone: (id: string) => void
  openFocus: (id: string) => void; closeFocus: () => void; tick: () => void
  applyChoice: (id: string, c: Choice) => void
  setView: (v: 'focus' | 'timeline') => void; setDay: (d: string) => void
  setCapacity: (m: number) => void; setCapacityFor: (day: string, m: number | null) => void
  setSessionMin: (m: number) => void
  setSetting: <K extends keyof Settings>(k: K, v: Settings[K]) => void
  mode: 'new' | 'demo' | null   // which scenario is being tried; null = show the welcome screen
  startScenario: (m: 'new' | 'demo') => void; leaveScenario: () => void
  seededOn: string | null   // the day the sample week was last planned around
  rollDay: () => void       // call when the date may have changed: re-anchors the sample week to the real today
  finishOnboarding: () => void; reset: () => void
}
/** Flip to true to bring back the first screen that asks to try Tend as a new user or with a sample week. */
export const WELCOME_ENABLED = false
const KEY = 'tend-demo-3'
const load = (): Partial<State> => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') } catch { return {} } }
const persist = (s: State) => { try { localStorage.setItem(KEY, JSON.stringify({ tasks: s.tasks, view: s.view, capacityMin: s.capacityMin, capacityByDay: s.capacityByDay, sessionMin: s.sessionMin, settings: s.settings, onboarded: s.onboarded, focusId: s.focusId, mode: s.mode, seededOn: s.seededOn })) } catch { /* ignore */ } }
const saved = load()
// Everyone starts with the sample week unless they already have their own saved state (or the welcome screen is on)
const fresh = WELCOME_ENABLED ? !saved.tasks : !saved.tasks || saved.mode == null
// Sample tasks have ids like t1/w2/s3; anything the visitor adds is 'u…' and keeps the dates they chose.
const isUserTask = (t: Task) => t.id.startsWith('u')
const SEED_REMAINING = 24 * 60 + 18
/** The sample week planned around the real today, with the visitor's own tasks carried over untouched. */
const replan = (tasks: Task[]) => [...makeSeed(), ...tasks.filter(isUserTask)]
let lastToday = todayIso()
const initialMode: 'new' | 'demo' | null = fresh ? (WELCOME_ENABLED ? null : 'demo') : saved.mode ?? 'demo'
const replanned = initialMode === 'demo' && (fresh || saved.seededOn !== todayIso())
const initialTasks: Task[] = fresh ? (WELCOME_ENABLED ? [] : makeSeed()) : replanned ? replan(saved.tasks!) : saved.tasks!
const nowTime = () => new Date().toTimeString().slice(0, 5)

export const useTend = create<State>((set, get) => {
  const save = (fn: (s: State) => Partial<State>) => { set(fn); persist(get()) }
  const patch = (id: string, fn: (t: Task) => Task) => (s: State) => ({ tasks: s.tasks.map((t) => t.id === id ? fn(t) : t) })
  return {
    tasks: initialTasks, mode: initialMode, seededOn: initialMode === 'demo' ? todayIso() : null, view: saved.view ?? 'focus', day: todayIso(),
    capacityMin: saved.capacityMin ?? 210, capacityByDay: saved.capacityByDay ?? {},
    settings: { ...defaultSettings, ...saved.settings }, onboarded: fresh ? !WELCOME_ENABLED : !!saved.onboarded,
    focusId: fresh ? (WELCOME_ENABLED ? null : 't1') : replanned ? 't1' : saved.focusId ?? null, focusOpen: false, sessionMin: saved.sessionMin ?? 45,
    remaining: (fresh && !WELCOME_ENABLED) || replanned ? SEED_REMAINING : (saved.sessionMin ?? 45) * 60,
    addTask: (t) => { const task: Task = { group: 'none', effort: 30, done: false, ...t, id: 'u' + Date.now() }; save((s) => ({ tasks: [...s.tasks, task] })); return task },
    updateTask: (id, p) => save(patch(id, (t) => ({ ...t, ...p }))),
    deleteTask: (id) => save((s) => ({ tasks: s.tasks.filter((t) => t.id !== id), focusId: s.focusId === id ? null : s.focusId, focusOpen: s.focusId === id ? false : s.focusOpen })),
    toggleDone: (id) => save((s) => ({
      ...patch(id, (t) => t.done ? { ...t, done: false, doneOn: undefined, doneAt: undefined } : { ...t, done: true, date: t.date ?? todayIso(), doneOn: todayIso(), doneAt: nowTime() })(s),
      focusId: s.focusId === id ? null : s.focusId,
    })),
    openFocus: (id) => save((s) => ({
      ...patch(id, (t) => ({ ...t, date: todayIso(), done: false }))(s),
      focusId: id, focusOpen: true, remaining: s.focusId === id ? s.remaining : s.sessionMin * 60,
    })),
    closeFocus: () => set({ focusOpen: false }),
    tick: () => set((s) => ({ remaining: Math.max(0, s.remaining - 1) })),
    applyChoice: (id, c) => save((s) => {
      const t = s.tasks.find((x) => x.id === id); if (!t) return {}
      const half = Math.max(15, Math.round(t.effort / 2 / 15) * 15)
      const rest = s.tasks.filter((x) => x.id !== id)
      const tasks = c === 'continue' ? s.tasks
        : c === 'rescope' ? s.tasks.map((x) => x.id === id ? { ...x, effort: half } : x)
        : c === 'split' ? [...rest, { ...t, title: t.title + ' · part 1', effort: half }, { ...t, id: id + 'b', title: t.title + ' · part 2', effort: half, date: undefined, start: undefined }]
        : c === 'defer' ? s.tasks.map((x) => x.id === id ? { ...x, date: addDays(todayIso(), 1), start: undefined } : x)
        : rest
      return { tasks, focusId: s.focusId === id ? null : s.focusId }
    }),
    setView: (view) => save(() => ({ view })),
    setDay: (day) => set({ day }),
    setCapacity: (capacityMin) => save(() => ({ capacityMin })),
    setCapacityFor: (day, m) => save((s) => { const next = { ...s.capacityByDay }; if (m === null) delete next[day]; else next[day] = m; return { capacityByDay: next } }),
    setSessionMin: (sessionMin) => save(() => ({ sessionMin })),
    setSetting: (k, v) => save((s) => ({ settings: { ...s.settings, [k]: v } })),
    finishOnboarding: () => save(() => ({ onboarded: true })),
    startScenario: (mode) => save(() => ({
      mode, day: todayIso(), view: 'focus' as const, capacityMin: 210, capacityByDay: {}, sessionMin: 45, settings: { ...defaultSettings },
      tasks: mode === 'demo' ? makeSeed() : [], onboarded: mode === 'demo', seededOn: mode === 'demo' ? todayIso() : null,
      focusId: mode === 'demo' ? 't1' : null, remaining: mode === 'demo' ? 24 * 60 + 18 : 45 * 60, focusOpen: false,
    })),
    rollDay: () => {
      const t = todayIso(); if (t === lastToday) return
      lastToday = t
      save((s) => s.mode === 'demo'
        ? { day: t, seededOn: t, tasks: replan(s.tasks), focusId: 't1', remaining: SEED_REMAINING, focusOpen: false }
        : { day: t })
    },
    leaveScenario: () => save(() => ({ mode: null, focusOpen: false })),
    reset: () => save(() => ({ seededOn: todayIso(), tasks: makeSeed(), view: 'focus', day: todayIso(), focusId: 't1', remaining: 24 * 60 + 18, capacityByDay: {} })),
  }
})
/** Tasks with their status worked out from dates, done state and the current focus. */
export function useTasks(): TaskView[] {
  const tasks = useTend((s) => s.tasks), focusId = useTend((s) => s.focusId)
  return useMemo(() => tasks.map((t) => ({ ...t, status: statusOf(t, focusId) })), [tasks, focusId])
}
export const capacityFor = (s: Pick<State, 'capacityMin' | 'capacityByDay'>, day: string) => s.capacityByDay[day] ?? s.capacityMin
// Capacity counts everything planned for the day, finished or not: time already spent stays spent
export const usedOn = (tasks: Task[], day: string) => tasks.filter((t) => t.date === day).reduce((a, t) => a + t.effort, 0)
export const fmtDur = (m: number) => { const h = Math.floor(m / 60), r = m % 60; return h && r ? `${h}h ${r}m` : h ? `${h}h` : `${r}m` }
export const effortLabel = (m: number) => (m >= 60 && m % 60 === 0 ? `${m / 60}H` : `${m} MIN`)
export const toMin = (hhmm: string) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const fromMin = (n: number) => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`
