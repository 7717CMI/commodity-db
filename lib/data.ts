import type { Entity, PriceRecord, ImportRecord, ImportDataset, TrendDataPoint } from './types'
import localJson from '@/data/localPrices.json'
import importJson from '@/data/importPrices.json'

const localPrices = localJson as { dates: string[]; data: PriceRecord[] }
const importPrices = importJson as ImportDataset

export const COMMODITIES = [
  'Glass', 'Aluminum', 'Granite', 'Sealants',
  'Glazing materials', 'Concrete', 'Steel', 'AC',
  'Transformers', 'Pipes',
]

export const LOCAL_COUNTRIES = [
  'UAE', 'KSA', 'Kuwait', 'Oman', 'Qatar', 'Bahrain', 'Rest of GCC',
]

export const IMPORT_COUNTRIES = ['U.S.', 'India', 'China']

// ── Local helpers ──────────────────────────────────────────────────────────────

export function getLocalRecord(
  entity: Entity,
  country: string,
  commodity: string,
): PriceRecord | undefined {
  return localPrices.data.find(
    r => r.entity === entity && r.country === country && r.commodity === commodity,
  )
}

export function getLocalDates(): string[] {
  return localPrices.dates
}

// ── Import helpers ─────────────────────────────────────────────────────────────

export function getImportRecord(
  country: string,
  commodity: string,
): ImportRecord | undefined {
  return importPrices.data.find(
    r => r.country === country && r.commodity === commodity,
  )
}

/** Returns ['Week 1', 'Week 2'] */
export function getImportWeeks(): string[] {
  return importPrices.weeks
}

/** Returns the 7 date strings for the given week index (0 = Week 1, 1 = Week 2) */
export function getImportWeekDates(week: number): string[] {
  return week === 0 ? importPrices.week1Dates : importPrices.week2Dates
}

/** Returns the 7 daily prices for the given week */
export function getImportWeekPrices(record: ImportRecord, week: number): number[] {
  return week === 0 ? record.week1 : record.week2
}

/** Build chart data points for one import week (7 days) */
export function buildImportTrendData(
  record: ImportRecord,
  week: number,
): TrendDataPoint[] {
  const prices = getImportWeekPrices(record, week)
  const dates = getImportWeekDates(week)
  return prices.map((price, i) => ({
    date: dates[i] ?? `Day ${i + 1}`,
    price,
  }))
}

// ── Local chart helpers ────────────────────────────────────────────────────────

/** Build time-series data points for local price chart */
export function buildTrendData(
  record: PriceRecord,
  dates: string[],
): TrendDataPoint[] {
  return record.prices.map((price, i) => ({
    date: dates[i] ?? `Day ${i + 1}`,
    price,
  }))
}

/** Filter data to last N data points */
export function filterLast(points: TrendDataPoint[], n: number): TrendDataPoint[] {
  return points.slice(-n)
}

/** Filter data to a date range */
export function filterByRange(
  points: TrendDataPoint[],
  from: string,
  to: string,
): TrendDataPoint[] {
  return points.filter(p => p.date >= from && p.date <= to)
}

/** Aggregate daily points into weekly averages */
export function aggregateByWeek(points: TrendDataPoint[]): TrendDataPoint[] {
  if (points.length === 0) return []
  const weeks: Record<string, number[]> = {}
  points.forEach(p => {
    const d = new Date(p.date)
    const dayOfWeek = d.getDay() === 0 ? 6 : d.getDay() - 1
    const monday = new Date(d)
    monday.setDate(d.getDate() - dayOfWeek)
    const key = monday.toISOString().split('T')[0]
    if (!weeks[key]) weeks[key] = []
    weeks[key].push(p.price)
  })
  return Object.entries(weeks)
    .map(([date, prices]) => ({
      date,
      price: Math.round((prices.reduce((a, b) => a + b, 0) / prices.length) * 100) / 100,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/** Format price for display */
export function formatPrice(price: number | null | undefined): string {
  if (price == null) return 'N/A'
  return price >= 1000
    ? price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : price.toFixed(2)
}

/** Compute % change between two prices */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 10000) / 100
}
