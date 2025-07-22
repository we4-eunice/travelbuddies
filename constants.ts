import { ExpenseCategory } from './types';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  ExpenseCategory.EatAndDrink,
  ExpenseCategory.Transportation,
  ExpenseCategory.Shopping,
  ExpenseCategory.Accommodation,
  ExpenseCategory.Other,
];

export const PARTICIPANT_EMOJIS = [
  '👦🏻', '👧🏻', '👵🏻', '👴🏻', '👨🏻', '👩🏻', '👶🏻', '🐶', '🐱'
];

export const CURRENCIES = [
    { code: 'AED', symbol: 'د.إ', name: 'United Arab Emirates' },
    { code: 'AUD', symbol: 'A$', name: 'Australia' },
    { code: 'CAD', symbol: 'C$', name: 'Canada' },
    { code: 'CHF', symbol: 'CHF', name: 'Switzerland' },
    { code: 'CNY', symbol: '¥', name: 'China' },
    { code: 'EUR', symbol: '€', name: 'Eurozone' },
    { code: 'GBP', symbol: '£', name: 'United Kingdom' },
    { code: 'HKD', symbol: 'HK$', name: 'Hong Kong' },
    { code: 'INR', symbol: '₹', name: 'India' },
    { code: 'JPY', symbol: '¥', name: 'Japan' },
    { code: 'KRW', symbol: '₩', name: 'South Korea' },
    { code: 'MXN', symbol: '$', name: 'Mexico' },
    { code: 'MYR', symbol: 'RM', name: 'Malaysia' },
    { code: 'NZD', symbol: 'NZ$', name: 'New Zealand' },
    { code: 'RUB', symbol: '₽', name: 'Russia' },
    { code: 'SEK', symbol: 'kr', name: 'Sweden' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore' },
    { code: 'THB', symbol: '฿', name: 'Thailand' },
    { code: 'TRY', symbol: '₺', name: 'Turkey' },
    { code: 'TWD', symbol: 'NT$', name: 'Taiwan' },
    { code: 'USD', symbol: '$', name: 'United States' },
];