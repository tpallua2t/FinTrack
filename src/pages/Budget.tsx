import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { mockCategories, mockMonthlySummaries } from '../utils/mockData';
import { formatCurrency } from '../utils/helpers';

const Budget: React.FC = () => {
  const currentMonth = mockMonthlySummaries[mockMonthlySummaries.length - 1];
  const previousMonth = mockMonthlySummaries[mockMonthlySummaries.length - 2];
  
  // Simulate budget data - in a real app this would come from user settings
  const budgets = mockCategories
    .filter(category => category.type === 'expense')
    .map(category => ({
      id: category.id,
      name: category.name,
      budgeted: Math.round(currentMonth.expenses / mockCategories.length * 1.2),
      spent: currentMonth.byCategory[category.name] || 0,
      previousSpent: previousMonth.byCategory[category.name] || 0
    }));

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Budget Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg dark:bg-blue-900/20">
                  <p className="text-sm text-blue-700 dark:text-blue-400 font-medium mb-1">Total Budgeted</p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                    {formatCurrency(totalBudgeted)}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${
                  totalSpent <= totalBudgeted 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <p className={`text-sm font-medium mb-1 ${
                    totalSpent <= totalBudgeted 
                      ? 'text-green-700 dark:text-green-400' 
                      : 'text-red-700 dark:text-red-400'
                  }`}>Total Spent</p>
                  <p className={`text-2xl font-bold ${
                    totalSpent <= totalBudgeted 
                      ? 'text-green-900 dark:text-green-300' 
                      : 'text-red-900 dark:text-red-300'
                  }`}>
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-xs mt-1">
                    {((totalSpent / totalBudgeted) * 100).toFixed(1)}% of budget
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800">
                <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-1">Remaining</p>
                <p className={`text-2xl font-bold ${
                  totalBudgeted - totalSpent >= 0
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(totalBudgeted - totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mt-8">Category Budgets</h2>
      
      <div className="space-y-4">
        {budgets.map(budget => {
          const percentSpent = (budget.spent / budget.budgeted) * 100;
          const changeFromPrevious = budget.spent - budget.previousSpent;
          
          return (
            <Card key={budget.id}>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{budget.name}</h3>
                    <div className="flex items-center">
                      {changeFromPrevious !== 0 && (
                        <div className={`flex items-center text-xs mr-2 ${
                          changeFromPrevious > 0 
                            ? 'text-red-600 dark:text-red-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {changeFromPrevious > 0 ? (
                            <ArrowUpRight size={14} className="mr-1" />
                          ) : (
                            <ArrowDownRight size={14} className="mr-1" />
                          )}
                          {Math.abs(changeFromPrevious / budget.previousSpent * 100).toFixed(1)}%
                        </div>
                      )}
                      <div className="text-sm font-medium">
                        {formatCurrency(budget.spent)} / {formatCurrency(budget.budgeted)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden dark:bg-gray-700">
                    <div 
                      className={`h-full rounded-full ${
                        percentSpent <= 75 
                          ? 'bg-green-500'
                          : percentSpent <= 100
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min(percentSpent, 100)}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span>0%</span>
                    <span>{percentSpent.toFixed(1)}% spent</span>
                    <span>100%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Budget;