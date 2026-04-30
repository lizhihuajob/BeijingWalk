import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, X, Navigation, Star, Clock, Ticket, ChevronRight, Layers, Locate } from 'lucide-react';
import { loadAmap, wgs84ToGcj02, getDistance } from '../utils/mapLoader';

const AmapComponent = ({ 
  scenicSpots, 
  onSpotClick, 
  selectedSpot,
  showRoutePlanning = false,
  userLocation = null,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [currentLayer, setCurrentLayer] = useState('standard');

  const initMap = useCallback(async () => {
    try {
      const AMap = await loadAmap();
      
      if (!mapContainerRef.current) return;
      
      const centerLat = scenicSpots.length > 0 
        ? scenicSpots.reduce((sum, spot) => sum + spot.latitude, 0) / scenicSpots.length
        : 39.9042;
      const centerLng = scenicSpots.length > 0
        ? scenicSpots.reduce((sum, spot) => sum + spot.longitude, 0) / scenicSpots.length
        : 116.4074;
      
      const gcj02Center = wgs84ToGcj02(centerLat, centerLng);
      
      mapRef.current = new AMap.Map(mapContainerRef.current, {
        zoom: 11,
        center: [gcj02Center.lng, gcj02Center.lat],
        mapStyle: 'amap://styles/whitesmoke',
        zoomControl: false,
      });
      
      AMap.plugin(['AMap.ToolBar', 'AMap.Scale'], () => {
        mapRef.current.addControl(new AMap.ToolBar({
          position: 'RT'
        }));
        mapRef.current.addControl(new AMap.Scale());
      });
      
      setMapLoaded(true);
      
      addMarkers(AMap, scenicSpots);
      
    } catch (error) {
      console.error('Failed to load AMap:', error);
    }
  }, [scenicSpots]);

  const addMarkers = (AMap, spots) => {
    if (!mapRef.current) return;
    
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];
    
    spots.forEach((spot) => {
      const gcj02 = wgs84ToGcj02(spot.latitude, spot.longitude);
      
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div class="relative">
          <div class="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg border-2 border-white">
            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
            </svg>
          </div>
          ${spot.is_featured ? '<div class="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full border-2 border-white flex items-center justify-center"><span class="text-xs">⭐</span></div>' : ''}
        </div>
      `;
      
      const marker = new AMap.Marker({
        position: [gcj02.lng, gcj02.lat],
        content: markerContent,
        offset: new AMap.Pixel(-20, -40),
        zIndex: spot.is_featured ? 150 : 100
      });
      
      marker.on('click', () => {
        if (onSpotClick) {
          onSpotClick(spot);
        }
      });
      
      marker.setMap(mapRef.current);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapLoaded && scenicSpots.length > 0) {
      const AMap = window.AMap;
      if (AMap) {
        addMarkers(AMap, scenicSpots);
      }
    }
  }, [scenicSpots, mapLoaded]);

  useEffect(() => {
    if (mapLoaded && selectedSpot && mapRef.current) {
      const gcj02 = wgs84ToGcj02(selectedSpot.latitude, selectedSpot.longitude);
      mapRef.current.setZoomAndCenter(14, [gcj02.lng, gcj02.lat]);
    }
  }, [selectedSpot, mapLoaded]);

  const handleLayerChange = (layer) => {
    setCurrentLayer(layer);
    setShowLayers(false);
    if (mapRef.current) {
      const styles = {
        standard: 'amap://styles/whitesmoke',
        dark: 'amap://styles/dark',
        light: 'amap://styles/light',
        satellite: 'amap://styles/satellite'
      };
      mapRef.current.setMapStyle(styles[layer] || styles.standard);
    }
  };

  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const gcj02 = wgs84ToGcj02(latitude, longitude);
          if (mapRef.current) {
            mapRef.current.setZoomAndCenter(15, [gcj02.lng, gcj02.lat]);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
        }
      );
    }
  };

  useEffect(() => {
    initMap();
    
    return () => {
      if (mapRef.current) {
        mapRef.current.destroy();
        mapRef.current = null;
      }
    };
  }, [initMap]);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <div 
        ref={mapContainerRef} 
        className="w-full h-full"
      />
      
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLocate}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        >
          <Locate className="w-5 h-5" />
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowLayers(!showLayers)}
          className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center text-gray-700 hover:bg-white transition-colors"
        >
          <Layers className="w-5 h-5" />
        </motion.button>
      </div>
      
      <AnimatePresence>
        {showLayers && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute top-16 right-4 z-10 bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-2"
          >
            {[
              { id: 'standard', label: '标准' },
              { id: 'dark', label: '深色' },
              { id: 'light', label: '浅色' },
              { id: 'satellite', label: '卫星' }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => handleLayerChange(layer.id)}
                className={`w-full px-4 py-2 text-sm rounded-xl transition-colors ${
                  currentLayer === layer.id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {layer.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedSpot && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-4 left-4 right-4 z-10 max-w-md"
        >
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden">
            <div className="relative h-40">
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
              <div className="absolute bottom-4 left-4">
                <h3 className="text-xl font-bold text-white drop-shadow-lg">
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
              
              <button
                onClick={() => {
                  if (onSpotClick) {
                    onSpotClick(selectedSpot, 'navigate');
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all"
              >
                <Navigation className="w-4 h-4" />
                查看详情
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AmapComponent;
