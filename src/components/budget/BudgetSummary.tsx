import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const BudgetSummary: React.FC<{ selectedPeriod: string }> = ({ selectedPeriod }) => {
  const { currentUser } = useAuth();
  const [summary, setSummary] = React.useState({
    revenues: 0,
    expenses: 0,
    balance: 0
  });

  React.useEffect(() => {
    if (currentUser) {
      loadSummary();
    }
  }, [currentUser, selectedPeriod]);

  const loadSummary = async () => {
    if (!currentUser) return;

    const [year, month] = selectedPeriod.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    try {
      // Load revenues
      const revenuesRef = collection(db, 'revenues');
      const revenuesQuery = query(
        revenuesRef,
        where('user_id', '==', currentUser.uid),
        where('annee', '==', yearNum),
        where('mois', '==', monthNum)
      );
      const revenuesSnapshot = await getDocs(revenuesQuery);
      const totalRevenues = revenuesSnapshot.docs.reduce(
        (sum, doc) => sum + doc.data().valeur,
        0
      );

      // Load expenses
      const expensesRef = collection(db, 'expenses');
      const expensesQuery = query(
        expensesRef,
        where('user_id', '==', currentUser.uid),
        where('annee', '==', yearNum),
        where('mois', '==', monthNum),
        where('type', '==', 'transaction')
      );
      const expensesSnapshot = await getDocs(expensesQuery);
      const totalExpenses = expensesSnapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().valeur_reel || 0),
        0
      );

      const balance = totalRevenues - totalExpenses;
      setSummary({ revenues: totalRevenues, expenses: totalExpenses, balance });
    } catch (error) {
      console.error('Erreur lors du chargement du résumé:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const [year, month] = selectedPeriod.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  const formattedDate = format(date, 'MMMM yyyy', { locale: fr });

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">
        Synthèse budgétaire - {formattedDate}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Revenus
                  </p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {formatAmount(summary.revenues)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Dépenses
                  </p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {formatAmount(summary.expenses)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-full ${
                  summary.balance >= 0 
                    ? 'bg-blue-100 dark:bg-blue-900/20' 
                    : 'bg-red-100 dark:bg-red-900/20'
                } flex items-center justify-center`}>
                  <PiggyBank className={`w-6 h-6 ${
                    summary.balance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Solde
                  </p>
                  <p className={`text-2xl font-bold ${
                    summary.balance >= 0 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {formatAmount(summary.balance)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BudgetSummary;