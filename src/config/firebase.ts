// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// TODO: Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBoCauxrpkHo3kzCHq1A_Zi9YF63OerM18",
  authDomain: "nxthyre.firebaseapp.com",
  projectId: "nxthyre",
  storageBucket: "nxthyre.firebasestorage.app",
  messagingSenderId: "863630644667",
  appId: "1:863630644667:web:137f60cd0f723ee301e09e",
  measurementId: "G-WNJZH2TFC5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Connect to auth emulator in development
if (import.meta.env.NODE_ENV === 'development') {
  // Uncomment the line below if you're using Firebase Auth emulator
  // connectAuthEmulator(auth, 'http://localhost:9099');
}

export default app;