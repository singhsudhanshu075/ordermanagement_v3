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
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200 bg-white">
          {dispatches.map((dispatch) => (
            <div key={dispatch.id} className="p-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">
                    {formatDateForDisplay(dispatch.date)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Qty: {dispatch.quantity?.toFixed(2)}
                  </span>
                </div>
                
                {dispatch.productType && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Product Type:</span>
                    <span className="text-sm text-gray-900">{dispatch.productType}</span>
                  </div>
                )}
                
                {dispatch.gaugeDifference && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Gauge Diff:</span>
                    <span className="text-sm text-gray-900">{dispatch.gaugeDifference}</span>
                  </div>
                )}
                
                {dispatch.dispatchPrice && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Price:</span>
                    <span className="text-sm text-gray-900">₹{dispatch.dispatchPrice.toFixed(2)}</span>
                  </div>
                )}
                
                {dispatch.loadingCharge && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Loading Charge:</span>
                    <span className="text-sm text-gray-900">₹{dispatch.loadingCharge.toFixed(2)}</span>
                  </div>
                )}
                
                {dispatch.taxRate && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Tax Rate:</span>
                    <span className="text-sm text-gray-900">{dispatch.taxRate}%</span>
                  </div>
                )}
                
                {dispatch.invoiceNumber && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Invoice:</span>
                    <span className="text-sm text-gray-900">{dispatch.invoiceNumber}</span>
                  </div>
                )}
                
                {dispatch.notes && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">Notes:</span>
                    <p className="text-sm text-gray-900 mt-1">{dispatch.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                Date
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Quantity
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Product Type
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Gauge Diff.
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Loading Charge
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Tax Rate
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Price (₹)
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Invoice #
              </th>
              <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {dispatches.map((dispatch) => (
              <tr key={dispatch.id}>
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {formatDateForDisplay(dispatch.date)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.quantity?.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.productType || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.gaugeDifference || '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.loadingCharge ? `₹${dispatch.loadingCharge.toFixed(2)}` : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.taxRate ? `${dispatch.taxRate}%` : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.dispatchPrice ? `₹${dispatch.dispatchPrice.toFixed(2)}` : '-'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {dispatch.invoiceNumber || '-'}
                </td>
                <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {dispatch.notes || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DispatchList;