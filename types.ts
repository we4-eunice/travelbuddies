
export enum ExpenseCategory {
  EatAndDrink = 'Eat and Drink',
  Transportation = 'Transportation',
  Shopping = 'Shopping',
  Accommodation = 'Accommodation',
  Other = 'Other',
}

export interface Participant {
  id: string;
  name: string;
  emoji: string;
}

export interface Expense {
  id:string;
  date: string; // YYYY-MM-DD
  description: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string; // participantId
  sharedBy: string[]; // array of participantIds
}

export interface ItineraryDay {
  day: number;
  accommodation: string;
  spots: string[];
  restaurants: string[];
}

export interface ToBringItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface TripState {
  tripName: string;
  passcode?: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  itinerary: ItineraryDay[];
  toBringList: ToBringItem[];
}