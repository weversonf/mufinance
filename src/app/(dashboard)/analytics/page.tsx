import { SpendingHeatmap } from "@/components/analytics/spending-heatmap"
import { CategoryDonut } from "@/components/analytics/category-donut"
import { MonthComparison } from "@/components/analytics/month-comparison"
import { RecurringDetector } from "@/components/analytics/recurring-detector"
import { AiInsights } from "@/components/analytics/ai-insights"
import { AnalyticsMonthProvider } from "@/components/analytics/analytics-month"
import { AnalyticsHeader } from "@/components/analytics/analytics-header"

export default function Page() {
  return (
    <AnalyticsMonthProvider>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <AnalyticsHeader />

        {/* Row 1: Heatmap */}
        <SpendingHeatmap />

        {/* Row 2: Donut + Month Comparison */}
        <div className="grid gap-4 lg:grid-cols-2">
          <CategoryDonut />
          <MonthComparison />
        </div>

        {/* Row 3: Recurring + AI Insights */}
        <div className="grid gap-4 lg:grid-cols-2">
          <RecurringDetector />
          <AiInsights />
        </div>
      </div>
    </AnalyticsMonthProvider>
  )
}
