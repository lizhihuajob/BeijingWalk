import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  MapPin, Search, Filter, Star, ArrowLeft, 
  Map, Globe, Layers, Info, Clock, Ticket
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import MapWrapper from '../components/MapWrapper';
import NearbyRecommendations from '../components/NearbyRecommendations';
import { getScenicSpotsForMap, recordSearchHistory } from '../services/api';
import { useI18n } from '../i18n';

const generateVisitorId = () => {
  let visitorId = localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('visitor_id', visitorId);
  }
  return visitorId;
};

const generateSessionId = () => {
  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

const MapPage = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [scenicSpots, setScenicSpots] = useState([]);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const searchTimeoutRef = useRef(null);
  const visitorIdRef = useRef(null);
  const sessionIdRef = useRef(null);
  const lastSearchTermRef = useRef('');

  useEffect(() => {
    visitorIdRef.current = generateVisitorId();
    sessionIdRef.current = generateSessionId();
  }, []);

  const handleSearch = async (keyword, results) => {
    if (!keyword || keyword.trim() === '') return;
    if (keyword === lastSearchTermRef.current) return;
    
    lastSearchTermRef.current = keyword;
    
    try {
      await recordSearchHistory({
        keyword: keyword.trim(),
        visitor_id: visitorIdRef.current,
        session_id: sessionIdRef.current,
        search_type: 'map',
        results_count: results.length
      });
    } catch (err) {
      console.error('Failed to record search history:', err);
    }
  };

  useEffect(() => {
    const fetchScenicSpots = async () => {
      try {
        setLoading(true);
        const data = await getScenicSpotsForMap();
        setScenicSpots(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scenic spots:', err);
        setError(t('map.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchScenicSpots();
  }, [language, t]);

  const filteredSpots = scenicSpots.filter(spot => {
    const matchesSearch = spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (spot.location && spot.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFeatured = !filterFeatured || spot.is_featured;
    return matchesSearch && matchesFeatured;
  });

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (searchQuery && searchQuery.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch(searchQuery, filteredSpots);
      }, 800);
    } else {
      lastSearchTermRef.current = '';
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, filteredSpots]);

  const handleSpotClick = (spot, action) => {
    if (action === 'navigate' || (spot && !action)) {
      navigate(`/scenic-spot/${spot.id}`);
    } else {
      setSelectedSpot(spot);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">{t('common.returnHome')}</span>
                </motion.button>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <Map className="w-6 h-6 text-blue-500" />
                    {t('map.title')}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {t('map.subtitle')}
                  </p>
                </div>
              </div>
              
              <div className="hidden md:flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('map.searchPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                  />
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterFeatured(!filterFeatured)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    filterFeatured
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Star className={`w-4 h-4 ${filterFeatured ? 'fill-amber-400' : ''}`} />
                  {t('map.featuredSpots')}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          <div className={`${showSidebar ? 'w-full md:w-80' : 'w-0 md:w-0'} bg-white border-r border-gray-200 overflow-y-auto transition-all duration-300`}>
            {showSidebar && (
              <div className="p-4">
                <div className="md:hidden mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder={t('map.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {t('map.spotList')} ({filteredSpots.length})
                </h3>
                
                <div className="space-y-3">
                  {filteredSpots.map((spot) => (
                    <motion.button
                      key={spot.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSpotClick(spot)}
                      className={`w-full text-left p-3 rounded-2xl transition-all ${
                        selectedSpot?.id === spot.id
                          ? 'bg-blue-50 border-2 border-blue-500'
                          : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={spot.image_url}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className="font-semibold text-gray-900 truncate">
                              {spot.name}
                            </h4>
                            {spot.is_featured && (
                              <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0 ml-1" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {spot.location || t('map.beijing')}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {spot.recommended_duration || t('map.defaultDuration')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Ticket className="w-3 h-3" />
                              {spot.ticket_price_peak || t('map.ticketRequired')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 md:hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowSidebar(!showSidebar)}
                className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-sm font-medium text-gray-700"
              >
                {showSidebar ? t('map.hideList') : t('map.showList')}
              </motion.button>
            </div>
            
            {loading ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-500">{t('map.loadingMap')}</p>
                </div>
              </div>
            ) : error ? (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="text-center">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {t('common.retry')}
                  </button>
                </div>
              </div>
            ) : (
              <MapWrapper
                scenicSpots={filteredSpots}
                onSpotClick={handleSpotClick}
                selectedSpot={selectedSpot}
                showProviderSwitch={true}
                className="w-full h-full"
              />
            )}
          </div>
        </div>
        
        {selectedSpot && (
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-500" />
                {t('map.nearbyRecommendations', { name: selectedSpot.name })}
              </h2>
              <NearbyRecommendations scenicSpotId={selectedSpot.id} />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default MapPage;
