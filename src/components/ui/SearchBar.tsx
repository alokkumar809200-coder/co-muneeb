import { useState, useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  value?: string
  onChange: (value: string) => void
  placeholder?: string
  debounce?: number
  className?: string
}

export default function SearchBar({
  value: externalValue,
  onChange,
  placeholder = 'Search...',
  debounce = 300,
  className,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(externalValue ?? '')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (externalValue !== undefined) {
      setLocalValue(externalValue)
    }
  }, [externalValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalValue(val)
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => onChange(val), debounce)
  }

  const handleClear = () => {
    setLocalValue('')
    if (timerRef.current) clearTimeout(timerRef.current)
    onChange('')
  }

  return (
    <div className={cn('relative flex items-center', className)}>
      <Search className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
      />
      {localValue && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 p-0.5 rounded text-gray-400 hover:text-gray-600"
          aria-label="Clear search"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
