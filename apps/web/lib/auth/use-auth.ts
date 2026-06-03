'use client';

import { createContext, useContext } from 'react';
import type {
  LoginUserInput,
  RegisterUserInput,
  UpdateCurrentUserInput,
} from '@/lib/api/auth';
import type { User } from '@/lib/api/types';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthState = {
  status: AuthStatus;
  user: User | null;
};

export type AuthContextValue = AuthState & {
  login: (input: LoginUserInput) => Promise<User>;
  register: (input: RegisterUserInput) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<User | null>;
  updateUser: (input: UpdateCurrentUserInput) => Promise<User>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
