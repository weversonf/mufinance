import { LiveTicker } from "@/components/investments/live-ticker"
import { PortfolioAllocation } from "@/components/investments/portfolio-allocation"
import { PerformanceChart } from "@/components/investments/performance-chart"
import { HoldingsTable } from "@/components/investments/holdings-table"
import { Watchlist } from "@/components/investments/watchlist"
import { MarketStocks } from "@/components/market/market-stocks"
import { FixedIncome } from "@/components/market/fixed-income"
import { CryptoHighlights } from "@/components/market/crypto-highlights"

export default function Page() {
  return (
    <>
      {/* Live ticker — full width, no padding */}
      <LiveTicker />

      <div className="flex flex-1 flex-col gap-4 p-4">
        {/* Mercado: ações da B3 */}
        <MarketStocks />

        {/* Mercado: renda fixa + criptomoedas */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <FixedIncome />
          </div>
          <div className="lg:col-span-5">
            <CryptoHighlights />
          </div>
        </div>

        {/* Sua carteira */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <PortfolioAllocation />
          </div>
          <div className="lg:col-span-8">
            <PerformanceChart />
          </div>
        </div>

        <HoldingsTable />
        <Watchlist />
      </div>
    </>
  )
}
