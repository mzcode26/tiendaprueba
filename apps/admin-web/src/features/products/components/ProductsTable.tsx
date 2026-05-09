import { Pencil, Trash2 } from 'lucide-react';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: Props) {
  if (!products.length) return (
    <div className="text-center py-12 text-gray-400">
      <p>No hay productos registrados</p>
    </div>
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-xs text-gray-500 uppercase border-b bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Producto</th>
            <th className="px-4 py-3 text-left">SKU</th>
            <th className="px-4 py-3 text-left">Categoría</th>
            <th className="px-4 py-3 text-left">Marca</th>
            <th className="px-4 py-3 text-right">Precio</th>
            <th className="px-4 py-3 text-center">Variantes</th>
            <th className="px-4 py-3 text-center">Estado</th>
            <th className="px-4 py-3 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {products.map(product => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 font-medium text-gray-800">{product.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-gray-500">{product.sku}</td>
              <td className="px-4 py-3 text-gray-500">{product.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{product.brand?.name ?? '—'}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {product.variants?.length ?? 0}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  product.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center gap-2">
                  <button onClick={() => onEdit(product)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(product)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}