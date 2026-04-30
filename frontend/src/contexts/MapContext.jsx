import React, { createContext, useContext, useState, useEffect } from 'react';

const MapContext = createContext();

export const useMapContext = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
};

export const MapProvider = ({ children }) => {
  const [mapProvider, setMapProvider] = useState(() => {
    const saved = localStorage.getItem('mapProvider');
    return saved || 'amap';
  });
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);

  useEffect(() => {
    localStorage.setItem('mapProvider', mapProvider);
  }, [mapProvider]);

  const toggleMapProvider = () => {
    setMapProvider(prev => prev === 'amap' ? 'baidu' : 'amap');
    setIsMapLoaded(false);
    setMapError(null);
  };

  const value = {
    mapProvider,
    setMapProvider,
    toggleMapProvider,
    isMapLoaded,
    setIsMapLoaded,
    mapError,
    setMapError,
  };

  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
};

export default MapContext;
