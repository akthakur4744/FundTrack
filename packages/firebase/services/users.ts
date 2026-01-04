import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../config';

export interface UserPreferences {
  currency: string;
  theme: 'light' | 'dark';
  timezone: string;
  language: string;
  notifications: boolean;
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences: UserPreferences;
  createdAt: number;
  updatedAt: number;
}

export interface CreateUserProfileInput {
  email: string;
  displayName: string;
  photoURL?: string;
}

/**
 * Create a new user profile in Firestore
 */
export const createUserProfile = async (
  userId: string,
  userData: CreateUserProfileInput
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const defaultPreferences: UserPreferences = {
      currency: 'USD',
      theme: 'dark',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language || 'en-US',
      notifications: true,
      email: userData.email,
    };

    await setDoc(userRef, {
      email: userData.email,
      displayName: userData.displayName,
      photoURL: userData.photoURL || '',
      preferences: defaultPreferences,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

/**
 * Get user profile by ID
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<CreateUserProfileInput>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

/**
 * Update user preferences
 */
export const updateUserPreferences = async (
  userId: string,
  preferences: Partial<UserPreferences>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userProfile = await getUserProfile(userId);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    await updateDoc(userRef, {
      preferences: {
        ...userProfile.preferences,
        ...preferences,
      },
      updatedAt: Date.now(),
    });
  } catch (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }
};

/**
 * Get user currency preference
 */
export const getUserCurrency = async (userId: string): Promise<string> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.preferences.currency || 'USD';
  } catch (error) {
    console.error('Error getting user currency:', error);
    throw error;
  }
};

/**
 * Get user theme preference
 */
export const getUserTheme = async (userId: string): Promise<'light' | 'dark'> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.preferences.theme || 'dark';
  } catch (error) {
    console.error('Error getting user theme:', error);
    throw error;
  }
};

/**
 * Get user timezone preference
 */
export const getUserTimezone = async (userId: string): Promise<string> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile?.preferences.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.error('Error getting user timezone:', error);
    throw error;
  }
};

/**
 * Check if user profile exists
 */
export const userProfileExists = async (userId: string): Promise<boolean> => {
  try {
    const userProfile = await getUserProfile(userId);
    return userProfile !== null;
  } catch (error) {
    console.error('Error checking user profile:', error);
    throw error;
  }
};
