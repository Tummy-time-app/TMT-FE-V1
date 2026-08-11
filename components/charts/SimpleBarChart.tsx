interface BarChartDatum {
  label: string;
  value: number;
}

interface SimpleBarChartProps {
  data: BarChartDatum[];
  valueFormatter?: (value: number) => string;
  height?: number;
}

/**
 * Minimal single-series magnitude chart — one hue, one axis, baseline-anchored
 * bars, a hover value label + native `title` tooltip. No dependency; sized for
 * small embedded admin stats (e.g. "orders over the last 7 days"), not a
 * general-purpose charting system.
 */
export function SimpleBarChart({ data, valueFormatter = (v) => String(v), height = 160 }: SimpleBarChartProps) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div>
      <div className="flex items-end gap-2" style={{ height }}>
        {data.map((d) => {
          const pct = (d.value / max) * 100;
          return (
            <div key={d.label} className="group relative flex flex-1 flex-col items-center justify-end">
              <span className="pointer-events-none absolute -top-6 rounded bg-text px-1.5 py-0.5 text-[10px] font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100">
                {valueFormatter(d.value)}
              </span>
              <div
                className="w-full rounded-t-md bg-primary transition-[height] duration-normal"
                style={{ height: `${Math.max(pct, 2)}%` }}
                title={`${d.label}: ${valueFormatter(d.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((d) => (
          <span key={d.label} className="flex-1 truncate text-center text-[10px] font-medium text-text-subtle">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
