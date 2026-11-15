import type { ReactNode } from 'react'
type P = { size?: number; color?: string }
const Svg = ({ size = 20, color = 'currentColor', children }: P & { children: ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
)
export const IconBriefcase = (p: P) => <Svg {...p}><rect x="3" y="7.5" width="18" height="12" rx="3" /><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 13h18" /></Svg>
export const IconSparkle = (p: P) => <Svg {...p}><path d="M12 3.5c.6 4.2 2.3 5.9 6.5 6.5-4.2.6-5.9 2.3-6.5 6.5-.6-4.2-2.3-5.9-6.5-6.5 4.2-.6 5.9-2.3 6.5-6.5ZM18.5 16.5c.2 1.4.8 2 2 2.2-1.2.2-1.8.8-2 2.1-.2-1.3-.8-1.9-2-2.1 1.2-.2 1.8-.8 2-2.2Z" /></Svg>
export const IconBook = (p: P) => <Svg {...p}><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5v13c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5v-13ZM12 6v13.5" /></Svg>
export const IconHeart = (p: P) => <Svg {...p}><path d="M12 19.5C5 15 3.5 11.5 3.5 9a4.2 4.2 0 0 1 8.5-1 4.2 4.2 0 0 1 8.5 1c0 2.5-1.5 6-8.5 10.5Z" /></Svg>
export const IconCheck = (p: P) => <Svg {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Svg>
export const IconClock = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>
export const IconCalendar = (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M8 3v4M16 3v4M3.5 10h17" /></Svg>
export const IconSun = (p: P) => <Svg {...p}><circle cx="12" cy="12" r="3.8" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></Svg>
export const IconList = (p: P) => <Svg {...p}><path d="M9 6.5h11M9 12h11M9 17.5h11M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" /></Svg>
export const IconMonth = (p: P) => <Svg {...p}><rect x="3.5" y="5" width="17" height="15.5" rx="3.5" /><path d="M8 3v4M16 3v4M3.5 10h17M8.5 14h.01M12 14h.01M15.5 14h.01M8.5 17h.01M12 17h.01" /></Svg>
export const IconReflect = (p: P) => <Svg {...p}><path d="M7 17.5a4 4 0 0 1-.5-7.9 5.5 5.5 0 0 1 10.6 1.2A3.4 3.4 0 0 1 17 17.5H7ZM9 20.5h.01M12 20.5h.01" /></Svg>
export const IconPlus = (p: P) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>
export const IconPlay = (p: P) => <Svg {...p}><path d="M8 5.5v13l11-6.5-11-6.5Z" /></Svg>
export const Doodle = ({ color }: { color: string }) => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M24 43V25" /><path d="M24 28c-7 0-10-4-10-9 6 0 10 3 10 9ZM24 24c0-6 3-10 10-10 0 6-3 10-10 10Z" /><path d="M15 43h18l-2-7H17l-2 7Z" />
  </svg>
)
