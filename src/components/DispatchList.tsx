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
  );
};

export default DispatchList;