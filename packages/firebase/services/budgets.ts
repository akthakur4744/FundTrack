import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore';
import { db } from '../config';

export interface Budget {
  id: string;
  userId: string;
  category: string;
  limit: number;
  period: 'monthly' | 'yearly'; // billing period
  currency: string;
  notifications: boolean;
  notificationThreshold: number; // percentage (e.g., 80)
  createdAt: number;
  updatedAt: number;
}

export interface CreateBudgetInput {
  category: string;
  limit: number;
  period: 'monthly' | 'yearly';
  currency: string;
  notifications?: boolean;
  notificationThreshold?: number;
}

export interface UpdateBudgetInput extends Partial<CreateBudgetInput> {}

/**
 * Add a new budget for a user
 */
export const addBudget = async (
  userId: string,
  budgetData: CreateBudgetInput
): Promise<string> => {
  try {
    const budgetsRef = collection(db, 'budgets', userId, 'items');
    const docRef = await addDoc(budgetsRef, {
      ...budgetData,
      notifications: budgetData.notifications ?? true,
      notificationThreshold: budgetData.notificationThreshold ?? 80,
      userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding budget:', error);
    throw error;
  }
};

/**
 * Update an existing budget
 */
export const updateBudget = async (
  userId: string,
  budgetId: string,
  updates: UpdateBudgetInput
): Promise<void> => {
  try {
    const budgetRef = doc(db, 'budgets', userId, 'items', budgetId);
    await updateDoc(budgetRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating budget:', error);
    throw error;
  }
};

/**
 * Delete a budget
 */
export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
  try {
    const budgetRef = doc(db, 'budgets', userId, 'items', budgetId);
    await deleteDoc(budgetRef);
  } catch (error) {
    console.error('Error deleting budget:', error);
    throw error;
  }
};

/**
 * Get a single budget by ID
 */
export const getBudget = async (userId: string, budgetId: string): Promise<Budget | null> => {
  try {
    const budgetRef = doc(db, 'budgets', userId, 'items', budgetId);
    const docSnap = await getDoc(budgetRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Budget;
    }
    return null;
  } catch (error) {
    console.error('Error getting budget:', error);
    throw error;
  }
};

/**
 * Get all budgets for a user
 */
export const getBudgets = async (
  userId: string,
  constraints?: QueryConstraint[]
): Promise<Budget[]> => {
  try {
    const budgetsRef = collection(db, 'budgets', userId, 'items');
    const q = query(budgetsRef, ...(constraints || [orderBy('createdAt', 'desc')]));
    const querySnapshot = await getDocs(q);

    const budgets: Budget[] = [];
    querySnapshot.forEach((doc) => {
      budgets.push({
        id: doc.id,
        ...doc.data(),
      } as Budget);
    });

    return budgets;
  } catch (error) {
    console.error('Error getting budgets:', error);
    throw error;
  }
};

/**
 * Get budget for a specific category
 */
export const getBudgetByCategory = async (
  userId: string,
  category: string
): Promise<Budget | null> => {
  try {
    const budgets = await getBudgets(userId);
    return budgets.find((b) => b.category === category) || null;
  } catch (error) {
    console.error('Error getting budget by category:', error);
    throw error;
  }
};

/**
 * Check if spending exceeded budget threshold
 */
export const isBudgetExceeded = async (
  userId: string,
  category: string,
  currentSpending: number
): Promise<boolean> => {
  try {
    const budget = await getBudgetByCategory(userId, category);
    if (!budget) return false;
    return currentSpending > budget.limit;
  } catch (error) {
    console.error('Error checking budget exceeded:', error);
    throw error;
  }
};

/**
 * Get budget progress for a category
 */
export const getBudgetProgress = async (
  userId: string,
  category: string,
  currentSpending: number
): Promise<{ spent: number; limit: number; percentage: number; remaining: number }> => {
  try {
    const budget = await getBudgetByCategory(userId, category);

    if (!budget) {
      return {
        spent: currentSpending,
        limit: 0,
        percentage: 0,
        remaining: 0,
      };
    }

    const percentage = (currentSpending / budget.limit) * 100;
    const remaining = Math.max(0, budget.limit - currentSpending);

    return {
      spent: currentSpending,
      limit: budget.limit,
      percentage: Math.round(percentage),
      remaining,
    };
  } catch (error) {
    console.error('Error getting budget progress:', error);
    throw error;
  }
};
