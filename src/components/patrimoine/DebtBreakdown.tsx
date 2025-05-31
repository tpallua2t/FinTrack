import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { DebtType, PatrimoineSnapshot } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface DebtBreakdownProps {
  data: PatrimoineSnapshot;
}

// Colors for different debt types
const COLORS = {
  [DebtType.CREDIT_CARD]: '#ef4444',
  [DebtType.LOAN]: '#f97316',
  [DebtType.MORTGAGE]: '#f59e0b',
  [DebtType.OTHER]: '#64748b',
};

// Debt type labels
const DEBT_LABELS = {
  [DebtType.CREDIT_CARD]: 'Credit Cards',
  [DebtType.LOAN]: 'Loans',
  [DebtType.MORTGAGE]: 'Mortgage',
  [DebtType.OTHER]: 'Other',
};

const DebtBreakdown: React.FC<DebtBreakdownProps> = ({ data }) => {
  const chartData = Object.entries(data.debts)
    .filter(([_, value]) => value > 0) // Only include debts with value > 0
    .map(([type, value]) => ({
      name: DEBT_LABELS[type as DebtType],
      value,
      color: COLORS[type as DebtType]
    }));

  const totalDebts = Object.values(data.debts).reduce((sum, value) => sum + value, 0);

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Debt Breakdown</span>
          <span className="text-lg font-bold">{formatCurrency(totalDebts)}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem' 
                }}
              />
              <Legend formatter={(value) => <span className="text-sm">{value}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs font-medium">{item.name}</span>
              </div>
              <span className="text-xs">{formatCurrency(item.value)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtBreakdown;