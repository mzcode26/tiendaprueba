import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

const variantStyles = {
  primary: 'bg-slate-100 text-slate-950 hover:bg-white',
  secondary: 'bg-slate-800 text-slate-100 hover:bg-slate-700',
};

const Button = ({ className, variant = 'primary', ...props }: ButtonProps) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-400',
      variantStyles[variant],
      className,
    )}
    {...props}
  />
);

export default Button;
