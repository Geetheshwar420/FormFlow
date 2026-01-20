'use client';

import { useState } from 'react';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { useFirebase, useUser as useFirebaseUser } from '@/firebase/provider';
import { FirebaseError } from 'firebase/app';

export function useAuth() {
  const { auth } = useFirebase();
  const { user, isUserLoading, userError } = useFirebaseUser();
  const [isAuthLoading, setAuthLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
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

  return {
    user,
    isUserLoading,
    userError,
    signUp,
    signIn,
    signOut,
    isAuthLoading,
  };
}
