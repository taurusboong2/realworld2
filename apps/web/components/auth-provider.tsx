'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  updateCurrentUser,
  type LoginUserInput,
  type RegisterUserInput,
  type UpdateCurrentUserInput,
} from '@/lib/api/auth';
import type { User } from '@/lib/api/types';
import {
  AuthContext,
  type AuthContextValue,
  type AuthState,
} from '@/lib/auth/use-auth';

type AuthProviderProps = {
  children: ReactNode;
};

const initialAuthState: AuthState = {
  status: 'loading',
  user: null,
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);

  const refreshUser = useCallback(async (): Promise<User | null> => {
    try {
      const { user } = await getCurrentUser();
      setAuthState({ status: 'authenticated', user });
      return user;
    } catch {
      setAuthState({ status: 'unauthenticated', user: null });
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  const login = useCallback(async (input: LoginUserInput): Promise<User> => {
    const { user } = await loginUser(input);
    setAuthState({ status: 'authenticated', user });
    return user;
  }, []);

  const register = useCallback(
    async (input: RegisterUserInput): Promise<User> => {
      const { user } = await registerUser(input);
      setAuthState({ status: 'authenticated', user });
      return user;
    },
    [],
  );

  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutUser();
    } finally {
      setAuthState({ status: 'unauthenticated', user: null });
    }
  }, []);

  const updateUser = useCallback(
    async (input: UpdateCurrentUserInput): Promise<User> => {
      const { user } = await updateCurrentUser(input);
      setAuthState({ status: 'authenticated', user });
      return user;
    },
    [],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...authState,
      login,
      register,
      logout,
      refreshUser,
      updateUser,
    }),
    [authState, login, logout, refreshUser, register, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
