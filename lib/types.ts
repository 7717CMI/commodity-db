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
  week1: number[]
  week2: number[]
}

export interface ImportDataset {
  weeks: string[]
  week1Dates: string[]
  week2Dates: string[]
  data: ImportRecord[]
}

export interface TrendDataPoint {
  date: string
  price: number
}
