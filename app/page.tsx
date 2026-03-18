'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import FilterBar from '@/components/FilterBar'
import PriceGrid from '@/components/PriceGrid'
import TrendChart from '@/components/TrendChart'
import { getLocalDates, getImportWeeks } from '@/lib/data'
import type { Entity, PriceType } from '@/lib/types'

const SIDEBAR_OPEN_W   = 280
const SIDEBAR_CLOSED_W = 48

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen]         = useState(true)
  const [selectedCommodity, setSelectedCommodity] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [priceType, setPriceType]             = useState<PriceType>('local')
  const [entity, setEntity]                   = useState<Entity>('manufacturer')
  const [selectedDate, setSelectedDate]       = useState(() => {
    const d = getLocalDates(); return d[d.length - 1]
  })
  const [selectedWeek, setSelectedWeek] = useState(() => getImportWeeks().length - 1)
  const [selectedDay, setSelectedDay]   = useState<number | null>(null)

  const handlePriceTypeChange = (t: PriceType) => {
    setPriceType(t)
    if (t === 'local') {
      // Local = UAE only, auto-select
      setSelectedCountry('UAE')
    } else {
      // Import = user must pick a source country
      setSelectedCountry(null)
      setSelectedWeek(getImportWeeks().length - 1)
      setSelectedDay(null)
    }
  }

  const handleSelectCommodity = (c: string) => {
    setSelectedCommodity(c)
    if (priceType === 'local') {
      // Always UAE for local
      setSelectedCountry('UAE')
    } else {
      // Keep current import country (user may have already picked one)
    }
  }

  const handleWeekChange = (w: number) => {
    setSelectedWeek(w)
    setSelectedDay(null)
  }

  const activeDates = useMemo(() => getLocalDates(), [])

  const importLabel = selectedDay === null
    ? `Week ${selectedWeek + 1} avg`
    : `Week ${selectedWeek + 1} · Day ${selectedDay + 1}`

  // Determine if we have enough selections to show data
  const isReady = selectedCommodity != null && selectedCountry != null

  return (
    <div className="min-h-screen" style={{ background: '#f8fafc' }}>
      <Header />

      <div className="flex pt-16">
        <Sidebar
          open={sidebarOpen}
          onToggle={setSidebarOpen}
          selectedCommodity={selectedCommodity}
          selectedCountry={selectedCountry}
          priceType={priceType}
          entity={entity}
          onSelectCommodity={handleSelectCommodity}
          onSelectCountry={c => setSelectedCountry(c)}
          onPriceTypeChange={handlePriceTypeChange}
          onEntityChange={setEntity}
        />

        <motion.main
          animate={{ marginLeft: sidebarOpen ? SIDEBAR_OPEN_W : SIDEBAR_CLOSED_W }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex-1 min-h-screen"
        >
          <FilterBar
            priceType={priceType}
            selectedDate={selectedDate}
            availableDates={activeDates}
            selectedWeek={selectedWeek}
            selectedDay={selectedDay}
            onDateChange={setSelectedDate}
            onWeekChange={handleWeekChange}
            onDayChange={setSelectedDay}
          />

          <AnimatePresence mode="wait">
            {!isReady ? (
              /* Welcome / empty state */
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] px-6 text-center"
              >
                <div className="max-w-lg">
                  {/* Icon */}
                  <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center">
                    <svg
                      className="w-8 h-8 text-teal-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                  </div>

                  <h1 className="text-2xl font-bold text-slate-800 mb-3">
                    {!selectedCommodity
                      ? 'Select a Commodity to Get Started'
                      : 'Now Choose a Source Country'}
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {!selectedCommodity
                      ? 'Use the sidebar on the left to choose a commodity. You\'ll instantly see live pricing data, trend charts, and comparisons across all commodities.'
                      : `You've selected ${selectedCommodity}. Pick a source country from the sidebar to view import pricing data and market trends.`}
                  </p>

                  {/* Step indicators */}
                  <div className="mt-8 flex items-center justify-center gap-3">
                    <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                      !selectedCommodity
                        ? 'bg-teal-500 text-white border-teal-500'
                        : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                    }`}>
                      {!selectedCommodity ? '1  Choose commodity' : '1  Commodity selected'}
                    </div>
                    {priceType === 'import' && (
                      <>
                        <div className="w-4 h-px bg-slate-200" />
                        <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border ${
                          selectedCommodity && !selectedCountry
                            ? 'bg-teal-500 text-white border-teal-500'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          2  Choose source country
                        </div>
                      </>
                    )}
                    <div className="w-4 h-px bg-slate-200" />
                    <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border bg-slate-50 text-slate-400 border-slate-200">
                      {priceType === 'import' ? '3' : '2'}  View data
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              /* Dashboard content */
              <motion.div
                key={`${selectedCommodity}-${selectedCountry}-${priceType}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="px-6 py-6 space-y-6"
              >
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">Dashboard</span>
                  <span className="text-slate-300">›</span>
                  <span className="text-slate-500 font-medium">{selectedCommodity}</span>
                  <span className="text-slate-300">›</span>
                  <span className="font-semibold text-teal-600">{selectedCountry}</span>
                  <span className="ml-2 text-xs bg-teal-50 text-teal-600 border border-teal-100 px-2 py-0.5 rounded-full">
                    {priceType === 'local' ? `local · ${entity}` : `import · ${importLabel}`}
                  </span>
                </div>

                {/* Demo disclaimer */}
                <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-amber-200 bg-amber-50">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                  </svg>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    <span className="font-semibold">Disclaimer:</span> All data displayed in this dashboard is for demonstration purposes only and does not represent actual market prices.
                  </p>
                </div>

                <PriceGrid
                  selectedCommodity={selectedCommodity}
                  country={selectedCountry}
                  entity={entity}
                  priceType={priceType}
                  selectedDate={selectedDate}
                  selectedWeek={selectedWeek}
                  selectedDay={selectedDay}
                />

                <TrendChart
                  commodity={selectedCommodity}
                  country={selectedCountry}
                  entity={entity}
                  priceType={priceType}
                  selectedWeek={selectedWeek}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>
      </div>
    </div>
  )
}
