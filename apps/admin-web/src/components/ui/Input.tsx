import type { InputHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = ({ label, error, className, ...props }: InputProps) => (
  <label className="block text-sm text-slate-300">
    {label ? <span className="mb-2 block text-slate-300">{label}</span> : null}
    <input
      className={cn(
        'w-full rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-slate-100 outline-none transition focus:border-slate-600 focus:ring-2 focus:ring-slate-700',
        error ? 'border-red-500 focus:border-red-400 focus:ring-red-500/30' : '',
        className,
      )}
      {...props}
    />
    {error ? <p className="mt-2 text-sm text-red-400">{error}</p> : null}
  </label>
);

export default Input;
