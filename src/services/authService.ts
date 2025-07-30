import apiClient from "./api";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  User as FirebaseUser,
} from "firebase/auth";
import { auth } from "../config/firebase";

export interface SignUpResponse {
  message: string;
}

export interface OTPVerifyResponse {
  status: string;
  next_step: string;
  message: string;
}

export interface LinkedInCallbackResponse {
  error: string;
  status: string;
  firebase_token: string;
  is_onboarded: boolean;
  recruiter_id: string;
  email: string;
  full_name: string;
  organization_status: string;
  organization?: {
    id: number;
    name: string;
  };
  message?: string;
}

export interface UserStatusResponse {
  is_onboarded: boolean;
  recruiter_id: string;
  email: string;
  full_name: string;
  organization?: {
    id: number;
    name: string;
  };
  roles: Array<{
    name: string;
    scope: string;
    organization_id: number;
    workspace_id?: number;
  }>;
}

export interface UpdateCompanyEmailResponse {
  message: string;
  new_email: string;
  organization_status: string;
}

class AuthService {
  // Sign up with email
  async signUpWithEmail(
    email: string,
    otp: string,
    password: string,
    fullName: string
  ): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post("/auth/signup/", {
        email,
        otp,
        password,
        full_name: fullName,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Sign up failed");
    }
  }

  // Verify OTP
  async verifyOTP(
    email: string,
    otp: string,
    password: string,
    fullName: string
  ): Promise<OTPVerifyResponse> {
    try {
      const response = await apiClient.post("/auth/otp/verify/", {
        email,
        otp,
        password,
        full_name: fullName,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "OTP verification failed");
    }
  }

  // LinkedIn callback
  async linkedInCallback(
    code: string,
    state: string
  ): Promise<LinkedInCallbackResponse> {
    try {
      const response = await apiClient.post("/auth/linkedin-callback/", {
        code,
        state,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "LinkedIn authentication failed"
      );
    }
  }

  // Update company email
  async updateCompanyEmail(email: string): Promise<UpdateCompanyEmailResponse> {
    try {
      const response = await apiClient.post("/auth/update-company-email/", {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Email update failed");
    }
  }

  // Resend OTP
  async resendOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/otp/send/", {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Failed to resend OTP");
    }
  }

  // Password reset flow here
  async sendPasswordResetOTP(email: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/password-reset/send-otp/", {
        email,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to send password reset OTP"
      );
    }
  }

  async verifyPasswordResetOTP(
    email: string,
    otp: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post(
        "/auth/password-reset/verify-otp/",
        {
          email,
          otp,
        }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "OTP verification failed");
    }
  }

  async resetPasswordWithOTP(
    email: string,
    otp: string,
    password: string
  ): Promise<{ message: string }> {
    try {
      const response = await apiClient.post("/auth/password-reset/confirm/", {
        email,
        otp,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Password reset failed");
    }
  }

  // Get current user status
  async getUserStatus(): Promise<UserStatusResponse> {
    try {
      const response = await apiClient.get("/auth/status/");
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error || "Failed to get user status"
      );
    }
  }

  // Private method to map Firebase errors to user-friendly messages
  private getFriendlyFirebaseError(error: any): string {
    if (error.code) {
      switch (error.code) {
        case "auth/invalid-email":
          return "The email address is not valid.";
        case "auth/user-disabled":
          return "This user account has been disabled.";
        case "auth/user-not-found":
          return "No user found with this email.";
        case "auth/wrong-password":
          return "Incorrect password.";
        case "auth/invalid-credential":
          return "Invalid email or password.";
        case "auth/email-already-in-use":
          return "This email is already in use.";
        case "auth/weak-password":
          return "The password is too weak.";
        case "auth/operation-not-allowed":
          return "This sign-in method is not allowed.";
        case "auth/too-many-requests":
          return "Too many attempts. Please try again later.";
        case "auth/network-request-failed":
          return "Network error. Please check your connection.";
        default:
          return "An authentication error occurred.";
      }
    }
    return "An unexpected error occurred.";
  }

  // Firebase authentication methods
  async signInWithEmail(
    email: string,
    password: string
  ): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      return userCredential.user;
    } catch (error: any) {
      throw new Error(this.getFriendlyFirebaseError(error));
    }
  }

  async signInWithCustomToken(token: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(this.getFriendlyFirebaseError(error));
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error("Failed to sign out. Please try again.");
    }
  }

  // Get current Firebase user
  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Wait for auth state to be ready
  waitForAuthReady(): Promise<FirebaseUser | null> {
    return new Promise((resolve) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

export const authService = new AuthService();
export default authService;
