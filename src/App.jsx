import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/AdminLayout';

// Public Pages
import HomePage from './pages/HomePage';
import PublicProductsPage from './pages/PublicProductsPage';
import PublicQuotePage from './pages/PublicQuotePage';

// Admin Portal Pages
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminQuotationsPage from './pages/admin/AdminQuotationsPage';
import AdminEnquiriesPage from './pages/admin/AdminEnquiriesPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminEmployeesPage from './pages/admin/AdminEmployeesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Website Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<PublicProductsPage />} />
          <Route path="/quote" element={<PublicQuotePage />} />
          <Route path="/contact" element={<HomePage />} />

          {/* Admin Authentication */}
          <Route path="/admin/login" element={<AdminLoginPage />} />

          {/* Protected Admin Portal Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="quotations" element={<AdminQuotationsPage />} />
            <Route path="enquiries" element={<AdminEnquiriesPage />} />
            <Route path="products" element={<AdminProductsPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="employees" element={<AdminEmployeesPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminUsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
