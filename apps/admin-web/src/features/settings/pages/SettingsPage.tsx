import { useState } from 'react';
import { StoresManager } from '../components/StoresManager';

type SettingsTab = 'general' | 'stores' | 'security';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('stores');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-gray-500">
          Administración general del sistema
        </p>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'general'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            General
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stores')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'stores'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Sucursales
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === 'security'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
            }`}
          >
            Seguridad
          </button>
        </nav>
      </div>

      <div>
        {activeTab === 'stores' && <StoresManager />}

        {activeTab === 'general' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">General</h2>
            <p className="mt-2 text-sm text-gray-500">
              Esta sección queda disponible para datos generales del sistema,
              como nombre comercial, moneda, ubicación o identidad visual.
            </p>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">Seguridad</h2>
            <p className="mt-2 text-sm text-gray-500">
              Esta sección queda disponible para cambios de contraseña,
              permisos, sesiones y controles de acceso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}