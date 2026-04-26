import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, Loader2 } from 'lucide-react';
import Header from './components/Header';
import Banner from './components/Banner';
import CultureSection from './components/CultureSection';
import SpecialtiesSection from './components/SpecialtiesSection';
import ScenicSection from './components/ScenicSection';
import HeritageSection from './components/HeritageSection';
import Footer from './components/Footer';
import { getAllData } from './services/api';

function HomePage() {
  const [data, setData] = useState({
    banners: [],
    cultures: [],
    specialties: [],
    scenic_spots: [],
    heritages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getAllData();
        setData(result);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError('加载数据失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading && data.banners.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main>
        <Banner banners={data.banners} loading={loading} />
        
        <CultureSection cultures={data.cultures} loading={loading} />
        
        <SpecialtiesSection specialties={data.specialties} loading={loading} />
        
        <ScenicSection scenicSpots={data.scenic_spots} loading={loading} />
        
        <HeritageSection heritages={data.heritages} loading={loading} />
      </main>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-lg z-50"
        >
          <p className="text-sm">{error}</p>
        </motion.div>
      )}
    </div>
  );
}

export default HomePage;
