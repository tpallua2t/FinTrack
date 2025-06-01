import React, { useState } from 'react';
import { Plus, Filter, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatCurrency } from '../../utils/helpers';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
}

const CATEGORIES = [
  { value: 'course', label: 'Course' },
  { value: 'alimentaire', label: 'Alimentaire' },
  { value: 'vehicule', label: 'Véhicule' },
];

const ExpenseManager: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Courses hebdomadaires',
      amount: 250,
      category: 'course',
      date: '2025-06-01'
    },
    {
      id: '2',
      description: 'Essence',
      amount: 80,
      category: 'vehicule',
      date: '2025-06-01'
    }
  ]);
  
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Expense;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingExpense) {
      setExpenses(expenses.map(expense => 
        expense.id === editingExpense.id 
          ? { ...formData, id: expense.id }
          : expense
      ));
    } else {
      setExpenses([...expenses, { ...formData, id: Date.now().toString() }]);
    }
    
    setFormData({
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData(expense);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  const handleSort = (key: keyof Expense) => {
    setSortConfig(current => ({
      key,
      direction: current?.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const filteredAndSortedExpenses = [...expenses]
    .filter(expense => !categoryFilter || expense.category === categoryFilter)
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      if (a[sortConfig.key] < b[sortConfig.key]) return -1 * direction;
      if (a[sortConfig.key] > b[sortConfig.key]) return 1 * direction;
      return 0;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Dépenses
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total: {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center"
          >
            <Filter size={16} className="mr-2" />
            Filtrer
            {showFilters ? (
              <ChevronUp size={16} className="ml-2" />
            ) : (
              <ChevronDown size={16} className="ml-2" />
            )}
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setShowForm(true);
              setEditingExpense(null);
              setFormData({
                description: '',
                amount: 0,
                category: '',
                date: new Date().toISOString().split('T')[0]
              });
            }}
            className="flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Ajouter une dépense
          </Button>
        </div>
      </div>

      {showFilters && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="p-4">
            <div className="flex gap-4">
              <Select
                label="Catégorie"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                options={[
                  { value: '', label: 'Toutes les catégories' },
                  ...CATEGORIES
                ]}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Montant"
                  name="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
                <Select
                  label="Catégorie"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  options={CATEGORIES}
                  required
                />
                <Input
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingExpense(null);
                    }}
                  >
                    Annuler
                  </Button>
                  <Button type="submit">
                    {editingExpense ? 'Modifier' : 'Ajouter'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => handleSort('date')}
                  >
                    Date
                    {sortConfig?.key === 'date' && (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => handleSort('description')}
                  >
                    Description
                    {sortConfig?.key === 'description' && (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => handleSort('category')}
                  >
                    Catégorie
                    {sortConfig?.key === 'category' && (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    )}
                  </th>
                  <th 
                    className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400 cursor-pointer"
                    onClick={() => handleSort('amount')}
                  >
                    Montant
                    {sortConfig?.key === 'amount' && (
                      sortConfig.direction === 'asc' ? '↑' : '↓'
                    )}
                  </th>
                  <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {filteredAndSortedExpenses.map(expense => (
                  <tr 
                    key={expense.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {new Date(expense.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {expense.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {CATEGORIES.find(c => c.value === expense.category)?.label}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(expense)}
                          className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                          aria-label="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(expense.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                          aria-label="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-200 dark:border-gray-800 font-medium">
                  <td colSpan={3} className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                    Total
                  </td>
                  <td className="px-4 py-3 text-right text-gray-900 dark:text-gray-100">
                    {formatCurrency(totalExpenses)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManager;