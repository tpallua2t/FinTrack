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
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExpenseItem {
  id: string;
  type: 'categorie' | 'sous-categorie' | 'transaction';
  nom: string;
  mois: number;
  annee: number;
  valeur_reel?: number;
  valeur_previsionnel?: number;
  user_id: string;
  parent_id?: string;
  order: number;
  description?: string;
  isExpanded?: boolean;
  isEditing?: boolean;
}

const ExpenseManager: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(() => format(new Date(), 'yyyy-MM'));
  const [items, setItems] = useState<ExpenseItem[]>([]);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newItemData, setNewItemData] = useState({
    nom: '',
    valeur_reel: 0,
    valeur_previsionnel: 0,
    description: ''
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

  const handleAddItem = async (type: 'categorie' | 'sous-categorie' | 'transaction', parentId?: string) => {
    if (!currentUser || !newItemData.nom) return;

    const [year, month] = selectedPeriod.split('-');
    const newItem: Partial<ExpenseItem> = {
      type,
      nom: newItemData.nom,
      mois: parseInt(month),
      annee: parseInt(year),
      user_id: currentUser.uid,
      order: items.length
    };

    if (type === 'transaction') {
      newItem.valeur_reel = newItemData.valeur_reel;
      newItem.description = newItemData.description;
    } else if (type === 'sous-categorie') {
      newItem.valeur_previsionnel = newItemData.valeur_previsionnel;
    }

    if (parentId) {
      newItem.parent_id = parentId;
    }

    try {
      const docRef = await addDoc(collection(db, 'expenses'), newItem);
      setItems([...items, { id: docRef.id, ...newItem } as ExpenseItem]);
      setNewItemData({ 
        nom: '', 
        valeur_reel: 0, 
        valeur_previsionnel: 0,
        description: ''
      });
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleUpdateItem = async (id: string) => {
    if (!currentUser) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const updateData = {
      nom: newItemData.nom,
      ...(item.type === 'transaction' ? { 
        valeur_reel: newItemData.valeur_reel,
        description: newItemData.description
      } : item.type === 'sous-categorie' ? {
        valeur_previsionnel: newItemData.valeur_previsionnel
      } : {})
    };

    const docRef = doc(db, 'expenses', id);
    try {
      await updateDoc(docRef, updateData);
      setItems(items.map(item => 
        item.id === id ? { ...item, ...updateData } : item
      ));
      setEditingItem(null);
      setNewItemData({ 
        nom: '', 
        valeur_reel: 0, 
        valeur_previsionnel: 0,
        description: ''
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
  };

  const handleUpdateTransaction = async (id: string, data: Partial<ExpenseItem>) => {
    if (!currentUser) return;

    const docRef = doc(db, 'expenses', id);
    try {
      await updateDoc(docRef, {
        description: data.description,
        valeur_reel: data.valeur_reel,
        nom: data.description
      });
      
      setItems(items.map(item => 
        item.id === id ? { ...item, ...data, isEditing: false } : item
      ));
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

  const calculateTotals = () => {
    const categories = items.filter(item => item.type === 'categorie');
    let totalReel = 0;
    let totalPrevisionnel = 0;

    categories.forEach(category => {
      const subcategories = items.filter(item => item.parent_id === category.id);
      subcategories.forEach(subcategory => {
        const transactions = items.filter(item => 
          item.type === 'transaction' && 
          item.parent_id === subcategory.id
        );
        
        const subcategoryReel = transactions.reduce((sum, t) => sum + (t.valeur_reel || 0), 0);
        totalReel += subcategoryReel;
        totalPrevisionnel += subcategory.valeur_previsionnel || 0;
      });
    });

    return { totalReel, totalPrevisionnel };
  };

  const renderTransactions = (subcategoryId: string) => {
    const transactions = items.filter(item => 
      item.type === 'transaction' && 
      item.parent_id === subcategoryId
    );

    return (
      <div className="pl-12 space-y-2">
        {transactions.map(transaction => (
          <div key={transaction.id} className="flex items-center justify-between py-2 text-sm">
            {transaction.isEditing ? (
              <>
                <Input
                  defaultValue={transaction.description}
                  className="flex-1 mr-4"
                  onBlur={(e) => {
                    handleUpdateTransaction(transaction.id, {
                      description: e.target.value,
                      valeur_reel: transaction.valeur_reel
                    });
                  }}
                />
                <Input
                  type="number"
                  defaultValue={transaction.valeur_reel}
                  className="w-32 mr-4"
                  onBlur={(e) => {
                    handleUpdateTransaction(transaction.id, {
                      description: transaction.description,
                      valeur_reel: parseFloat(e.target.value)
                    });
                  }}
                />
              </>
            ) : (
              <>
                <div className="flex-1">
                  <span>{transaction.description}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="w-32 text-right">{formatAmount(transaction.valeur_reel || 0)}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setItems(items.map(item =>
                          item.id === transaction.id ? { ...item, isEditing: true } : item
                        ));
                      }}
                      className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteItem(transaction.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
        
        <div className="flex items-center space-x-4 py-2">
          <Input
            placeholder="Description"
            value={newItemData.description}
            onChange={(e) => setNewItemData({ 
              ...newItemData, 
              description: e.target.value,
              nom: e.target.value
            })}
            className="flex-1"
          />
          <Input
            type="number"
            placeholder="Montant"
            value={newItemData.valeur_reel}
            onChange={(e) => setNewItemData({ 
              ...newItemData, 
              valeur_reel: parseFloat(e.target.value) 
            })}
            className="w-32"
          />
          <Button
            onClick={() => handleAddItem('transaction', subcategoryId)}
            size="sm"
          >
            <Plus size={16} className="mr-2" />
            + Transaction
          </Button>
        </div>
      </div>
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
                  {items
                    .filter(item => item.type === 'categorie')
                    .map((category) => {
                      const subcategories = items.filter(
                        item => item.type === 'sous-categorie' && 
                        item.parent_id === category.id
                      );

                      const categoryReel = subcategories.reduce((sum, sub) => {
                        const transactions = items.filter(
                          t => t.type === 'transaction' && 
                          t.parent_id === sub.id
                        );
                        return sum + transactions.reduce(
                          (subSum, t) => subSum + (t.valeur_reel || 0), 
                          0
                        );
                      }, 0);

                      const categoryPrevisionnel = subcategories.reduce(
                        (sum, sub) => sum + (sub.valeur_previsionnel || 0),
                        0
                      );

                      return (
                        <React.Fragment key={category.id}>
                          <tr className="border-b border-gray-200 dark:border-gray-800">
                            <td className="px-6 py-3">
                              <div className="flex items-center">
                                <button
                                  onClick={() => toggleExpand(category.id)}
                                  className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                >
                                  {category.isExpanded ? (
                                    <ChevronDown size={16} />
                                  ) : (
                                    <ChevronRight size={16} />
                                  )}
                                </button>
                                {editingItem === category.id ? (
                                  <Input
                                    value={newItemData.nom}
                                    onChange={(e) => setNewItemData({ 
                                      ...newItemData, 
                                      nom: e.target.value 
                                    })}
                                    onBlur={() => handleUpdateItem(category.id)}
                                    className="w-48"
                                  />
                                ) : (
                                  <span className="font-medium">{category.nom}</span>
                                )}
                              </div>
                            </td>
                            <td className="text-right px-6 py-3">
                              {formatAmount(categoryReel)}
                            </td>
                            <td className="text-right px-6 py-3">
                              {formatAmount(categoryPrevisionnel)}
                            </td>
                            <td className={`text-right px-6 py-3 ${
                              getEcartColor(categoryReel, categoryPrevisionnel)
                            }`}>
                              {calculateEcart(categoryReel, categoryPrevisionnel)}
                            </td>
                            <td className="px-6 py-3">
                              <div className="flex justify-end space-x-2">
                                <button
                                  onClick={() => {
                                    setEditingItem(category.id);
                                    setNewItemData({
                                      ...newItemData,
                                      nom: category.nom
                                    });
                                  }}
                                  className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(category.id)}
                                  className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>

                          {category.isExpanded && subcategories.map(subcategory => {
                            const transactions = items.filter(
                              t => t.type === 'transaction' && 
                              t.parent_id === subcategory.id
                            );
                            const subcategoryReel = transactions.reduce(
                              (sum, t) => sum + (t.valeur_reel || 0),
                              0
                            );

                            return (
                              <React.Fragment key={subcategory.id}>
                                <tr className="bg-gray-50 dark:bg-gray-800/50">
                                  <td className="px-6 py-3">
                                    <div className="flex items-center pl-6">
                                      <button
                                        onClick={() => toggleExpand(subcategory.id)}
                                        className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                      >
                                        {subcategory.isExpanded ? (
                                          <ChevronDown size={16} />
                                        ) : (
                                          <ChevronRight size={16} />
                                        )}
                                      </button>
                                      {editingItem === subcategory.id ? (
                                        <Input
                                          value={newItemData.nom}
                                          onChange={(e) => setNewItemData({ 
                                            ...newItemData, 
                                            nom: e.target.value 
                                          })}
                                          onBlur={() => handleUpdateItem(subcategory.id)}
                                          className="w-48"
                                        />
                                      ) : (
                                        <span>{subcategory.nom}</span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="text-right px-6 py-3">
                                    {formatAmount(subcategoryReel)}
                                  </td>
                                  <td className="text-right px-6 py-3">
                                    {editingItem === subcategory.id ? (
                                      <Input
                                        type="number"
                                        value={newItemData.valeur_previsionnel}
                                        onChange={(e) => setNewItemData({ 
                                          ...newItemData, 
                                          valeur_previsionnel: parseFloat(e.target.value) 
                                        })}
                                        onBlur={() => handleUpdateItem(subcategory.id)}
                                        className="w-32 ml-auto"
                                      />
                                    ) : (
                                      formatAmount(subcategory.valeur_previsionnel || 0)
                                    )}
                                  </td>
                                  <td className={`text-right px-6 py-3 ${
                                    getEcartColor(
                                      subcategoryReel,
                                      subcategory.valeur_previsionnel || 0
                                    )
                                  }`}>
                                    {calculateEcart(
                                      subcategoryReel,
                                      subcategory.valeur_previsionnel || 0
                                    )}
                                  </td>
                                  <td className="px-6 py-3">
                                    <div className="flex justify-end space-x-2">
                                      <button
                                        onClick={() => {
                                          setEditingItem(subcategory.id);
                                          setNewItemData({
                                            ...newItemData,
                                            nom: subcategory.nom,
                                            valeur_previsionnel: 
                                              subcategory.valeur_previsionnel || 0
                                          });
                                        }}
                                        className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400"
                                      >
                                        <Edit2 size={16} />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteItem(subcategory.id)}
                                        className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                                      >
                                        <Trash2 size={16} />
                                      </button>
                                    </div>
                                  </td>
                                </tr>

                                {subcategory.isExpanded && (
                                  <tr>
                                    <td colSpan={5} className="px-6 py-2">
                                      {renderTransactions(subcategory.id)}
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}

                          {category.isExpanded && (
                            <tr className="bg-gray-50 dark:bg-gray-800/50">
                              <td colSpan={5} className="px-6 py-2">
                                <div className="flex items-center space-x-4 pl-6">
                                  <Input
                                    placeholder="Nouvelle sous-catégorie..."
                                    value={newItemData.nom}
                                    onChange={(e) => setNewItemData({ 
                                      ...newItemData, 
                                      nom: e.target.value 
                                    })}
                                    className="w-64"
                                  />
                                  <div className="flex-1 flex justify-end pr-6">
                                    <Input
                                      type="number"
                                      placeholder="Prévisionnel"
                                      value={newItemData.valeur_previsionnel}
                                      onChange={(e) => setNewItemData({ 
                                        ...newItemData, 
                                        valeur_previsionnel: parseFloat(e.target.value) 
                                      })}
                                      className="w-32"
                                    />
                                    <Button
                                      onClick={() => handleAddItem('sous-categorie', category.id)}
                                      size="sm"
                                      className="ml-4"
                                    >
                                      <Plus size={16} className="mr-2" />
                                      + Sous-catégorie
                                    </Button>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                </SortableContext>
              </DndContext>
              
              {(() => {
                const { totalReel, totalPrevisionnel } = calculateTotals();
                return (
                  <tr className="font-medium bg-gray-50 dark:bg-gray-800">
                    <td className="px-6 py-3">Total général</td>
                    <td className="text-right px-6 py-3">
                      {formatAmount(totalReel)}
                    </td>
                    <td className="text-right px-6 py-3">
                      {formatAmount(totalPrevisionnel)}
                    </td>
                    <td className={`text-right px-6 py-3 ${
                      getEcartColor(totalReel, totalPrevisionnel)
                    }`}>
                      {calculateEcart(totalReel, totalPrevisionnel)}
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                );
              })()}

              <tr className="border-t border-gray-200 dark:border-gray-800">
                <td colSpan={5} className="px-6 py-3">
                  <div className="flex items-center space-x-4">
                    <Input
                      placeholder="Nouvelle catégorie..."
                      value={newItemData.nom}
                      onChange={(e) => setNewItemData({ 
                        ...newItemData, 
                        nom: e.target.value 
                      })}
                      className="w-64"
                    />
                    <Button
                      onClick={() => handleAddItem('categorie')}
                      size="sm"
                    >
                      <Plus size={16} className="mr-2" />
                      + Catégorie
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