import React, { useState } from 'react';
import { PlusCircle, CreditCard, Building, Wallet, PiggyBank, Landmark, BarChart4 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockAccounts } from '../utils/mockData';
import { Account, AccountType } from '../types';
import { formatCurrency } from '../utils/helpers';

const Accounts: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);

  // Group accounts by type
  const accountsByType: Record<string, Account[]> = {};
  accounts.forEach(account => {
    if (!accountsByType[account.type]) {
      accountsByType[account.type] = [];
    }
    accountsByType[account.type].push(account);
  });

  // Calculate total balance
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);

  // Get icon for account type
  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return <Building size={20} />;
      case AccountType.SAVINGS:
        return <PiggyBank size={20} />;
      case AccountType.CASH:
        return <Wallet size={20} />;
      case AccountType.INVESTMENT:
        return <BarChart4 size={20} />;
      case AccountType.CREDIT_CARD:
        return <CreditCard size={20} />;
      case AccountType.LOAN:
        return <Landmark size={20} />;
      default:
        return <Wallet size={20} />;
    }
  };

  // Get label for account type
  const getAccountTypeLabel = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return 'Checking Accounts';
      case AccountType.SAVINGS:
        return 'Savings Accounts';
      case AccountType.CASH:
        return 'Cash';
      case AccountType.INVESTMENT:
        return 'Investment Accounts';
      case AccountType.CREDIT_CARD:
        return 'Credit Cards';
      case AccountType.LOAN:
        return 'Loans';
      default:
        return 'Other Accounts';
    }
  };

  // Get color for account type
  const getAccountTypeColor = (type: AccountType, isDark = false) => {
    switch (type) {
      case AccountType.CHECKING:
        return isDark ? 'bg-blue-900/20 text-blue-400' : 'bg-blue-50 text-blue-700';
      case AccountType.SAVINGS:
        return isDark ? 'bg-green-900/20 text-green-400' : 'bg-green-50 text-green-700';
      case AccountType.CASH:
        return isDark ? 'bg-yellow-900/20 text-yellow-400' : 'bg-yellow-50 text-yellow-700';
      case AccountType.INVESTMENT:
        return isDark ? 'bg-purple-900/20 text-purple-400' : 'bg-purple-50 text-purple-700';
      case AccountType.CREDIT_CARD:
        return isDark ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-700';
      case AccountType.LOAN:
        return isDark ? 'bg-amber-900/20 text-amber-400' : 'bg-amber-50 text-amber-700';
      default:
        return isDark ? 'bg-gray-900/20 text-gray-400' : 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Accounts</h1>
        
        <Button className="flex items-center justify-center sm:justify-start">
          <PlusCircle size={16} className="mr-2" />
          Add Account
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 dark:text-gray-50">
            {formatCurrency(totalBalance)}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Total balance across {accounts.length} accounts
          </p>
        </CardContent>
      </Card>
      
      <div className="space-y-6">
        {Object.entries(accountsByType).map(([type, accounts]) => (
          <div key={type} className="space-y-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {getAccountTypeLabel(type as AccountType)}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map(account => {
                const isDarkMode = document.documentElement.classList.contains('dark');
                const typeColor = getAccountTypeColor(account.type, isDarkMode);
                
                return (
                  <Card key={account.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${typeColor}`}>
                            {getAccountIcon(account.type)}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-900 dark:text-gray-100">{account.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{account.type}</p>
                          </div>
                        </div>
                        <div className={`text-lg font-semibold ${account.balance >= 0 ? 'text-gray-900 dark:text-gray-50' : 'text-red-600 dark:text-red-400'}`}>
                          {formatCurrency(account.balance)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accounts;