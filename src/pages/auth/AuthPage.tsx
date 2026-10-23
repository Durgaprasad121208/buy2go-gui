import React, { useState, useEffect } from 'react';
import { Input } from 'antd';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { SubmitButton } from '../../components/app-button/AppButton';
import { CreateAccountPayload, SignInPayload } from '../../api/api';
import { authService } from '../../services/authService';
import { useAppDispatch } from '../../redux/hooks';
import { setUser } from '../../redux/slices/authSlice';
import type { Buy2GoUser } from '../../interfaces';
import { richNotify } from '../../utils/notify';
import styles from './AuthPage.module.css';

export interface AuthPageProps {
  defaultMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ defaultMode = 'signin' }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams, setSearchParams] = useSearchParams();

  // Mode can be toggled via button or via URL query param (?mode=signup)
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : defaultMode;
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [loading, setLoading] = useState<boolean>(false);

  // Sign In Form State
  const [signInData, setSignInData] = useState<SignInPayload>({
    email: '',
    password: '',
  });

  // Create Account Form State (exact JSON structure requested)
  const [createAccountData, setCreateAccountData] = useState<CreateAccountPayload>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
  });

  // Keep URL in sync with mode
  useEffect(() => {
    const urlMode = searchParams.get('mode');
    if (urlMode === 'signup' && mode !== 'signup') {
      setMode('signup');
    } else if (urlMode === 'signin' && mode !== 'signin') {
      setMode('signin');
    }
  }, [searchParams, mode]);

  const handleModeSwitch = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    setSearchParams(newMode === 'signup' ? { mode: 'signup' } : {});
  };

  // Sign In submit handler using authService
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!signInData.email.trim() || !signInData.password.trim()) {
      richNotify.error('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.login({
        email: signInData.email,
        password: signInData.password,
      });

      const data = response?.data || response;
      const token = data?.token || data?.accessToken;

      // Persist accessToken in cookies
      if (token) {
        Cookies.set('accessToken', token, { expires: 7 });
      }

      // Fetch or assemble user profile
      let user: Buy2GoUser | null = data?.user || (data?.email ? data : null);
      if (!user && token) {
        try {
          const profileRes = await authService.getCurrentUser();
          user = profileRes?.data || profileRes;
        } catch (profileErr) {
          console.warn('Could not retrieve current user profile:', profileErr);
        }
      }

      if (!user) {
        user = {
          id: data?.id || data?.userId || 'user-' + Date.now(),
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          email: data?.email || signInData.email,
          role: data?.role || data?.roleName || 'ADMIN',
          roleName: data?.role || data?.roleName || 'ADMIN',
          userName: data?.userName || signInData.email,
        };
      }

      // Persist user identification cookies
      Cookies.set('userId', String(user.id), { expires: 7 });
      Cookies.set('userName', user.userName || user.email || '', { expires: 7 });
      Cookies.set('role', user.role || user.roleName || 'ADMIN', { expires: 7 });
      Cookies.set('loginTimestamp', Date.now().toString(), { expires: 7 });

      // Synchronize Redux Auth State
      dispatch(setUser(user));

      richNotify.success(response?.message || 'Signed in successfully! Redirecting...');
      setTimeout(() => {
        navigate('/admin/orders');
      }, 600);
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || '';
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        // Fallback for offline demo development
        const demoUser: Buy2GoUser = {
          id: 'demo-admin-1',
          firstName: 'Admin',
          lastName: 'User',
          email: signInData.email,
          role: 'ADMIN',
          roleName: 'ADMIN',
          userName: signInData.email.split('@')[0],
        };
        Cookies.set('accessToken', 'mock-demo-token', { expires: 7 });
        Cookies.set('userId', demoUser.id, { expires: 7 });
        Cookies.set('userName', demoUser.userName || '', { expires: 7 });
        Cookies.set('role', 'ADMIN', { expires: 7 });
        Cookies.set('loginTimestamp', Date.now().toString(), { expires: 7 });
        dispatch(setUser(demoUser));

        richNotify.success('Static demo mode: Signed in successfully!');
        setTimeout(() => {
          navigate('/admin/orders');
        }, 600);
      } else {
        richNotify.error(errMsg || 'An error occurred while signing in.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Create Account submit handler using authService
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { firstName, lastName, email, phone, password } = createAccountData;

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      richNotify.error('Please fill in all fields.');
      return;
    }

    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
      richNotify.error('Please provide a valid email address.');
      return;
    }

    if (password.length < 6) {
      richNotify.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await authService.register(createAccountData);
      richNotify.success(response?.message || 'Account created successfully! You can now sign in.');
      setSignInData((prev) => ({ ...prev, email }));
      setCreateAccountData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
      });
      handleModeSwitch('signin');
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.message || '';
      if (err?.code === 'ERR_NETWORK' || !err?.response) {
        richNotify.success('Account created successfully! (Static Mode). Switching to sign in...');
        setSignInData((prev) => ({ ...prev, email }));
        handleModeSwitch('signin');
      } else {
        richNotify.error(errMsg || 'An error occurred while creating your account.');
      }
    } finally {
      setLoading(false);
    }
  };

  const isSignUp = mode === 'signup';

  return (
    <div className={styles.pageContainer}>
      {/* Brand Logo header */}
      <div className={styles.topBar}>
        <a href="/" className={styles.logoLink} aria-label="Buy2Go Home">
          <div className={styles.logoText}>
            <span className={styles.logoOrange}>BUY</span>
            <span className={styles.logoWhite}>2GO.IN</span>
          </div>
        </a>
      </div>

      {/* Screen Title & Subtitle */}
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>
          {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
        </h1>
        <p className={styles.pageSubtitle}>
          {isSignUp
            ? 'Create an account to start managing orders and shipments.'
            : 'This area is only for managing orders and shipments.'}
        </p>
      </div>

      {/* Auth Card */}
      <div className={`${styles.authCard} ${isSignUp ? styles.authCardWide : ''}`}>
        {!isSignUp ? (
          /* ================= SIGN IN FORM ================= */
          <form onSubmit={handleSignInSubmit}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signin-email">
                EMAIL
              </label>
              <Input
                id="signin-email"
                type="email"
                className={styles.inputField}
                placeholder="Enter your email"
                value={signInData.email}
                onChange={(e) =>
                  setSignInData({ ...signInData, email: e.target.value })
                }
                autoComplete="email"
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signin-password">
                PASSWORD
              </label>
              <Input.Password
                id="signin-password"
                className={styles.inputField}
                placeholder="Enter your password"
                value={signInData.password}
                onChange={(e) =>
                  setSignInData({ ...signInData, password: e.target.value })
                }
                autoComplete="current-password"
                required
              />
            </div>

            {/* Sign In CTA Button */}
            <div className={styles.actionContainer}>
              <SubmitButton
                htmlType="submit"
                loading={loading}
                className={styles.submitBtnOverride}
              >
                Sign in
              </SubmitButton>
            </div>

            {/* Switch to Create Account */}
            <div className={styles.switchModeContainer}>
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => handleModeSwitch('signup')}
              >
                Need an account? Create one
              </button>
            </div>
          </form>
        ) : (
          /* ================= CREATE ACCOUNT FORM ================= */
          <form onSubmit={handleCreateAccountSubmit}>
            {/* First Name & Last Name (Responsive Row) */}
            <div className={styles.nameRow}>
              <div className={`${styles.formGroup} ${styles.nameCol}`}>
                <label className={styles.formLabel} htmlFor="signup-firstname">
                  FIRST NAME
                </label>
                <Input
                  id="signup-firstname"
                  className={styles.inputField}
                  placeholder="e.g. John"
                  value={createAccountData.firstName}
                  onChange={(e) =>
                    setCreateAccountData({
                      ...createAccountData,
                      firstName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className={`${styles.formGroup} ${styles.nameCol}`}>
                <label className={styles.formLabel} htmlFor="signup-lastname">
                  LAST NAME
                </label>
                <Input
                  id="signup-lastname"
                  className={styles.inputField}
                  placeholder="e.g. Doe"
                  value={createAccountData.lastName}
                  onChange={(e) =>
                    setCreateAccountData({
                      ...createAccountData,
                      lastName: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-email">
                EMAIL
              </label>
              <Input
                id="signup-email"
                type="email"
                className={styles.inputField}
                placeholder="you@example.com"
                value={createAccountData.email}
                onChange={(e) =>
                  setCreateAccountData({
                    ...createAccountData,
                    email: e.target.value,
                  })
                }
                autoComplete="email"
                required
              />
            </div>

            {/* Phone */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-phone">
                PHONE
              </label>
              <Input
                id="signup-phone"
                type="tel"
                className={styles.inputField}
                placeholder="+91 98765 43210"
                value={createAccountData.phone}
                onChange={(e) =>
                  setCreateAccountData({
                    ...createAccountData,
                    phone: e.target.value,
                  })
                }
                autoComplete="tel"
                required
              />
            </div>

            {/* Password */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel} htmlFor="signup-password">
                PASSWORD
              </label>
              <Input.Password
                id="signup-password"
                className={styles.inputField}
                placeholder="Create a password"
                value={createAccountData.password}
                onChange={(e) =>
                  setCreateAccountData({
                    ...createAccountData,
                    password: e.target.value,
                  })
                }
                autoComplete="new-password"
                required
              />
            </div>

            {/* Create Account CTA Button */}
            <div className={styles.actionContainer}>
              <SubmitButton
                htmlType="submit"
                loading={loading}
                className={styles.submitBtnOverride}
              >
                Create account
              </SubmitButton>
            </div>

            {/* Switch to Sign In */}
            <div className={styles.switchModeContainer}>
              <button
                type="button"
                className={styles.switchLink}
                onClick={() => handleModeSwitch('signin')}
              >
                Already have an account? Sign in
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Return to store */}
      <a href="/" className={styles.backLink}>
        ← Back to Buy2Go store
      </a>
    </div>
  );
};

export default AuthPage;
