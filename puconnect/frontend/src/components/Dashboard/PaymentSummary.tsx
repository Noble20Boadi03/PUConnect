import React from "react";
import { Payment, formatAmount, getStatusColor, getStatusLabel } from "../../types/payment";

interface PaymentSummaryProps {
  payment: Payment;
}

const PaymentSummary: React.FC<PaymentSummaryProps> = ({ payment }) => {
  const color = getStatusColor(payment.status);

  const colorClasses: Record<string, string> = {
    green: "text-green-700 bg-green-50",
    yellow: "text-yellow-700 bg-yellow-50",
    red: "text-red-700 bg-red-50",
    gray: "text-gray-700 bg-gray-50",
  };

  // SAFE values
  const listingId =
    typeof payment.listing_id === "string"
      ? payment.listing_id.substring(0, 8)
      : "N/A";

  const transactionRef =
    typeof payment.transaction_reference === "string"
      ? payment.transaction_reference
      : "Pending";

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-lg transition-colors duration-150 border-b border-gray-100 last:border-0">
      <div className="flex items-center">
        <div className="p-2 rounded-full bg-gray-100 mr-3">
          <svg
            className="w-5 h-5 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Listing ID: {listingId}...
          </p>
          <p className="text-xs text-gray-500">
            Ref: {transactionRef}
          </p>
        </div>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          {formatAmount(payment.amount ?? 0)}
        </p>
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            colorClasses[color] ?? colorClasses.gray
          }`}
        >
          {getStatusLabel(payment.status)}
        </span>
      </div>
    </div>
  );
};

export default PaymentSummary;
