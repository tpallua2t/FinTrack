import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit2, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { format, parse } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExpenseItem {
  id: string;
  type: 'categorie' | 'sous-categorie' | 'depense';
  nom: string;
  mois: number;
  annee: number;
  valeur_reel: number;
  valeur_previsionnel: number;
  user_id: string;
  parent_id?: string;
  order: number;
  isExpanded?: boolean;
}

const ExpenseManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(() => format(new Date(), 'yyyy-MM'));
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({
    nom: '',
    valeur_reel: 0,
    valeur_previsionnel: 0
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (currentUser) {
      loadExpenses();
    }
  }, [currentUser, selectedPeriod]);

  const loadExpenses = async () => {
    if (!currentUser) return;

    const [year, month] = selectedPeriod.split('-');
    const expensesRef = collection(db, 'expenses');
    const q = query(
      expensesRef,
      where('user_id', '==', currentUser.uid),
      where('annee', '==', parseInt(year)),
      where('mois', '==', parseInt(month))
    );

    try {
      const snapshot = await getDocs(q);
      const loadedItems: ExpenseItem[] = [];
      snapshot.forEach(doc => {
        loadedItems.push({ id: doc.id, ...doc.data() } as ExpenseItem);
      });
      setItems(loadedItems.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Erreur lors du chargement des dépenses:', error);
    }
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex).map((item, index) => ({
          ...item,
          order: index
        }));

        // Update order in Firestore
        newItems.forEach(async (item) => {
          const docRef = doc(db, 'expenses', item.id);
          await updateDoc(docRef, { order: item.order });
        });

        return newItems;
      });
    }
  };

  const toggleExpand = (id: string) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, isExpanded: !item.isExpanded } : item
    ));
  };

  const calculateEcart = (reel: number, previsionnel: number): string => {
    if (previsionnel === 0) return '0%';
    const ecart = ((reel - previsionnel) / previsionnel) * 100;
    return `${ecart > 0 ? '+' : ''}${ecart.toFixed(1)}%`;
  };

  const getEcartColor = (reel: number, previsionnel: number): string => {
    if (previsionnel === 0) return 'text-gray-500 dark:text-gray-400';
    const ecart = ((reel - previsionnel) / previsionnel) * 100;
    return ecart > 0 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-green-600 dark:text-green-400';
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const handleAddItem = async (type: 'categorie' | 'sous-categorie', parentId?: string) => {
    if (!currentUser || !newItemData.nom) return;

    const [year, month] = selectedPeriod.split('-');
    const newItem: Partial<ExpenseItem> = {
      type,
      nom: newItemData.nom,
      mois: parseInt(month),
      annee: parseInt(year),
      valeur_reel: newItemData.valeur_reel,
      valeur_previsionnel: newItemData.valeur_previsionnel,
      user_id: currentUser.uid,
      order: items.length
    };

    // Only add parent_id if it's provided and not undefined
    if (parentId) {
      newItem.parent_id = parentId;
    }

    try {
      const docRef = await addDoc(collection(db, 'expenses'), newItem);
      setItems([...items, { id: docRef.id, ...newItem } as ExpenseItem]);
      setNewItemData({ nom: '', valeur_reel: 0, valeur_previsionnel: 0 });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleUpdateItem = async (id: string) => {
    if (!currentUser) return;

    const docRef = doc(db, 'expenses', id);
    try {
      await updateDoc(docRef, newItemData);
      setItems(items.map(item => 
        item.id === id ? { ...item, ...newItemData } : item
      ));
      setEditingItem(null);
      setNewItemData({ nom: '', valeur_reel: 0, valeur_previsionnel: 0 });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'expenses', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const getTotalsByType = () => {
    const categories = items.filter(item => item.type === 'categorie');
    const totalReel = categories.reduce((sum, item) => sum + item.valeur_reel, 0);
    const totalPrevisionnel = categories.reduce((sum, item) => sum + item.valeur_previsionnel, 0);
    return { totalReel, totalPrevisionnel };
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
                        ${item.type === 'sous-categorie' ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                      `}>
                        <td className="px-6 py-3">
                          <div className="flex items-center">
                            {item.type === 'categorie' && (
                              <button
                                onClick={() => toggleExpand(item.id)}
                                className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                              >
                                {item.isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              </button>
                            )}
                            {editingItem === item.id ? (
                              <Input
                                value={newItemData.nom}
                                onChange={(e) => setNewItemData({ ...newItemData, nom: e.target.value })}
                                onBlur={() => handleUpdateItem(item.id)}
                                className="w-48"
                              />
                            ) : (
                              <span className={`
                                ${item.type === 'categorie' ? 'font-medium' : 'pl-6'}
                              `}>
                                {item.nom}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="text-right px-6 py-3">
                          {editingItem === item.id ? (
                            <Input
                              type="number"
                              value={newItemData.valeur_reel}
                              onChange={(e) => setNewItemData({ ...newItemData, valeur_reel: parseFloat(e.target.value) })}
                              onBlur={() => handleUpdateItem(item.id)}
                              className="w-32"
                            />
                          ) : (
                            formatAmount(item.valeur_reel)
                          )}
                        </td>
                        <td className="text-right px-6 py-3">
                          {editingItem === item.id ? (
                            <Input
                              type="number"
                              value={newItemData.valeur_previsionnel}
                              onChange={(e) => setNewItemData({ ...newItemData, valeur_previsionnel: parseFloat(e.target.value) })}
                              onBlur={() => handleUpdateItem(item.id)}
                              className="w-32"
                            />
                          ) : (
                            formatAmount(item.valeur_previsionnel)
                          )}
                        </td>
                        <td className={`text-right px-6 py-3 ${item.type === 'categorie' ? getEcartColor(item.valeur_reel, item.valeur_previsionnel) : ''}`}>
                          {item.type === 'categorie' && calculateEcart(item.valeur_reel, item.valeur_previsionnel)}
                        </td>
                        <td className="px-6 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingItem(item.id);
                                setNewItemData({
                                  nom: item.nom,
                                  valeur_reel: item.valeur_reel,
                                  valeur_previsionnel: item.valeur_previsionnel
                                });
                              }}
                              className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDeleteItem(item.id)}
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
                const { totalReel, totalPrevisionnel } = getTotalsByType();
                return (
                  <tr className="font-medium bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-3">Total général</td>
                    <td className="text-right px-6 py-3">{formatAmount(totalReel)}</td>
                    <td className="text-right px-6 py-3">{formatAmount(totalPrevisionnel)}</td>
                    <td className={`text-right px-6 py-3 ${getEcartColor(totalReel, totalPrevisionnel)}`}>
                      {calculateEcart(totalReel, totalPrevisionnel)}
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                );
              })()}

              {/* Ligne d'ajout */}
              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td colSpan={5} className="px-6 py-3">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Nouvelle catégorie..."
                      value={newItemData.nom}
                      onChange={(e) => setNewItemData({ ...newItemData, nom: e.target.value })}
                      className="w-48"
                    />
                    <Input
                      type="number"
                      placeholder="Réel"
                      value={newItemData.valeur_reel}
                      onChange={(e) => setNewItemData({ ...newItemData, valeur_reel: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                    <Input
                      type="number"
                      placeholder="Prévisionnel"
                      value={newItemData.valeur_previsionnel}
                      onChange={(e) => setNewItemData({ ...newItemData, valeur_previsionnel: parseFloat(e.target.value) })}
                      className="w-32"
                    />
                    <Button
                      onClick={() => handleAddItem('categorie')}
                      className="ml-2"
                    >
                      <Plus size={16} className="mr-2" />
                      Ajouter
                    </Button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManager;