import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, isToday, isYesterday, differenceInDays } from 'date-fns';
import { TransactionType } from '../types';

/**
 * Combine multiple class names with Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency with proper locale and currency symbol
 */
export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format date with options for relative dates (today, yesterday)
 */
export function formatDate(date: Date, showRelative = true) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  if (showRelative) {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (differenceInDays(new Date(), date) < 7) {
      return format(date, 'EEEE');
    }
  }
  
  return format(date, 'dd MMM yyyy');
}

/**
 * Get color based on transaction type
 */
export function getTransactionColor(type: TransactionType) {
  switch (type) {
    case TransactionType.INCOME:
      return 'text-green-600';
    case TransactionType.EXPENSE:
      return 'text-red-600';
    case TransactionType.TRANSFER:
      return 'text-blue-600';
    case TransactionType.INVESTMENT:
      return 'text-purple-600';
    case TransactionType.DEBT_PAYMENT:
      return 'text-amber-600';
    default:
      return 'text-gray-600';
  }
}

/**
 * Get icon name based on transaction type
 */
export function getTransactionIcon(type: TransactionType) {
  switch (type) {
    case TransactionType.INCOME:
      return 'trending-up';
    case TransactionType.EXPENSE:
      return 'trending-down';
    case TransactionType.TRANSFER:
      return 'repeat';
    case TransactionType.INVESTMENT:
      return 'line-chart';
    case TransactionType.DEBT_PAYMENT:
      return 'credit-card';
    default:
      return 'circle';
  }
}

/**
 * Get the sign of the transaction (positive or negative)
 */
export function getTransactionSign(type: TransactionType) {
  switch (type) {
    case TransactionType.INCOME:
      return 1;
    case TransactionType.EXPENSE:
    case TransactionType.DEBT_PAYMENT:
      return -1;
    default:
      return 0;
  }
}