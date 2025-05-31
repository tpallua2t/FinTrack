export type User = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
};

export type Transaction = {
  id: string;
  date: Date;
  type: TransactionType;
  accountId: string;
  categoryId: string;
  subcategoryId?: string;
  amount: number;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Account = {
  id: string;
  name: string;
  type: AccountType;
  currency: string;
  balance: number;
  includeInNetWorth: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Category = {
  id: string;
  name: string;
  type: TransactionType;
  subcategories?: Subcategory[];
  createdAt: Date;
  updatedAt: Date;
};

export type Subcategory = {
  id: string;
  name: string;
  categoryId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Asset = {
  id: string;
  name: string;
  type: AssetType;
  value: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type Debt = {
  id: string;
  name: string;
  type: DebtType;
  amount: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
};

export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense',
  TRANSFER = 'transfer',
  INVESTMENT = 'investment',
  DEBT_PAYMENT = 'debt_payment',
}

export enum AccountType {
  CHECKING = 'checking',
  SAVINGS = 'savings',
  CASH = 'cash',
  INVESTMENT = 'investment',
  CREDIT_CARD = 'credit_card',
  LOAN = 'loan',
  OTHER = 'other',
}

export enum AssetType {
  CASH = 'cash',
  CHECKING = 'checking',
  SAVINGS = 'savings',
  INVESTMENT = 'investment',
  REAL_ESTATE = 'real_estate',
  VEHICLE = 'vehicle',
  CRYPTOCURRENCY = 'cryptocurrency',
  OTHER = 'other',
}

export enum DebtType {
  CREDIT_CARD = 'credit_card',
  LOAN = 'loan',
  MORTGAGE = 'mortgage',
  OTHER = 'other',
}

export type MonthlySummary = {
  month: Date;
  income: number;
  expenses: number;
  savings: number;
  byCategory: Record<string, number>;
};

export type PatrimoineSnapshot = {
  date: Date;
  assets: Record<AssetType, number>;
  debts: Record<DebtType, number>;
  netWorth: number;
};