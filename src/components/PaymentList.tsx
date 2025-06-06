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
      return <BanknoteIcon className="w-4 h-4 text-green-600" />;
    case 'bank_transfer':
      return <CreditCard className="w-4 h-4 text-blue-600" />;
    case 'cheque':
      return <FileText className="w-4 h-4 text-purple-600" />;
    case 'upi':
      return <CheckCircle className="w-4 h-4 text-amber-600" />;
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
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Date
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Amount
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Mode
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Status
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Reference
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Notes
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {payments.map((payment) => (
            <tr key={payment.id}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                <div className="flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-gray-400" />
                  {formatDateForDisplay(payment.paymentDate)}
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                {formatCurrency(payment.amount)}
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                <div className="flex items-center gap-1.5">
                  {getPaymentModeIcon(payment.paymentMode)}
                  <span>{getPaymentModeLabel(payment.paymentMode)}</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm">
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.paymentStatus)}`}>
                  {payment.paymentStatus}
                </span>
              </td>
              <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                {payment.referenceNumber || '-'}
              </td>
              <td className="px-3 py-4 text-sm text-gray-500">
                {payment.notes || '-'}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50">
          <tr>
            <th scope="row" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
              Total
            </th>
            <td className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              {formatCurrency(payments.reduce((sum, payment) => sum + payment.amount, 0))}
            </td>
            <td colSpan={4}></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default PaymentList;