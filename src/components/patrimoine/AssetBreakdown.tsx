import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { AssetType, PatrimoineSnapshot } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface AssetBreakdownProps {
  data: PatrimoineSnapshot;
}

// Colors for different asset types
const COLORS = {
  [AssetType.CASH]: '#22c55e',
  [AssetType.CHECKING]: '#3b82f6',
  [AssetType.SAVINGS]: '#06b6d4',
  [AssetType.INVESTMENT]: '#8b5cf6',
  [AssetType.REAL_ESTATE]: '#ec4899',
  [AssetType.VEHICLE]: '#f59e0b',
  [AssetType.CRYPTOCURRENCY]: '#6366f1',
  [AssetType.OTHER]: '#64748b',
};

// Asset type labels
const ASSET_LABELS = {
  [AssetType.CASH]: 'Cash',
  [AssetType.CHECKING]: 'Checking',
  [AssetType.SAVINGS]: 'Savings',
  [AssetType.INVESTMENT]: 'Investments',
  [AssetType.REAL_ESTATE]: 'Real Estate',
  [AssetType.VEHICLE]: 'Vehicles',
  [AssetType.CRYPTOCURRENCY]: 'Crypto',
  [AssetType.OTHER]: 'Other',
};

const AssetBreakdown: React.FC<AssetBreakdownProps> = ({ data }) => {
  const chartData = Object.entries(data.assets)
    .filter(([_, value]) => value > 0) // Only include assets with value > 0
    .map(([type, value]) => ({
      name: ASSET_LABELS[type as AssetType],
      value,
      color: COLORS[type as AssetType]
    }));

  const totalAssets = Object.values(data.assets).reduce((sum, value) => sum + value, 0);

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Asset Breakdown</span>
          <span className="text-lg font-bold">{formatCurrency(totalAssets)}</span>
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

export default AssetBreakdown;