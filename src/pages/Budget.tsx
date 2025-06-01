import React from 'react';
import ExpenseManager from '../components/budget/ExpenseManager';

const Budget: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
      <ExpenseManager />
    </div>
  );
};

export default Budget;