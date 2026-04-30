import React, { useState } from 'react';
import { useMapContext } from '../contexts/MapContext';
import StaticMapComponent from './StaticMapComponent';
import { motion } from 'framer-motion';
import { Map, Globe, X } from 'lucide-react';

const MapWrapper = ({ 
  scenicSpots, 
  onSpotClick, 
  selectedSpot,
  showRoutePlanning = false,
  userLocation = null,
  showProviderSwitch = true,
  showMarkerPopup = true,
  showMarkers = true,
  className = ''
}) => {
  const { mapProvider, toggleMapProvider } = useMapContext();
  const [useRealMap, setUseRealMap] = useState(false);

  return (
    <div className={`relative w-full h-full ${className}`}>
      {showProviderSwitch && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-4 left-4 z-20"
        >
          <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-lg p-1 flex items-center gap-1">
            <button
              onClick={() => setUseRealMap(false)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                !useRealMap 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>静态地图</span>
            </button>
            <button
              onClick={() => setUseRealMap(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium transition-all ${
                useRealMap 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Globe className="w-4 h-4" />
              <span>交互地图</span>
            </button>
          </div>
        </motion.div>
      )}
      
      {useRealMap ? (
        <div className="w-full h-full relative">
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
            <div className="text-center p-6 bg-white rounded-2xl shadow-xl max-w-sm">
              <Globe className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="font-bold text-gray-900 mb-2">需要配置API密钥</h3>
              <p className="text-sm text-gray-600 mb-4">
                交互地图功能需要配置高德地图或百度地图的API密钥才能使用。
              </p>
              <div className="space-y-2 text-left text-xs text-gray-500">
                <p>1. 申请高德地图API密钥：https://lbs.amap.com/</p>
                <p>2. 申请百度地图API密钥：https://lbsyun.baidu.com/</p>
                <p>3. 在环境变量中配置密钥</p>
              </div>
              <button
                onClick={() => setUseRealMap(false)}
                className="mt-4 w-full px-4 py-2 bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-600 transition-colors"
              >
                使用静态地图
              </button>
            </div>
          </div>
          <div className="w-full h-full opacity-20">
            <StaticMapComponent
              scenicSpots={scenicSpots}
              onSpotClick={onSpotClick}
              selectedSpot={selectedSpot}
              showRoutePlanning={showRoutePlanning}
              userLocation={userLocation}
              showMarkerPopup={showMarkerPopup}
              showMarkers={showMarkers}
              className=""
            />
          </div>
        </div>
      ) : (
        <StaticMapComponent
          scenicSpots={scenicSpots}
          onSpotClick={onSpotClick}
          selectedSpot={selectedSpot}
          showRoutePlanning={showRoutePlanning}
          userLocation={userLocation}
          showMarkerPopup={showMarkerPopup}
          showMarkers={showMarkers}
          className=""
        />
      )}
    </div>
  );
};

export default MapWrapper;
