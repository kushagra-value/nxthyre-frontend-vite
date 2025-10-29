import { useState, useEffect } from "react";
import { User as FirebaseUser, onAuthStateChanged } from "firebase/auth";
import { auth } from "../config/firebase";
import { authService, UserStatusResponse } from "../services/authService";

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
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken(); // Get fresh token
          localStorage.setItem("authToken", token); // Store for superAdminApi.ts

          // User is signed in, get their status from backend
          const userStatus = await authService.getUserStatus();
          setAuthState({
            user: firebaseUser,
            userStatus,
            loading: false,
            error: null,
          });
        } else {
          localStorage.removeItem("authToken"); // Clean up on sign-out
          // User is signed out
          setAuthState({
            user: null,
            userStatus: null,
            loading: false,
            error: null,
          });
        }
      } catch (error: any) {
        console.error("Error fetching user status:", error);
        setAuthState({
          user: firebaseUser,
          userStatus: null,
          loading: false,
          error: error.message,
        });
        if (firebaseUser) {
          localStorage.removeItem("authToken"); // Clean up on error too
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshUserStatus = async () => {
    if (authState.user) {
      try {
        const token = await authState.user.getIdToken(true); // Force refresh
        localStorage.setItem("authToken", token);
        const userStatus = await authService.getUserStatus();
        setAuthState((prev) => ({
          ...prev,
          userStatus,
          error: null,
        }));
      } catch (error: any) {
        setAuthState((prev) => ({
          ...prev,
          error: error.message,
        }));
      }
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem("authToken"); // Add this
      await authService.signOut();
      setAuthState({
        user: null,
        userStatus: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      console.error("Sign out error:", error);
      setAuthState((prev) => ({
        ...prev,
        error: error.message,
      }));
    }
  };

  return {
    ...authState,
    refreshUserStatus,
    signOut,
    isAuthenticated: !!authState.user,
    isOnboarded: authState.userStatus?.is_onboarded || false,
  };
};
