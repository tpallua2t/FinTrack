import React from 'react';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { PatrimoineSnapshot } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface NetWorthChartProps {
  data: PatrimoineSnapshot[];
}

const NetWorthChart: React.FC<NetWorthChartProps> = ({ data }) => {
  const chartData = data.map(snapshot => ({
    name: format(snapshot.date, 'MMM yyyy'),
    Assets: Object.values(snapshot.assets).reduce((sum, value) => sum + value, 0),
    Debts: Object.values(snapshot.debts).reduce((sum, value) => sum + value, 0),
    NetWorth: snapshot.netWorth
  }));

  const currentNetWorth = data[data.length - 1].netWorth;
  const previousNetWorth = data[data.length - 2]?.netWorth || 0;
  const change = currentNetWorth - previousNetWorth;
  const percentChange = previousNetWorth ? (change / previousNetWorth) * 100 : 0;

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Net Worth Evolution</span>
          <div className="text-right">
            <span className="text-2xl font-bold">{formatCurrency(currentNetWorth)}</span>
            <div className={`text-sm ${change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {change >= 0 ? '+' : ''}{formatCurrency(change)} ({percentChange.toFixed(1)}%)
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis dataKey="name" className="text-xs fill-gray-500 dark:fill-gray-400" />
              <YAxis className="text-xs fill-gray-500 dark:fill-gray-400" />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), '']}
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem' 
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="NetWorth" 
                stroke="#3B82F6" 
                strokeWidth={2}
                activeDot={{ r: 8 }}
              />
              <Line 
                type="monotone" 
                dataKey="Assets" 
                stroke="#10B981"
                strokeWidth={2} 
              />
              <Line 
                type="monotone" 
                dataKey="Debts" 
                stroke="#EF4444" 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default NetWorthChart;