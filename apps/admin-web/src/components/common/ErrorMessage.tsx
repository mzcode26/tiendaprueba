import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  className?: string;
}

const ErrorMessage = ({ message, className = '' }: ErrorMessageProps) => (
  <div className={`rounded-2xl border border-red-700 bg-red-950/90 p-4 text-red-100 ${className}`}>
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-1 h-5 w-5 text-red-400" />
      <p className="text-sm leading-6">{message}</p>
    </div>
  </div>
);

export default ErrorMessage;
