import { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Package, Warehouse, ShoppingCart,
  Monitor, Users, BarChart2, Settings, ShoppingBag, LogOut, X,
} from 'lucide-react';
import { useLogout } from '../features/auth/hooks/useAuth';
import { useAuthStore } from '../stores/auth.store';
import { Navbar } from '../components/common/Navbar';

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

const getPageTitle = (pathname: string): string => {
  const item = NAV_ITEMS.find(nav => nav.to === pathname);
  return item?.label || 'Dashboard';
};

export default function DashboardLayout() {
  const logout = useLogout();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarCompact, setSidebarCompact] = useState(false);

  const pageTitle = getPageTitle(location.pathname);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div
        className="flex items-center gap-2 px-6 py-4 border-b cursor-pointer hover:bg-gray-50"
        onClick={() => {
          navigate('/dashboard');
          setSidebarOpen(false);
        }}
      >
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
          <ShoppingBag className="w-4 h-4 text-white" />
        </div>
        {!sidebarCompact && <span className="font-bold text-gray-900">Tienda</span>}
      </div>

      {/* Nav */}
      <nav className={`flex-1 px-4 py-3 overflow-y-auto ${sidebarCompact ? 'space-y-2' : 'space-y-0.5'}`}>
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`
            }
            title={sidebarCompact ? label : undefined}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {!sidebarCompact && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* User + Logout */}
      <div className="border-t p-3 space-y-1">
        {user && !sidebarCompact && (
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
          title={sidebarCompact ? 'Cerrar sesión' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!sidebarCompact && <span className="truncate">Cerrar sesión</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Expandible */}
      <aside className={`hidden md:flex bg-white border-r flex-col shrink-0 transition-all duration-300 ${
        sidebarCompact ? 'w-20' : 'w-56'
      }`}>
        <SidebarContent />
      </aside>

      {/* Mobile Overlay Sidebar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-white border-r flex flex-col transition-transform duration-300 ease-in-out md:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-4 border-b">
          <span className="font-bold text-gray-900">Menú</span>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar 
          onMenuClick={() => {
            if (window.innerWidth < 768) {
              setSidebarOpen(!sidebarOpen);
            } else {
              setSidebarCompact(!sidebarCompact);
            }
          }} 
          title={pageTitle} 
        />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}