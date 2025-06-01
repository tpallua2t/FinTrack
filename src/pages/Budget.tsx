import React, { useState } from 'react';
import { Plus, ArrowUpRight, ArrowDownRight, Receipt, Calendar, Target, Wallet } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { mockCategories, mockMonthlySummaries } from '../utils/mockData';
import { formatCurrency } from '../utils/helpers';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const Budget: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'revenus' | 'depenses' | 'synthese'>('synthese');
  const currentMonth = mockMonthlySummaries[mockMonthlySummaries.length - 1];
  const previousMonth = mockMonthlySummaries[mockMonthlySummaries.length - 2];

  // Données simulées pour les revenus
  const revenus = [
    { id: 1, nom: 'Salaire', montant: 3500, type: 'récurrent', date: '2024-03-25' },
    { id: 2, nom: 'Freelance', montant: 800, type: 'ponctuel', date: '2024-03-15' }
  ];

  // Données simulées pour les objectifs
  const objectifs = [
    { id: 1, nom: 'Dépenses resto', montant: 150, actuel: 85 },
    { id: 2, nom: 'Épargne', montant: 300, actuel: 250 },
    { id: 3, nom: 'Shopping', montant: 200, actuel: 180 }
  ];

  // Calculs pour la synthèse
  const totalRevenus = revenus.reduce((sum, rev) => sum + rev.montant, 0);
  const depensesFixesMensuelles = 2000; // Simulé
  const epargnePrevisionnelle = 300;
  const resteAVivre = totalRevenus - depensesFixesMensuelles - epargnePrevisionnelle;

  // Données pour le graphique d'évolution
  const evolutionData = mockMonthlySummaries.map(summary => ({
    name: new Date(summary.month).toLocaleDateString('fr-FR', { month: 'short' }),
    revenus: summary.income,
    depenses: summary.expenses,
    solde: summary.income - summary.expenses
  }));

  // Données pour le camembert des dépenses
  const depensesData = Object.entries(currentMonth.byCategory).map(([name, value]) => ({
    name,
    value,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'revenus':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Revenus du mois</h2>
              <Button size="sm" className="flex items-center">
                <Plus size={16} className="mr-2" />
                Ajouter un revenu
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-gray-200 dark:divide-gray-800">
                  {revenus.map(revenu => (
                    <div key={revenu.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{revenu.nom}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {revenu.type} • {new Date(revenu.date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className="text-green-600 dark:text-green-400 font-medium">
                        +{formatCurrency(revenu.montant)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenus à venir</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Aucun revenu programmé</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'depenses':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Dépenses par catégorie</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Receipt size={16} className="mr-2" />
                  Dépenses récurrentes
                </Button>
                <Button size="sm" className="flex items-center">
                  <Plus size={16} className="mr-2" />
                  Nouvelle dépense
                </Button>
              </div>
            </div>

            <div className="grid gap-6">
              {Object.entries(currentMonth.byCategory).map(([category, amount]) => {
                const budget = Math.round(currentMonth.expenses / mockCategories.length * 1.2);
                const percentSpent = (amount / budget) * 100;
                const previousAmount = previousMonth.byCategory[category] || 0;
                const changeFromPrevious = amount - previousAmount;

                return (
                  <Card key={category}>
                    <CardContent className="p-4">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="font-medium text-gray-900 dark:text-gray-100">{category}</h3>
                          <div className="flex items-center">
                            {changeFromPrevious !== 0 && (
                              <div className={`flex items-center text-xs mr-2 ${
                                changeFromPrevious > 0 
                                  ? 'text-red-600 dark:text-red-400' 
                                  : 'text-green-600 dark:text-green-400'
                              }`}>
                                {changeFromPrevious > 0 ? (
                                  <ArrowUpRight size={14} className="mr-1" />
                                ) : (
                                  <ArrowDownRight size={14} className="mr-1" />
                                )}
                                {Math.abs(changeFromPrevious / previousAmount * 100).toFixed(1)}%
                              </div>
                            )}
                            <div className="text-sm font-medium">
                              {formatCurrency(amount)} / {formatCurrency(budget)}
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden dark:bg-gray-700">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentSpent <= 75 
                                ? 'bg-green-500'
                                : percentSpent <= 100
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(percentSpent, 100)}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>0%</span>
                          <span>{percentSpent.toFixed(1)}% dépensé</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        );

      case 'synthese':
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reste à vivre</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Wallet className="h-12 w-12 text-blue-500 mb-4" />
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                      {formatCurrency(resteAVivre)}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      après dépenses fixes et épargne
                    </p>
                  </div>
                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Revenus totaux</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(totalRevenus)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Dépenses fixes</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        -{formatCurrency(depensesFixesMensuelles)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Épargne prévue</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        -{formatCurrency(epargnePrevisionnelle)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Objectifs du mois</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {objectifs.map(objectif => {
                      const progress = (objectif.actuel / objectif.montant) * 100;
                      return (
                        <div key={objectif.id} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <Target size={16} className="text-gray-400 mr-2" />
                              <span className="font-medium">{objectif.nom}</span>
                            </div>
                            <span className="text-sm">
                              {formatCurrency(objectif.actuel)} / {formatCurrency(objectif.montant)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full dark:bg-gray-700">
                            <div
                              className="h-full rounded-full bg-blue-500 transition-all duration-500"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Évolution mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={evolutionData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem'
                          }}
                          formatter={(value: number) => [formatCurrency(value), '']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenus"
                          stroke="#10B981"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="depenses"
                          stroke="#EF4444"
                          strokeWidth={2}
                          dot={false}
                        />
                        <Line
                          type="monotone"
                          dataKey="solde"
                          stroke="#3B82F6"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Répartition des dépenses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={depensesData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {depensesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => [formatCurrency(value), '']}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '0.5rem'
                          }}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
        
        <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('synthese')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'synthese'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Synthèse
          </button>
          <button
            onClick={() => setActiveTab('revenus')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'revenus'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Revenus
          </button>
          <button
            onClick={() => setActiveTab('depenses')}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === 'depenses'
                ? 'bg-blue-500 text-white'
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            Dépenses
          </button>
        </div>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Budget;