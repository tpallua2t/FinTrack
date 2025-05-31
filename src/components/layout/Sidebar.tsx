import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  PieChart, 
  BarChart4, 
  Wallet, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../../utils/helpers';
import ThemeToggle from '../ui/ThemeToggle';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isMobile: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile, isOpen, toggleSidebar }) => {
  const location = useLocation();
  const { signOut } = useAuth();

  const links = [
    { path: '/', label: 'Dashboard', icon: <Home size={20} /> },
    { path: '/transactions', label: 'Transactions', icon: <FileText size={20} /> },
    { path: '/budget', label: 'Budget', icon: <PieChart size={20} /> },
    { path: '/patrimoine', label: 'Patrimoine', icon: <BarChart4 size={20} /> },
    { path: '/accounts', label: 'Accounts', icon: <Wallet size={20} /> },
    { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ];

  const sidebarClasses = cn(
    'fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out',
    'dark:bg-gray-900 dark:border-gray-800',
    isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0',
    isMobile ? 'shadow-lg' : ''
  );

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">FinTrack</h1>
            {isMobile && (
              <button 
                onClick={toggleSidebar}
                className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Nav links */}
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1 px-2">
              {links.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={cn(
                      'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      location.pathname === link.path
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                    onClick={isMobile ? toggleSidebar : undefined}
                  >
                    <span className="mr-3">{link.icon}</span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between">
              <ThemeToggle />
              
              <button
                onClick={handleSignOut}
                className="flex items-center text-gray-700 hover:text-red-600 text-sm font-medium dark:text-gray-300 dark:hover:text-red-400"
              >
                <LogOut size={18} className="mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile toggle button */}
      {isMobile && !isOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md dark:bg-gray-800"
        >
          <Menu size={20} className="text-gray-700 dark:text-gray-300" />
        </button>
      )}
    </>
  );
};

export default Sidebar;