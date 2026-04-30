import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Star, Clock, Ticket, ChevronRight, Layers, Locate, ExternalLink } from 'lucide-react';
import { wgs84ToGcj02, getDistance } from '../utils/mapLoader';

const StaticMapComponent = ({ 
  scenicSpots, 
  onSpotClick, 
  selectedSpot,
  showRoutePlanning = false,
  userLocation = null,
  showMarkerPopup = true,
  showMarkers = true,
  className = ''
}) => {
  const [userPos, setUserPos] = useState(userLocation);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    if (!userLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Geolocation error:', error);
        }
      );
    }
  }, [userLocation]);

  const centerLat = scenicSpots.length > 0 
    ? scenicSpots.reduce((sum, spot) => sum + spot.latitude, 0) / scenicSpots.length
    : 39.9042;
  const centerLng = scenicSpots.length > 0
    ? scenicSpots.reduce((sum, spot) => sum + spot.longitude, 0) / scenicSpots.length
    : 116.4074;

  const getSpotPosition = (spot) => {
    const minLat = Math.min(...scenicSpots.map(s => s.latitude)) - 0.02;
    const maxLat = Math.max(...scenicSpots.map(s => s.latitude)) + 0.02;
    const minLng = Math.min(...scenicSpots.map(s => s.longitude)) - 0.03;
    const maxLng = Math.max(...scenicSpots.map(s => s.longitude)) + 0.03;
    
    const latRange = maxLat - minLat;
    const lngRange = maxLng - minLng;
    
    const x = ((spot.longitude - minLng) / lngRange) * 100;
    const y = ((maxLat - spot.latitude) / latRange) * 100;
    
    return { x, y };
  };

  const openInMap = (spot) => {
    const amapUrl = `https://uri.amap.com/marker?position=${spot.longitude},${spot.latitude}&name=${encodeURIComponent(spot.name)}`;
    window.open(amapUrl, '_blank');
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div className="w-full h-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
        
        <div className="absolute inset-0">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path 
              d="M 10 30 Q 30 25 50 30 T 90 30" 
              fill="none" 
              stroke="rgba(59, 130, 246, 0.15)" 
              strokeWidth="0.5"
            />
            <path 
              d="M 5 50 Q 25 45 50 50 T 95 50" 
              fill="none" 
              stroke="rgba(99, 102, 241, 0.15)" 
              strokeWidth="0.5"
            />
            <path 
              d="M 10 70 Q 35 65 60 70 T 90 70" 
              fill="none" 
              stroke="rgba(139, 92, 246, 0.15)" 
              strokeWidth="0.5"
            />
            <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(59, 130, 246, 0.1)" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(99, 102, 241, 0.1)" strokeWidth="0.3" />
          </svg>
        </div>
        
        {showMarkers && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="flex items-center gap-1 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-xs text-gray-600">
              <ExternalLink className="w-3 h-3" />
              <span>点击标记打开外部地图</span>
            </div>
          </div>
        )}
        
        {showMarkers && scenicSpots.map((spot, index) => {
          const pos = getSpotPosition(spot);
          const isSelected = selectedSpot?.id === spot.id;
          
          return (
            <motion.div
              key={spot.id || index}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              style={{ 
                left: `${pos.x}%`, 
                top: `${pos.y}%`,
                transform: 'translate(-50%, -100%)'
              }}
              className="absolute z-20 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                if (onSpotClick) {
                  onSpotClick(spot);
                }
              }}
            >
              <motion.div
                whileHover={{ scale: 1.15, y: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-all ${
                    isSelected 
                      ? 'bg-gradient-to-r from-amber-400 to-orange-500 scale-110' 
                      : spot.is_featured 
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}>
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  
                  {spot.is_featured && !isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-xs">⭐</span>
                    </div>
                  )}
                  
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1">
                    <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-white" />
                  </div>
                </div>
                
                {isSelected && showMarkerPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 whitespace-nowrap"
                  >
                    <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-xl p-3 min-w-48">
                      <p className="font-bold text-gray-900 text-sm">{spot.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{spot.location}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onSpotClick) {
                              onSpotClick(spot, 'navigate');
                            }
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-medium rounded-xl hover:shadow-md transition-all"
                        >
                          <Navigation className="w-3 h-3" />
                          查看详情
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openInMap(spot);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          打开地图
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
        
        {userPos && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute z-10"
            style={{
              left: '50%',
              top: '45%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-blue-500 border-3 border-white shadow-lg" />
              <div className="absolute inset-0 w-5 h-5 rounded-full bg-blue-400 animate-ping opacity-75" />
            </div>
          </motion.div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowInfo(!showInfo)}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        >
          <Layers className="w-5 h-5" />
        </motion.button>
      </div>
      
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-16 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 w-64"
          >
            <h4 className="font-bold text-gray-900 mb-2 text-sm">地图说明</h4>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
                <span>景点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500" />
                <span>推荐景点</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-blue-500" />
                <span>您的位置</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-3 pt-3 border-t border-gray-100">
              点击景点标记可查看详情和导航
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedSpot && !showInfo && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-10 max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-32">
              <img
                src={selectedSpot.image_url}
                alt={selectedSpot.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <button
                onClick={() => onSpotClick && onSpotClick(null)}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3">
                <h3 className="text-lg font-bold text-white drop-shadow-lg">
                  {selectedSpot.name}
                </h3>
                {selectedSpot.is_featured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-400/90 text-xs font-medium rounded-full mt-1">
                    <Star className="w-3 h-3" />
                    推荐景点
                  </span>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-gray-500">位置</p>
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {selectedSpot.location || '北京市'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Clock className="w-4 h-4 text-indigo-500" />
                  </div>
                  <p className="text-xs text-gray-500">游览时间</p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedSpot.recommended_duration || '2-3小时'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Ticket className="w-4 h-4 text-purple-500" />
                  </div>
                  <p className="text-xs text-gray-500">门票</p>
                  <p className="text-xs font-medium text-gray-700">
                    {selectedSpot.ticket_price_peak || '需购票'}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (onSpotClick) {
                      onSpotClick(selectedSpot, 'navigate');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
                >
                  <Navigation className="w-4 h-4" />
                  查看详情
                </button>
                <button
                  onClick={() => openInMap(selectedSpot)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  打开地图
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default StaticMapComponent;
