export type MarketStock = {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
  dayHigh: number
  dayLow: number
  volume: number
  marketCap: number | null
  sparkline: number[]
}

export type MarketCrypto = {
  id: string
  symbol: string
  name: string
  image: string
  price: number
  change24h: number
  change7d: number
  marketCap: number
  volume24h: number
  sparkline: number[]
}

export type MarketRate = {
  id: string
  name: string
  value: number
  unit: "% a.a." | "% a.m."
  referenceDate: string
  source: string
  description: string
}

export type FixedIncomeProduct = {
  id: string
  name: string
  indexer: string
  rate: number
  liquidity: string
  risk: "Baixo" | "Médio" | "Alto"
  minimum: string
  note: string
}

export type MarketSnapshot = {
  updatedAt: string
  stocks: MarketStock[]
  crypto: MarketCrypto[]
  rates: MarketRate[]
  fixedIncome: FixedIncomeProduct[]
  warnings: string[]
}

export type MarketCandle = {
  t: number
  o: number
  h: number
  l: number
  c: number
}
