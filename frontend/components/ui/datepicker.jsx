'use client'

import { useState, useRef, useEffect } from 'react'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'

const cx = (...values) => values.filter(Boolean).join(' ')

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay()
}

export function DatePicker({ value, onChange, name, required, className = '', placeholder = 'Select date' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  
  const [internalValue, setInternalValue] = useState('')
  const actualValue = value !== undefined ? value : internalValue

  const [currentDate, setCurrentDate] = useState(() => {
    if (actualValue) {
      const [y, m, d] = actualValue.split('-')
      if (y && m && d) return new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    }
    return new Date()
  })

  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (day) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    const yyyy = newDate.getFullYear()
    const mm = String(newDate.getMonth() + 1).padStart(2, '0')
    const dd = String(newDate.getDate()).padStart(2, '0')
    const str = `${yyyy}-${mm}-${dd}`
    
    if (value === undefined) setInternalValue(str)
    if (onChange) onChange(str)
    setOpen(false)
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const daysInMonth = getDaysInMonth(year, month)
  const firstDay = getFirstDayOfMonth(year, month)
  
  const displayValue = actualValue ? (() => {
    const [y, m, d] = actualValue.split('-')
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d))
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  })() : ''

  const isSelected = (day) => {
    if (!actualValue) return false
    const [y, m, d] = actualValue.split('-')
    return parseInt(y) === year && parseInt(m) - 1 === month && parseInt(d) === day
  }

  const isToday = (day) => {
    const today = new Date()
    return today.getFullYear() === year && today.getMonth() === month && today.getDate() === day
  }

  return (
    <div ref={ref} className={cx('relative', className)}>
      {name && <input type="hidden" name={name} value={actualValue} required={required} />}
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className={cx(
          "flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03] transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.06]",
          !actualValue && "text-slate-500 dark:text-slate-400"
        )}
      >
        <span>{displayValue || placeholder}</span>
        <CalendarIcon className="size-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xl dark:border-white/[0.08] dark:bg-[#111113]">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-slate-900 dark:text-slate-100 pl-1">
              {MONTHS[month]} {year}
            </span>
            <div className="flex gap-1">
              <button type="button" onClick={prevMonth} className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                <ChevronLeft className="size-4 opacity-70" />
              </button>
              <button type="button" onClick={nextMonth} className="flex size-7 items-center justify-center rounded-md hover:bg-slate-100 dark:hover:bg-white/[0.06]">
                <ChevronRight className="size-4 opacity-70" />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[11px] font-medium text-slate-400 dark:text-slate-500 py-1">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const selected = isSelected(day);
              const today = isToday(day);
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelect(day)}
                  className={cx(
                    "flex size-7 items-center justify-center rounded-md text-sm transition-colors mx-auto font-medium",
                    selected
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                      : today
                        ? "bg-slate-100 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-400 hover:bg-slate-200 dark:hover:bg-indigo-500/25"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.06]"
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  )
}
