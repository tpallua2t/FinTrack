import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, PieChart, BarChart4, Wallet } from 'lucide-react';
import { cn } from '../../utils/helpers';

const MobileNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <FileText size={20} /> },
    { path: '/budget', label: 'Budget', icon: <PieChart size={20} /> },
    { path: '/patrimoine', label: 'Patrimoine', icon: <BarChart4 size={20} /> },
    { path: '/accounts', label: 'Accounts', icon: <Wallet size={20} /> },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 z-50">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center py-3 px-2 text-xs font-medium transition-colors',
              location.pathname === item.path
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400'
            )}
          >
            {item.icon}
            <span className="mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNav;