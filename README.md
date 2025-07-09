@@ .. @@
 # NxtHyre - Professional Recruitment Platform

 A modern recruitment platform built with React, TypeScript, and Tailwind CSS.
+
+## Backend Integration
+
+This frontend is integrated with a Django backend API. The following components have been updated to use real API calls:
+
+### Authentication
+- **Login**: Uses Firebase authentication + backend user status
+- **Sign Up**: Creates user via backend API + sends OTP
+- **OTP Verification**: Verifies email with backend
+- **Password Reset**: Full flow with backend OTP system
+- **LinkedIn OAuth**: Handles LinkedIn callback and custom token auth
+
+### Organization & Workspace Management
+- **Create Organization**: Uses backend API
+- **Create Workspace**: Uses backend API  
+- **Join Workspace**: Request/withdraw join requests
+- **Onboarding Status**: Fetches user's onboarding state
+
+### Setup Instructions
+
+1. **Environment Variables**: Copy `.env.example` to `.env` and fill in your values:
+   ```bash
+   cp .env.example .env
+   ```
+
+2. **Firebase Setup**: 
+   - Create a Firebase project
+   - Enable Authentication with Email/Password
+   - Add your Firebase config to `src/config/firebase.ts`
+   - Update environment variables
+
+3. **Backend Setup**:
+   - Ensure your Django backend is running
+   - Update `VITE_API_BASE_URL` in `.env`
+   - Make sure CORS is configured for your frontend domain
+
+### Components Using Dummy Data (TODO)
+
+The following components still use dummy data and need to be connected to backend APIs:
+
+- **WorkspacesOrg.tsx**: Workspace list and management
+- **WorkspaceJoining.tsx**: Available workspaces list  
+- **CandidatesMain.tsx**: Candidate data and filtering
+- **PipelineStages.tsx**: Pipeline candidate data
+- **All candidate-related components**: Using mock candidate data
+
+### API Integration Status
+
+✅ **Completed**:
+- User authentication (login/signup/logout)
+- Email verification with OTP
+- Password reset flow
+- Organization creation
+- Workspace creation
+- Basic user status fetching
+
+🔄 **In Progress/TODO**:
+- Workspace member management
+- Candidate data integration
+- Pipeline management APIs
+- File upload for resumes/documents
+- Real-time notifications
+- Advanced filtering and search
+
+### Notes for Developers
+
+1. **Firebase Token Management**: The app automatically handles Firebase ID token refresh and includes it in API requests
+
+2. **Error Handling**: All API calls include proper error handling with user-friendly toast messages
+
+3. **Loading States**: Components show appropriate loading states during API calls
+
+4. **Type Safety**: TypeScript interfaces are defined for all API responses
+
+5. **Offline Handling**: The app gracefully handles network errors and provides retry mechanisms