import { Menu, Bell, User, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/auth.store';

interface NavbarProps {
  onMenuClick: () => void;
  title: string;
}

export const Navbar = ({ onMenuClick, title }: NavbarProps) => {
  const { user, clearAuth } = useAuthStore();

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-900">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              3
            </span>
          </button>

          <div className="relative group">
            <button className="flex items-center space-x-2 p-2 rounded-md text-gray-700 hover:bg-gray-100">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden md:block text-sm font-medium">{user?.name || 'Usuario'}</span>
            </button>

            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
              <div className="py-1">
                <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs">{user?.email}</p>
                </div>
                <button
                  onClick={clearAuth}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
