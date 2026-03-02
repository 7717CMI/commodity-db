'use client'
import { motion } from 'framer-motion'
import {
  getLocalRecord, getImportRecord,
  getLocalDates, getImportWeekPrices,
} from '@/lib/data'
import type { Entity, PriceType } from '@/lib/types'
import PriceCard from './PriceCard'

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

function weeklyAvg(prices: number[]): number {
  if (!prices.length) return 0
  const sum = prices.reduce((a, b) => a + b, 0)
  return Math.round((sum / prices.length) * 100) / 100
}

export default function PriceGrid({
  selectedCommodity, country, entity, priceType,
  selectedDate, selectedWeek, selectedDay,
}: Props) {
  function getPrices(): { price: number | null; prevPrice: number | null } {
    if (priceType === 'local') {
      const dates = getLocalDates()
      const dateIdx = getDateIndex(dates, selectedDate)
      const rec = getLocalRecord(entity, country, selectedCommodity)
      return {
        price: rec?.prices[dateIdx] ?? null,
        prevPrice: rec?.prices[dateIdx - 1] ?? null,
      }
    }

    const rec = getImportRecord(country, selectedCommodity)
    if (!rec) return { price: null, prevPrice: null }
    const weekPrices = getImportWeekPrices(rec, selectedWeek)

    if (selectedDay === null) {
      return { price: weeklyAvg(weekPrices), prevPrice: null }
    }

    return {
      price: weekPrices[selectedDay] ?? null,
      prevPrice: selectedDay > 0 ? (weekPrices[selectedDay - 1] ?? null) : null,
    }
  }

  const { price, prevPrice } = getPrices()
  const animationKey = `${selectedCommodity}-${country}-${priceType}-${selectedWeek}-${selectedDay}`

  return (
    <motion.div
      key={`hero-${animationKey}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <PriceCard
        commodity={selectedCommodity}
        price={price}
        previousPrice={prevPrice}
        isHero
      />
    </motion.div>
  )
}
