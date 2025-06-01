import React, { useState } from 'react';
import ExpenseManager from '../components/budget/ExpenseManager';
import RevenueManager from '../components/budget/RevenueManager';
import BudgetSummary from '../components/budget/BudgetSummary';
import { format } from 'date-fns';

type BudgetTab = 'expenses' | 'revenues' | 'summary';

const Budget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<BudgetTab>('expenses');
  const [selectedPeriod, setSelectedPeriod] = useState(() => format(new Date(), 'yyyy-MM'));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'expenses'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Dépenses
          </button>
          <button
            onClick={() => setActiveTab('revenues')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'revenues'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Revenus
          </button>
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            Synthèse
          </button>
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        {activeTab === 'expenses' && <ExpenseManager />}
        {activeTab === 'revenues' && <RevenueManager />}
        {activeTab === 'summary' && <BudgetSummary selectedPeriod={selectedPeriod} />}
      </div>
    </div>
  );
};

export default Budget;