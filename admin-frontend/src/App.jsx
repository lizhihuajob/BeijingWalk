import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import GuestbooksPage from './pages/GuestbooksPage';
import UsersPage from './pages/UsersPage';
import Profile from './pages/Profile';
import Login from './pages/Login';
import BannersPage from './pages/BannersPage';
import CulturesPage from './pages/CulturesPage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import ScenicSpotsPage from './pages/ScenicSpotsPage';
import HeritagesPage from './pages/HeritagesPage';
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
                <Route path="/guestbooks" element={<GuestbooksPage />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/content/banners" element={<BannersPage />} />
                <Route path="/content/cultures" element={<CulturesPage />} />
                <Route path="/content/specialties" element={<SpecialtiesPage />} />
                <Route path="/content/scenic-spots" element={<ScenicSpotsPage />} />
                <Route path="/content/heritages" element={<HeritagesPage />} />
              </Routes>
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
