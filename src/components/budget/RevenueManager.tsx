import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Revenue {
  id: string;
  type: 'regulier' | 'exceptionnel';
  description: string;
  valeur: number;
  mois: number;
  annee: number;
  user_id: string;
  groupe_id?: string;
  date_debut?: Date;
}

interface RevenueFormData {
  type: 'regulier' | 'exceptionnel';
  description: string;
  valeur: number;
  date_debut?: string;
}

const RevenueManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(() => format(new Date(), 'yyyy-MM'));
  const [revenues, setRevenues] = useState<Revenue[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RevenueFormData>({
    type: 'regulier',
    description: '',
    valeur: 0,
    date_debut: format(new Date(), 'yyyy-MM-dd')
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      loadRevenues();
    }
  }, [currentUser, selectedPeriod]);

  const loadRevenues = async () => {
    if (!currentUser) return;

    const [year, month] = selectedPeriod.split('-');
    const revenuesRef = collection(db, 'revenues');
    const q = query(
      revenuesRef,
      where('user_id', '==', currentUser.uid),
      where('annee', '==', parseInt(year)),
      where('mois', '==', parseInt(month))
    );

    try {
      const snapshot = await getDocs(q);
      const loadedRevenues: Revenue[] = [];
      snapshot.forEach(doc => {
        loadedRevenues.push({ id: doc.id, ...doc.data() } as Revenue);
      });
      setRevenues(loadedRevenues);
    } catch (error) {
      console.error('Erreur lors du chargement des revenus:', error);
    }
  };

  const handleAddRevenue = async () => {
    if (!currentUser || !formData.description || formData.valeur <= 0) return;

    const [year, month] = selectedPeriod.split('-');
    const newRevenue: Partial<Revenue> = {
      type: formData.type,
      description: formData.description,
      valeur: formData.valeur,
      mois: parseInt(month),
      annee: parseInt(year),
      user_id: currentUser.uid
    };

    if (formData.type === 'regulier') {
      newRevenue.groupe_id = Date.now().toString();
      newRevenue.date_debut = new Date(formData.date_debut!);
    }

    try {
      const docRef = await addDoc(collection(db, 'revenues'), newRevenue);

      if (formData.type === 'regulier') {
        // Créer les revenus pour les mois suivants
        const startDate = new Date(formData.date_debut!);
        const currentDate = new Date(parseInt(year), parseInt(month) - 1);
        
        if (startDate <= currentDate) {
          for (let i = 1; i <= 11; i++) {
            const nextDate = new Date(currentDate);
            nextDate.setMonth(currentDate.getMonth() + i);
            
            await addDoc(collection(db, 'revenues'), {
              ...newRevenue,
              mois: nextDate.getMonth() + 1,
              annee: nextDate.getFullYear(),
              groupe_id: newRevenue.groupe_id
            });
          }
        }
      }

      setRevenues([...revenues, { id: docRef.id, ...newRevenue } as Revenue]);
      setShowForm(false);
      setFormData({
        type: 'regulier',
        description: '',
        valeur: 0,
        date_debut: format(new Date(), 'yyyy-MM-dd')
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du revenu:', error);
    }
  };

  const handleDeleteRevenue = async (revenue: Revenue) => {
    try {
      // Delete the current revenue
      await deleteDoc(doc(db, 'revenues', revenue.id));

      if (revenue.type === 'regulier' && revenue.groupe_id) {
        // Get all future revenues from the same group
        const futurRevenuesRef = collection(db, 'revenues');
        const q = query(
          futurRevenuesRef,
          where('groupe_id', '==', revenue.groupe_id)
        );
        
        const snapshot = await getDocs(q);
        const deletionPromises = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Revenue))
          .filter(rev => {
            // Filter future revenues in JavaScript instead of in the query
            if (rev.annee > revenue.annee) return true;
            if (rev.annee === revenue.annee && rev.mois > revenue.mois) return true;
            return false;
          })
          .map(rev => deleteDoc(doc(db, 'revenues', rev.id)));

        await Promise.all(deletionPromises);
      }

      setRevenues(revenues.filter(r => r.id !== revenue.id));
      await loadRevenues(); // Reload to ensure the list is up to date
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const calculateTotalRevenues = () => {
    const total = revenues.reduce((sum, revenue) => sum + revenue.valeur, 0);
    const regularTotal = revenues
      .filter(r => r.type === 'regulier')
      .reduce((sum, r) => sum + r.valeur, 0);
    const exceptionalTotal = revenues
      .filter(r => r.type === 'exceptionnel')
      .reduce((sum, r) => sum + r.valeur, 0);

    return { total, regularTotal, exceptionalTotal };
  };

  const renderRevenueSummary = () => {
    const { total, regularTotal, exceptionalTotal } = calculateTotalRevenues();
    const [year, month] = selectedPeriod.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    const formattedDate = format(date, 'MMMM yyyy', { locale: fr });

    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Total des revenus pour {formattedDate}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {formatAmount(total)}
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                <p className="text-sm text-green-600 dark:text-green-400 font-medium">Revenus réguliers</p>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {formatAmount(regularTotal)}
                </p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Revenus exceptionnels</p>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {formatAmount(exceptionalTotal)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderRevenueTable = (type: 'regulier' | 'exceptionnel') => {
    const filteredRevenues = revenues.filter(r => r.type === type);

    if (filteredRevenues.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          Aucun revenu {type === 'regulier' ? 'régulier' : 'exceptionnel'} pour ce mois
        </div>
      );
    }

    return (
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-800">
            <th className="text-left px-6 py-3">Description</th>
            <th className="text-right px-6 py-3">Montant</th>
            <th className="w-20 px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {filteredRevenues.map(revenue => (
            <tr key={revenue.id} className="border-b border-gray-200 dark:border-gray-800">
              <td className="px-6 py-3">{revenue.description}</td>
              <td className="text-right px-6 py-3">{formatAmount(revenue.valeur)}</td>
              <td className="px-6 py-3">
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleDeleteRevenue(revenue)}
                    className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Input
          type="month"
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="w-48"
        />
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} className="mr-2" />
          Revenu
        </Button>
      </div>

      {renderRevenueSummary()}

      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenus réguliers</h3>
            {renderRevenueTable('regulier')}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Revenus exceptionnels</h3>
            {renderRevenueTable('exceptionnel')}
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Ajouter un revenu</h3>
              <div className="space-y-4">
                <Select
                  label="Type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'regulier' | 'exceptionnel' })}
                  options={[
                    { value: 'regulier', label: 'Régulier' },
                    { value: 'exceptionnel', label: 'Exceptionnel' }
                  ]}
                />
                <Input
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
                <Input
                  label="Montant"
                  type="number"
                  value={formData.valeur}
                  onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) })}
                />
                {formData.type === 'regulier' && (
                  <Input
                    label="Date de début"
                    type="date"
                    value={formData.date_debut}
                    onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  />
                )}
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Annuler
                  </Button>
                  <Button onClick={handleAddRevenue}>
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

export default RevenueManager;