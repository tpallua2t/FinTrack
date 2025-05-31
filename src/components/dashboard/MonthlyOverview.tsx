import React from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { MonthlySummary } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface MonthlyOverviewProps {
  data: MonthlySummary[];
}

const MonthlyOverview: React.FC<MonthlyOverviewProps> = ({ data }) => {
  const chartData = data.map(item => ({
    name: format(item.month, 'MMM'),
    Income: item.income,
    Expenses: item.expenses,
    Savings: item.savings
  }));

  // Calculate the current month's data
  const currentMonth = data[data.length - 1];
  
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Income</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {formatCurrency(currentMonth.income)}
            </p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">Expenses</p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">
              {formatCurrency(currentMonth.expenses)}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg dark:bg-green-900/20">
            <p className="text-sm text-green-700 dark:text-green-400 font-medium mb-1">Savings</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {formatCurrency(currentMonth.savings)}
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              {((currentMonth.savings / currentMonth.income) * 100).toFixed(1)}% of income
            </p>
          </div>
        </div>

        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="name" className="text-xs fill-gray-500 dark:fill-gray-400" />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem' 
                }} 
                formatter={(value: number) => [formatCurrency(value), '']}
              />
              <Bar dataKey="Income" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Savings" fill="#10B981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyOverview;