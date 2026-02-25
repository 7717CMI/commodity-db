'use client'
import { motion } from 'framer-motion'
import {
  COMMODITIES, getLocalRecord, getImportRecord,
  getLocalDates, getImportWeekPrices,
} from '@/lib/data'
import type { Entity, PriceType } from '@/lib/types'
import PriceCard, { cardVariants } from './PriceCard'

interface Props {
  selectedCommodity: string
  country: string
  entity: Entity
  priceType: PriceType
  selectedDate: string
  selectedWeek: number
  selectedDay: number | null   // null = weekly average
}

function getDateIndex(dates: string[], selectedDate: string): number {
  const idx = dates.indexOf(selectedDate)
  return idx >= 0 ? idx : dates.length - 1
}

const gridVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } } as const,
}

function weeklyAvg(prices: number[]): number {
  if (!prices.length) return 0
  const sum = prices.reduce((a, b) => a + b, 0)
  return Math.round((sum / prices.length) * 100) / 100
}

export default function PriceGrid({
  selectedCommodity, country, entity, priceType,
  selectedDate, selectedWeek, selectedDay,
}: Props) {
  function getPrices(commodity: string): { price: number | null; prevPrice: number | null } {
    if (priceType === 'local') {
      const dates = getLocalDates()
      const dateIdx = getDateIndex(dates, selectedDate)
      const rec = getLocalRecord(entity, country, commodity)
      return {
        price: rec?.prices[dateIdx] ?? null,
        prevPrice: rec?.prices[dateIdx - 1] ?? null,
      }
    }

    // Import mode
    const rec = getImportRecord(country, commodity)
    if (!rec) return { price: null, prevPrice: null }
    const weekPrices = getImportWeekPrices(rec, selectedWeek)

    if (selectedDay === null) {
      // Weekly average — no prev price (avg has no single predecessor)
      return { price: weeklyAvg(weekPrices), prevPrice: null }
    }

    // Specific day
    return {
      price: weekPrices[selectedDay] ?? null,
      prevPrice: selectedDay > 0 ? (weekPrices[selectedDay - 1] ?? null) : null,
    }
  }

  const heroData = getPrices(selectedCommodity)
  const animationKey = `${selectedCommodity}-${country}-${priceType}-${selectedWeek}-${selectedDay}`

  return (
    <div>
      {/* Hero card */}
      <motion.div
        key={`hero-${animationKey}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="mb-6"
      >
        <PriceCard
          commodity={selectedCommodity}
          price={heroData.price}
          previousPrice={heroData.prevPrice}
          isHero
        />
      </motion.div>

      {/* Section label */}
      <motion.h3
        key={`label-${animationKey}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3"
      >
        All Commodities — {country}
        {priceType === 'import' && (
          <span className="ml-2 normal-case font-normal text-slate-400">
            {selectedDay === null
              ? `(${selectedWeek === 0 ? 'Week 1' : 'Week 2'} avg)`
              : `(${selectedWeek === 0 ? 'Week 1' : 'Week 2'} · Day ${selectedDay + 1})`}
          </span>
        )}
      </motion.h3>

      {/* Staggered grid */}
      <motion.div
        key={`grid-${animationKey}`}
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      >
        {COMMODITIES.filter(c => c !== selectedCommodity).map(commodity => {
          const { price, prevPrice } = getPrices(commodity)
          return (
            <motion.div key={commodity} variants={cardVariants}>
              <PriceCard
                commodity={commodity}
                price={price}
                previousPrice={prevPrice}
              />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
