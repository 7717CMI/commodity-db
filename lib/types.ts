export type Entity = 'manufacturer' | 'distributor'
export type PriceType = 'local' | 'import'
export type TrendPeriod = 'day' | 'week' | 'month' | 'custom'

export interface PriceRecord {
  entity?: Entity
  country: string
  commodity: string
  currentPrice: number | null
  prices: number[]
}

export interface ImportRecord {
  country: string
  commodity: string
  prices: number[][]   // prices[weekIndex][dayIndex]
}

export interface ImportDataset {
  weeks: string[]
  weekDates: string[][]  // weekDates[weekIndex][dayIndex]
  data: ImportRecord[]
}

export interface TrendDataPoint {
  date: string
  price: number
}
