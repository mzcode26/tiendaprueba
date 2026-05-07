import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatCurrency = (amount: number, currency = 'ARS'): string =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency,
  }).format(amount);

export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const formatRelativeTime = (date: string | Date): string => {
  const now = new Date();
  const d = new Date(date);
  const diffInMs = now.getTime() - d.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
    return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
  }
  if (diffInHours > 0) {
    return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
  }
  return 'hace menos de una hora';
};
