interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-4',
};

export const LoadingSpinner = ({ size = 'md', fullScreen = false }: LoadingSpinnerProps) => (
  <div
    className={`flex items-center justify-center ${fullScreen ? 'min-h-screen' : 'min-h-[240px]'} px-4 py-6`}
  >
    <div className={`animate-spin rounded-full border-gray-300 border-t-blue-600 ${sizes[size]}`} />
  </div>
);

export default LoadingSpinner;
