'use client';

import { useState } from 'react';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  updateProfile,
} from 'firebase/auth';
import { useFirebase, useUser as useFirebaseUser } from '@/firebase/provider';
import { FirebaseError } from 'firebase/app';
import { doc, setDoc } from 'firebase/firestore';

export function useAuth() {
  const { auth, firestore } = useFirebase();
  const { user, isUserLoading, userError } = useFirebaseUser();
  const [isAuthLoading, setAuthLoading] = useState(false);

  const signUp = async (email: string, password: string, displayName: string, username: string) => {
    setAuthLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update the user's profile with the display name
      await updateProfile(user, { displayName });

      // Create a document in the 'users' collection
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        id: user.uid,
        email: user.email,
        username: username,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    setAuthLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    setAuthLoading(true);
    if (!user || !user.email) {
      setAuthLoading(false);
      throw new Error("User not found or email is missing.");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    try {
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    } catch (error) {
      if (error instanceof FirebaseError) {
        throw new Error(error.message);
      }
      throw error;
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    isUserLoading,
    userError,
    signUp,
    signIn,
    signOut,
    signInWithGoogle,
    sendPasswordReset,
    changePassword,
    isAuthLoading,
  };
}
