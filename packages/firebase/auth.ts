import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
  UserCredential,
  GoogleAuthProvider,
  signInWithPopup,
  OAuthProvider,
  AuthError,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  currency: string;
  theme: 'light' | 'dark';
  timezone: string;
  createdAt: number;
  updatedAt: number;
}

/**
 * Convert Firebase User to AuthUser
 */
export const userToAuthUser = (user: User): AuthUser => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
  emailVerified: user.emailVerified,
});

/**
 * Sign up with email and password
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
  displayName: string
): Promise<AuthUser> => {
  try {
    // Create user account
    const credential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = credential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || '',
      displayName,
      photoURL: user.photoURL,
      currency: 'USD',
      theme: 'dark',
      timezone: 'UTC',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await setDoc(userRef, userProfile);

    // Send email verification
    await sendEmailVerification(user);

    return userToAuthUser(user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string): Promise<AuthUser> => {
  try {
    const credential: UserCredential = await signInWithEmailAndPassword(auth, email, password);
    return userToAuthUser(credential.user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Sign in with Google
 */
export const signInWithGoogle = async (): Promise<AuthUser> => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const credential: UserCredential = await signInWithPopup(auth, provider);
    const user = credential.user;

    // Create user profile in Firestore if new user
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoURL: user.photoURL,
        currency: 'USD',
        theme: 'dark',
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(userRef, userProfile);
    }

    return userToAuthUser(user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Sign in with Apple (iOS/Web)
 */
export const signInWithApple = async (): Promise<AuthUser> => {
  try {
    const provider = new OAuthProvider('apple.com');
    provider.addScope('email');
    provider.addScope('name');

    const credential: UserCredential = await signInWithPopup(auth, provider);
    const user = credential.user;

    // Create user profile in Firestore if new user
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Apple User',
        photoURL: user.photoURL,
        currency: 'USD',
        theme: 'dark',
        timezone: 'UTC',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      await setDoc(userRef, userProfile);
    }

    return userToAuthUser(user);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Send password reset email
 */
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Sign out
 */
export const logOut = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Get current user profile from Firestore
 */
export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
  userId: string,
  updates: Partial<UserProfile>
): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: Date.now(),
    });
  } catch (error) {
    const authError = error as AuthError;
    throw new Error(authError.message);
  }
};

/**
 * Get current authenticated user
 */
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChanged = (callback: (user: AuthUser | null) => void) => {
  return auth.onAuthStateChanged((firebaseUser) => {
    if (firebaseUser) {
      callback(userToAuthUser(firebaseUser));
    } else {
      callback(null);
    }
  });
};
