import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentPage from './pages/ContentPage';
import GuestbooksPage from './pages/GuestbooksPage';
import UsersPage from './pages/UsersPage';
import Profile from './pages/Profile';
import SiteConfigPage from './pages/SiteConfigPage';
import NavigationsPage from './pages/NavigationsPage';
import CategoriesPage from './pages/CategoriesPage';
import BookingGuidesPage from './pages/BookingGuidesPage';
import Login from './pages/Login';
import { Loader2 } from 'lucide-react';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return user ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/*"
        element={
          <PrivateRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/content" element={<ContentPage />} />
                <Route path="/guestbooks" element={<GuestbooksPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/site-config" element={<SiteConfigPage />} />
                <Route path="/navigations" element={<NavigationsPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/booking-guides" element={<BookingGuidesPage />} />
                <Route path="/profile" element={<Profile />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
