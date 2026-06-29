import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts'

export default function TrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 text-sm text-[var(--color-muted)]">
        Not enough data to chart trends.
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">PRs over time</h3>
        <div className="text-xs text-[var(--color-muted)]">Weekly</div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid stroke="#262b38" strokeDasharray="3 3" />
          <XAxis dataKey="week" stroke="#8b91a1" fontSize={11} />
          <YAxis stroke="#8b91a1" fontSize={11} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: '#14171f',
              border: '1px solid #262b38',
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="opened"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
          <Line
            type="monotone"
            dataKey="merged"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
