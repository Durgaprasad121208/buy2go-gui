import type { ThemeConfig } from 'antd';
import { theme as antdTheme } from 'antd';

/**
 * Buy2Go Brand Color Tokens (Single Theme: Dark & Brand Orange)
 */
export const themeTokens = {
  colors: {
    primary: '#FF5E00',
    primaryHover: '#FF7724',
    primaryActive: '#E04E00',
    primarySubtle: 'rgba(255, 94, 0, 0.12)',
    primaryGlow: 'rgba(255, 94, 0, 0.35)',
    primaryText: '#000000', // Black text on primary orange buttons as per spec

    bgBase: '#0B0B0C',
    bgContainer: '#141416',
    bgElevated: '#1E1E22',
    bgSpotlight: '#26262B',
    bgHeader: '#0D0907',
    bgFooter: '#17130F',

    borderSubtle: '#242428',
    borderBase: '#333338',
    borderFocus: '#FF5E00',

    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1A8',
    textTertiary: '#6E6E77',
    textDisabled: '#4A4A52',

    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
  },
  borderRadius: {
    sm: 6,
    base: 8,
    lg: 12,
    full: 9999,
  },
  controlHeight: {
    sm: 36,
    base: 44,
    lg: 50,
  },
} as const;

/**
 * Ant Design ConfigProvider Theme Configuration
 * Apply this to <ConfigProvider theme={antdThemeConfig}> for unified Ant Design styling.
 */
export const antdThemeConfig: ThemeConfig = {
  algorithm: antdTheme.darkAlgorithm,
  token: {
    colorPrimary: themeTokens.colors.primary,
    colorPrimaryHover: themeTokens.colors.primaryHover,
    colorPrimaryActive: themeTokens.colors.primaryActive,
    colorPrimaryText: themeTokens.colors.primaryText,

    colorBgBase: themeTokens.colors.bgBase,
    colorBgContainer: themeTokens.colors.bgContainer,
    colorBgElevated: themeTokens.colors.bgElevated,
    colorBgSpotlight: themeTokens.colors.bgSpotlight,

    colorBorder: themeTokens.colors.borderBase,
    colorBorderSecondary: themeTokens.colors.borderSubtle,

    colorText: themeTokens.colors.textPrimary,
    colorTextSecondary: themeTokens.colors.textSecondary,
    colorTextTertiary: themeTokens.colors.textTertiary,
    colorTextDisabled: themeTokens.colors.textDisabled,

    borderRadius: themeTokens.borderRadius.base,
    controlHeight: themeTokens.controlHeight.base,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
  components: {
    Button: {
      borderRadius: themeTokens.borderRadius.base,
      controlHeight: themeTokens.controlHeight.base,
      controlHeightLG: themeTokens.controlHeight.lg,
      controlHeightSM: themeTokens.controlHeight.sm,
      fontWeight: 600,
      primaryColor: themeTokens.colors.primaryText, // black text on primary button
      primaryShadow: 'none',
    },
    Notification: {
      colorBgElevated: '#14100E',
      colorText: '#FFFFFF',
      colorTextHeading: '#FFFFFF',
    },
  },
};
