import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SalesPage from './pages/SalesPage';
import PurchasesPage from './pages/PurchasesPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import PaymentsPage from './pages/PaymentsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/sales" element={<SalesPage />} />
            <Route path="/purchases" element={<PurchasesPage />} />
            <Route path="/orders/:id" element={<OrderDetailPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/payments/:id?" element={<PaymentsPage />} />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;