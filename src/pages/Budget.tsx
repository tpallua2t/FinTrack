import React, { useState } from 'react';
import ExpenseManager from '../components/budget/ExpenseManager';
import RevenueManager from '../components/budget/RevenueManager';

type BudgetTab = 'expenses' | 'revenues';

const Budget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BudgetTab>('expenses');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'expenses'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Dépenses
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'revenues'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Revenus
          </button>
        </div>
      </div>

      {activeTab === 'expenses' ? <ExpenseManager /> : <RevenueManager />}
    </div>
  );
};

export default Budget;