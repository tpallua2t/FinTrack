import React from 'react';
import MonthlyOverview from '../components/dashboard/MonthlyOverview';
import CategoryBreakdown from '../components/dashboard/CategoryBreakdown';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import { mockTransactions, mockMonthlySummaries } from '../utils/mockData';

const Dashboard: React.FC = () => {
  const currentMonthSummary = mockMonthlySummaries[mockMonthlySummaries.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      
      <div className="grid grid-cols-12 gap-6">
        <MonthlyOverview data={mockMonthlySummaries} />
        
        <CategoryBreakdown data={currentMonthSummary} />
        
        <RecentTransactions transactions={mockTransactions} />
      </div>
    </div>
  );
};

export default Dashboard;