interface BarChartProps {
  data: { label: string; value: number }[];
  height?: number;
  barColor?: string;
  highlightIndex?: number;
}

export function BarChart({
  data,
  height = 160,
  barColor = '#065f46',
  highlightIndex,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        No data
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(48, Math.floor(600 / data.length) - 8);
  const gap = 12;
  const chartWidth = data.length * (barWidth + gap);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${chartWidth} ${height + 28}`}
        className="w-full min-w-[280px]"
        preserveAspectRatio="xMidYMid meet"
      >
        {data.map((item, i) => {
          const barHeight = (item.value / max) * (height - 16);
          const x = i * (barWidth + gap);
          const y = height - barHeight;
          const isHighlight = highlightIndex === i || item.value === max;
          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={6}
                fill={isHighlight ? '#047857' : barColor}
                opacity={isHighlight ? 1 : 0.75}
              />
              <text
                x={x + barWidth / 2}
                y={height + 18}
                textAnchor="middle"
                className="fill-gray-400 text-[10px]"
              >
                {item.label}
              </text>
              {item.value > 0 && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  className="fill-brand-800 text-[10px] font-medium"
                >
                  {item.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
