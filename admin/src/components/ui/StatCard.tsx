interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: { value: string; positive?: boolean };
  variant?: 'default' | 'highlight';
  onClick?: () => void;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  onClick,
}: StatCardProps) {
  const isHighlight = variant === 'highlight';
  const Wrapper = onClick ? 'button' : 'div';

  return (
    <Wrapper
      onClick={onClick}
      className={`rounded-2xl p-5 text-left transition-all ${
        isHighlight
          ? 'bg-brand-800 text-white shadow-card-hover'
          : 'card hover:shadow-card-hover'
      } ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`text-sm font-medium ${isHighlight ? 'text-brand-200' : 'text-gray-500'}`}>
            {label}
          </p>
          <p className={`text-2xl font-bold mt-1 tracking-tight ${isHighlight ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {trend && (
            <span
              className={`inline-flex items-center mt-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                isHighlight
                  ? 'bg-white/15 text-brand-100'
                  : trend.positive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>
        {icon && (
          <div
            className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
              isHighlight ? 'bg-white/15' : 'bg-brand-50 text-brand-700'
            }`}
          >
            {icon}
          </div>
        )}
      </div>
    </Wrapper>
  );
}
