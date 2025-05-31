import React, { useState } from 'react';
import { format } from 'date-fns';
import { Edit2, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent, 
  CardFooter 
} from '../ui/Card';
import Button from '../ui/Button';
import { Transaction } from '../../types';
import { formatCurrency, formatDate, getTransactionColor } from '../../utils/helpers';
import TransactionForm from './TransactionForm';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onDelete,
  onEdit
}) => {
  const [editTransaction, setEditTransaction] = useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditTransaction(transaction);
  };

  const handleUpdate = (data: Partial<Transaction>) => {
    if (editTransaction) {
      onEdit({ ...editTransaction, ...data });
    }
    setEditTransaction(null);
  };

  // Group transactions by date
  const groupedTransactions: Record<string, Transaction[]> = {};
  transactions.forEach((transaction) => {
    const date = format(transaction.date, 'yyyy-MM-dd');
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = [];
    }
    groupedTransactions[date].push(transaction);
  });

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No transactions found</p>
          <Button>Add your first transaction</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedTransactions).map(([date, txns]) => (
        <div key={date} className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {formatDate(new Date(date))}
          </h3>
          <Card>
            <CardContent className="p-0">
              <ul className="divide-y divide-gray-200 dark:divide-gray-800">
                {txns.map((transaction) => (
                  <li key={transaction.id} className="px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {transaction.type}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`text-sm font-medium ${getTransactionColor(transaction.type)}`}>
                          {formatCurrency(transaction.amount)}
                        </span>
                        <div className="flex ml-4">
                          <button
                            onClick={() => handleEdit(transaction)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 mr-2"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => onDelete(transaction.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      ))}

      {editTransaction && (
        <TransactionForm
          onClose={() => setEditTransaction(null)}
          onSubmit={handleUpdate}
          initialData={editTransaction}
          isEdit
        />
      )}
    </div>
  );
};

export default TransactionList;