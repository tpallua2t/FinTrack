import { 
  Transaction, 
  Account, 
  Category, 
  Asset, 
  Debt, 
  TransactionType, 
  AccountType, 
  AssetType, 
  DebtType,
  MonthlySummary,
  PatrimoineSnapshot
} from '../types';

// Mock accounts
export const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Main Checking',
    type: AccountType.CHECKING,
    currency: 'EUR',
    balance: 2500,
    includeInNetWorth: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Savings',
    type: AccountType.SAVINGS,
    currency: 'EUR',
    balance: 15000,
    includeInNetWorth: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '3',
    name: 'Credit Card',
    type: AccountType.CREDIT_CARD,
    currency: 'EUR',
    balance: -500,
    includeInNetWorth: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '4',
    name: 'Investment Account',
    type: AccountType.INVESTMENT,
    currency: 'EUR',
    balance: 25000,
    includeInNetWorth: true,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

// Mock categories
export const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Salary',
    type: TransactionType.INCOME,
    subcategories: [
      {
        id: '101',
        name: 'Regular Salary',
        categoryId: '1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '102',
        name: 'Bonus',
        categoryId: '1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: 'Housing',
    type: TransactionType.EXPENSE,
    subcategories: [
      {
        id: '201',
        name: 'Rent',
        categoryId: '2',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '202',
        name: 'Utilities',
        categoryId: '2',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '3',
    name: 'Transportation',
    type: TransactionType.EXPENSE,
    subcategories: [
      {
        id: '301',
        name: 'Fuel',
        categoryId: '3',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '302',
        name: 'Public Transit',
        categoryId: '3',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '4',
    name: 'Food',
    type: TransactionType.EXPENSE,
    subcategories: [
      {
        id: '401',
        name: 'Groceries',
        categoryId: '4',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '402',
        name: 'Restaurants',
        categoryId: '4',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '5',
    name: 'Entertainment',
    type: TransactionType.EXPENSE,
    subcategories: [
      {
        id: '501',
        name: 'Movies',
        categoryId: '5',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      },
      {
        id: '502',
        name: 'Concerts',
        categoryId: '5',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
      }
    ],
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    date: new Date('2023-04-01'),
    type: TransactionType.INCOME,
    accountId: '1',
    categoryId: '1',
    subcategoryId: '101',
    amount: 3500,
    description: 'Monthly Salary',
    createdAt: new Date('2023-04-01'),
    updatedAt: new Date('2023-04-01')
  },
  {
    id: '2',
    date: new Date('2023-04-05'),
    type: TransactionType.EXPENSE,
    accountId: '1',
    categoryId: '2',
    subcategoryId: '201',
    amount: 1200,
    description: 'Rent Payment',
    createdAt: new Date('2023-04-05'),
    updatedAt: new Date('2023-04-05')
  },
  {
    id: '3',
    date: new Date('2023-04-10'),
    type: TransactionType.EXPENSE,
    accountId: '1',
    categoryId: '4',
    subcategoryId: '401',
    amount: 150,
    description: 'Grocery Shopping',
    createdAt: new Date('2023-04-10'),
    updatedAt: new Date('2023-04-10')
  },
  {
    id: '4',
    date: new Date('2023-04-15'),
    type: TransactionType.EXPENSE,
    accountId: '3',
    categoryId: '5',
    subcategoryId: '502',
    amount: 85,
    description: 'Concert Tickets',
    createdAt: new Date('2023-04-15'),
    updatedAt: new Date('2023-04-15')
  },
  {
    id: '5',
    date: new Date('2023-04-20'),
    type: TransactionType.TRANSFER,
    accountId: '1',
    categoryId: '',
    amount: 500,
    description: 'Transfer to Savings',
    createdAt: new Date('2023-04-20'),
    updatedAt: new Date('2023-04-20')
  },
  {
    id: '6',
    date: new Date('2023-04-25'),
    type: TransactionType.INVESTMENT,
    accountId: '4',
    categoryId: '',
    amount: 1000,
    description: 'Stock Purchase',
    createdAt: new Date('2023-04-25'),
    updatedAt: new Date('2023-04-25')
  }
];

// Mock assets
export const mockAssets: Asset[] = [
  {
    id: '1',
    name: 'Checking Account',
    type: AssetType.CHECKING,
    value: 2500,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '2',
    name: 'Savings Account',
    type: AssetType.SAVINGS,
    value: 15000,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '3',
    name: 'Investment Portfolio',
    type: AssetType.INVESTMENT,
    value: 25000,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '4',
    name: 'Apartment',
    type: AssetType.REAL_ESTATE,
    value: 350000,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  }
];

// Mock debts
export const mockDebts: Debt[] = [
  {
    id: '1',
    name: 'Credit Card',
    type: DebtType.CREDIT_CARD,
    amount: 500,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '2',
    name: 'Mortgage',
    type: DebtType.MORTGAGE,
    amount: 200000,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  },
  {
    id: '3',
    name: 'Car Loan',
    type: DebtType.LOAN,
    amount: 15000,
    date: new Date('2023-04-30'),
    createdAt: new Date('2023-04-30'),
    updatedAt: new Date('2023-04-30')
  }
];

// Mock monthly summaries
export const mockMonthlySummaries: MonthlySummary[] = [
  {
    month: new Date('2023-01-01'),
    income: 3500,
    expenses: 2800,
    savings: 700,
    byCategory: {
      'Housing': 1200,
      'Food': 600,
      'Transportation': 400,
      'Entertainment': 300,
      'Other': 300
    }
  },
  {
    month: new Date('2023-02-01'),
    income: 3500,
    expenses: 2600,
    savings: 900,
    byCategory: {
      'Housing': 1200,
      'Food': 550,
      'Transportation': 350,
      'Entertainment': 250,
      'Other': 250
    }
  },
  {
    month: new Date('2023-03-01'),
    income: 3800,
    expenses: 2900,
    savings: 900,
    byCategory: {
      'Housing': 1200,
      'Food': 650,
      'Transportation': 450,
      'Entertainment': 300,
      'Other': 300
    }
  },
  {
    month: new Date('2023-04-01'),
    income: 3500,
    expenses: 2700,
    savings: 800,
    byCategory: {
      'Housing': 1200,
      'Food': 600,
      'Transportation': 400,
      'Entertainment': 200,
      'Other': 300
    }
  }
];

// Mock patrimoine snapshots
export const mockPatrimoineSnapshots: PatrimoineSnapshot[] = [
  {
    date: new Date('2023-01-31'),
    assets: {
      [AssetType.CASH]: 500,
      [AssetType.CHECKING]: 2000,
      [AssetType.SAVINGS]: 12000,
      [AssetType.INVESTMENT]: 20000,
      [AssetType.REAL_ESTATE]: 350000,
      [AssetType.VEHICLE]: 15000,
      [AssetType.CRYPTOCURRENCY]: 2000,
      [AssetType.OTHER]: 1000
    },
    debts: {
      [DebtType.CREDIT_CARD]: 1000,
      [DebtType.LOAN]: 18000,
      [DebtType.MORTGAGE]: 210000,
      [DebtType.OTHER]: 0
    },
    netWorth: 171500
  },
  {
    date: new Date('2023-02-28'),
    assets: {
      [AssetType.CASH]: 500,
      [AssetType.CHECKING]: 2200,
      [AssetType.SAVINGS]: 13000,
      [AssetType.INVESTMENT]: 21000,
      [AssetType.REAL_ESTATE]: 350000,
      [AssetType.VEHICLE]: 14500,
      [AssetType.CRYPTOCURRENCY]: 2500,
      [AssetType.OTHER]: 1000
    },
    debts: {
      [DebtType.CREDIT_CARD]: 800,
      [DebtType.LOAN]: 17500,
      [DebtType.MORTGAGE]: 209000,
      [DebtType.OTHER]: 0
    },
    netWorth: 175400
  },
  {
    date: new Date('2023-03-31'),
    assets: {
      [AssetType.CASH]: 500,
      [AssetType.CHECKING]: 2300,
      [AssetType.SAVINGS]: 14000,
      [AssetType.INVESTMENT]: 23000,
      [AssetType.REAL_ESTATE]: 355000,
      [AssetType.VEHICLE]: 14000,
      [AssetType.CRYPTOCURRENCY]: 2200,
      [AssetType.OTHER]: 1000
    },
    debts: {
      [DebtType.CREDIT_CARD]: 700,
      [DebtType.LOAN]: 17000,
      [DebtType.MORTGAGE]: 208000,
      [DebtType.OTHER]: 0
    },
    netWorth: 184300
  },
  {
    date: new Date('2023-04-30'),
    assets: {
      [AssetType.CASH]: 500,
      [AssetType.CHECKING]: 2500,
      [AssetType.SAVINGS]: 15000,
      [AssetType.INVESTMENT]: 25000,
      [AssetType.REAL_ESTATE]: 350000,
      [AssetType.VEHICLE]: 13500,
      [AssetType.CRYPTOCURRENCY]: 2800,
      [AssetType.OTHER]: 1000
    },
    debts: {
      [DebtType.CREDIT_CARD]: 500,
      [DebtType.LOAN]: 16500,
      [DebtType.MORTGAGE]: 207000,
      [DebtType.OTHER]: 0
    },
    netWorth: 186300
  }
];