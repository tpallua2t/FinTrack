import React from 'react';
import NetWorthChart from '../components/patrimoine/NetWorthChart';
import AssetBreakdown from '../components/patrimoine/AssetBreakdown';
import DebtBreakdown from '../components/patrimoine/DebtBreakdown';
import { mockPatrimoineSnapshots } from '../utils/mockData';

const Patrimoine: React.FC = () => {
  const latestSnapshot = mockPatrimoineSnapshots[mockPatrimoineSnapshots.length - 1];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Patrimoine</h1>
      
      <div className="grid grid-cols-12 gap-6">
        <NetWorthChart data={mockPatrimoineSnapshots} />
        
        <AssetBreakdown data={latestSnapshot} />
        
        <DebtBreakdown data={latestSnapshot} />
      </div>
    </div>
  );
};

export default Patrimoine;