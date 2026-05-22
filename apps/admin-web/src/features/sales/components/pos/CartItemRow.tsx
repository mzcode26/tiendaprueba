import { Minus, Plus, Trash2 } from 'lucide-react';
import type { CartItem } from '../../types/sales.types';

interface Props {
  item: CartItem;
  onUpdateQuantity: (variantId: string, quantity: number) => void;
  onRemove: (variantId: string) => void;
}

export function CartItemRow({ item, onUpdateQuantity, onRemove }: Props) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
        <p className="text-xs text-gray-500">
          SKU: {item.sku}
          {item.size && ` · ${item.size}`}
          {item.color && ` · ${item.color}`}
        </p>
        <p className="text-xs text-indigo-600 font-medium">${item.unitPrice.toFixed(2)} c/u</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateQuantity(item.variantId, item.quantity - 1)}
          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          disabled={item.quantity <= 1}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.variantId, item.quantity + 1)}
          className="h-6 w-6 rounded-full border flex items-center justify-center hover:bg-gray-100 disabled:opacity-40"
          disabled={item.quantity >= item.stock}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <div className="text-right min-w-[60px]">
        <p className="text-sm font-semibold">${(item.unitPrice * item.quantity).toFixed(2)}</p>
      </div>
      <button onClick={() => onRemove(item.variantId)} className="text-red-400 hover:text-red-600">
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}