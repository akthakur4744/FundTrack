import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../config';
import { RecurringExpense, Expense } from '../../shared/types';
import { recurringExpenseCreateSchema, RecurringExpenseCreate } from '../../shared/schemas/recurringSchema';

/**
 * Generate the next occurrence date based on frequency
 */
function getNextOccurrence(
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  currentDate: Date,
  daysOfWeek?: number[],
  dayOfMonth?: number
): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;

    case 'weekly':
      if (!daysOfWeek || daysOfWeek.length === 0) {
        next.setDate(next.getDate() + 7);
      } else {
        // Find next occurrence on one of the specified days
        let found = false;
        for (let i = 1; i <= 7; i++) {
          next.setDate(next.getDate() + i);
          if (daysOfWeek.includes(next.getDay())) {
            found = true;
            break;
          }
        }
        if (!found) {
          next.setDate(next.getDate() + 7);
        }
      }
      break;

    case 'monthly':
      const targetDay = dayOfMonth || currentDate.getDate();
      next.setMonth(next.getMonth() + 1);
      next.setDate(1);
      next.setDate(0); // Go to last day of previous month
      
      // Adjust if target day exceeds days in month
      const daysInMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate();
      next.setDate(Math.min(targetDay, daysInMonth));
      break;

    case 'yearly':
      // Handle leap year case for Feb 29
      const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
      const isFeb29 = currentDate.getMonth() === 1 && currentDate.getDate() === 29;
      
      next.setFullYear(next.getFullYear() + 1);
      
      if (isFeb29 && !isLeapYear(next.getFullYear())) {
        next.setDate(28);
      }
      break;
  }

  return next;
}

/**
 * Generate expense instances for a recurring expense
 * Generates instances from startDate to endDate (up to maxInstances)
 */
function generateExpenseInstances(
  recurring: RecurringExpenseCreate & { userId: string },
  maxInstances: number = 12
): Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[] {
  const expenses: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  let currentDate = new Date(recurring.startDate);
  const endDate = recurring.endDate ? new Date(recurring.endDate) : null;

  while (expenses.length < maxInstances) {
    if (endDate && currentDate > endDate) {
      break;
    }

    // Create expense for this date
    expenses.push({
      userId: recurring.userId,
      amount: recurring.amount,
      currency: recurring.currency,
      category: recurring.category,
      description: recurring.description,
      date: new Date(currentDate),
      paymentMethod: 'recurring', // Mark as recurring
      synced: true,
      isRecurringInstance: true,
      recurringExpenseId: '', // Will be set after recurring expense is created
      tags: [],
    });

    // Get next occurrence
    currentDate = getNextOccurrence(
      recurring.frequency,
      currentDate,
      recurring.daysOfWeek,
      recurring.dayOfMonth
    );
  }

  return expenses;
}

/**
 * Create a new recurring expense and generate initial instances
 * @param userId - User ID
 * @param data - Recurring expense data
 * @returns Promise with recurring expense ID
 */
export async function createRecurringExpense(
  userId: string,
  data: RecurringExpenseCreate
): Promise<string> {
  try {
    // Validate input
    const validated = recurringExpenseCreateSchema.parse(data);

    // Create recurring expense document reference
    const recurringId = doc(collection(db, 'recurringExpenses', userId)).id;
    const recurringRef = doc(db, 'recurringExpenses', userId, recurringId);

    // Calculate next instance due
    const nextInstanceDue = getNextOccurrence(
      validated.frequency,
      validated.startDate,
      validated.daysOfWeek,
      validated.dayOfMonth
    );

    // Generate initial expense instances (up to 12 months)
    const expenseInstances = generateExpenseInstances(
      {
        ...validated,
        userId,
      },
      12
    ).map(expense => ({
      ...expense,
      recurringExpenseId: recurringId,
    }));

    // Prepare batch write
    const batch = writeBatch(db);

    // Write recurring expense document
    const recurringExpenseDoc: RecurringExpense = {
      id: recurringId,
      userId,
      description: validated.description,
      amount: validated.amount,
      currency: validated.currency,
      category: validated.category,
      frequency: validated.frequency,
      startDate: validated.startDate,
      endDate: validated.endDate,
      daysOfWeek: validated.daysOfWeek,
      dayOfMonth: validated.dayOfMonth,
      isActive: true,
      nextInstanceDue,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    batch.set(recurringRef, recurringExpenseDoc);

    // Write expense instances
    const expensesRef = collection(db, 'expenses', userId);
    for (const expense of expenseInstances) {
      const expenseRef = doc(expensesRef);
      batch.set(expenseRef, {
        ...expense,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Commit batch
    await batch.commit();

    return recurringId;
  } catch (error) {
    console.error('Error creating recurring expense:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create recurring expense: ${error.message}`);
    }
    throw new Error('Failed to create recurring expense');
  }
}

/**
 * Get all recurring expenses for a user
 * @param userId - User ID
 * @returns Promise with array of recurring expenses
 */
export async function getRecurringExpenses(userId: string): Promise<RecurringExpense[]> {
  try {
    const q = query(
      collection(db, 'recurringExpenses', userId),
      where('isActive', '==', true)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      startDate: doc.data().startDate?.toDate() || new Date(),
      endDate: doc.data().endDate?.toDate(),
      nextInstanceDue: doc.data().nextInstanceDue?.toDate() || new Date(),
    } as RecurringExpense));
  } catch (error) {
    console.error('Error fetching recurring expenses:', error);
    return [];
  }
}

/**
 * Get a single recurring expense by ID
 * @param userId - User ID
 * @param recurringId - Recurring expense ID
 * @returns Promise with recurring expense or null
 */
export async function getRecurringExpenseById(
  userId: string,
  recurringId: string
): Promise<RecurringExpense | null> {
  try {
    const ref = doc(db, 'recurringExpenses', userId, recurringId);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();
    return {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
      startDate: data.startDate?.toDate() || new Date(),
      endDate: data.endDate?.toDate(),
      nextInstanceDue: data.nextInstanceDue?.toDate() || new Date(),
    } as RecurringExpense;
  } catch (error) {
    console.error('Error fetching recurring expense:', error);
    return null;
  }
}

/**
 * Get all expenses generated from a recurring expense
 * @param userId - User ID
 * @param recurringId - Recurring expense ID
 * @returns Promise with array of expenses
 */
export async function getRecurringInstances(
  userId: string,
  recurringId: string
): Promise<Expense[]> {
  try {
    const q = query(
      collection(db, 'expenses', userId),
      where('recurringExpenseId', '==', recurringId)
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      date: doc.data().date?.toDate() || new Date(),
    } as Expense));
  } catch (error) {
    console.error('Error fetching recurring instances:', error);
    return [];
  }
}

/**
 * Update a recurring expense (soft delete by setting isActive = false)
 * @param userId - User ID
 * @param recurringId - Recurring expense ID
 * @returns Promise<void>
 */
export async function deleteRecurringExpense(
  userId: string,
  recurringId: string
): Promise<void> {
  try {
    const ref = doc(db, 'recurringExpenses', userId, recurringId);
    await updateDoc(ref, {
      isActive: false,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error deleting recurring expense:', error);
    throw new Error('Failed to delete recurring expense');
  }
}

/**
 * Hard delete a recurring expense and all its instances
 * WARNING: This is destructive and cannot be undone
 * @param userId - User ID
 * @param recurringId - Recurring expense ID
 * @returns Promise<void>
 */
export async function deleteRecurringExpenseHard(
  userId: string,
  recurringId: string
): Promise<void> {
  try {
    // Get all instances
    const instances = await getRecurringInstances(userId, recurringId);

    // Prepare batch delete
    const batch = writeBatch(db);

    // Delete recurring expense
    const recurringRef = doc(db, 'recurringExpenses', userId, recurringId);
    batch.delete(recurringRef);

    // Delete all instances
    for (const expense of instances) {
      const expenseRef = doc(db, 'expenses', userId, expense.id);
      batch.delete(expenseRef);
    }

    // Commit batch
    await batch.commit();
  } catch (error) {
    console.error('Error hard deleting recurring expense:', error);
    throw new Error('Failed to delete recurring expense and instances');
  }
}

/**
 * Update a recurring expense and regenerate future instances
 * @param userId - User ID
 * @param recurringId - Recurring expense ID
 * @param updates - Partial updates to recurring expense
 * @returns Promise<void>
 */
export async function updateRecurringExpense(
  userId: string,
  recurringId: string,
  updates: Partial<RecurringExpenseCreate>
): Promise<void> {
  try {
    const ref = doc(db, 'recurringExpenses', userId, recurringId);
    const batch = writeBatch(db);

    // Get current recurring expense
    const current = await getRecurringExpenseById(userId, recurringId);
    if (!current) {
      throw new Error('Recurring expense not found');
    }

    // Merge updates with current data
    const merged = {
      ...current,
      ...updates,
      userId,
      id: recurringId,
      createdAt: current.createdAt,
      updatedAt: new Date(),
    };

    // Validate merged data
    recurringExpenseCreateSchema.parse(merged);

    // Calculate next instance due
    const nextInstanceDue = getNextOccurrence(
      merged.frequency,
      merged.startDate,
      merged.daysOfWeek,
      merged.dayOfMonth
    );

    // Update recurring expense
    batch.update(ref, {
      ...updates,
      nextInstanceDue,
      updatedAt: new Date(),
    });

    // Delete future auto-generated instances
    const instances = await getRecurringInstances(userId, recurringId);
    const now = new Date();
    for (const expense of instances) {
      if (new Date(expense.date) > now && expense.isRecurringInstance) {
        const expenseRef = doc(db, 'expenses', userId, expense.id);
        batch.delete(expenseRef);
      }
    }

    // Regenerate future instances
    const newInstances = generateExpenseInstances(merged, 12).map(expense => ({
      ...expense,
      recurringExpenseId: recurringId,
    }));

    const expensesRef = collection(db, 'expenses', userId);
    for (const expense of newInstances) {
      // Only add if it's in the future
      if (new Date(expense.date) > now) {
        const expenseRef = doc(expensesRef);
        batch.set(expenseRef, {
          ...expense,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    // Commit batch
    await batch.commit();
  } catch (error) {
    console.error('Error updating recurring expense:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update recurring expense: ${error.message}`);
    }
    throw new Error('Failed to update recurring expense');
  }
}
