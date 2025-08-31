import { useReducer, useEffect } from 'react';
import type { FC, PropsWithChildren } from 'react';
import { AuthContext } from './AuthContext';
import { authReducer, initialState } from './reducer';
import { AUTH_STORAGE_KEY } from '../../../constants';
import { authApi } from '../services/auth';

export const AuthProvider: FC<PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = localStorage.getItem(AUTH_STORAGE_KEY);

    if (token) {
      authApi
        .me()
        .then((user) => {
          dispatch({ type: 'SET_USER', payload: user });
          dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        })
        .catch(() => {
          localStorage.removeItem(AUTH_STORAGE_KEY);
          dispatch({ type: 'LOGIN_FAILURE' });
        })
        .finally(() => {
          dispatch({ type: 'SET_LOADING', payload: false });
        });
    } else {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });

      localStorage.setItem(AUTH_STORAGE_KEY, response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error) {
      throw error;
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await authApi.signup({ name, email, password });

      localStorage.setItem(AUTH_STORAGE_KEY, response.token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: response });
    } catch (error) {
      throw error;
    }
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword({ email });
  };

  const resetPassword = async (code: string, newPassword: string) => {
    await authApi.resetPassword({ code, newPassword });
  };

  const sendVerificationEmail = async (email: string) => {
    await authApi.sendVerificationEmail({ email });
  };

  const verifyEmail = async (code: string) => {
    await authApi.verifyEmail({ code });
  };

  const updateEmail = async (newEmail: string) => {
    await authApi.updateEmail({ newEmail });
    if (state.user) {
      dispatch({ type: 'SET_USER', payload: { ...state.user, email: newEmail } });
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await authApi.updatePassword({ currentPassword, newPassword });
  };

  const logout = () => {
    authApi.logout();
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
        sendVerificationEmail,
        verifyEmail,
        updateEmail,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};