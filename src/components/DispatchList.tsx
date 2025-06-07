import React from 'react';
import { Dispatch } from '../types';
import { formatDateForDisplay } from '../utils/helpers';

interface DispatchListProps {
  dispatches: Dispatch[];
}

const DispatchList: React.FC<DispatchListProps> = ({ dispatches }) => {
  if (!Array.isArray(dispatches) || dispatches.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        No dispatches recorded yet.
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
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[70px]">
                Quantity
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Product Type
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Gauge Diff.
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[90px]">
                Loading Charge
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[70px]">
                Tax Rate
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Price (₹)
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[80px]">
                Invoice #
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-3.5 text-left text-xs sm:text-sm font-semibold text-gray-900 min-w-[100px]">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {dispatches.map((dispatch) => (
              <tr key={dispatch.id}>
                <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-medium text-gray-900">
                  <span className="hidden sm:inline">{formatDateForDisplay(dispatch.date)}</span>
                  <span className="sm:hidden">{new Date(dispatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.quantity?.toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.productType || '-'}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.gaugeDifference || '-'}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.loadingCharge ? `₹${dispatch.loadingCharge.toFixed(0)}` : '-'}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.taxRate ? `${dispatch.taxRate}%` : '-'}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  {dispatch.dispatchPrice ? `₹${dispatch.dispatchPrice.toFixed(0)}` : '-'}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div className="max-w-[60px] sm:max-w-none truncate">
                    {dispatch.invoiceNumber || '-'}
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-gray-500">
                  <div className="max-w-[80px] sm:max-w-xs truncate">
                    {dispatch.notes || '-'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gray-50 px-4 py-2 text-center">
        <p className="text-xs text-gray-500">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default DispatchList;