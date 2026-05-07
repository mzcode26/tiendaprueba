import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Monitor, Users, BarChart2, Settings, ShoppingBag, LogOut,
} from 'lucide-react';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';

const NAV_ITEMS = [
  { to: '/dashboard',  label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/products',   label: 'Productos',   icon: Package },
  { to: '/inventory',  label: 'Inventario',  icon: Warehouse },
  { to: '/sales',      label: 'Ventas',      icon: ShoppingCart },
  { to: '/pos',        label: 'POS',         icon: Monitor },
  { to: '/customers',  label: 'Clientes',    icon: Users },
  { to: '/reports',    label: 'Reportes',    icon: BarChart2 },
  { to: '/settings',   label: 'Configuración', icon: Settings },
];

export default function DashboardLayout() {
  const logout = useLogout();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r flex flex-col shrink-0">
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-4 py-4 border-b cursor-pointer"
          onClick={() => navigate('/dashboard')}
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <ShoppingBag className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900">Tienda</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="border-t p-3 space-y-1">
          {user && (
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-gray-800 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => logout.mutate()}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}