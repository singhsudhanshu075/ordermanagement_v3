import React from 'react';
import { Dispatch } from '../types';
import { formatDateForDisplay } from '../utils/helpers';

interface DispatchListProps {
  dispatches: Dispatch[];
}

const DispatchList: React.FC<DispatchListProps> = ({ dispatches }) => {
  if (!Array.isArray(dispatches) || dispatches.length === 0) {
    return (
      <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 font-medium">No dispatches recorded yet.</p>
      </div>
    );
  }

  const getProductTypeColor = (productType: string): string => {
    if (!productType) return 'text-gray-500';
    
    // Color based on product dimensions
    if (productType.includes('40x') || productType.includes('30x')) {
      return 'text-blue-700 bg-blue-50';
    } else if (productType.includes('50x') || productType.includes('65x')) {
      return 'text-emerald-700 bg-emerald-50';
    } else if (productType.includes('75x')) {
      return 'text-purple-700 bg-purple-50';
    }
    return 'text-indigo-700 bg-indigo-50';
  };

  const getTaxRateColor = (taxRate: number): string => {
    if (taxRate === 7) return 'text-green-700 bg-green-50';
    if (taxRate === 12) return 'text-amber-700 bg-amber-50';
    if (taxRate === 18) return 'text-red-700 bg-red-50';
    return 'text-gray-700 bg-gray-50';
  };

  const getPriceColor = (price: number): string => {
    if (price > 10000) return 'text-emerald-700 font-bold';
    if (price > 5000) return 'text-blue-700 font-semibold';
    return 'text-slate-600 font-medium';
  };

  return (
    <div className="overflow-hidden shadow-md ring-1 ring-black ring-opacity-5 rounded-lg border border-gray-200">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-slate-200">
            <tr>
              <th scope="col" className="py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-blue-50">
                Date
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[70px] bg-amber-50">
                Quantity
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-indigo-50">
                Product Type
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-emerald-50">
                Gauge Diff.
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[90px] bg-purple-50">
                Loading Charge
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[70px] bg-orange-50">
                Tax Rate
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-green-50">
                Price (₹)
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[80px] bg-rose-50">
                Invoice #
              </th>
              <th scope="col" className="px-2 sm:px-3 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-slate-700 uppercase tracking-wider min-w-[100px] bg-cyan-50">
                Notes
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {dispatches.map((dispatch, index) => (
              <tr 
                key={dispatch.id}
                className={`border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                  index % 2 === 0 ? 'bg-gray-50/30' : 'bg-white'
                }`}
              >
                <td className="whitespace-nowrap py-3 sm:py-4 pl-3 sm:pl-4 pr-2 sm:pr-3 text-xs sm:text-sm font-medium text-blue-700 bg-blue-50/20">
                  <span className="hidden sm:inline">{formatDateForDisplay(dispatch.date)}</span>
                  <span className="sm:hidden">{new Date(dispatch.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-semibold text-amber-700 bg-amber-50/20">
                  {dispatch.quantity?.toFixed(1)}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium bg-indigo-50/20">
                  {dispatch.productType ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getProductTypeColor(dispatch.productType)}`}>
                      {dispatch.productType}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-emerald-700 bg-emerald-50/20">
                  {dispatch.gaugeDifference ? (
                    <span className="font-mono">{dispatch.gaugeDifference}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-purple-700 bg-purple-50/20">
                  {dispatch.loadingCharge ? (
                    <span className="font-mono">₹{dispatch.loadingCharge.toFixed(0)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium bg-orange-50/20">
                  {dispatch.taxRate ? (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaxRateColor(dispatch.taxRate)}`}>
                      {dispatch.taxRate}%
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm bg-green-50/20">
                  {dispatch.dispatchPrice ? (
                    <span className={`font-mono ${getPriceColor(dispatch.dispatchPrice)}`}>
                      ₹{dispatch.dispatchPrice.toFixed(0)}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50/20">
                  <div className="max-w-[60px] sm:max-w-none truncate">
                    {dispatch.invoiceNumber ? (
                      <span className="font-mono bg-rose-50 px-2 py-1 rounded text-xs">
                        {dispatch.invoiceNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
                <td className="px-2 sm:px-3 py-3 sm:py-4 text-xs sm:text-sm text-cyan-700 bg-cyan-50/20">
                  <div className="max-w-[80px] sm:max-w-xs truncate font-medium">
                    {dispatch.notes ? (
                      <span className="bg-cyan-50 px-2 py-1 rounded text-xs">
                        {dispatch.notes}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile scroll hint */}
      <div className="sm:hidden bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 text-center border-t border-blue-100">
        <p className="text-xs text-blue-600 font-medium">← Scroll horizontally to see more details →</p>
      </div>
    </div>
  );
};

export default DispatchList;