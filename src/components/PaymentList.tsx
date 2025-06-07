import React from 'react';
import { Payment, PaymentMode } from '../types';
import { formatDateForDisplay, formatCurrency } from '../utils/helpers';
import { BanknoteIcon, CalendarIcon, CreditCard, FileText, CheckCircle } from 'lucide-react';

interface PaymentListProps {
  payments: Payment[];
}

const getPaymentModeIcon = (mode: PaymentMode) => {
  switch (mode) {
    case 'cash':
      return <BanknoteIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />;
    case 'bank_transfer':
      return <CreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />;
    case 'cheque':
      return <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />;
    case 'upi':
      return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-amber-600" />;
  }
};

const getPaymentModeLabel = (mode: PaymentMode): string => {
  switch (mode) {
    case 'cash':
      return 'Cash';
    case 'bank_transfer':
      return 'Bank Transfer';
    case 'cheque':
      return 'Cheque';
    case 'upi':
      return 'UPI';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800';
    case 'partial':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-red-100 text-red-800';
  }
};

const PaymentList: React.FC<PaymentListProps> = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500">No payments recorded yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3 sm:py-3.5 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Date
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Amount
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[90px]">
                Mode
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[90px]">
                Reference
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[100px]">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-medium text-gray-900">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                    <span className="hidden sm:inline">{formatDateForDisplay(payment.paymentDate)}</span>
                    <span className="sm:hidden">{new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                  <span className="hidden sm:inline">{formatCurrency(payment.amount)}</span>
                  <span className="sm:hidden">₹{(payment.amount / 1000).toFixed(0)}k</span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    {getPaymentModeIcon(payment.paymentMode)}
                    <span className="hidden sm:inline">{getPaymentModeLabel(payment.paymentMode)}</span>
                    <span className="sm:hidden">{payment.paymentMode === 'bank_transfer' ? 'Bank' : getPaymentModeLabel(payment.paymentMode)}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                    <span className="hidden sm:inline">{payment.paymentStatus}</span>
                    <span className="sm:hidden">{payment.paymentStatus.charAt(0).toUpperCase()}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div className="max-w-[60px] sm:max-w-none truncate">
                    {payment.referenceNumber || '-'}
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div className="max-w-[80px] sm:max-w-none truncate">
                    {payment.notes || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <th scope="row" className="py-3 sm:py-3.5 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-gray-900">
                Total
              </th>
              <td className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900">
                <span className="hidden sm:inline">{formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}</span>
                <span className="sm:hidden">₹{(payments.reduce((sum, payment) => sum + payment.amount, 0) / 1000).toFixed(0)}k</span>
              </td>
              <td colSpan={4}></td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default PaymentList;