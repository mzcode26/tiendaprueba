import { Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Product } from '../types/product.types';
import { formatCurrency } from '../../../lib/utils';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export function ProductsTable({ products, onEdit, onDelete }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!products.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-sm">No hay productos para mostrar</p>
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead className="bg-gray-50 border-b">
        <tr>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Producto</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Categoría</th>
          <th className="text-left px-4 py-3 font-medium text-gray-600">Marca</th>
          <th className="text-right px-4 py-3 font-medium text-gray-600">Precio</th>
          <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
          <th className="text-center px-4 py-3 font-medium text-gray-600">Variantes</th>
          <th className="px-4 py-3" />
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {products.map((product) => (
          <>
            <tr key={product.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 font-medium text-gray-900">{product.name}</td>
              <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
              <td className="px-4 py-3 text-gray-500">{product.category?.name ?? '—'}</td>
              <td className="px-4 py-3 text-gray-500">{product.brand?.name ?? '—'}</td>
              <td className="px-4 py-3 text-right font-medium">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                  product.isActive
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}>
                  {product.isActive ? 'Activo' : 'Inactivo'}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                {product.variants.length > 0 ? (
                  <button
                    onClick={() => setExpanded(expanded === product.id ? null : product.id)}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs"
                  >
                    {product.variants.length}
                    {expanded === product.id
                      ? <ChevronUp className="w-3 h-3" />
                      : <ChevronDown className="w-3 h-3" />}
                  </button>
                ) : (
                  <span className="text-gray-400 text-xs">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1">
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(product)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>

            {/* Variants row */}
            {expanded === product.id && product.variants.length > 0 && (
              <tr key={`${product.id}-variants`} className="bg-blue-50/50">
                <td colSpan={8} className="px-8 py-3">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500">
                        <th className="text-left py-1 font-medium">SKU</th>
                        <th className="text-left py-1 font-medium">Talle</th>
                        <th className="text-left py-1 font-medium">Color</th>
                        <th className="text-right py-1 font-medium">Precio</th>
                        <th className="text-center py-1 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-blue-100">
                      {product.variants.map((v) => (
                        <tr key={v.id}>
                          <td className="py-1.5 font-mono">{v.sku}</td>
                          <td className="py-1.5">{v.size ?? '—'}</td>
                          <td className="py-1.5">{v.color ?? '—'}</td>
                          <td className="py-1.5 text-right">{formatCurrency(v.price)}</td>
                          <td className="py-1.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              v.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                            }`}>
                              {v.isActive ? 'Activa' : 'Inactiva'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
              </tr>
            )}
          </>
        ))}
      </tbody>
    </table>
  );
}