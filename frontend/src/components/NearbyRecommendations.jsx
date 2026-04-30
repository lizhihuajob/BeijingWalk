import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UtensilsCrossed, Landmark, ShoppingBag, Star, MapPin,
  ChevronRight, Loader2, X, ExternalLink, Navigation
} from 'lucide-react';
import { getNearbyRecommendations } from '../services/api';

const CATEGORY_CONFIG = {
  food: {
    icon: UtensilsCrossed,
    label: '美食推荐',
    color: 'red',
    gradient: 'from-red-400 to-orange-500',
    bgLight: 'from-red-50 to-orange-50',
    borderColor: 'border-red-200'
  },
  culture: {
    icon: Landmark,
    label: '文化场所',
    color: 'blue',
    gradient: 'from-blue-400 to-indigo-500',
    bgLight: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200'
  },
  specialty: {
    icon: ShoppingBag,
    label: '特产购物',
    color: 'purple',
    gradient: 'from-purple-400 to-pink-500',
    bgLight: 'from-purple-50 to-pink-50',
    borderColor: 'border-purple-200'
  }
};

const NearbyRecommendations = ({ scenicSpotId, className = '' }) => {
  const [activeCategory, setActiveCategory] = useState('food');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!scenicSpotId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await getNearbyRecommendations(scenicSpotId);
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to fetch nearby recommendations:', err);
        setError('加载周边推荐失败');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [scenicSpotId]);

  const getCurrentItems = () => {
    if (!recommendations) return [];
    return recommendations[activeCategory] || [];
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
          <p className="text-gray-500 text-sm">加载周边推荐...</p>
        </div>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <p className="text-gray-500">{error || '暂无周边推荐'}</p>
        </div>
      </div>
    );
  }

  const items = getCurrentItems();

  return (
    <div className={className}>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
          const IconComponent = config.icon;
          const count = recommendations[key]?.length || 0;
          
          return (
            <motion.button
              key={key}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                activeCategory === key
                  ? `bg-gradient-to-r ${config.gradient} text-white shadow-lg`
                  : `bg-white border ${config.borderColor} text-gray-700 hover:shadow-md`
              }`}
            >
              <IconComponent className="w-4 h-4" />
              <span>{config.label}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeCategory === key
                  ? 'bg-white/20'
                  : 'bg-gray-100'
              }`}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-gray-500">该分类暂无推荐</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, index) => {
            const config = CATEGORY_CONFIG[activeCategory];
            return (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedItem(item)}
                className={`bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer border ${config.borderColor}`}
              >
                <div className="relative h-40">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="text-xs font-medium text-gray-700">{item.rating}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h4 className="font-bold text-gray-900 mb-2">{item.name}</h4>
                  
                  <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{item.address}</span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-500 font-medium">
                      {item.distance}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              
              <div className="relative h-56">
                <img
                  src={selectedItem.image_url}
                  alt={selectedItem.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {selectedItem.name}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span className="font-medium">{selectedItem.rating}</span>
                    </span>
                    <span className="text-white/80">{selectedItem.distance}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700">{selectedItem.address}</p>
                </div>
                
                <p className="text-gray-600 leading-relaxed mb-6">
                  {selectedItem.description}
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => {
                      if (selectedItem.latitude && selectedItem.longitude) {
                        const url = `https://uri.amap.com/navigation?to=${selectedItem.longitude},${selectedItem.latitude},${encodeURIComponent(selectedItem.name)}&mode=car&coordinate=gaode&callnative=0`;
                        window.open(url, '_blank');
                      } else {
                        const searchUrl = `https://uri.amap.com/search?keyword=${encodeURIComponent(selectedItem.name)}&view=map`;
                        window.open(searchUrl, '_blank');
                      }
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-xl hover:shadow-lg transition-all active:scale-95"
                  >
                    <Navigation className="w-4 h-4" />
                    导航前往
                  </button>
                  <button 
                    onClick={() => {
                      const searchUrl = `https://uri.amap.com/search?keyword=${encodeURIComponent(selectedItem.name)}&view=map`;
                      window.open(searchUrl, '_blank');
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    地图搜索
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NearbyRecommendations;
