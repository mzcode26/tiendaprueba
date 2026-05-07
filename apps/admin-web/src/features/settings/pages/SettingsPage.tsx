import { useState } from 'react';
import { Building2, Store, Lock } from 'lucide-react';
import { TenantSettingsForm } from '../components/TenantSettingsForm';
import { StoresManager } from '../components/StoresManager';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

const TABS = [
  { id: 'tenant', label: 'Negocio', icon: Building2 },
  { id: 'stores', label: 'Tiendas', icon: Store },
  { id: 'security', label: 'Seguridad', icon: Lock },
] as const;

type TabId = typeof TABS[number]['id'];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('tenant');

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white border rounded-xl p-6">
        {activeTab === 'tenant' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Información del negocio</h2>
            <TenantSettingsForm />
          </div>
        )}
        {activeTab === 'stores' && <StoresManager />}
        {activeTab === 'security' && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Cambiar contraseña</h2>
            <ChangePasswordForm />
          </div>
        )}
      </div>
    </div>
  );
}