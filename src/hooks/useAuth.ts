import { useState, useEffect } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import { authService, UserStatusResponse } from '../services/authService';

interface AuthState {
  user: FirebaseUser | null;
  userStatus: UserStatusResponse | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userStatus: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, get their status from backend
          const userStatus = await authService.getUserStatus();
          setAuthState({
            user: firebaseUser,
            userStatus,
            loading: false,
            error: null
          });
        } else {
          // User is signed out
          setAuthState({
            user: null,
            userStatus: null,
            loading: false,
            error: null
          });
        }
      } catch (error: any) {
        console.error('Error fetching user status:', error);
        setAuthState({
          user: firebaseUser,
          userStatus: null,
          loading: false,
          error: error.message
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUserStatus = async () => {
    if (authState.user) {
      try {
        const userStatus = await authService.getUserStatus();
        setAuthState(prev => ({
          ...prev,
          userStatus,
          error: null
        }));
      } catch (error: any) {
        setAuthState(prev => ({
          ...prev,
          error: error.message
        }));
      }
    }
  };

  return {
    ...authState,
    refreshUserStatus,
    isAuthenticated: !!authState.user,
    isOnboarded: authState.userStatus?.is_onboarded || false
  };
};