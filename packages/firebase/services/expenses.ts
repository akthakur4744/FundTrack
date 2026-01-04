import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: number; // timestamp
  receiptUrl?: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateExpenseInput {
  amount: number;
  category: string;
  description: string;
  date: number;
  receiptUrl?: string;
  notes?: string;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

/**
 * Add a new expense for a user
 */
export const addExpense = async (
  userId: string,
  expenseData: CreateExpenseInput
): Promise<string> => {
  try {
    const expensesRef = collection(db, 'expenses', userId, 'items');
    const docRef = await addDoc(expensesRef, {
      ...expenseData,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding expense:', error);
    throw error;
  }
};

/**
 * Update an existing expense
 */
export const updateExpense = async (
  userId: string,
  expenseId: string,
  updates: UpdateExpenseInput
): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', userId, 'items', expenseId);
    await updateDoc(expenseRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense
 */
export const deleteExpense = async (userId: string, expenseId: string): Promise<void> => {
  try {
    const expenseRef = doc(db, 'expenses', userId, 'items', expenseId);
    await deleteDoc(expenseRef);
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Get a single expense by ID
 */
export const getExpense = async (userId: string, expenseId: string): Promise<Expense | null> => {
  try {
    const expenseRef = doc(db, 'expenses', userId, 'items', expenseId);
    const docSnap = await getDoc(expenseRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Expense;
    }
    return null;
  } catch (error) {
    console.error('Error getting expense:', error);
    throw error;
  }
};

/**
 * Get all expenses for a user with optional filters
 */
export const getExpenses = async (
  userId: string,
  constraints?: QueryConstraint[]
): Promise<Expense[]> => {
  try {
    const expensesRef = collection(db, 'expenses', userId, 'items');
    const q = query(expensesRef, ...(constraints || [orderBy('date', 'desc')]));
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
      } as Expense);
    });

    return expenses;
  } catch (error) {
    console.error('Error getting expenses:', error);
    throw error;
  }
};

/**
 * Get expenses within a date range
 */
export const getExpensesByDateRange = async (
  userId: string,
  startDate: number,
  endDate: number
): Promise<Expense[]> => {
  try {
    const expensesRef = collection(db, 'expenses', userId, 'items');
    const q = query(
      expensesRef,
      where('date', '>=', startDate),
      where('date', '<=', endDate),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
      } as Expense);
    });

    return expenses;
  } catch (error) {
    console.error('Error getting expenses by date range:', error);
    throw error;
  }
};

/**
 * Get expenses for a specific category
 */
export const getExpensesByCategory = async (
  userId: string,
  category: string
): Promise<Expense[]> => {
  try {
    const expensesRef = collection(db, 'expenses', userId, 'items');
    const q = query(expensesRef, where('category', '==', category), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    const expenses: Expense[] = [];
    querySnapshot.forEach((doc) => {
      expenses.push({
        id: doc.id,
        ...doc.data(),
      } as Expense);
    });

    return expenses;
  } catch (error) {
    console.error('Error getting expenses by category:', error);
    throw error;
  }
};

/**
 * Get total spending for a user in a date range
 */
export const getTotalSpending = async (
  userId: string,
  startDate: number,
  endDate: number
): Promise<number> => {
  try {
    const expenses = await getExpensesByDateRange(userId, startDate, endDate);
    return expenses.reduce((total, expense) => total + expense.amount, 0);
  } catch (error) {
    console.error('Error calculating total spending:', error);
    throw error;
  }
};

/**
 * Get spending by category for a date range
 */
export const getSpendingByCategory = async (
  userId: string,
  startDate: number,
  endDate: number
): Promise<Record<string, number>> => {
  try {
    const expenses = await getExpensesByDateRange(userId, startDate, endDate);
    const spending: Record<string, number> = {};

    expenses.forEach((expense) => {
      if (!spending[expense.category]) {
        spending[expense.category] = 0;
      }
      spending[expense.category] += expense.amount;
    });

    return spending;
  } catch (error) {
    console.error('Error getting spending by category:', error);
    throw error;
  }
};
