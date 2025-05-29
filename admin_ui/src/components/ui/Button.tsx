import React from 'react';
import clsx from 'clsx';

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost';
  size?: 'base' | 'sm';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'primary',
  size = 'base',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded transition';
  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    ghost:
      'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300',
  };
  const sizeStyles = {
    base: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1 text-xs',
  };

  return (
    <button
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
