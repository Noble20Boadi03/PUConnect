interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
}

export function DonutChart({ segments, size = 160 }: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div
        className="flex items-center justify-center text-sm text-gray-400"
        style={{ width: size, height: size }}
      >
        No data
      </div>
    );
  }

  const radius = 52;
  const stroke = 18;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <svg width={size} height={size} viewBox="0 0 140 140" className="shrink-0">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="#e2e8e4"
          strokeWidth={stroke}
        />
        {segments.map((seg) => {
          const pct = seg.value / total;
          const dash = pct * circumference;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={seg.label}
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-currentOffset}
              transform="rotate(-90 70 70)"
              strokeLinecap="round"
            />
          );
        })}
        <text x="70" y="66" textAnchor="middle" className="fill-gray-900 text-lg font-bold">
          {total}
        </text>
        <text x="70" y="82" textAnchor="middle" className="fill-gray-400 text-[10px]">
          total
        </text>
      </svg>
      <div className="flex flex-col gap-2.5 min-w-0">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2.5 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            <span className="text-gray-600 truncate">{seg.label}</span>
            <span className="ml-auto font-semibold text-gray-900 tabular-nums">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
