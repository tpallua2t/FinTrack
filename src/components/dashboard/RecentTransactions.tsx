import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, getTransactionColor } from '../../utils/helpers';

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions }) => {
  const sortedTransactions = [...transactions]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 5);

  return (
    <Card className="col-span-full md:col-span-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {sortedTransactions.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-800">
            {sortedTransactions.map((transaction) => (
              <li key={transaction.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {formatDate(transaction.date)}
                  </p>
                </div>
                <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                  {formatCurrency(transaction.amount)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6">No recent transactions</p>
        )}
      </CardContent>
      <CardFooter className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
        <Link
          to="/transactions"
          className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium flex items-center"
        >
          View all transactions
          <ArrowRight size={16} className="ml-1" />
        </Link>
      </CardFooter>
    </Card>
  );
};

export default RecentTransactions;