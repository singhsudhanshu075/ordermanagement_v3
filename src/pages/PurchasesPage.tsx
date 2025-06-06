import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderForm from '../components/OrderForm';

const PurchasesPage: React.FC = () => {
  const navigate = useNavigate();
  const [isOrderCreated, setIsOrderCreated] = useState(false);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  
  const handleOrderCreated = (orderId: string) => {
    setCreatedOrderId(orderId);
    setIsOrderCreated(true);
  };
  
  const handleViewOrder = () => {
    navigate(`/orders/${createdOrderId}`);
  };
  
  const handleCreateAnother = () => {
    setIsOrderCreated(false);
    setCreatedOrderId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isOrderCreated ? (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Purchase order created successfully
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Order ID: <span className="font-semibold">{createdOrderId}</span>
                </p>
              </div>
              <div className="mt-4">
                <div className="-mx-2 -my-1.5 flex">
                  <button
                    onClick={handleViewOrder}
                    className="bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    View Order
                  </button>
                  <button
                    onClick={handleCreateAnother}
                    className="ml-3 bg-green-50 px-2 py-1.5 rounded-md text-sm font-medium text-green-800 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 focus:ring-green-600"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Purchase Order</h1>
          <OrderForm type="purchase" onOrderCreated={handleOrderCreated} />
        </>
      )}
    </div>
  );
};

export default PurchasesPage;