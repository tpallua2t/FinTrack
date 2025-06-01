import React from 'react';
import BudgetCalendar from '../components/budget/BudgetCalendar';

const Budget: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
      <BudgetCalendar />
    </div>
  );
};

export default Budget;