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

const getPaymentModeColor = (mode: PaymentMode): string => {
  switch (mode) {
    case 'cash':
      return 'text-green-700 bg-green-100 border-green-200';
    case 'bank_transfer':
      return 'text-blue-700 bg-blue-100 border-blue-200';
    case 'cheque':
      return 'text-purple-700 bg-purple-100 border-purple-200';
    case 'upi':
      return 'text-amber-700 bg-amber-100 border-amber-200';
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    case 'partial':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    default:
      return 'bg-red-100 text-red-800 border-red-200';
  }
};

const getAmountColor = (amount: number): string => {
  if (amount > 100000) return 'text-emerald-700 font-bold';
  if (amount > 50000) return 'text-blue-700 font-semibold';
  if (amount > 10000) return 'text-indigo-700 font-medium';
  return 'text-slate-600 font-medium';
};

const PaymentList: React.FC<PaymentListProps> = ({ payments }) => {
  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 font-medium">No payments recorded yet</p>
      </div>
    );
  }

  const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-xl border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-50 via-green-50 to-emerald-50 border-b border-slate-200">
            <tr>
              <th scope="col" className="py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[80px] bg-cyan-100">
                Date
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[80px] bg-green-100">
                Amount
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[90px] bg-blue-100">
                Mode
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[80px] bg-amber-100">
                Status
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[90px] bg-purple-100">
                Reference
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-bold text-slate-700 uppercase tracking-wider min-w-[100px] bg-rose-100">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {payments.map((payment, index) => (
              <tr 
                key={payment.id}
                className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-gray-50/40' : 'bg-white'
                }`}
              >
                <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-semibold text-cyan-700 bg-cyan-50/30">
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-500 flex-shrink-0" />
                    <span className="hidden sm:inline">{formatDateForDisplay(payment.paymentDate)}</span>
                    <span className="sm:hidden">{new Date(payment.paymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-bold bg-green-50/30">
                  <span className={`font-mono ${getAmountColor(payment.amount)}`}>
                    <span className="hidden sm:inline">{formatCurrency(payment.amount)}</span>
                    <span className="sm:hidden">₹{(payment.amount / 1000).toFixed(0)}k</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm bg-blue-50/30">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getPaymentModeColor(payment.paymentMode)}`}>
                    <div className="flex items-center gap-1">
                      {getPaymentModeIcon(payment.paymentMode)}
                      <span className="hidden sm:inline">{getPaymentModeLabel(payment.paymentMode)}</span>
                      <span className="sm:hidden">{payment.paymentMode === 'bank_transfer' ? 'Bank' : getPaymentModeLabel(payment.paymentMode)}</span>
                    </div>
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm bg-amber-50/30">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full border ${getStatusColor(payment.paymentStatus)}`}>
                    <span className="hidden sm:inline">{payment.paymentStatus}</span>
                    <span className="sm:hidden">{payment.paymentStatus.charAt(0).toUpperCase()}</span>
                  </span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-purple-700 bg-purple-50/30">
                  <div className="max-w-[60px] sm:max-w-none truncate">
                    {payment.referenceNumber ? (
                      <span className="font-mono bg-purple-100 px-2 py-1 rounded text-xs border border-purple-200">
                        {payment.referenceNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-rose-700 bg-rose-50/30">
                  <div className="max-w-[80px] sm:max-w-none truncate font-medium">
                    {payment.notes ? (
                      <span className="bg-rose-100 px-2 py-1 rounded text-xs border border-rose-200">
                        {payment.notes}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gradient-to-r from-emerald-100 to-green-100 border-t-2 border-emerald-200">
            <tr>
              <th scope="row" className="py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-sm font-bold text-emerald-800">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                  Total
                </div>
              </th>
              <td className="px-2 sm:px-3 py-4 text-left text-sm font-bold text-emerald-800">
                <span className={`font-mono ${getAmountColor(totalAmount)}`}>
                  <span className="hidden sm:inline">{formatCurrency(totalAmount)}</span>
                  <span className="sm:hidden">₹{(totalAmount / 1000).toFixed(0)}k</span>
                </span>
              </td>
              <td colSpan={4} className="px-2 sm:px-3 py-4">
                <div className="text-xs text-emerald-600 font-medium">
                  {payments.length} payment{payments.length !== 1 ? 's' : ''} recorded
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-3 text-center border-t border-emerald-100">
        <p className="text-xs text-emerald-600 font-medium">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default PaymentList;