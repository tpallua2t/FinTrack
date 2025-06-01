import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

interface BudgetItem {
  id: string;
  type: 'category' | 'subcategory';
  name: string;
  realAmount: number;
  plannedAmount: number;
  parentId?: string;
  order: number;
  isExpanded?: boolean;
}

const ExpenseManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(() => format(new Date(), 'yyyy-MM'));
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemData, setNewItemData] = useState({
    name: '',
    plannedAmount: 0,
    type: 'category' as const,
    parentId: ''
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (currentUser) {
      loadBudgetItems();
    }
  }, [currentUser, selectedPeriod]);

  const loadBudgetItems = async () => {
    if (!currentUser) return;

    const [year, month] = selectedPeriod.split('-');
    const budgetRef = collection(db, 'budgets');
    const q = query(
      budgetRef,
      where('userId', '==', currentUser.uid),
      where('year', '==', parseInt(year)),
      where('month', '==', parseInt(month))
    );

    try {
      const snapshot = await getDocs(q);
      const loadedItems: BudgetItem[] = [];
      snapshot.forEach(doc => {
        loadedItems.push({ id: doc.id, ...doc.data() } as BudgetItem);
      });
      setItems(loadedItems.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Erreur lors du chargement du budget:', error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));
      });
    }
  };

  const toggleExpand = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const calculateVariance = (real: number, planned: number): string => {
    if (planned === 0) return '0%';
    const variance = ((real - planned) / planned) * 100;
    return `${variance > 0 ? '+' : ''}${variance.toFixed(1)}%`;
  };

  const getVarianceColor = (real: number, planned: number): string => {
    if (planned === 0) return 'text-gray-500 dark:text-gray-400';
    const variance = ((real - planned) / planned) * 100;
    return variance > 0 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-green-600 dark:text-green-400';
  };

  const getTotalsByType = () => {
    const categories = items.filter(item => item.type === 'category');
    const realTotal = categories.reduce((sum, item) => sum + item.realAmount, 0);
    const plannedTotal = categories.reduce((sum, item) => sum + item.plannedAmount, 0);
    return { realTotal, plannedTotal };
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
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
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="text-left px-6 py-3">Dépenses</th>
                <th className="text-right px-6 py-3">Réel</th>
                <th className="text-right px-6 py-3">Prévisionnel</th>
                <th className="text-right px-6 py-3">Écart</th>
                <th className="w-20 px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={items}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((item) => (
                    <React.Fragment key={item.id}>
                      <tr className={`
                        border-b border-gray-200 dark:border-gray-800
                        ${item.type === 'subcategory' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                      `}>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            {item.type === 'category' && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                {item.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            )}
                            <span className={`
                              ${item.type === 'category' ? 'font-medium' : 'pl-6'}
                            `}>
                              {item.name}
                            </span>
                          </div>
                        </td>
                        <td className="text-right px-6 py-3">{formatAmount(item.realAmount)}</td>
                        <td className="text-right px-6 py-3">{formatAmount(item.plannedAmount)}</td>
                        <td className={`text-right px-6 py-3 ${getVarianceColor(item.realAmount, item.plannedAmount)}`}>
                          {calculateVariance(item.realAmount, item.plannedAmount)}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {/* Implémenter la modification */}}
                              className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => {/* Implémenter la suppression */}}
                              className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  ))}
                </SortableContext>
              </DndContext>
              
              {/* Total général */}
              {(() => {
                const { realTotal, plannedTotal } = getTotalsByType();
                return (
                  <tr className="font-medium bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-3">Total général</td>
                    <td className="text-right px-6 py-3">{formatAmount(realTotal)}</td>
                    <td className="text-right px-6 py-3">{formatAmount(plannedTotal)}</td>
                    <td className={`text-right px-6 py-3 ${getVarianceColor(realTotal, plannedTotal)}`}>
                      {calculateVariance(realTotal, plannedTotal)}
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Button
        onClick={() => setIsAddingItem(true)}
        className="flex items-center"
      >
        <Plus size={16} className="mr-2" />
        Ajouter une catégorie
      </Button>

      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Nouvelle catégorie</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Nom"
                  value={newItemData.name}
                  onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                />
                <Input
                  label="Montant prévisionnel"
                  type="number"
                  step="0.01"
                  value={newItemData.plannedAmount}
                  onChange={(e) => setNewItemData({ ...newItemData, plannedAmount: parseFloat(e.target.value) })}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddingItem(false)}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={() => {
                      // Implémenter l'ajout
                      setIsAddingItem(false);
                    }}
                  >
                    Ajouter
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ExpenseManager;