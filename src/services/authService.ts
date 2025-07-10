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
    password: string
  ): Promise<SignUpResponse> {
    try {
      const response = await apiClient.post("/auth/signup/email/", {
        email,
        password,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.error || "Sign up failed");
    }
  }

  // Verify OTP
  async verifyOTP(email: string, otp: string): Promise<OTPVerifyResponse> {
    try {
      const response = await apiClient.post("/auth/otp/verify/", {
        email,
        otp,
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

  // Password reset flow
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
      throw new Error(error.message || "Firebase sign in failed");
    }
  }

  async signInWithCustomToken(token: string): Promise<FirebaseUser> {
    try {
      const userCredential = await signInWithCustomToken(auth, token);
      return userCredential.user;
    } catch (error: any) {
      throw new Error(error.message || "Custom token sign in failed");
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      throw new Error(error.message || "Sign out failed");
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
