'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import {
  getLocalRecord, getImportRecord, getLocalDates,
  buildTrendData, buildImportTrendData,
  filterLast, filterByRange, aggregateByWeek, formatPrice,
} from '@/lib/data'
import type { Entity, PriceType, TrendPeriod } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  commodity: string
  country: string
  entity: Entity
  priceType: PriceType
  selectedWeek: number
}

export default function TrendChart({ commodity, country, entity, priceType, selectedWeek }: Props) {
  const [period, setPeriod] = useState<TrendPeriod>('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const localDates = getLocalDates()

  // Build the base data points depending on price type
  const allPoints = useMemo(() => {
    if (priceType === 'import') {
      const rec = getImportRecord(country, commodity)
      if (!rec) return []
      return buildImportTrendData(rec, selectedWeek)
    }
    const rec = getLocalRecord(entity, country, commodity)
    if (!rec) return []
    return buildTrendData(rec, localDates)
  }, [commodity, country, entity, priceType, selectedWeek, localDates])

  // For import mode: always show all 7 days of the selected week (no period filter)
  const chartData = useMemo(() => {
    if (priceType === 'import') return allPoints
    switch (period) {
      case 'day':   return filterLast(allPoints, 7)
      case 'week':  return aggregateByWeek(filterLast(allPoints, 28))
      case 'month': return allPoints
      case 'custom':
        return customFrom && customTo ? filterByRange(allPoints, customFrom, customTo) : allPoints
    }
  }, [allPoints, priceType, period, customFrom, customTo])

  const minPrice = chartData.length ? Math.min(...chartData.map(d => d.price)) : 0
  const maxPrice = chartData.length ? Math.max(...chartData.map(d => d.price)) : 0
  const avgPrice = chartData.length
    ? Math.round((chartData.reduce((s, d) => s + d.price, 0) / chartData.length) * 100) / 100
    : 0

  const LOCAL_PERIODS: { label: string; value: TrendPeriod }[] = [
    { label: 'Last 7 Days', value: 'day' },
    { label: 'By Week', value: 'week' },
    { label: 'Full Month', value: 'month' },
    { label: 'Custom', value: 'custom' },
  ]

  const formatXAxis = (dateStr: string) => {
    try {
      return period === 'week' && priceType === 'local'
        ? `Wk ${format(new Date(dateStr), 'MM/dd')}`
        : format(new Date(dateStr), 'MMM d')
    } catch { return dateStr }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
        <p className="text-slate-500 mb-1">{label}</p>
        <p className="font-semibold text-slate-800">${formatPrice(payload[0].value)}</p>
      </div>
    )
  }

  const chartKey = `${commodity}-${country}-${priceType}-${selectedWeek}-${period}`

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white rounded-xl border border-slate-100 p-6"
    >
      {/* Section header */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h3 className="text-base font-semibold text-slate-800">Price Trend Analysis</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {commodity} · {country} ·{' '}
            {priceType === 'import'
              ? `Import — ${selectedWeek === 0 ? 'Week 1' : 'Week 2'}`
              : entity}
          </p>
        </div>

        {/* Stats pills */}
        <div className="flex gap-3 flex-wrap">
          {[
            { label: 'Min', value: `$${formatPrice(minPrice)}` },
            { label: 'Avg', value: `$${formatPrice(avgPrice)}` },
            { label: 'Max', value: `$${formatPrice(maxPrice)}` },
          ].map(s => (
            <div key={s.label} className="text-center bg-slate-50 rounded-lg px-3 py-1.5">
              <div className="text-xs text-slate-400">{s.label}</div>
              <div className="text-sm font-semibold text-slate-700">{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Period filter — local mode only */}
      {priceType === 'local' && (
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {LOCAL_PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                period === p.value
                  ? 'bg-teal-500 text-white border-teal-500'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-teal-300 hover:text-teal-600'
              }`}
            >
              {p.label}
            </button>
          ))}
          {period === 'custom' && (
            <div className="flex items-center gap-2 ml-2">
              <input
                type="date"
                value={customFrom}
                min={localDates[0]}
                max={localDates[localDates.length - 1]}
                onChange={e => setCustomFrom(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-teal-400"
              />
              <span className="text-slate-400 text-xs">to</span>
              <input
                type="date"
                value={customTo}
                min={localDates[0]}
                max={localDates[localDates.length - 1]}
                onChange={e => setCustomTo(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 outline-none focus:border-teal-400"
              />
            </div>
          )}
        </div>
      )}

      {/* Import mode: label showing which week is displayed */}
      {priceType === 'import' && (
        <div className="mb-4">
          <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-teal-50 text-teal-700 border border-teal-100">
            {selectedWeek === 0 ? 'Week 1' : 'Week 2'} — 7 daily prices
          </span>
        </div>
      )}

      {/* Chart — fades when data key changes */}
      <AnimatePresence mode="wait">
        <motion.div
          key={chartKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
              No data available for selected range
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatXAxis}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={v => `$${v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v}`}
                  width={55}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine
                  y={avgPrice}
                  stroke="#14b8a6"
                  strokeDasharray="4 4"
                  strokeOpacity={0.4}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
