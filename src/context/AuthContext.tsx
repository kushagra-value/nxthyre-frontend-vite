import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth"; // Adjust path
import { User } from "../types/auth"; // Adjust path
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  userStatus: any;
  loading: boolean;
  signOut: () => Promise<void>;
  selectedWorkspaceId: number | null;
  setSelectedWorkspaceId: (id: number | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user: firebaseUser,
    userStatus,
    isAuthenticated,
    loading,
    signOut: authSignOut,
  } = useAuth();

  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<number | null>(
    null
  );

  React.useEffect(() => {
    if (isAuthenticated && userStatus) {
      const user: User = {
        id: firebaseUser?.uid,
        fullName: userStatus.full_name || "Unknown User",
        email: userStatus.email || "Unknown@user.com",
        role:
          userStatus.roles?.length > 0
            ? userStatus.roles[0].name.toLowerCase()
            : "team",
        organizationId: userStatus.organization?.id?.toString(),
        workspaceIds: userStatus.roles
          .filter(
            (role: any) =>
              role.workspace_id !== null && role.workspace_id !== undefined
          )
          .map((role: any) => Number(role.workspace_id)),
        isVerified: firebaseUser?.emailVerified ?? true,
        createdAt:
          firebaseUser?.metadata.creationTime || new Date().toISOString(),
      };
      setCurrentUser(user);
      const savedWorkspaceId = Cookies.get("selectedWorkspaceId");
      if (
        savedWorkspaceId &&
        user.workspaceIds.includes(parseInt(savedWorkspaceId))
      ) {
        setSelectedWorkspaceId(parseInt(savedWorkspaceId));
      } else if (user.workspaceIds.length > 0) {
        // If no valid workspace in cookie, select the first one
        setSelectedWorkspaceId(user.workspaceIds[0]);
        Cookies.set("selectedWorkspaceId", user.workspaceIds[0].toString(), {
          expires: 7,
        });
      } else {
        setSelectedWorkspaceId(null);
        Cookies.remove("selectedWorkspaceId");
      }
    } else {
      setCurrentUser(null);
      setSelectedWorkspaceId(null);
      Cookies.remove("selectedWorkspaceId");
    }
  }, [isAuthenticated, userStatus, firebaseUser]);

  const signOut = async () => {
    try {
      localStorage.removeItem("authToken"); // Add this
      await authSignOut();
      setCurrentUser(null);
      setSelectedWorkspaceId(null);
      Cookies.remove("selectedWorkspaceId");
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  const value = {
    isAuthenticated,
    user: currentUser,
    userStatus,
    loading,
    signOut,
    selectedWorkspaceId,
    setSelectedWorkspaceId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};
