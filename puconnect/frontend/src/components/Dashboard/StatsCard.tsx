import React from 'react';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    colorClass: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, colorClass }) => {
    return (
        <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
                <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10 mr-4`}>
                    {icon}
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
            </div>
        </div>
    );
};

export default StatsCard;
