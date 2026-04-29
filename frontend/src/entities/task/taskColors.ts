export interface TaskColor {
  id: string
  label: string
  bgLight: string
  bgDark: string
  borderLight: string
  borderDark: string
}

export const TASK_COLORS: TaskColor[] = [
  { id: 'slate',  label: 'Slate',  bgLight: 'bg-slate-100',  bgDark: 'dark:bg-slate-800/60',  borderLight: 'border-slate-200',  borderDark: 'dark:border-slate-700' },
  { id: 'rose',   label: 'Rose',   bgLight: 'bg-rose-50',    bgDark: 'dark:bg-rose-900/25',   borderLight: 'border-rose-200',   borderDark: 'dark:border-rose-800' },
  { id: 'amber',  label: 'Amber',  bgLight: 'bg-amber-50',   bgDark: 'dark:bg-amber-900/25',  borderLight: 'border-amber-200',  borderDark: 'dark:border-amber-800' },
  { id: 'lime',   label: 'Lime',   bgLight: 'bg-lime-50',    bgDark: 'dark:bg-lime-900/25',   borderLight: 'border-lime-200',   borderDark: 'dark:border-lime-800' },
  { id: 'sky',    label: 'Sky',    bgLight: 'bg-sky-50',     bgDark: 'dark:bg-sky-900/25',    borderLight: 'border-sky-200',    borderDark: 'dark:border-sky-800' },
  { id: 'violet', label: 'Violet', bgLight: 'bg-violet-50',  bgDark: 'dark:bg-violet-900/25', borderLight: 'border-violet-200', borderDark: 'dark:border-violet-800' },
  { id: 'pink',   label: 'Pink',   bgLight: 'bg-pink-50',    bgDark: 'dark:bg-pink-900/25',   borderLight: 'border-pink-200',   borderDark: 'dark:border-pink-800' },
  { id: 'teal',   label: 'Teal',   bgLight: 'bg-teal-50',    bgDark: 'dark:bg-teal-900/25',   borderLight: 'border-teal-200',   borderDark: 'dark:border-teal-800' },
]

export const TASK_COLOR_DOT: Record<string, string> = {
  slate:  'bg-slate-400',
  rose:   'bg-rose-400',
  amber:  'bg-amber-400',
  lime:   'bg-lime-400',
  sky:    'bg-sky-400',
  violet: 'bg-violet-400',
  pink:   'bg-pink-400',
  teal:   'bg-teal-400',
}

export function getTaskColorClasses(colorId: string | null | undefined): string {
  if (!colorId) return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  const c = TASK_COLORS.find((tc) => tc.id === colorId)
  if (!c) return 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  return `${c.bgLight} ${c.bgDark} ${c.borderLight} ${c.borderDark}`
}
