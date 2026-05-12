import React, { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { useAuthStore } from '../stores/auth.store';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import LoadingSpinner from '../components/common/LoadingSpinner';
import NotFound from '../pages/NotFound';
import POSPage from '../features/sales/pages/POSPage';


const LoginPage = lazy(() => import('../features/auth/pages/LoginPage'));
const DashboardPage = lazy(() => import('../pages/DashboardPage'));
const ProductsPage = lazy(() => import('../features/products/pages/ProductsPage'));
const InventoryPage = lazy(() => import('../features/inventory/pages/InventoryPage'));
const SalesPage = lazy(() => import('../features/sales/pages/SalesPage'));
const CustomersPage = lazy(() => import('../features/customers/pages/CustomersPage'));
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage'));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage'));

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const UnauthenticatedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <UnauthenticatedRoute>
        <AuthLayout>
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        </AuthLayout>
      </UnauthenticatedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: 'products',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ProductsPage />
          </Suspense>
        ),
      },
      {
        path: 'inventory',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <InventoryPage />
          </Suspense>
        ),
      },
      {
        path: 'sales',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SalesPage />
          </Suspense>
        ),
      },
      {
        path: 'customers',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <CustomersPage />
          </Suspense>
        ),
      },
      {
        path: 'reports',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <ReportsPage />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<LoadingSpinner />}>
            <SettingsPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
  {
  path: '/pos',
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      index: true,
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <POSPage />
        </Suspense>
      ),
    },
  ],
},
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
