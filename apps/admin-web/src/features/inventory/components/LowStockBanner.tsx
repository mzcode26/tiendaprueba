import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  lowStockCount: number;
  outOfStockCount: number;
  onFilterLowStock: () => void;
}

export function LowStockBanner({ lowStockCount, outOfStockCount, onFilterLowStock }: Props) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || (lowStockCount === 0 && outOfStockCount === 0)) return null;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
        <p className="text-sm text-yellow-800">
          {outOfStockCount > 0 && <><strong>{outOfStockCount}</strong> productos sin stock. </>}
          {lowStockCount > 0 && <><strong>{lowStockCount}</strong> productos con stock bajo.</>}
          {' '}
          <button onClick={onFilterLowStock} className="underline font-medium hover:text-yellow-900">
            Ver productos
          </button>
        </p>
      </div>
      <button onClick={() => setDismissed(true)} className="text-yellow-500 hover:text-yellow-700">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}