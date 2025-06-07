import React, { useState } from 'react';
import { PackageSearch, Menu, X, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AuthButton from './AuthButton';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <PackageSearch className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900">OrderTrack</span>
            </div>
            
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              
              <Link
                to="/sales"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/sales') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Sales
              </Link>
              
              <Link
                to="/purchases"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/purchases') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Purchases
              </Link>
              
              <Link
                to="/orders"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/orders') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Orders
              </Link>

              <Link
                to="/payments"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/payments') 
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <CreditCard className="h-4 w-4 mr-1" />
                <span className="hidden lg:inline">Payments</span>
                <span className="lg:hidden">Pay</span>
              </Link>
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <AuthButton />
          </div>
          
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 touch-manipulation"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
          <Link
            to="/"
            onClick={closeMenu}
            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-manipulation ${
              isActive('/') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Home
          </Link>
          
          <Link
            to="/sales"
            onClick={closeMenu}
            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-manipulation ${
              isActive('/sales') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Sales
          </Link>
          
          <Link
            to="/purchases"
            onClick={closeMenu}
            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-manipulation ${
              isActive('/purchases') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Purchases
          </Link>
          
          <Link
            to="/orders"
            onClick={closeMenu}
            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-manipulation ${
              isActive('/orders') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Orders
          </Link>

          <Link
            to="/payments"
            onClick={closeMenu}
            className={`block pl-3 pr-4 py-3 border-l-4 text-base font-medium touch-manipulation ${
              isActive('/payments') 
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Payments
          </Link>
          
          <div className="pl-3 pr-4 py-3 border-t border-gray-200">
            <AuthButton />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;