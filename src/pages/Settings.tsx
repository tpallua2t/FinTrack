import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

const Settings: React.FC = () => {
  const { currentUser } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Paramètres</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Paramètres du compte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <p className="mt-1 text-gray-900 dark:text-gray-100">{currentUser?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;