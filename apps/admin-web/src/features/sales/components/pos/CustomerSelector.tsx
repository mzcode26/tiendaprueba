import { useState, useEffect } from 'react';
import { User, X } from 'lucide-react';
import api from '../../../../lib/axios';

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}

interface Props {
  selectedCustomer: Customer | null;
  onSelect: (customer: Customer | null) => void;
}

export function CustomerSelector({ selectedCustomer, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Customer[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/customers', { params: { search: query, limit: 5 } });
        setResults(data.data?.data ?? []);
      } catch {
        setResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  if (selectedCustomer) {
    return (
      <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-indigo-600" />
          <div>
            <p className="text-sm font-medium text-indigo-900">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </p>
            {selectedCustomer.email && (
              <p className="text-xs text-indigo-600">{selectedCustomer.email}</p>
            )}
          </div>
        </div>
        <button onClick={() => onSelect(null)} className="text-indigo-400 hover:text-indigo-600">
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setIsOpen(true); }}
        onFocus={() => setIsOpen(true)}
        placeholder="Buscar cliente (opcional)..."
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {results.map(c => (
            <button
              key={c.id}
              onClick={() => { onSelect(c); setQuery(''); setIsOpen(false); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left border-b last:border-0"
            >
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                {c.email && <p className="text-xs text-gray-500">{c.email}</p>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}