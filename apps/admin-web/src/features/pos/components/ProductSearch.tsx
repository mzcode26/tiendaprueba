import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../../../lib/axios';
import type { POSProduct } from '../../sales/types/sales.types';

interface Props {
  storeId: string;
  onSelect: (variant: POSProduct) => void;
}

function unwrapProducts(payload: unknown): POSProduct[] {
  if (Array.isArray(payload)) return payload as POSProduct[];
  if (payload && typeof payload === 'object') {
    const p = payload as { items?: POSProduct[]; data?: { items?: POSProduct[]; data?: POSProduct[] } };
    if (Array.isArray(p.items)) return p.items;
    if (Array.isArray(p.data?.items)) return p.data.items;
    if (Array.isArray(p.data?.data)) return p.data.data;
  }
  return [];
}

export function ProductSearch({ storeId, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<POSProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();

    if (q.length < 2 || !storeId) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        console.log('BUSCANDO POS =>', { q, storeId });

        const { data } = await api.get('/pos/search', {
          params: { q, storeId },
        });

        console.log('RESPUESTA POS =>', data);
        setResults(unwrapProducts(data?.data));
      } catch (error) {
        console.error('Error buscando productos POS', error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => window.clearTimeout(timer);
  }, [query, storeId]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto... (F2)"
          className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3 text-center text-sm text-gray-400">
          Buscando...
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((variant) => (
            <button
              key={variant.variantId}
              onClick={() => {
                onSelect(variant);
                setQuery('');
                setResults([]);
              }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left border-b last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{variant.productName}</p>
                <p className="text-xs text-gray-500">
                  SKU: {variant.sku}
                  {variant.size && ` · Talle: ${variant.size}`}
                  {variant.color && ` · Color: ${variant.color}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-indigo-600">${variant.price.toFixed(2)}</p>
                <p className={`text-xs ${variant.stock <= 0 ? 'text-red-500' : 'text-gray-400'}`}>
                  Stock: {variant.stock}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}