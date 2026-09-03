import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RevenuePoint } from "../../types/analytics";
import { formatPaise, paiseToRupees } from "../../utils/currency";

export function RevenueChart({ data }: { data: RevenuePoint[] }) {
  const chartData = data.map((d) => ({ month: d.month, revenue: paiseToRupees(d.revenuePaise) }));

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "var(--folio-ink-soft)", fontSize: 12, fontFamily: "IBM Plex Mono" }}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "var(--folio-line)" }}
            contentStyle={{
              background: "var(--folio-paper)",
              border: "1px solid var(--folio-line-strong)",
              borderRadius: 6,
              fontSize: 12,
              fontFamily: "IBM Plex Sans",
            }}
            formatter={(value) => [formatPaise(Math.round(Number(value) * 100)), "Revenue"]}
            labelStyle={{ color: "var(--folio-ink-soft)" }}
          />
          <Bar dataKey="revenue" fill="var(--folio-accent)" radius={[3, 3, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
