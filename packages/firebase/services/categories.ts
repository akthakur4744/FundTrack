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

export const DEFAULT_CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal',
  'Work',
  'Subscriptions',
  'Other',
];

export interface Category {
  id: string;
  userId: string;
  name: string;
  color: string; // hex color code
  icon: string; // emoji or icon name
  isDefault: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CreateCategoryInput {
  name: string;
  color: string;
  icon: string;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

/**
 * Initialize default categories for a new user
 */
export const initializeDefaultCategories = async (userId: string): Promise<void> => {
  try {
    const categoriesRef = collection(db, 'categories', userId, 'items');

    const defaultCategoryData = [
      { name: 'Food & Dining', color: '#FF6B6B', icon: '🍽️' },
      { name: 'Transportation', color: '#4ECDC4', icon: '🚗' },
      { name: 'Shopping', color: '#FFE66D', icon: '🛍️' },
      { name: 'Entertainment', color: '#95E1D3', icon: '🎬' },
      { name: 'Utilities', color: '#A8E6CF', icon: '💡' },
      { name: 'Healthcare', color: '#FF8B94', icon: '⚕️' },
      { name: 'Education', color: '#87CEEB', icon: '📚' },
      { name: 'Travel', color: '#DDA0DD', icon: '✈️' },
      { name: 'Personal', color: '#F0E68C', icon: '💇' },
      { name: 'Work', color: '#CD5C5C', icon: '💼' },
      { name: 'Subscriptions', color: '#20B2AA', icon: '📱' },
      { name: 'Other', color: '#808080', icon: '📌' },
    ];

    for (const categoryData of defaultCategoryData) {
      await addDoc(categoriesRef, {
        ...categoryData,
        userId,
        isDefault: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  } catch (error) {
    console.error('Error initializing default categories:', error);
    throw error;
  }
};

/**
 * Add a new category for a user
 */
export const addCategory = async (
  userId: string,
  categoryData: CreateCategoryInput
): Promise<string> => {
  try {
    const categoriesRef = collection(db, 'categories', userId, 'items');
    const docRef = await addDoc(categoriesRef, {
      ...categoryData,
      userId,
      isDefault: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

/**
 * Update an existing category
 */
export const updateCategory = async (
  userId: string,
  categoryId: string,
  updates: UpdateCategoryInput
): Promise<void> => {
  try {
    const categoryRef = doc(db, 'categories', userId, 'items', categoryId);
    await updateDoc(categoryRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

/**
 * Delete a category (only non-default categories can be deleted)
 */
export const deleteCategory = async (userId: string, categoryId: string): Promise<void> => {
  try {
    const category = await getCategory(userId, categoryId);
    if (category?.isDefault) {
      throw new Error('Cannot delete default categories');
    }

    const categoryRef = doc(db, 'categories', userId, 'items', categoryId);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

/**
 * Get a single category by ID
 */
export const getCategory = async (userId: string, categoryId: string): Promise<Category | null> => {
  try {
    const categoryRef = doc(db, 'categories', userId, 'items', categoryId);
    const docSnap = await getDoc(categoryRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Category;
    }
    return null;
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

/**
 * Get all categories for a user
 */
export const getCategories = async (
  userId: string,
  constraints?: QueryConstraint[]
): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, 'categories', userId, 'items');
    const q = query(categoriesRef, ...(constraints || [orderBy('createdAt', 'asc')]));
    const querySnapshot = await getDocs(q);

    const categories: Category[] = [];
    querySnapshot.forEach((doc) => {
      categories.push({
        id: doc.id,
        ...doc.data(),
      } as Category);
    });

    return categories;
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

/**
 * Get category by name
 */
export const getCategoryByName = async (
  userId: string,
  name: string
): Promise<Category | null> => {
  try {
    const categories = await getCategories(userId);
    return categories.find((c) => c.name === name) || null;
  } catch (error) {
    console.error('Error getting category by name:', error);
    throw error;
  }
};
