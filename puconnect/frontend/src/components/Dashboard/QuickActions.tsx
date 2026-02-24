import React from 'react';
import { useNavigate } from 'react-router-dom';

const QuickActions: React.FC = () => {
    const navigate = useNavigate();

    const actions = [
        {
            title: 'Sell a Product',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
            ),
            color: 'text-blue-600 bg-blue-50',
            onClick: () => navigate('/listings/new?type=product')
        },
        {
            title: 'Offer a Service',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            ),
            color: 'text-green-600 bg-green-50',
            onClick: () => navigate('/listings/new?type=service')
        },
        {
            title: 'Browse Marketplace',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            color: 'text-orange-600 bg-orange-50',
            onClick: () => navigate('/listings')
        }
    ];

    return (
        <section className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-gray-900 mb-6 px-1">Quick Actions</h2>
            <div className="space-y-4">
                {actions.map((action, idx) => (
                    <button
                        key={idx}
                        onClick={action.onClick}
                        className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                    >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${action.color}`}>
                            {action.icon}
                        </div>
                        <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">{action.title}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;
