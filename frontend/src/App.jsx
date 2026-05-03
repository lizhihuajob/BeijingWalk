import React, { useEffect } from 'react';
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
import TicketBookingGuide from './pages/TicketBookingGuide';
import MapPage from './pages/MapPage';
import TravelPackagesPage from './pages/TravelPackagesPage';
import TravelPackageDetail from './pages/TravelPackageDetail';
import SearchResultsPage from './pages/SearchResultsPage';
import ItineraryPage from './pages/ItineraryPage';
import { MapProvider } from './contexts/MapContext';
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
    <MapProvider>
      <RouteAnalyticsTracker />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/culture" element={<CulturePage />} />
        <Route path="/culture/:id" element={<CultureDetail />} />
        <Route path="/specialties" element={<SpecialtiesPage />} />
        <Route path="/specialty/:id" element={<SpecialtyDetail />} />
        <Route path="/scenic" element={<ScenicPage />} />
        <Route path="/scenic-spot/:id" element={<ScenicSpotDetail />} />
        <Route path="/ticket-guide/:id" element={<TicketBookingGuide />} />
        <Route path="/heritage" element={<HeritagePage />} />
        <Route path="/heritage/:id" element={<HeritageDetail />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/travel-packages" element={<TravelPackagesPage />} />
        <Route path="/travel-package/:id" element={<TravelPackageDetail />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/itinerary" element={<ItineraryPage />} />
      </Routes>
    </MapProvider>
  );
}

export default App;
