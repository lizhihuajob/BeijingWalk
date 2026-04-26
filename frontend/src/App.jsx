import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CultureDetail from './pages/CultureDetail';
import SpecialtyDetail from './pages/SpecialtyDetail';
import ScenicSpotDetail from './pages/ScenicSpotDetail';
import HeritageDetail from './pages/HeritageDetail';
import Guestbook from './pages/Guestbook';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/culture/:id" element={<CultureDetail />} />
      <Route path="/specialty/:id" element={<SpecialtyDetail />} />
      <Route path="/scenic-spot/:id" element={<ScenicSpotDetail />} />
      <Route path="/heritage/:id" element={<HeritageDetail />} />
      <Route path="/guestbook" element={<Guestbook />} />
    </Routes>
  );
}

export default App;
