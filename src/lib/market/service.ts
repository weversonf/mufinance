import "server-only"

import { setDefaultResultOrder } from "node:dns"

import type {
  FixedIncomeProduct,
  MarketCandle,
  MarketCrypto,
  MarketRate,
  MarketSnapshot,
  MarketStock,
} from "@/lib/market/types"

const STOCK_TICKERS = [
  "PETR4",
  "VALE3",
  "ITUB4",
  "BBDC4",
  "ABEV3",
  "BBAS3",
  "WEGE3",
  "RENT3",
  "BPAC11",
  "ELET3",
]

const STOCK_NAMES: Record<string, string> = {
  PETR4: "Petrobras PN",
  VALE3: "Vale ON",
  ITUB4: "Itaú Unibanco PN",
  BBDC4: "Bradesco PN",
  ABEV3: "Ambev ON",
  BBAS3: "Banco do Brasil ON",
  WEGE3: "WEG ON",
  RENT3: "Localiza ON",
  BPAC11: "BTG Pactual UNT",
  ELET3: "Eletrobras ON",
}

const CRYPTO_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "cardano",
  "ripple",
  "binancecoin",
  "avalanche-2",
  "dogecoin",
]

const SNAPSHOT_TTL_MS = 60_000

// Em algumas redes o BCB só responde por IPv4. Evita timeout tentando IPv6 primeiro.
setDefaultResultOrder("ipv4first")

type BrapiQuote = {
  symbol?: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  regularMarketPreviousClose?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketVolume?: number
  marketCap?: number
  historicalDataPrice?: Array<{ close?: number }>
}

type CoinGeckoCoin = {
  id?: string
  symbol?: string
  name?: string
  image?: string
  current_price?: number
  price_change_24h?: number
  price_change_percentage_24h?: number
  price_change_percentage_7d_in_currency?: number
  market_cap?: number
  total_volume?: number
  sparkline_in_7d?: { price?: number[] }
}

type BcbPoint = { data?: string; valor?: string }

type CachedSection<T> = { value: T; at: number }

let snapshotCache: { value: MarketSnapshot; at: number } | null = null
let lastStocks: CachedSection<MarketStock[]> | null = null
let lastCrypto: CachedSection<MarketCrypto[]> | null = null
let lastRates: CachedSection<{ rates: MarketRate[]; fixedIncome: FixedIncomeProduct[] }> | null = null

function round(value: number, digits = 2) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

function downsample(values: number[], limit = 40) {
  if (values.length <= limit) return values
  const step = values.length / limit
  return Array.from({ length: limit }, (_, index) => values[Math.floor(index * step)])
}

function parseBcbDate(value: string | undefined) {
  if (!value) return new Date().toISOString().slice(0, 10)
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return value
  return `${match[3]}-${match[2]}-${match[1]}`
}

async function fetchBrapiStocks(): Promise<MarketStock[]> {
  const url = new URL(`https://brapi.dev/api/quote/${STOCK_TICKERS.join(",")}`)
  url.searchParams.set("range", "5d")
  url.searchParams.set("interval", "1d")
  if (process.env.BRAPI_TOKEN) url.searchParams.set("token", process.env.BRAPI_TOKEN)

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
    next: { revalidate: 120 },
    signal: AbortSignal.timeout(9_000),
  })
  if (!response.ok) throw new Error(`brapi respondeu ${response.status}`)

  const payload = (await response.json()) as { results?: BrapiQuote[] }
  const results = Array.isArray(payload.results) ? payload.results : []
  if (results.length === 0) throw new Error("brapi não retornou cotações")

  return results
    .filter((quote): quote is BrapiQuote & { symbol: string; regularMarketPrice: number } =>
      Boolean(quote.symbol) && Number.isFinite(quote.regularMarketPrice)
    )
    .map((quote) => {
      const price = Number(quote.regularMarketPrice)
      const previousClose = Number(quote.regularMarketPreviousClose ?? price - Number(quote.regularMarketChange ?? 0))
      const sparkline = (quote.historicalDataPrice ?? [])
        .map((point) => Number(point.close))
        .filter((value) => Number.isFinite(value))
      return {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName || STOCK_NAMES[quote.symbol] || quote.symbol,
        price: round(price),
        change: round(Number(quote.regularMarketChange ?? price - previousClose)),
        changePercent: round(Number(quote.regularMarketChangePercent ?? (previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0))),
        previousClose: round(previousClose),
        dayHigh: round(Number(quote.regularMarketDayHigh ?? price)),
        dayLow: round(Number(quote.regularMarketDayLow ?? price)),
        volume: Number(quote.regularMarketVolume ?? 0),
        marketCap: Number.isFinite(quote.marketCap) ? Number(quote.marketCap) : null,
        sparkline: sparkline.length > 0 ? sparkline : [previousClose, price],
      }
    })
}

async function fetchYahooStock(symbol: string): Promise<MarketStock> {
  const response = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.SA?range=5d&interval=1d`,
    {
      headers: { Accept: "application/json", "User-Agent": "Mozilla/5.0 (compatible; MuFinance/1.0)" },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(8_000),
    }
  )
  if (!response.ok) throw new Error(`Yahoo respondeu ${response.status}`)

  const payload = (await response.json()) as {
    chart?: {
      result?: Array<{
        meta?: {
          regularMarketPrice?: number
          chartPreviousClose?: number
          previousClose?: number
          regularMarketDayHigh?: number
          regularMarketDayLow?: number
          regularMarketVolume?: number
          longName?: string
          shortName?: string
        }
        indicators?: { quote?: Array<{ close?: Array<number | null> }> }
      }>
    }
  }
  const result = payload.chart?.result?.[0]
  const meta = result?.meta
  const price = Number(meta?.regularMarketPrice)
  if (!Number.isFinite(price)) throw new Error(`Yahoo sem preço para ${symbol}`)

  const closes = (result?.indicators?.quote?.[0]?.close ?? [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value))
  const previousClose = closes.length >= 2
    ? closes[closes.length - 2]
    : Number(meta?.chartPreviousClose ?? meta?.previousClose ?? price)

  return {
    symbol,
    name: meta?.longName || meta?.shortName || STOCK_NAMES[symbol] || symbol,
    price: round(price),
    change: round(price - previousClose),
    changePercent: round(previousClose > 0 ? ((price - previousClose) / previousClose) * 100 : 0),
    previousClose: round(previousClose),
    dayHigh: round(Number(meta?.regularMarketDayHigh ?? price)),
    dayLow: round(Number(meta?.regularMarketDayLow ?? price)),
    volume: Number(meta?.regularMarketVolume ?? 0),
    marketCap: null,
    sparkline: closes.length > 0 ? closes : [previousClose, price],
  }
}

async function fetchStocks(): Promise<{ stocks: MarketStock[]; warning?: string }> {
  try {
    const stocks = await fetchBrapiStocks()
    lastStocks = { value: stocks, at: Date.now() }
    return { stocks }
  } catch (error) {
    console.warn("Falha ao carregar cotações da B3 via brapi", error)
  }

  const settled = await Promise.allSettled(STOCK_TICKERS.map((ticker) => fetchYahooStock(ticker)))
  const stocks = settled
    .filter((result): result is PromiseFulfilledResult<MarketStock> => result.status === "fulfilled")
    .map((result) => result.value)

  if (stocks.length > 0) {
    lastStocks = { value: stocks, at: Date.now() }
    return { stocks }
  }

  if (lastStocks) {
    return {
      stocks: lastStocks.value,
      warning: "Não foi possível atualizar as cotações da B3 agora. Exibindo a última leitura disponível.",
    }
  }

  return {
    stocks: [],
    warning: "As cotações da B3 estão indisponíveis neste momento.",
  }
}

async function fetchCrypto(): Promise<{ crypto: MarketCrypto[]; warning?: string }> {
  try {
    const url = new URL("https://api.coingecko.com/api/v3/coins/markets")
    url.searchParams.set("vs_currency", "brl")
    url.searchParams.set("ids", CRYPTO_IDS.join(","))
    url.searchParams.set("order", "market_cap_desc")
    url.searchParams.set("sparkline", "true")
    url.searchParams.set("price_change_percentage", "24h,7d")

    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
      signal: AbortSignal.timeout(9_000),
    })
    if (!response.ok) throw new Error(`CoinGecko respondeu ${response.status}`)

    const payload = (await response.json()) as CoinGeckoCoin[]
    if (!Array.isArray(payload) || payload.length === 0) throw new Error("CoinGecko não retornou moedas")

    const crypto = payload
      .filter((coin): coin is CoinGeckoCoin & { id: string; symbol: string; name: string; current_price: number } =>
        Boolean(coin.id) && Boolean(coin.symbol) && Boolean(coin.name) && Number.isFinite(coin.current_price)
      )
      .map((coin) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        image: coin.image ?? "",
        price: round(Number(coin.current_price)),
        change24h: round(Number(coin.price_change_percentage_24h ?? 0)),
        change7d: round(Number(coin.price_change_percentage_7d_in_currency ?? 0)),
        marketCap: Number(coin.market_cap ?? 0),
        volume24h: Number(coin.total_volume ?? 0),
        sparkline: downsample((coin.sparkline_in_7d?.price ?? []).filter((value) => Number.isFinite(value))),
      }))

    lastCrypto = { value: crypto, at: Date.now() }
    return { crypto }
  } catch (error) {
    console.warn("Falha ao carregar criptomoedas no CoinGecko", error)
  }

  if (lastCrypto) {
    return {
      crypto: lastCrypto.value,
      warning: "Não foi possível atualizar as criptomoedas agora. Exibindo a última leitura disponível.",
    }
  }

  return {
    crypto: [],
    warning: "As cotações de criptomoedas estão indisponíveis neste momento.",
  }
}

async function fetchBcbSeries(series: number, last = 1): Promise<BcbPoint[]> {
  const response = await fetch(
    `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${series}/dados/ultimos/${last}?formato=json`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 3_600 },
      signal: AbortSignal.timeout(9_000),
    }
  )
  if (!response.ok) throw new Error(`BCB série ${series} respondeu ${response.status}`)
  const payload = (await response.json()) as BcbPoint[]
  if (!Array.isArray(payload) || payload.length === 0) throw new Error(`BCB série ${series} sem dados`)
  return payload
}

async function fetchRates(): Promise<{ rates: MarketRate[]; fixedIncome: FixedIncomeProduct[]; warning?: string }> {
  try {
    const [selicMeta, cdiAnnual, ipcaMonthly] = await Promise.all([
      fetchBcbSeries(432),
      fetchBcbSeries(4389),
      fetchBcbSeries(433, 12),
    ])

    const selicValue = Number(selicMeta[selicMeta.length - 1]?.valor)
    const cdiValue = Number(cdiAnnual[cdiAnnual.length - 1]?.valor)
    if (!Number.isFinite(selicValue) || !Number.isFinite(cdiValue)) {
      throw new Error("BCB retornou taxas inválidas")
    }

    const ipcaFactor = ipcaMonthly.reduce((factor, point) => {
      const value = Number(point.valor)
      return Number.isFinite(value) ? factor * (1 + value / 100) : factor
    }, 1)
    const ipcaValue = round((ipcaFactor - 1) * 100)

    const selicDate = parseBcbDate(selicMeta[selicMeta.length - 1]?.data)
    const cdiDate = parseBcbDate(cdiAnnual[cdiAnnual.length - 1]?.data)
    const ipcaDate = parseBcbDate(ipcaMonthly[ipcaMonthly.length - 1]?.data)

    const rates: MarketRate[] = [
      {
        id: "selic",
        name: "Selic",
        value: round(selicValue),
        unit: "% a.a.",
        referenceDate: selicDate,
        source: "Banco Central do Brasil",
        description: "Meta definida pelo Copom.",
      },
      {
        id: "cdi",
        name: "CDI",
        value: round(cdiValue),
        unit: "% a.a.",
        referenceDate: cdiDate,
        source: "Banco Central do Brasil",
        description: "Taxa anualizada dos títulos privados.",
      },
      {
        id: "ipca",
        name: "IPCA 12 meses",
        value: ipcaValue,
        unit: "% a.a.",
        referenceDate: ipcaDate,
        source: "Banco Central do Brasil",
        description: "Inflação acumulada nos últimos 12 meses.",
      },
    ]

    const savingsRate = selicValue > 8.5 ? 6.17 : round(selicValue * 0.7)
    const fixedIncome: FixedIncomeProduct[] = [
      {
        id: "tesouro-selic",
        name: "Tesouro Selic",
        indexer: "Selic",
        rate: round(selicValue),
        liquidity: "D+1",
        risk: "Baixo",
        minimum: "A partir de R$ 150,00",
        note: "Rentabilidade de referência acompanha a Selic.",
      },
      {
        id: "cdb-100",
        name: "CDB 100% CDI",
        indexer: "CDI",
        rate: round(cdiValue),
        liquidity: "No vencimento",
        risk: "Baixo",
        minimum: "Conforme instituição",
        note: "CDBs com liquidez diária costumam pagar menos que 100% do CDI.",
      },
      {
        id: "lci-90",
        name: "LCI/LCA 90% CDI",
        indexer: "90% do CDI",
        rate: round(cdiValue * 0.9),
        liquidity: "Após carência",
        risk: "Baixo",
        minimum: "Conforme instituição",
        note: "Isenta de imposto de renda para pessoa física.",
      },
      {
        id: "poupanca",
        name: "Poupança",
        indexer: selicValue > 8.5 ? "0,5% ao mês + TR" : "70% da Selic",
        rate: savingsRate,
        liquidity: "Imediata",
        risk: "Baixo",
        minimum: "Sem mínimo",
        note: "Rendimento estimado sem considerar a TR.",
      },
    ]

    const section = { rates, fixedIncome }
    lastRates = { value: section, at: Date.now() }
    return section
  } catch (error) {
    console.warn("Falha ao carregar indicadores do Banco Central", error)
  }

  if (lastRates) {
    return {
      ...lastRates.value,
      warning: "Não foi possível atualizar os indicadores do Banco Central agora. Exibindo a última leitura disponível.",
    }
  }

  return {
    rates: [],
    fixedIncome: [],
    warning: "Os indicadores de renda fixa estão indisponíveis neste momento.",
  }
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const now = Date.now()
  if (snapshotCache && now - snapshotCache.at < SNAPSHOT_TTL_MS) {
    return snapshotCache.value
  }

  const [stocksResult, cryptoResult, ratesResult] = await Promise.all([
    fetchStocks(),
    fetchCrypto(),
    fetchRates(),
  ])

  const warnings = [stocksResult.warning, cryptoResult.warning, ratesResult.warning].filter(
    (warning): warning is string => Boolean(warning)
  )

  const snapshot: MarketSnapshot = {
    updatedAt: new Date().toISOString(),
    stocks: stocksResult.stocks,
    crypto: cryptoResult.crypto,
    rates: ratesResult.rates,
    fixedIncome: ratesResult.fixedIncome,
    warnings,
  }

  snapshotCache = { value: snapshot, at: now }
  return snapshot
}

const OHLC_DAYS = new Set([1, 7, 14, 30, 90, 180, 365])

export async function getCryptoOhlc(id: string, days: number): Promise<MarketCandle[]> {
  if (!/^[a-z0-9-]{2,60}$/.test(id)) throw new Error("Moeda inválida")
  if (!OHLC_DAYS.has(days)) throw new Error("Período inválido")

  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=brl&days=${days}`,
    {
      headers: { Accept: "application/json" },
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(10_000),
    }
  )
  if (!response.ok) throw new Error(`CoinGecko OHLC respondeu ${response.status}`)

  const payload = (await response.json()) as number[][]
  if (!Array.isArray(payload)) throw new Error("CoinGecko OHLC inválido")

  return payload
    .filter((row) => Array.isArray(row) && row.length >= 5 && row.every((value) => Number.isFinite(value)))
    .map(([t, o, h, l, c]) => ({ t, o, h, l, c }))
}
