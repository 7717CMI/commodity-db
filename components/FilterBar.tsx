'use client'
import { motion, AnimatePresence } from 'framer-motion'
import type { PriceType } from '@/lib/types'
import { getImportWeeks, getImportWeekDates } from '@/lib/data'
import { format } from 'date-fns'

interface Props {
  priceType: PriceType
  // Local mode
  selectedDate: string
  availableDates: string[]
  onDateChange: (d: string) => void
  // Import mode
  selectedWeek: number
  selectedDay: number | null   // null = weekly average
  onWeekChange: (w: number) => void
  onDayChange: (day: number | null) => void
}

export default function FilterBar({
  priceType,
  selectedDate, availableDates, onDateChange,
  selectedWeek, selectedDay, onWeekChange, onDayChange,
}: Props) {
  const importWeeks = getImportWeeks()
  const weekDates = getImportWeekDates(selectedWeek)

  const formatDay = (dateStr: string) => {
    try { return format(new Date(dateStr), 'MMM d') } catch { return dateStr }
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-4 px-6 py-4 bg-white border-b border-slate-100">
      {/* Left — context label */}
      <div className="flex items-center gap-3">
        {priceType === 'local' && (
          <div className="text-sm text-slate-500 font-medium">
            Local Prices — UAE
          </div>
        )}
        {priceType === 'import' && (
          <div className="text-sm text-teal-700 font-medium border border-teal-200 bg-teal-50 rounded-lg px-3 py-1.5">
            Import Prices
          </div>
        )}
      </div>

      {/* Right — temporal controls */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Local: date picker */}
        {priceType === 'local' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              View Date
            </label>
            <input
              type="date"
              value={selectedDate}
              min={availableDates[0]}
              max={availableDates[availableDates.length - 1]}
              onChange={e => onDateChange(e.target.value)}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 cursor-pointer"
            />
          </div>
        )}

        {/* Import: week selector */}
        {priceType === 'import' && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              Select Week
            </label>
            <select
              value={String(selectedWeek)}
              onChange={e => onWeekChange(Number(e.target.value))}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 cursor-pointer min-w-48"
            >
              {importWeeks.map((label, idx) => {
                const dates = getImportWeekDates(idx)
                const rangeLabel = dates.length
                  ? `${formatDay(dates[0])} – ${formatDay(dates[dates.length - 1])}`
                  : ''
                return (
                  <option key={idx} value={String(idx)}>
                    {label} ({rangeLabel})
                  </option>
                )
              })}
            </select>
          </div>
        )}

        {/* Import: day dropdown */}
        <AnimatePresence>
          {priceType === 'import' && (
            <motion.div
              key="day-picker"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex flex-col gap-1"
            >
              <label className="text-xs text-slate-400 font-medium uppercase tracking-wide">
                View Day
              </label>
              <select
                value={selectedDay === null ? '' : String(selectedDay)}
                onChange={e => onDayChange(e.target.value === '' ? null : Number(e.target.value))}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 cursor-pointer min-w-40"
              >
                <option value="">Weekly Average</option>
                {weekDates.map((date, i) => (
                  <option key={i} value={String(i)}>
                    Day {i + 1} — {formatDay(date)}
                  </option>
                ))}
              </select>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
