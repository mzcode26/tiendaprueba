import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  LayoutDashboard,
  Package,
  Package2,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  X
} from 'lucide-react';

interface SidebarProps {
  onClose?: () => void;
}

const navigation = [
  {
    name: 'GENERAL',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    name: 'CATÁLOGO',
    items: [
      { name: 'Productos', href: '/products', icon: Package },
    ],
  },
  {
    name: 'OPERACIONES',
    items: [
      { name: 'Inventario', href: '/inventory', icon: Package2 },
      { name: 'Ventas', href: '/sales', icon: ShoppingCart },
      { name: 'POS', href: '/pos', icon: ShoppingCart },
    ],
  },
  {
    name: 'CLIENTES',
    items: [
      { name: 'Clientes', href: '/customers', icon: Users },
    ],
  },
  {
    name: 'ADMINISTRACIÓN',
    items: [
      { name: 'Reportes', href: '/reports', icon: BarChart3 },
      { name: 'Configuración', href: '/settings', icon: Settings },
    ],
  },
];

export const Sidebar = ({ onClose }: SidebarProps) => {
  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200">
        <div className="flex items-center">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Package className="h-5 w-5 text-white" />
          </div>
          <span className="ml-2 text-lg font-semibold text-gray-900">Tienda</span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-8 px-4 py-6">
        {navigation.map((section) => (
          <div key={section.name}>
            <h3 className="mb-2 px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              {section.name}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon
                    className={cn(
                      'mr-3 h-5 w-5 flex-shrink-0',
                      'group-hover:text-gray-500'
                    )}
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
};
