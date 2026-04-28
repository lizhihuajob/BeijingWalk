import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CulturePage from './pages/CulturePage';
import SpecialtiesPage from './pages/SpecialtiesPage';
import ScenicPage from './pages/ScenicPage';
import HeritagePage from './pages/HeritagePage';
import CultureDetail from './pages/CultureDetail';
import SpecialtyDetail from './pages/SpecialtyDetail';
import ScenicSpotDetail from './pages/ScenicSpotDetail';
import HeritageDetail from './pages/HeritageDetail';
import Guestbook from './pages/Guestbook';
import { trackPageView } from './services/analytics';

function RouteAnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    void trackPageView({
      pathname: location.pathname,
      title: document.title,
      referrer: document.referrer,
    });
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <>
      <RouteAnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/culture" element={<CulturePage />} />
        <Route path="/culture/:id" element={<CultureDetail />} />
        <Route path="/specialties" element={<SpecialtiesPage />} />
        <Route path="/specialty/:id" element={<SpecialtyDetail />} />
        <Route path="/scenic" element={<ScenicPage />} />
        <Route path="/scenic-spot/:id" element={<ScenicSpotDetail />} />
        <Route path="/heritage" element={<HeritagePage />} />
        <Route path="/heritage/:id" element={<HeritageDetail />} />
        <Route path="/guestbook" element={<Guestbook />} />
      </Routes>
    </>
  );
}

export default App;
