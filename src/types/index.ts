import { 
  Transaction, 
  Account, 
  Category as BudgetCategory, 
  Asset, 
  Debt, 
  TransactionType, 
  AccountType, 
  AssetType, 
  DebtType,
  MonthlySummary,
  PatrimoineSnapshot
} from '../types';

export interface ShopCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: ShopSubcategory[];
}

export interface ShopSubcategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId: string;
}

export type {
  Transaction,
  Account,
  BudgetCategory as Category,
  Asset,
  Debt,
  TransactionType,
  AccountType,
  AssetType,
  DebtType,
  MonthlySummary,
  PatrimoineSnapshot
};