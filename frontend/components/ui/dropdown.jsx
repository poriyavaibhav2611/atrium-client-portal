'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

const cx = (...values) => values.filter(Boolean).join(' ')

export function Dropdown({ value, onChange, options = [], className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className={cx('relative', className)}>
      <button 
        type="button"
        onClick={() => setOpen(!open)}
        className="flex h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-indigo-500 dark:border-white/10 dark:bg-white/[0.03]"
      >
        <span className="truncate">{value || 'Select option...'}</span>
        <ChevronDown className="size-4 opacity-50" />
      </button>
      
      {open && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-slate-200 bg-white p-1 text-sm shadow-xl dark:border-white/[0.08] dark:bg-[#111113]">
          {options.map((opt) => {
            const label = typeof opt === 'string' ? opt : opt.label;
            const val = typeof opt === 'string' ? opt : opt.value;
            const isSelected = value === val;
            
            return (
              <button
                key={val}
                type="button"
                onClick={() => { onChange(val); setOpen(false); }}
                className={cx(
                  'relative flex w-full cursor-default select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-left text-sm outline-none transition-colors hover:bg-slate-100 dark:hover:bg-white/[0.06]',
                  isSelected ? 'text-indigo-600 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-200'
                )}
              >
                {isSelected && (
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    <Check className="size-4" />
                  </span>
                )}
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
