import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { X } from 'lucide-react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { 
  Transaction, 
  TransactionType, 
  Account, 
  Category 
} from '../../types';
import { mockAccounts, mockCategories } from '../../utils/mockData';

interface TransactionFormProps {
  onClose: () => void;
  onSubmit: (data: Partial<Transaction>) => void;
  initialData?: Partial<Transaction>;
  isEdit?: boolean;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  onClose,
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const { handleSubmit, control, watch, formState: { errors } } = useForm<Partial<Transaction>>({
    defaultValues: initialData || {
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 0,
      description: ''
    }
  });
  
  const selectedType = watch('type');
  
  // Filter categories based on selected transaction type
  const filteredCategories = mockCategories.filter(
    category => category.type === selectedType
  );
  
  const typeOptions = [
    { value: TransactionType.INCOME, label: 'Income' },
    { value: TransactionType.EXPENSE, label: 'Expense' },
    { value: TransactionType.TRANSFER, label: 'Transfer' },
    { value: TransactionType.INVESTMENT, label: 'Investment' },
    { value: TransactionType.DEBT_PAYMENT, label: 'Debt Payment' }
  ];
  
  const accountOptions = mockAccounts.map(account => ({
    value: account.id,
    label: account.name
  }));
  
  const categoryOptions = filteredCategories.map(category => ({
    value: category.id,
    label: category.name
  }));
  
  const getSubcategoryOptions = (categoryId?: string) => {
    if (!categoryId) return [];
    
    const category = mockCategories.find(c => c.id === categoryId);
    return category?.subcategories?.map(sub => ({
      value: sub.id,
      label: sub.name
    })) || [];
  };
  
  const submitHandler = (data: Partial<Transaction>) => {
    onSubmit(data);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg dark:bg-gray-900">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {isEdit ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(submitHandler)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Controller
                name="date"
                control={control}
                rules={{ required: 'Date is required' }}
                render={({ field }) => (
                  <Input
                    label="Date"
                    type="date"
                    value={field.value instanceof Date 
                      ? field.value.toISOString().split('T')[0] 
                      : field.value as string}
                    onChange={e => field.onChange(new Date(e.target.value))}
                    error={errors.date?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="type"
                control={control}
                rules={{ required: 'Type is required' }}
                render={({ field }) => (
                  <Select
                    label="Type"
                    options={typeOptions}
                    {...field}
                    error={errors.type?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="accountId"
                control={control}
                rules={{ required: 'Account is required' }}
                render={({ field }) => (
                  <Select
                    label="Account"
                    options={accountOptions}
                    {...field}
                    error={errors.accountId?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="categoryId"
                control={control}
                rules={{ required: 'Category is required' }}
                render={({ field }) => (
                  <Select
                    label="Category"
                    options={categoryOptions}
                    {...field}
                    error={errors.categoryId?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="subcategoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    label="Subcategory (Optional)"
                    options={getSubcategoryOptions(watch('categoryId'))}
                    {...field}
                    error={errors.subcategoryId?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="amount"
                control={control}
                rules={{ 
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' }
                }}
                render={({ field }) => (
                  <Input
                    label="Amount"
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    error={errors.amount?.message}
                  />
                )}
              />
            </div>
            
            <div className="col-span-2">
              <Controller
                name="description"
                control={control}
                rules={{ required: 'Description is required' }}
                render={({ field }) => (
                  <Input
                    label="Description"
                    {...field}
                    error={errors.description?.message}
                  />
                )}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Add'} Transaction
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;