import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit2, Trash2 } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';

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
  const [editedValues, setEditedValues] = useState<Partial<ExpenseItem>>({});
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

  const startEditing = (item: ExpenseItem) => {
    setEditingItem(item.id);
    setEditedValues({
      nom: item.nom,
      description: item.description,
      valeur_reel: item.valeur_reel,
      valeur_previsionnel: item.valeur_previsionnel
    });
  };

  const handleUpdate = async (id: string) => {
    if (!currentUser || !editedValues || !editingItem) return;

    const item = items.find(i => i.id === id);
    if (!item) return;

    const hasChanges = Object.keys(editedValues).some(key => 
      editedValues[key as keyof typeof editedValues] !== item[key as keyof typeof item]
    );

    if (!hasChanges) {
      setEditingItem(null);
      setEditedValues({});
      return;
    }

    const docRef = doc(db, 'expenses', id);
    try {
      await updateDoc(docRef, editedValues);
      setItems(items.map(item => 
        item.id === id ? { ...item, ...editedValues } : item
      ));
      setEditingItem(null);
      setEditedValues({});
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    }
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

  const handleDeleteItem = async (id: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(doc(db, 'expenses', id));
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const renderEditableField = (
    value: string | number,
    onChange: (value: any) => void,
    type: 'text' | 'number' = 'text',
    className = ''
  ) => (
    <div className="flex items-center space-x-2">
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? parseFloat(e.target.value) : e.target.value)}
        className={className}
      />
      <Button
        size="sm"
        onClick={() => handleUpdate(editingItem!)}
        disabled={!editedValues}
      >
        Modifier
      </Button>
    </div>
  );

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
                  {items.map(item => (
                    <tr key={item.id} className="border-b border-gray-200 dark:border-gray-800">
                      <td className="px-6 py-3">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleExpand(item.id)}
                            className="mr-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            {item.isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </button>
                          {editingItem === item.id ? (
                            renderEditableField(
                              editedValues.nom || '',
                              (value) => setEditedValues({ ...editedValues, nom: value }),
                              'text',
                              'w-48'
                            )
                          ) : (
                            <span className="font-medium">{item.nom}</span>
                          )}
                        </div>
                      </td>
                      <td className="text-right px-6 py-3">
                        {editingItem === item.id && item.type === 'transaction' ? (
                          renderEditableField(
                            editedValues.valeur_reel || 0,
                            (value) => setEditedValues({ ...editedValues, valeur_reel: value }),
                            'number',
                            'w-32'
                          )
                        ) : (
                          item.valeur_reel || 0
                        )}
                      </td>
                      <td className="text-right px-6 py-3">
                        {editingItem === item.id && item.type === 'sous-categorie' ? (
                          renderEditableField(
                            editedValues.valeur_previsionnel || 0,
                            (value) => setEditedValues({ ...editedValues, valeur_previsionnel: value }),
                            'number',
                            'w-32'
                          )
                        ) : (
                          item.valeur_previsionnel || 0
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => startEditing(item)}
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
                  ))}
                </SortableContext>
              </DndContext>
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
                      Catégorie
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