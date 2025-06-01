import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Budget from './pages/Budget';
import Patrimoine from './pages/Patrimoine';
import Accounts from './pages/Accounts';
import Settings from './pages/Settings';
import Auth from './pages/Auth';
import TransactionForm from './components/transactions/TransactionForm';
import { Transaction } from './types';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [showAddTransaction, setShowAddTransaction] = useState(false);
  
  const handleAddTransaction = (data: Partial<Transaction>) => {
    console.log('Adding transaction:', data);
    setShowAddTransaction(false);
  };
  
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            
            <Route
              element={
                <ProtectedRoute>
                  <Layout showAddTransaction={() => setShowAddTransaction(true)} />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/budget" element={<Budget />} />
              <Route path="/patrimoine" element={<Patrimoine />} />
              <Route path="/accounts" element={<Accounts />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/\" replace />} />
            </Route>
          </Routes>
          
          {showAddTransaction && (
            <TransactionForm
              onClose={() => setShowAddTransaction(false)}
              onSubmit={handleAddTransaction}
            />
          )}
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;