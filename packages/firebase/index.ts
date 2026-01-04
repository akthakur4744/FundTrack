// Firebase configuration
export { default as app, auth, db, storage } from './config';

// Authentication services
export {
  signUpWithEmail,
  signInWithEmail,
  signInWithGoogle,
  signInWithApple,
  resetPassword,
  logOut,
  getCurrentUser,
  getUserProfile,
  updateUserProfile,
  userToAuthUser,
  type AuthUser,
  type UserProfile,
} from './auth';

// Re-export all Firebase hooks
export * from './hooks';

// Re-export all Firestore services
export * from './services';
