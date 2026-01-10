import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config';
import {
  SharedBudget,
  SharedExpense,
  Settlement,
  BalanceSummary,
} from '@fundtrack/shared/types';
import {
  SharedBudgetCreate,
  SharedBudgetUpdate,
  SharedExpenseCreate,
  calculateEqualSplit,
  validateSplitsSum,
  validateItemizedSplitsSum,
} from '@fundtrack/shared/schemas';

// ===== SHARED BUDGET CRUD =====

/**
 * Create a new shared budget
 * - Creator is automatically added as admin
 * - Invitations sent separately
 */
export async function createSharedBudget(
  userId: string,
  data: SharedBudgetCreate
): Promise<string> {
  if (!userId) throw new Error('User ID required');

  const budgetRef = doc(collection(db, 'sharedBudgets'));
  const budgetId = budgetRef.id;

  const sharedBudget: SharedBudget = {
    id: budgetId,
    createdBy: userId,
    name: data.name,
    description: data.description,
    category: data.category,
    totalBudget: data.totalBudget,
    currency: data.currency,
    period: data.period,
    startDate: new Date(data.startDate),
    endDate: data.endDate ? new Date(data.endDate) : undefined,
    members: {
      [userId]: {
        status: 'active',
        joinedAt: new Date(),
        role: 'admin',
        splitPercentage: 100,
      },
    },
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(budgetRef, sharedBudget);

  // Send invitations if provided
  if (data.inviteEmails && data.inviteEmails.length > 0) {
    await inviteMembers(budgetId, userId, data.inviteEmails);
  }

  return budgetId;
}

/**
 * Get all shared budgets for a user (as member or invited)
 */
export async function getSharedBudgets(userId: string): Promise<SharedBudget[]> {
  if (!userId) throw new Error('User ID required');

  const budgetsRef = collection(db, 'sharedBudgets');
  const q = query(
    budgetsRef,
    where(`members.${userId}`, '!=', null)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    startDate: (doc.data().startDate as Timestamp).toDate(),
    endDate: (doc.data().endDate as Timestamp)?.toDate(),
    createdAt: (doc.data().createdAt as Timestamp).toDate(),
    updatedAt: (doc.data().updatedAt as Timestamp).toDate(),
  })) as SharedBudget[];
}

/**
 * Get a specific shared budget by ID
 * - Checks user is a member
 */
export async function getSharedBudgetById(
  userId: string,
  budgetId: string
): Promise<SharedBudget | null> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  const budgetDoc = await getDoc(budgetRef);

  if (!budgetDoc.exists()) {
    return null;
  }

  const budget = budgetDoc.data() as SharedBudget;

  // Check user is a member
  if (!budget.members[userId]) {
    throw new Error('User is not a member of this budget');
  }

  return {
    ...budget,
    startDate: (budget.startDate as any).toDate?.() || new Date(budget.startDate),
    endDate: (budget.endDate as any)?.toDate?.() || (budget.endDate ? new Date(budget.endDate) : undefined),
    createdAt: (budget.createdAt as any).toDate?.() || new Date(budget.createdAt),
    updatedAt: (budget.updatedAt as any).toDate?.() || new Date(budget.updatedAt),
  };
}

/**
 * Update shared budget (admin only)
 */
export async function updateSharedBudget(
  userId: string,
  budgetId: string,
  updates: SharedBudgetUpdate
): Promise<void> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  // Check user is admin
  if (budget.members[userId]?.role !== 'admin') {
    throw new Error('Only admins can update budget');
  }

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  const dataToUpdate = {
    ...updates,
    updatedAt: new Date(),
  };

  await updateDoc(budgetRef, dataToUpdate);
}

/**
 * Delete shared budget (soft delete - mark inactive)
 */
export async function deleteSharedBudget(
  userId: string,
  budgetId: string
): Promise<void> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  // Check user is admin
  if (budget.members[userId]?.role !== 'admin') {
    throw new Error('Only admins can delete budget');
  }

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  await updateDoc(budgetRef, {
    isActive: false,
    updatedAt: new Date(),
  });
}

// ===== MEMBER MANAGEMENT =====

/**
 * Invite members to a shared budget
 */
export async function inviteMembers(
  budgetId: string,
  invitedBy: string,
  emails: string[]
): Promise<void> {
  if (!budgetId || !invitedBy || !emails.length) {
    throw new Error('Budget ID, inviter, and emails required');
  }

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  const budget = await getDoc(budgetRef);
  if (!budget.exists()) throw new Error('Budget not found');

  // Add invitations to members map
  const updates: Record<string, any> = {
    updatedAt: new Date(),
  };

  // TODO: In production, send actual emails
  // For now, store invitations in the members map
  const budgetData = budget.data() as SharedBudget;
  const newMembers = { ...budgetData.members };

  emails.forEach((email) => {
    // Use email as temporary ID for invited members
    const inviteId = `invite_${email}`;
    newMembers[inviteId] = {
      status: 'invited',
      joinedAt: new Date(),
      role: 'member',
    };
  });

  updates.members = newMembers;
  await updateDoc(budgetRef, updates);
}

/**
 * Accept an invitation to a shared budget
 * - User claimed their email invitation
 */
export async function acceptInvite(
  userId: string,
  budgetId: string,
  email: string
): Promise<void> {
  if (!userId || !budgetId || !email) {
    throw new Error('User ID, Budget ID, and email required');
  }

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  const budget = await getDoc(budgetRef);
  if (!budget.exists()) throw new Error('Budget not found');

  const budgetData = budget.data() as SharedBudget;
  const inviteId = `invite_${email}`;

  // Check invitation exists
  if (!budgetData.members[inviteId]) {
    throw new Error('Invitation not found');
  }

  // Remove old invite, add user as active member
  const newMembers = { ...budgetData.members };
  delete newMembers[inviteId];
  newMembers[userId] = {
    status: 'active',
    joinedAt: new Date(),
    role: 'member',
  };

  await updateDoc(budgetRef, {
    members: newMembers,
    updatedAt: new Date(),
  });
}

/**
 * Remove a member from shared budget
 */
export async function removeMember(
  userId: string,
  budgetId: string,
  memberId: string
): Promise<void> {
  if (!userId || !budgetId || !memberId) {
    throw new Error('User ID, Budget ID, and Member ID required');
  }

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  // Check user is admin
  if (budget.members[userId]?.role !== 'admin') {
    throw new Error('Only admins can remove members');
  }

  // Cannot remove yourself
  if (userId === memberId) {
    throw new Error('Cannot remove yourself from budget');
  }

  const budgetRef = doc(db, 'sharedBudgets', budgetId);
  const newMembers = { ...budget.members };
  newMembers[memberId].status = 'left';

  await updateDoc(budgetRef, {
    members: newMembers,
    updatedAt: new Date(),
  });
}

/**
 * Get all members in a shared budget
 */
export async function getMembers(
  userId: string,
  budgetId: string
): Promise<Array<{ userId: string; status: string; role: string }>> {
  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  return Object.entries(budget.members)
    .filter(([, member]) => member.status === 'active')
    .map(([id, member]) => ({
      userId: id,
      status: member.status,
      role: member.role,
    }));
}

// ===== SHARED EXPENSE MANAGEMENT =====

/**
 * Add a shared expense to the budget
 * - Validates splits sum to total amount
 * - Handles equal, custom, and itemized splitting
 */
export async function addSharedExpense(
  userId: string,
  budgetId: string,
  data: SharedExpenseCreate
): Promise<string> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  // Check user is member
  if (!budget.members[userId]) {
    throw new Error('User is not a member of this budget');
  }

  // Prepare splits based on splitting method
  let finalSplits: Record<string, { amount: number; itemized?: Array<{ description: string; amount: number; quantity?: number }> }> = {};

  if (data.splittingMethod === 'equal') {
    // Equal split among participants
    const splitAmount = calculateEqualSplit(data.amount, data.participants.length);
    data.participants.forEach((participantId) => {
      finalSplits[participantId] = { amount: splitAmount };
    });
  } else if (data.splittingMethod === 'custom') {
    // Use provided splits
    if (!data.splits || !validateSplitsSum(data.splits, data.amount)) {
      throw new Error('Custom splits must sum to total expense amount');
    }
    Object.entries(data.splits).forEach(([participantId, amount]) => {
      finalSplits[participantId] = { amount };
    });
  } else if (data.splittingMethod === 'itemized') {
    // Calculate splits from itemized items
    if (!data.itemizedSplits || !validateItemizedSplitsSum(data.itemizedSplits, data.amount)) {
      throw new Error('Itemized items must sum to total expense amount');
    }

    // Sum items per participant
    Object.entries(data.itemizedSplits).forEach(([participantId, items]) => {
      const total = items.reduce(
        (sum, item) => sum + item.amount * (item.quantity || 1),
        0
      );
      finalSplits[participantId] = {
        amount: parseFloat(total.toFixed(2)),
        itemized: items,
      };
    });
  }

  // Create expense document
  const expenseRef = doc(collection(db, 'sharedBudgets', budgetId, 'expenses'));
  const expenseId = expenseRef.id;

  const sharedExpense: SharedExpense = {
    id: expenseId,
    budgetId,
    description: data.description,
    amount: data.amount,
    currency: budget.currency,
    category: data.category,
    date: new Date(data.date),
    paidBy: data.paidBy,
    paidByAmount: data.amount,
    splits: finalSplits,
    receiptUrl: data.receiptUrl,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await setDoc(expenseRef, sharedExpense);

  return expenseId;
}

/**
 * Update a shared expense
 */
export async function updateSharedExpense(
  userId: string,
  budgetId: string,
  expenseId: string,
  updates: Partial<SharedExpenseCreate>
): Promise<void> {
  if (!userId || !budgetId || !expenseId) {
    throw new Error('User ID, Budget ID, and Expense ID required');
  }

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  const expenseRef = doc(db, 'sharedBudgets', budgetId, 'expenses', expenseId);
  const expenseDoc = await getDoc(expenseRef);

  if (!expenseDoc.exists()) {
    throw new Error('Expense not found');
  }

  const expense = expenseDoc.data() as SharedExpense;

  // Only payer or budget admin can update
  if (userId !== expense.paidBy && budget.members[userId]?.role !== 'admin') {
    throw new Error('Only expense payer or admin can update');
  }

  const dataToUpdate = {
    ...updates,
    updatedAt: new Date(),
  };

  await updateDoc(expenseRef, dataToUpdate);
}

/**
 * Delete a shared expense
 */
export async function deleteSharedExpense(
  userId: string,
  budgetId: string,
  expenseId: string
): Promise<void> {
  if (!userId || !budgetId || !expenseId) {
    throw new Error('User ID, Budget ID, and Expense ID required');
  }

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  const expenseRef = doc(db, 'sharedBudgets', budgetId, 'expenses', expenseId);
  const expenseDoc = await getDoc(expenseRef);

  if (!expenseDoc.exists()) {
    throw new Error('Expense not found');
  }

  const expense = expenseDoc.data() as SharedExpense;

  // Only payer or budget admin can delete
  if (userId !== expense.paidBy && budget.members[userId]?.role !== 'admin') {
    throw new Error('Only expense payer or admin can delete');
  }

  // Soft delete
  await updateDoc(expenseRef, {
    isDeleted: true,
    deletedAt: new Date(),
    updatedAt: new Date(),
  });
}

/**
 * Get all expenses in a shared budget
 */
export async function getSharedExpenses(
  userId: string,
  budgetId: string
): Promise<SharedExpense[]> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  await getSharedBudgetById(userId, budgetId); // Auth check

  const expensesRef = collection(db, 'sharedBudgets', budgetId, 'expenses');
  const q = query(expensesRef, where('isDeleted', '!=', true));

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data() as SharedExpense;
    return {
      ...data,
      date: (data.date as any).toDate?.() || new Date(data.date),
      createdAt: (data.createdAt as any).toDate?.() || new Date(data.createdAt),
      updatedAt: (data.updatedAt as any).toDate?.() || new Date(data.updatedAt),
    };
  });
}

/**
 * Get expenses involving a specific member
 */
export async function getSharedExpensesByMember(
  userId: string,
  budgetId: string,
  memberId: string
): Promise<SharedExpense[]> {
  const allExpenses = await getSharedExpenses(userId, budgetId);

  return allExpenses.filter((expense) => {
    // Either the member paid or is in the split
    return expense.paidBy === memberId || memberId in expense.splits;
  });
}

// ===== BALANCE CALCULATION =====

/**
 * Calculate balance summary for all members in a budget
 * Returns who owes what to whom
 */
export async function calculateBalances(
  userId: string,
  budgetId: string
): Promise<BalanceSummary> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  const expenses = await getSharedExpenses(userId, budgetId);

  // Initialize balances for all active members
  const balances: BalanceSummary = {};
  Object.entries(budget.members).forEach(([memberId, member]) => {
    if (member.status === 'active') {
      balances[memberId] = {
        owes: 0,
        owed: 0,
        balance: 0,
      };
    }
  });

  // Calculate from expenses
  expenses.forEach((expense) => {
    // Person who paid gets credited
    balances[expense.paidBy].owed += expense.amount;

    // Everyone in split owes
    Object.entries(expense.splits).forEach(([participantId, amount]) => {
      if (typeof amount === 'number') {
        balances[participantId].owes += amount;
      }
    });
  });

  // Calculate net balance (positive = owed to them, negative = they owe)
  Object.values(balances).forEach((balance) => {
    balance.balance = balance.owed - balance.owes;
  });

  return balances;
}

// ===== SETTLEMENTS =====

/**
 * Calculate settlement suggestions (optimal payment paths)
 * Uses greedy algorithm to minimize number of transactions
 */
export async function calculateSettlements(
  userId: string,
  budgetId: string
): Promise<Settlement[]> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  const balances = await calculateBalances(userId, budgetId);

  // Convert to array of [userId, balance]
  const debtors: [string, number][] = [];
  const creditors: [string, number][] = [];

  Object.entries(balances).forEach(([memberId, { balance }]) => {
    if (balance < 0) {
      debtors.push([memberId, Math.abs(balance)]);
    } else if (balance > 0) {
      creditors.push([memberId, balance]);
    }
  });

  const settlements: Settlement[] = [];

  // Greedy matching: match largest debts with largest credits
  while (debtors.length > 0 && creditors.length > 0) {
    const [debtorId, debtAmount] = debtors[0];
    const [creditorId, creditAmount] = creditors[0];

    const settlementAmount = Math.min(debtAmount, creditAmount);

    settlements.push({
      id: `settle_${Date.now()}_${Math.random()}`,
      budgetId,
      from: debtorId,
      to: creditorId,
      amount: parseFloat(settlementAmount.toFixed(2)),
      currency: (await getSharedBudgetById(userId, budgetId))?.currency || 'USD',
      status: 'pending',
      createdAt: new Date(),
    });

    // Update remaining amounts
    debtors[0][1] -= settlementAmount;
    creditors[0][1] -= settlementAmount;

    if (debtors[0][1] <= 0.01) debtors.shift();
    if (creditors[0][1] <= 0.01) creditors.shift();
  }

  return settlements;
}

/**
 * Record a settlement payment
 */
export async function recordSettlement(
  userId: string,
  budgetId: string,
  from: string,
  to: string,
  amount: number,
  note?: string
): Promise<string> {
  if (!userId || !budgetId || !from || !to || amount <= 0) {
    throw new Error('Invalid settlement parameters');
  }

  const budget = await getSharedBudgetById(userId, budgetId);
  if (!budget) throw new Error('Budget not found');

  // Check user is payer or admin
  if (userId !== from && budget.members[userId]?.role !== 'admin') {
    throw new Error('Only payer or admin can record settlement');
  }

  const settlementRef = doc(collection(db, 'sharedBudgets', budgetId, 'settlements'));
  const settlementId = settlementRef.id;

  const settlement: Settlement = {
    id: settlementId,
    budgetId,
    from,
    to,
    amount: parseFloat(amount.toFixed(2)),
    currency: budget.currency,
    status: 'completed',
    createdAt: new Date(),
    completedAt: new Date(),
    note,
  };

  await setDoc(settlementRef, settlement);

  return settlementId;
}

/**
 * Get settlement history for a shared budget
 */
export async function getSettlementHistory(
  userId: string,
  budgetId: string
): Promise<Settlement[]> {
  if (!userId || !budgetId) throw new Error('User ID and Budget ID required');

  await getSharedBudgetById(userId, budgetId); // Auth check

  const settlementsRef = collection(db, 'sharedBudgets', budgetId, 'settlements');
  const snapshot = await getDocs(settlementsRef);

  return snapshot.docs.map((doc) => {
    const data = doc.data() as Settlement;
    return {
      ...data,
      createdAt: (data.createdAt as any).toDate?.() || new Date(data.createdAt),
      completedAt: (data.completedAt as any)?.toDate?.() || data.completedAt,
    };
  });
}
