'use client'
import { motion } from 'framer-motion'
import { formatPrice, pctChange } from '@/lib/data'

interface Props {
  commodity: string
  price: number | null
  previousPrice?: number | null
  isHero?: boolean
}

const COMMODITY_UNITS: Record<string, string> = {
  Glass: 'USD/sqm', Aluminum: 'USD/MT', Granite: 'USD/MT', Sealants: 'USD/MT',
  'Glazing materials': 'USD/unit', Concrete: 'USD/m³', Steel: 'USD/MT',
  AC: 'USD/unit', Transformers: 'USD/unit', Pipes: 'USD/m',
}

export const cardVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' as const } },
}

export default function PriceCard({ commodity, price, previousPrice, isHero = false }: Props) {
  const change = price != null && previousPrice != null ? pctChange(price, previousPrice) : null
  const isPositive = change != null && change >= 0

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ y: -3, transition: { duration: 0.15 } }}
      className={`bg-white rounded-xl border transition-colors ${
        isHero ? 'border-teal-200 shadow-sm p-6' : 'border-slate-100 p-4 hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div>
            <p className={`font-medium text-slate-700 ${isHero ? 'text-base' : 'text-sm'}`}>
              {commodity}
            </p>
            <p className="text-xs text-slate-400">
              {COMMODITY_UNITS[commodity] ?? 'USD'}
            </p>
          </div>
        </div>
        {change != null && (
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isPositive
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-red-50 text-red-500'
            }`}
          >
            {isPositive ? '▲' : '▼'} {Math.abs(change).toFixed(2)}%
          </motion.span>
        )}
      </div>
      <p className={`font-bold text-slate-900 mt-3 ${isHero ? 'text-3xl' : 'text-xl'}`}>
        {price != null ? `$${formatPrice(price)}` : 'N/A'}
      </p>
      {previousPrice != null && (
        <p className="text-xs text-slate-400 mt-1">
          Prev: ${formatPrice(previousPrice)}
        </p>
      )}
    </motion.div>
  )
}
