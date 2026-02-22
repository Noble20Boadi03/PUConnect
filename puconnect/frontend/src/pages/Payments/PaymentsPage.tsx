import React, { useEffect, useState } from 'react';
import Sidebar from '../../components/Dashboard/Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { API_ENDPOINTS } from '../../api/endpoints';
import { Payment, PaymentStatus, formatAmount,getStatusLabel } from '../../types/payment';

const PaymentsPage: React.FC = () => {
    const { user } = useAuth();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<PaymentStatus | 'all'>('all');

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                const response = await api.get<Payment[]>(API_ENDPOINTS.PAYMENTS.list);
                setPayments(response.data);
            } catch (error) {
                console.error("Error fetching payments:", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchPayments();
        }
    }, [user]);

    const filteredPayments = filter === 'all'
        ? payments
        : payments.filter(p => p.status === filter);

    const stats = {
        total: payments.reduce((acc, p) => p.status === PaymentStatus.SUCCESSFUL ? acc + p.amount : acc, 0),
        pending: payments.filter(p => p.status === PaymentStatus.PENDING).length,
        successful: payments.filter(p => p.status === PaymentStatus.SUCCESSFUL).length,
    };

    const getStatusBadgeClass = (status: PaymentStatus) => {
        switch (status) {
            case PaymentStatus.SUCCESSFUL:
                return 'bg-green-100 text-green-800 border-green-200';
            case PaymentStatus.PENDING:
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case PaymentStatus.FAILED:
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-50">
                <Sidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />

            <main className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
                            <p className="text-gray-600 mt-1">
                                Manage and track all your transactions on PUConnect.
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm">
                            {(['all', ...Object.values(PaymentStatus)] as const).map((s) => (
                                <button
                                    key={s}
                                    onClick={() => setFilter(s)}
                                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${filter === s
                                            ? 'bg-blue-600 text-white shadow-md'
                                            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-2 text-blue-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">Total Spent</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{formatAmount(stats.total)}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-2 text-yellow-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">Pending Requests</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                            <div className="flex items-center space-x-3 mb-2 text-green-600">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-semibold">Completed Payment</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{stats.successful}</div>
                        </div>
                    </div>

                    {/* Transactions Table/List */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        {filteredPayments.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100">
                                        <tr>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Date</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Transaction Ref</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Amount</th>
                                            <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredPayments.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors duration-150">
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(payment.created_at).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-mono text-gray-700">
                                                        {payment.transaction_reference || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">
                                                        {formatAmount(payment.amount)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusBadgeClass(payment.status)}`}>
                                                        {getStatusLabel(payment.status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-12 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">No transactions found</h3>
                                <p className="text-gray-500 max-w-xs mx-auto">
                                    You haven't made any payments yet. When you buy something, it will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default PaymentsPage;
