import React from 'react';
import { useLocation } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';

interface HeaderProps {
  showAddTransaction: () => void;
}

const Header: React.FC<HeaderProps> = ({ showAddTransaction }) => {
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/') return 'Dashboard';
    if (path === '/transactions') return 'Transactions';
    if (path === '/budget') return 'Budget';
    if (path === '/patrimoine') return 'Patrimoine';
    if (path === '/accounts') return 'Accounts';
    if (path === '/settings') return 'Settings';
    
    return 'FinTrack';
  };

  return (
    <header className="sticky top-0 z-10 h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex-1">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-50">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-2">
        <ThemeToggle className="hidden md:flex" />
        <Button 
          onClick={showAddTransaction}
          size="sm"
          className="flex items-center"
        >
          <PlusCircle size={16} className="mr-1" />
          <span>Add Transaction</span>
        </Button>
      </div>
    </header>
  );
};

export default Header;