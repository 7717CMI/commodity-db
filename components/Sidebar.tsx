'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { COMMODITIES, LOCAL_COUNTRIES, IMPORT_COUNTRIES } from '@/lib/data'
import type { PriceType } from '@/lib/types'

interface Props {
  open: boolean
  onToggle: (open: boolean) => void
  selectedCommodity: string | null
  selectedCountry: string | null
  priceType: PriceType
  onSelectCommodity: (c: string) => void
  onSelectCountry: (c: string) => void
}

export default function Sidebar({
  open,
  onToggle,
  selectedCommodity,
  selectedCountry,
  priceType,
  onSelectCommodity,
  onSelectCountry,
}: Props) {
  const countries = priceType === 'local' ? LOCAL_COUNTRIES : IMPORT_COUNTRIES

  return (
    <motion.aside
      animate={{ width: open ? 280 : 48 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="fixed left-0 top-16 bottom-0 z-40 flex flex-col bg-white border-r border-slate-200 overflow-hidden"
    >
      <AnimatePresence mode="wait">
        {!open ? (
          /* Collapsed strip */
          <motion.div
            key="collapsed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center pt-4"
          >
            <button
              onClick={() => onToggle(true)}
              className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
              title="Open sidebar"
            >
              ›
            </button>
          </motion.div>
        ) : (
          /* Expanded content */
          <motion.div
            key="expanded"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col flex-1 min-h-0"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-4 pt-5 pb-4 shrink-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-800">Filters</h2>
                <p className="text-xs text-slate-400 mt-0.5">Select commodity &amp; country</p>
              </div>
              <button
                onClick={() => onToggle(false)}
                className="mt-0.5 p-1 rounded hover:bg-slate-100 text-slate-400 text-sm"
              >
                ‹
              </button>
            </div>

            {/* Dropdowns */}
            <div className="px-4 space-y-5 shrink-0">

              {/* Commodity dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  Commodity
                </label>
                <select
                  value={selectedCommodity ?? ''}
                  onChange={e => { if (e.target.value) onSelectCommodity(e.target.value) }}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:bg-white transition cursor-pointer"
                >
                  <option value="" disabled>Select commodity…</option>
                  {COMMODITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Country dropdown */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {priceType === 'local' ? 'Country' : 'Source'}
                </label>
                <select
                  value={selectedCountry ?? ''}
                  onChange={e => { if (e.target.value) onSelectCountry(e.target.value) }}
                  className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50 text-slate-700 outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-400 focus:bg-white transition cursor-pointer"
                >
                  <option value="" disabled>Select {priceType === 'local' ? 'country' : 'source'}…</option>
                  {countries.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Active selection summary */}
            <motion.div
              layout
              className="mx-4 mt-6 p-3 rounded-xl bg-teal-50 border border-teal-100"
            >
              <p className="text-xs text-teal-600 font-medium uppercase tracking-wide mb-2">
                Current Selection
              </p>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Commodity</span>
                  <span className={`text-xs font-semibold ${selectedCommodity ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                    {selectedCommodity ?? 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {priceType === 'local' ? 'Country' : 'Source'}
                  </span>
                  <span className={`text-xs font-semibold ${selectedCountry ? 'text-slate-700' : 'text-slate-400 italic'}`}>
                    {selectedCountry ?? 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Mode</span>
                  <span
                    className="text-xs font-semibold capitalize px-1.5 py-0.5 rounded-full"
                    style={{ background: '#ccfbf1', color: '#0f766e' }}
                  >
                    {priceType}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  )
}
