import { useState } from 'react';

import { TenantSettingsForm } from '../components/TenantSettingsForm';
import { StoresManager } from '../components/StoresManager';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

type Tab = 'general' | 'stores' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('general');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Configuración
        </h1>

        <p className="text-muted-foreground">
          Administración general del sistema
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            General
          </button>

          <button
            onClick={() => setActiveTab('stores')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'stores'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sucursales
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`pb-3 text-sm font-medium transition-colors ${
              activeTab === 'security'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Seguridad
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'general' && (
          <TenantSettingsForm />
        )}

        {activeTab === 'stores' && (
          <StoresManager />
        )}

        {activeTab === 'security' && (
          <ChangePasswordForm />
        )}
      </div>
    </div>
  );
}