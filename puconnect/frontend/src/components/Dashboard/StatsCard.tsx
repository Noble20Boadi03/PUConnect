import React from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  colorClass: string;
  trend?: string;
  trendColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  colorClass,
  trend,
  trendColor = "text-green-600",
}) => {
  return (
    <div className="p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
      <div
        className={`w-10 h-10 rounded-xl ${colorClass} bg-opacity-10 flex items-center justify-center mb-4`}
      >
        <div className={colorClass.replace("bg-", "text-")}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-tight">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{title}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trendColor}`}>{trend}</p>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
