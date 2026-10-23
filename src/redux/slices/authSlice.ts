import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Buy2GoUser } from '../../interfaces';
import Cookies from 'js-cookie';
import { authService, LoginPayload } from '../../services/authService';
import { setLoggingOutFlag, RegisterPayload } from '../../api/api';

export interface AuthState {
  user: Buy2GoUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export function checkIsAdmin(user: any): boolean {
  if (!user) return false;
  const role = (
    user.roleName ||
    user.role ||
    user.userType ||
    user.authorities?.[0]?.authority ||
    user.roles?.[0] ||
    ''
  ).toString().toUpperCase();

  return (
    role === 'ADMIN' ||
    role === 'ROLE_ADMIN' ||
    role === 'SUPERADMIN' ||
    role === 'ROLE_SUPERADMIN' ||
    role === 'OWNER' ||
    role === 'ROLE_OWNER'
  );
}

export function checkIsOwner(user: any): boolean {
  if (!user) return false;
  const role = (
    user.roleName ||
    user.role ||
    user.authorities?.[0]?.authority ||
    ''
  ).toString().toUpperCase();

  return (
    role === 'OWNER' ||
    role === 'ROLE_OWNER' ||
    role === 'ADMIN' ||
    role === 'ROLE_ADMIN'
  );
}

export function checkIsCustomer(user: any): boolean {
  if (!user) return false;
  const role = (
    user.roleName ||
    user.role ||
    user.userType ||
    user.authorities?.[0]?.authority ||
    user.roles?.[0] ||
    ''
  ).toString().toUpperCase();

  return (
    role === 'CUSTOMER' ||
    role === 'ROLE_CUSTOMER' ||
    role === 'USER' ||
    role === 'ROLE_USER'
  );
}

// Helper to hydrate user from persistent session cookies
export const getInitialUser = (): Buy2GoUser | null => {
  const token = Cookies.get('accessToken');
  if (!token) return null;

  const userId = Cookies.get('userId');
  const userName = Cookies.get('userName');
  const role = Cookies.get('role');
  if (!userId && !userName && !role) return null;

  return {
    id: userId || 'user',
    email: userName || '',
    userName: userName || '',
    role: role || 'ROLE_CUSTOMER',
    roleName: role || 'ROLE_CUSTOMER',
    firstName: Cookies.get('firstName') || userName || '',
    lastName: Cookies.get('lastName') || '',
  };
};

const initialUser = getInitialUser();

const initialState: AuthState = {
  user: initialUser,
  isAuthenticated: !!Cookies.get('accessToken'),
  isAdmin: checkIsAdmin(initialUser),
  isOwner: checkIsOwner(initialUser),
  isLoading: false,
  error: null,
  token: Cookies.get('accessToken') || null,
};

/**
 * Fetch Current Authenticated User from Buy2Go backend (/api/auth/me)
 */
export const fetchCurrentUserAsync = createAsyncThunk(
  'auth/fetchCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getCurrentUser();
      const user = response?.data || response;
      if (!user) {
        return rejectWithValue('User profile not found');
      }
      const isAdmin = checkIsAdmin(user);
      const isOwner = checkIsOwner(user);
      return { user, isAdmin, isOwner };
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || error?.message || 'Failed to fetch user profile');
    }
  }
);

/**
 * Authenticate User with Buy2Go backend (/api/auth/login)
 */
export const loginAsync = createAsyncThunk(
  'auth/login',
  async (credentials: LoginPayload, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const data = response?.data || response;
      const token = data?.token || data?.accessToken;

      const rawRole = (
        data?.role ||
        data?.roleName ||
        data?.authorities?.[0]?.authority ||
        (credentials.email.toLowerCase().includes('admin') ? 'ROLE_ADMIN' : 'ROLE_CUSTOMER')
      ).toString().toUpperCase();

      const user: Buy2GoUser = {
        id: data?.id || data?.userId || 'user-' + Date.now(),
        firstName: data?.firstName || '',
        lastName: data?.lastName || '',
        email: data?.email || credentials.email,
        role: rawRole,
        roleName: rawRole,
        userName: data?.userName || data?.email,
      };

      const expiryDays = 7;
      const timestamp = Date.now().toString();

      if (token) {
        Cookies.set('accessToken', token, { expires: expiryDays });
      }

      if (user.id) {
        Cookies.set('userId', String(user.id), { expires: expiryDays });
      }

      Cookies.set('userName', user.userName || user.email || '', { expires: expiryDays });
      Cookies.set('role', user.role || 'ROLE_CUSTOMER', { expires: expiryDays });
      Cookies.set('firstName', user.firstName || '', { expires: expiryDays });
      Cookies.set('lastName', user.lastName || '', { expires: expiryDays });
      Cookies.set('loginTimestamp', timestamp, { expires: expiryDays });

      const isAdmin = checkIsAdmin(user);
      const isOwner = checkIsOwner(user);
      setLoggingOutFlag(false);

      return { user, token, isAdmin, isOwner };
    } catch (error: any) {
      if (
        !error.response ||
        error.code === 'ERR_NETWORK' ||
        error.code === 'ECONNABORTED' ||
        error.message?.includes('Network Error') ||
        !window.navigator.onLine
      ) {
        return rejectWithValue(
          'Unable to connect to Buy2Go server. Please check your backend connection.'
        );
      }
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details;

      return rejectWithValue(apiError || 'Invalid email or password');
    }
  }
);

/**
 * Register New User with Buy2Go backend (/api/auth/register)
 */
export const registerAsync = createAsyncThunk(
  'auth/register',
  async (payload: RegisterPayload, { rejectWithValue }) => {
    try {
      const response = await authService.register(payload);
      return response?.data || response;
    } catch (error: any) {
      const apiError =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details;
      return rejectWithValue(apiError || 'Failed to create account.');
    }
  }
);

/**
 * Clear session cookies and local storage
 */
export const clearAuthSessionCookies = () => {
  Cookies.remove('accessToken');
  Cookies.remove('userId');
  Cookies.remove('userName');
  Cookies.remove('role');
  Cookies.remove('firstName');
  Cookies.remove('lastName');
  Cookies.remove('loginTimestamp');
  try {
    const savedTheme = localStorage.getItem('buy2go-theme');
    localStorage.clear();
    sessionStorage.clear();
    if (savedTheme) {
      localStorage.setItem('buy2go-theme', savedTheme);
    }
  } catch {
    // ignore
  }
};

/**
 * Logout User
 */
export const logoutAsync = createAsyncThunk(
  'auth/logout',
  async () => {
    setLoggingOutFlag(true);
    clearAuthSessionCookies();
    await new Promise((r) => setTimeout(r, 150));
    return null;
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      setLoggingOutFlag(true);
      clearAuthSessionCookies();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isAdmin = false;
      state.isOwner = false;
      state.error = null;
    },
    setUser(state, action) {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isAdmin = checkIsAdmin(action.payload);
      state.isOwner = checkIsOwner(action.payload);
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAdmin = action.payload.isAdmin;
        state.isOwner = action.payload.isOwner;
        state.isAuthenticated = true;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Register
      .addCase(registerAsync.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerAsync.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(registerAsync.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Current User
      .addCase(fetchCurrentUserAsync.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAdmin = action.payload.isAdmin;
        state.isOwner = action.payload.isOwner;
        state.isAuthenticated = true;
      })
      // Logout
      .addCase(logoutAsync.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.isAdmin = false;
        state.isOwner = false;
      });
  },
});

export const { logout, setUser, clearError } = authSlice.actions;

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAdmin = (state: { auth: AuthState }) => state.auth.isAdmin;
export const selectIsOwner = (state: { auth: AuthState }) => state.auth.isOwner;
export const selectIsCustomer = (state: { auth: AuthState }) => checkIsCustomer(state.auth.user);
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;

export default authSlice.reducer;
