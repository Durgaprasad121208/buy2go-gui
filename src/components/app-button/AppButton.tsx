import React from 'react';
import { Button as AntButton, ButtonProps } from 'antd';
import styles from './AppButton.module.css';

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  /** Button visual style variant matching the Buy2Go design system */
  variant?: 'submit' | 'cancel' | 'outline' | 'dark' | 'primary';
}

/**
 * SubmitButton - Primary CTA button (Solid brand orange fill, black text)
 * Perfect for: Checkout, "Buy now — COD", Form submissions, Save actions
 */
export const SubmitButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <AntButton
      type="primary"
      {...props}
      className={`${styles.submitBtn} ${className}`.trim()}
    />
  );
};

/**
 * CancelButton / OutlineButton - Secondary CTA button (Transparent bg, brand orange border & text)
 * Perfect for: "Add to cart", Cancel actions, Secondary navigation
 */
export const CancelButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <AntButton
      {...props}
      className={`${styles.cancelBtn} ${className}`.trim()}
    />
  );
};

/**
 * OutlineButton - Explicit alias for the orange border / orange text button (Image 1 "Add to cart")
 */
export const OutlineButton: React.FC<ButtonProps> = (props) => {
  return <CancelButton {...props} />;
};

/**
 * DarkButton - Dark surface button (Dark container bg, subtle border, white text - Image 2 "Add to cart")
 */
export const DarkButton: React.FC<ButtonProps> = ({ className = '', ...props }) => {
  return (
    <AntButton
      {...props}
      className={`${styles.darkBtn} ${className}`.trim()}
    />
  );
};

/**
 * AppButton - Universal button component with variant support
 */
export const AppButton: React.FC<AppButtonProps> = ({
  variant = 'submit',
  className = '',
  ...props
}) => {
  let variantClass = styles.submitBtn;

  if (variant === 'cancel' || variant === 'outline') {
    variantClass = styles.cancelBtn;
  } else if (variant === 'dark') {
    variantClass = styles.darkBtn;
  }

  return (
    <AntButton
      type={variant === 'submit' || variant === 'primary' ? 'primary' : props.type}
      {...props}
      className={`${variantClass} ${className}`.trim()}
    />
  );
};

export default AppButton;
