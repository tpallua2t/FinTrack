import React, { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { TransactionType } from '../../types';

interface Transaction {
  id: string;
  date: Date;
  type: TransactionType;
  categoryId: string;
  amount: number;
  description: string;
}

interface Category {
  id: string;
  name: string;
  type: TransactionType;
}

const BudgetCalendar: React.FC = () => {
  // État initial avec les transactions d'exemple pour juin 2025
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: '1',
      date: new Date('2025-06-05'),
      type: TransactionType.INCOME,
      categoryId: 'salary',
      amount: 2500,
      description: 'Salaire'
    },
    {
      id: '2',
      date: new Date('2025-06-01'),
      type: TransactionType.EXPENSE,
      categoryId: 'rent',
      amount: 800,
      description: 'Loyer'
    },
    {
      id: '3',
      date: new Date('2025-06-15'),
      type: TransactionType.EXPENSE,
      categoryId: 'groceries',
      amount: 350,
      description: 'Courses'
    },
    {
      id: '4',
      date: new Date('2025-06-30'),
      type: TransactionType.INCOME,
      categoryId: 'bonus',
      amount: 500,
      description: 'Prime'
    }
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: 'salary', name: 'Salaire', type: TransactionType.INCOME },
    { id: 'bonus', name: 'Prime', type: TransactionType.INCOME },
    { id: 'rent', name: 'Loyer', type: TransactionType.EXPENSE },
    { id: 'groceries', name: 'Courses', type: TransactionType.EXPENSE }
  ]);

  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', type: TransactionType.EXPENSE });

  // Calcul des totaux
  const totals = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === TransactionType.INCOME) {
        acc.income += transaction.amount;
      } else {
        acc.expenses += transaction.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const handleAddCategory = () => {
    if (newCategory.name.trim()) {
      const newCategoryId = newCategory.name.toLowerCase().replace(/\s+/g, '-');
      setCategories([
        ...categories,
        {
          id: newCategoryId,
          name: newCategory.name,
          type: newCategory.type
        }
      ]);
      setIsAddingCategory(false);
      setNewCategory({ name: '', type: TransactionType.EXPENSE });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          Budget - {format(new Date('2025-06-01'), 'MMMM yyyy', { locale: fr })}
        </h2>
        <Button onClick={() => setIsAddingCategory(true)}>
          <Plus size={16} className="mr-2" />
          Ajouter une catégorie
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatAmount(totals.income)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dépenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {formatAmount(totals.expenses)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactions
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg dark:bg-gray-800"
                >
                  <div className="flex items-center">
                    {transaction.type === TransactionType.INCOME ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {format(transaction.date, 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <div className={`font-medium ${
                    transaction.type === TransactionType.INCOME
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === TransactionType.INCOME ? '+' : '-'}
                    {formatAmount(transaction.amount)}
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {isAddingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nouvelle catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="Nom de la catégorie"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
                <Select
                  label="Type"
                  value={newCategory.type}
                  options={[
                    { value: TransactionType.INCOME, label: 'Revenu' },
                    { value: TransactionType.EXPENSE, label: 'Dépense' }
                  ]}
                  onChange={(e) => setNewCategory({ 
                    ...newCategory, 
                    type: e.target.value as TransactionType 
                  })}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingCategory(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddCategory}>
                    Ajouter
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BudgetCalendar;