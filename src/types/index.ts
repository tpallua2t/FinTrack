// Shop related types
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

// Budget and finance related types
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer'
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CREDIT = 'credit',
  INVESTMENT = 'investment',
  CASH = 'cash'
}

export enum AssetType {
  REAL_ESTATE = 'real_estate',
  VEHICLE = 'vehicle',
  INVESTMENT = 'investment',
  OTHER = 'other'
}

export enum DebtType {
  MORTGAGE = 'mortgage',
  LOAN = 'loan',
  CREDIT_CARD = 'credit_card',
  OTHER = 'other'
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: TransactionType;
  categoryId: string;
  accountId: string;
  toAccountId?: string; // For transfers
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  budget?: number;
  color?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  purchaseDate: string;
  purchasePrice: number;
}

export interface Debt {
  id: string;
  name: string;
  type: DebtType;
  amount: number;
  interestRate: number;
  startDate: string;
  endDate?: string;
}

export interface MonthlySummary {
  month: string;
  income: number;
  expenses: number;
  savings: number;
  categoryBreakdown: {
    [categoryId: string]: number;
  };
}

export interface PatrimoineSnapshot {
  date: string;
  totalAssets: number;
  totalDebts: number;
  netWorth: number;
  assetBreakdown: {
    [AssetType: string]: number;
  };
  debtBreakdown: {
    [DebtType: string]: number;
  };
}