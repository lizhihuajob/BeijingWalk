import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Sun, Coffee, Moon, 
  Check, X, ArrowRight, ArrowLeft, 
  RefreshCw, Building, Utensils, 
  Map, TrendingUp, Clock, Info
} from 'lucide-react';
import { getScenicSpots, generateItinerary } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SPOT_TYPES = {
  '皇家园林': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: '🏯' },
  '寺庙': { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '⛩️' },
  '胡同': { color: 'bg-green-100 text-green-700 border-green-200', icon: '🏘️' },
  '博物馆': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '🏛️' },
};

const ItineraryPage = () => {
  const [step, setStep] = useState(1);
  const [allSpots, setAllSpots] = useState([]);
  const [selectedSpots, setSelectedSpots] = useState([]);
  const [days, setDays] = useState(1);
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeSpotType, setActiveSpotType] = useState('all');

  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const data = await getScenicSpots();
        setAllSpots(data || []);
      } catch (err) {
        console.error('Failed to fetch spots:', err);
      }
    };

    fetchSpots();
  }, []);

  const filteredSpots = activeSpotType === 'all' 
    ? allSpots 
    : allSpots.filter((spot) => spot.spot_type === activeSpotType);

  const spotTypes = ['all', '皇家园林', '寺庙', '胡同', '博物馆'];

  const toggleSpot = (spot) => {
    setSelectedSpots((prev) => {
      const exists = prev.find((s) => s.id === spot.id);
      if (exists) {
        return prev.filter((s) => s.id !== spot.id);
      } else {
        return [...prev, spot];
      }
    });
  };

  const moveSpot = (spotId, direction) => {
    setSelectedSpots((prev) => {
      const index = prev.findIndex((s) => s.id === spotId);
      if (index === -1) return prev;
      
      const newSpots = [...prev];
      if (direction === 'up' && index > 0) {
        [newSpots[index], newSpots[index - 1]] = [newSpots[index - 1], newSpots[index]];
      } else if (direction === 'down' && index < prev.length - 1) {
        [newSpots[index], newSpots[index + 1]] = [newSpots[index + 1], newSpots[index]];
      }
      return newSpots;
    });
  };

  const handleGenerate = async () => {
    if (selectedSpots.length === 0) {
      setError('请至少选择一个景点');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await generateItinerary(
        selectedSpots.map((s) => s.id),
        days,
        { include_dinner: true }
      );
      setItinerary(data);
      setStep(3);
    } catch (err) {
      setError('生成行程失败，请稍后重试');
      console.error('Generate itinerary error:', err);
    } finally {
      setLoading(false);
    }
  };

  const resetItinerary = () => {
    setStep(1);
    setSelectedSpots([]);
    setDays(1);
    setItinerary(null);
    setError(null);
  };

  const getTimeBlockIcon = (type) => {
    switch (type) {
      case 'morning': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'afternoon': return <Coffee className="w-5 h-5 text-blue-500" />;
      case 'evening': return <Moon className="w-5 h-5 text-indigo-500" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTimeBlockColor = (type) => {
    switch (type) {
      case 'morning': return 'from-amber-400 to-orange-400';
      case 'afternoon': return 'from-blue-400 to-cyan-400';
      case 'evening': return 'from-indigo-400 to-purple-400';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 md:pt-24">
        <div className="bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-white"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
                <Map className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                智能行程规划
              </h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                选择您想去的景点和天数，我们将为您智能规划最佳行程
              </p>

              <div className="flex items-center justify-center gap-4 mt-8">
                {[1, 2, 3].map((s) => (
                  <React.Fragment key={s}>
                    <motion.div
                      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all duration-300 ${
                        step >= s
                          ? 'bg-white text-orange-500 shadow-lg'
                          : 'bg-white/20 text-white/60'
                      }`}
                      whileHover={{ scale: step >= s ? 1.1 : 1 }}
                    >
                      {step > s ? <Check className="w-5 h-5" /> : s}
                    </motion.div>
                    {s < 3 && (
                      <div className={`w-16 h-1 rounded-full transition-all duration-300 ${
                        step > s ? 'bg-white' : 'bg-white/20'
                      }`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
              <div className="flex items-center justify-center gap-8 mt-2">
                {['选择景点', '设置天数', '查看行程'].map((label, index) => (
                  <span
                    key={label}
                    className={`text-sm font-medium transition-colors duration-300 ${
                      step >= index + 1 ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 mb-1">
                      选择您想去的景点
                    </h2>
                    <p className="text-gray-500">
                      已选择 <span className="text-orange-500 font-semibold">{selectedSpots.length}</span> 个景点
                    </p>
                  </div>
                  {selectedSpots.length > 0 && (
                    <button
                      onClick={() => setStep(2)}
                      className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center gap-2"
                    >
                      下一步 <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto">
                  {spotTypes.map((type) => (
                    <motion.button
                      key={type}
                      onClick={() => setActiveSpotType(type)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        activeSpotType === type
                          ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
                          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {type === 'all' ? '全部' : (
                        <span className="flex items-center gap-1.5">
                          <span>{SPOT_TYPES[type]?.icon}</span>
                          {type}
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center gap-2"
                  >
                    <Info className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpots.map((spot) => {
                    const isSelected = selectedSpots.some((s) => s.id === spot.id);
                    const typeInfo = SPOT_TYPES[spot.spot_type] || SPOT_TYPES['皇家园林'];

                    return (
                      <motion.div
                        key={spot.id}
                        onClick={() => toggleSpot(spot)}
                        className={`group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 ${
                          isSelected
                            ? 'ring-2 ring-orange-400 shadow-lg'
                            : 'bg-white shadow-sm hover:shadow-md'
                        }`}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="relative h-40">
                          <img
                            src={spot.image_url}
                            alt={spot.name}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          
                          {isSelected && (
                            <div className="absolute top-3 right-3">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Check className="w-5 h-5 text-white" />
                              </motion.div>
                            </div>
                          )}

                          <div className="absolute bottom-3 left-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm bg-white/90 text-gray-700">
                              <span>{typeInfo.icon}</span>
                              {spot.spot_type}
                            </span>
                          </div>

                          <div className="absolute bottom-3 right-3">
                            <h3 className="text-white font-bold text-lg drop-shadow-md">
                              {spot.name}
                            </h3>
                          </div>
                        </div>

                        <div className="p-4">
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {spot.description?.substring(0, 80)}
                          </p>
                          <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
                            {spot.location && <span className="truncate flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {spot.location}
                            </span>}
                            {spot.recommended_duration && <span>
                              建议游览 {spot.recommended_duration}
                            </span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {filteredSpots.length === 0 && (
                  <div className="text-center py-16">
                    <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">暂无该类型的景点</p>
                  </div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <Calendar className="w-6 h-6 text-orange-500" />
                      选择行程天数
                    </h2>

                    <div className="grid grid-cols-3 gap-3 mb-8">
                      {[1, 2, 3, 4, 5, 7].map((d) => (
                        <motion.button
                          key={d}
                          onClick={() => setDays(d)}
                          className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                            days === d
                              ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <div className="text-2xl font-bold">{d}</div>
                          <div className="text-sm mt-1">{d}天</div>
                        </motion.button>
                      ))}
                    </div>

                    <div className="bg-amber-50 rounded-2xl p-4 mb-6">
                      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-amber-500" />
                        行程概览
                      </h3>
                      <ul className="text-sm text-gray-600 space-y-1.5">
                        <li>• 已选择 <span className="font-semibold text-orange-600">{selectedSpots.length}</span> 个景点</li>
                        <li>• 行程共 <span className="font-semibold text-orange-600">{days}</span> 天</li>
                        <li>• 平均每天 <span className="font-semibold text-orange-600">{Math.ceil(selectedSpots.length / days)}</span> 个景点</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setStep(1)}
                        className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        上一步
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={loading || selectedSpots.length === 0}
                        className="flex-1 py-3 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            生成行程
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-6 h-6 text-orange-500" />
                      已选景点（可调整顺序）
                    </h2>

                    {selectedSpots.length === 0 ? (
                      <div className="text-center py-12">
                        <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">还没有选择景点</p>
                        <button
                          onClick={() => setStep(1)}
                          className="mt-3 text-orange-500 hover:text-orange-600 text-sm font-medium"
                        >
                          去选择景点 →
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {selectedSpots.map((spot, index) => {
                          const typeInfo = SPOT_TYPES[spot.spot_type] || SPOT_TYPES['皇家园林'];

                          return (
                            <motion.div
                              key={spot.id}
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                            >
                              <div className="text-gray-400 text-sm font-semibold w-6 text-center">
                                {index + 1}
                              </div>
                              <img
                                src={spot.image_url}
                                alt={spot.name}
                                className="w-14 h-14 rounded-lg object-cover"
                              />
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 truncate">
                                  {spot.name}
                                </h4>
                                <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border typeInfo.color}>
                                  <span>{typeInfo.icon}</span>
                                  {spot.spot_type}
                                </span>
                              </div>
                              <div className="flex flex-col gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSpot(spot.id, 'up');
                                  }}
                                  disabled={index === 0}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowLeft className="w-4 h-4 text-gray-500 rotate-90" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveSpot(spot.id, 'down');
                                  }}
                                  disabled={index === selectedSpots.length - 1}
                                  className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                                >
                                  <ArrowLeft className="w-4 h-4 text-gray-500 -rotate-90" />
                                </button>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSpot(spot);
                                }}
                                className="p-1.5 hover:bg-red-100 rounded-full transition-colors"
                              >
                                <X className="w-4 h-4 text-red-500" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && itinerary && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="bg-white rounded-3xl shadow-sm p-6 mb-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        🎉 您的专属行程已生成！
                      </h2>
                      <p className="text-gray-500">
                        共 <span className="font-semibold text-orange-500">{itinerary.summary.total_days}</span> 天，
                        <span className="font-semibold text-orange-500">{itinerary.summary.total_spots}</span> 个景点
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={resetItinerary}
                        className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full font-medium hover:bg-gray-200 transition-colors flex items-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        重新规划
                      </button>
                      <button
                        onClick={() => window.print()}
                        className="px-6 py-2.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full font-medium hover:shadow-lg transition-all duration-300"
                      >
                        打印行程
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 mt-6">
                    <div className="bg-amber-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-amber-700 mb-1">预算参考</h4>
                      <p className="text-gray-600 text-sm">{itinerary.summary.estimated_budget}</p>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-blue-700 mb-1">最佳季节</h4>
                      <p className="text-gray-600 text-sm">{itinerary.summary.best_season}</p>
                    </div>
                    <div className="bg-green-50 rounded-2xl p-4">
                      <h4 className="font-semibold text-green-700 mb-1">景点列表</h4>
                      <p className="text-gray-600 text-sm">
                        {itinerary.summary.spots.map((s) => s.name).join('、')}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  {itinerary.itinerary.map((day, dayIndex) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: dayIndex * 0.1 }}
                    >
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 text-white font-bold text-lg shadow-lg">
                          {day.day}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {day.title}
                          </h3>
                          <p className="text-gray-500 text-sm">
                            {day.activities.length} 个行程安排
                          </p>
                        </div>
                      </div>

                      <div className="relative pl-8">
                        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200"></div>

                        {day.activities.map((activity, activityIndex) => (
                          <motion.div
                            key={activityIndex}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: activityIndex * 0.05 }}
                            className="relative mb-6"
                          >
                            <div className={`absolute -left-3 top-6 w-6 h-6 rounded-full bg-gradient-to-br ${getTimeBlockColor(activity.type)} flex items-center justify-center shadow-md z-10">
                              {getTimeBlockIcon(activity.type)}
                            </div>

                            <div className={`bg-white rounded-2xl shadow-sm p-5 ml-4 border-l-4 ${
                              activity.is_meal ? 'border-amber-400' : 'border-gray-100'
                            }`}>
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`text-sm font-semibold text-gray-700">
                                  {activity.time}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {activity.time_range}
                                </span>
                                {activity.is_meal && (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                                    <Utensils className="w-3 h-3 inline mr-1" />
                                    用餐推荐
                                  </span>
                                )}
                              </div>

                              {activity.spot ? (
                                <div className="flex gap-4">
                                  <img
                                    src={activity.spot.image_url}
                                    alt={activity.spot.name}
                                    className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                                      {activity.spot.name}
                                    </h4>
                                    <p className="text-gray-600 text-sm mb-3">
                                      {activity.description}
                                    </p>
                                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                                      {activity.spot.location && (
                                        <span className="flex items-center gap-1">
                                          <MapPin className="w-3 h-3" />
                                          {activity.spot.location}
                                        </span>
                                      )}
                                      {activity.spot.recommended_duration && (
                                        <span className="flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          建议游览 {activity.spot.recommended_duration}
                                        </span>
                                      )}
                                      {activity.spot.ticket_price_peak && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-amber-500">💰</span>
                                          门票 {activity.spot.ticket_price_peak}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                                    {activity.description}
                                  </h4>
                                  {activity.tips && activity.tips.length > 0 && (
                                    <ul className="text-sm text-gray-600 space-y-1.5">
                                      {activity.tips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        {tip}
                                      </li>
                                    ))}
                                    </ul>
                                  )}
                                </div>
                              )}

                              {activity.tips && activity.tips.length > 0 && activity.spot && (
                                <div className="mt-4 pt-4 border-t border-gray-100">
                                  <h5 className="text-sm font-medium text-gray-700 mb-2">游玩贴士</h5>
                                  <ul className="text-sm text-gray-600 space-y-1.5">
                                    {activity.tips.map((tip, i) => (
                                      <li key={i} className="flex items-start gap-2">
                                        <span className="text-orange-500 mt-0.5">•</span>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ItineraryPage;
