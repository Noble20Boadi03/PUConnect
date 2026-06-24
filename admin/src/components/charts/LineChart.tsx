interface LineChartProps {
  data: { label: string; value: number }[];
  height?: number;
  strokeColor?: string;
}

export function LineChart({
  data,
  height = 140,
  strokeColor = '#047857',
}: LineChartProps) {
  if (data.length < 2) {
    return (
      <div className="flex items-center justify-center text-sm text-gray-400" style={{ height }}>
        Not enough data
      </div>
    );
  }

  const width = 480;
  const padding = { top: 12, right: 8, bottom: 24, left: 8 };
  const innerW = width - padding.left - padding.right;
  const innerH = height - padding.top - padding.bottom;

  const max = Math.max(...data.map((d) => d.value), 1);
  const points = data.map((d, i) => {
    const x = padding.left + (i / (data.length - 1)) * innerW;
    const y = padding.top + innerH - (d.value / max) * innerH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`;

  const labelStep = Math.max(1, Math.floor(data.length / 6));

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((pct) => (
        <line
          key={pct}
          x1={padding.left}
          y1={padding.top + innerH * (1 - pct)}
          x2={width - padding.right}
          y2={padding.top + innerH * (1 - pct)}
          stroke="#e2e8e4"
          strokeWidth="1"
        />
      ))}
      <path d={areaPath} fill="url(#lineFill)" />
      <path d={linePath} fill="none" stroke={strokeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) =>
        i % labelStep === 0 || i === points.length - 1 ? (
          <text
            key={p.label}
            x={p.x}
            y={height - 4}
            textAnchor="middle"
            className="fill-gray-400 text-[9px]"
          >
            {p.label}
          </text>
        ) : null,
      )}
    </svg>
  );
}
