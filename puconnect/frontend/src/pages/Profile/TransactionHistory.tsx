import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';

interface Transaction {
    id: string;
    amount: number;
    status: 'pending' | 'successful' | 'failed';
    transaction_reference: string;
    created_at: string;
    listing_title: string;
    listing_type: 'product' | 'service';
    transaction_type: 'buy' | 'sell' | 'service';
    other_party_name: string;
}

const TransactionHistory: React.FC = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get(API_ENDPOINTS.PAYMENTS.history);
                setTransactions(response.data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to fetch transaction history');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'successful': return 'bg-green-100 text-green-700 border-green-200';
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'failed': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'buy':
                return (
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                    </div>
                );
            case 'sell':
                return (
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                );
            case 'service':
                return (
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                <p className="text-gray-500 font-medium">Loading your transaction history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 rounded-2xl border border-red-100 p-8 text-center">
                <p className="text-red-700 font-medium">{error}</p>
            </div>
        );
    }

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    {transactions.length} Total
                </span>
            </div>

            {transactions.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No transactions yet</h3>
                    <p className="text-gray-500">Your history of buys, sells, and services will appear here.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {transactions.map((txn) => (
                        <div key={txn.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between group">
                            <div className="flex items-center space-x-4">
                                {getTransactionIcon(txn.transaction_type)}
                                <div>
                                    <div className="flex items-center space-x-2">
                                        <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors uppercase text-sm tracking-tight">
                                            {txn.transaction_type === 'buy' ? 'Bought' : txn.transaction_type === 'sell' ? 'Sold' : 'Service Provided'}
                                        </h4>
                                        <span className="text-gray-300">•</span>
                                        <span className="text-gray-500 text-sm font-medium">
                                            {txn.transaction_type === 'buy' ? `from ${txn.other_party_name}` : `to ${txn.other_party_name}`}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800 mt-0.5">{txn.listing_title}</h3>
                                    <div className="flex items-center space-x-3 mt-1.5">
                                        <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">{txn.transaction_reference}</span>
                                        <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                                        <span className="text-gray-400 text-xs font-medium">
                                            {new Date(txn.created_at).toLocaleDateString(undefined, {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-xl font-black text-gray-900 mb-2">
                                    ₦{txn.amount.toLocaleString()}
                                </div>
                                <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusColor(txn.status)}`}>
                                    {txn.status.toUpperCase()}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TransactionHistory;
