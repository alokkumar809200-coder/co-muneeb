import { useState } from 'react'
import { subDays, startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'

export type DatePreset = 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth' | 'custom'

export interface DateRange {
  from: string
  to: string
  preset: DatePreset
}

export function getDateRangeFromPreset(preset: Exclude<DatePreset, 'custom'>): { from: string; to: string } {
  const now = new Date()
  const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

  switch (preset) {
    case 'today':
      return { from: fmt(now), to: fmt(now) }
    case 'yesterday': {
      const y = subDays(now, 1)
      return { from: fmt(y), to: fmt(y) }
    }
    case 'last7':
      return { from: fmt(subDays(now, 6)), to: fmt(now) }
    case 'last30':
      return { from: fmt(subDays(now, 29)), to: fmt(now) }
    case 'thisMonth':
      return { from: fmt(startOfMonth(now)), to: fmt(endOfMonth(now)) }
    case 'lastMonth': {
      const lm = subMonths(now, 1)
      return { from: fmt(startOfMonth(lm)), to: fmt(endOfMonth(lm)) }
    }
    default:
      return { from: fmt(subDays(now, 29)), to: fmt(now) }
  }
}

interface DateRangePickerProps {
  value: DateRange
  onChange: (range: DateRange) => void
  className?: string
}

const PRESETS: { label: string; value: DatePreset }[] = [
  { label: 'Today', value: 'today' },
  { label: 'Yesterday', value: 'yesterday' },
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: 'Custom', value: 'custom' },
]

export function DateRangePicker({ value, onChange, className }: DateRangePickerProps) {
  const [showCustom, setShowCustom] = useState(value.preset === 'custom')

  const handlePreset = (preset: DatePreset) => {
    if (preset === 'custom') {
      setShowCustom(true)
      onChange({ ...value, preset: 'custom' })
    } else {
      setShowCustom(false)
      const range = getDateRangeFromPreset(preset)
      onChange({ ...range, preset })
    }
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            onClick={() => handlePreset(p.value)}
            className={cn(
              'px-3 py-1.5 text-xs rounded-lg font-medium transition-colors border',
              value.preset === p.value
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      {showCustom && (
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="date"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <span className="text-xs text-gray-500">to</span>
          <input
            type="date"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}
    </div>
  )
}

export default DateRangePicker;