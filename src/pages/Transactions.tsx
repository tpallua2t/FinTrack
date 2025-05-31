import React, { useState } from 'react';
import { PlusCircle, Search, Filter } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import TransactionList from '../components/transactions/TransactionList';
import TransactionForm from '../components/transactions/TransactionForm';
import { Transaction } from '../types';
import { mockTransactions } from '../utils/mockData';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddTransaction = (data: Partial<Transaction>) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: data.date || new Date(),
      type: data.type!,
      accountId: data.accountId || '',
      categoryId: data.categoryId || '',
      subcategoryId: data.subcategoryId,
      amount: data.amount || 0,
      description: data.description || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setTransactions([...transactions, newTransaction]);
  };

  const handleEditTransaction = (updatedTransaction: Transaction) => {
    setTransactions(
      transactions.map(transaction => 
        transaction.id === updatedTransaction.id 
          ? { ...updatedTransaction, updatedAt: new Date() } 
          : transaction
      )
    );
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(transaction => transaction.id !== id));
  };

  const filteredTransactions = searchTerm
    ? transactions.filter(transaction =>
        transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transactions;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
        
        <Button 
          onClick={() => setShowForm(true)}
          className="flex items-center justify-center sm:justify-start"
        >
          <PlusCircle size={16} className="mr-2" />
          Add Transaction
        </Button>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" className="flex items-center">
          <Filter size={16} className="mr-2" />
          Filter
        </Button>
      </div>
      
      <TransactionList
        transactions={filteredTransactions}
        onDelete={handleDeleteTransaction}
        onEdit={handleEditTransaction}
      />
      
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSubmit={handleAddTransaction}
        />
      )}
    </div>
  );
};

export default Transactions;