import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import api from '../../../../lib/axios';
import type { ProductVariant } from '../../types/sales.types';

interface Props {
  onSelect: (variant: ProductVariant) => void;
}

export function ProductSearch({ onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const { data } = await api.get('/pos/search', { params: { q: query } });
        setResults(data.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por nombre, SKU o código..."
          className="w-full pl-9 pr-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>
      {results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map(variant => (
            <button
              key={variant.id}
              onClick={() => { onSelect(variant); setQuery(''); setResults([]); }}
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
      {isLoading && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg p-3 text-center text-sm text-gray-400">
          Buscando...
        </div>
      )}
    </div>
  );
}