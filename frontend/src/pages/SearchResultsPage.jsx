import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Building, Utensils, Scroll, Sparkles, Filter, X } from 'lucide-react';
import { globalSearch } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [countByType, setCountByType] = useState({});

  const filters = [
    { key: 'all', label: '全部', icon: Search },
    { key: 'scenic_spot', label: '景点', icon: Building },
    { key: 'specialty', label: '特产', icon: Utensils },
    { key: 'culture', label: '文化', icon: Scroll },
    { key: 'heritage', label: '非遗', icon: Sparkles },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setAllResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await globalSearch(query, 'all', 50, 0);
        setAllResults(data.results || []);
        setCountByType(data.count_by_type || {});
        setResults(data.results || []);
      } catch (err) {
        setError('搜索失败，请稍后重试');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  useEffect(() => {
    if (activeFilter === 'all') {
      setResults(allResults);
    } else {
      setResults(allResults.filter((item) => item.result_type === activeFilter));
    }
  }, [activeFilter, allResults]);

  const getTypeColor = (type) => {
    const colors = {
      scenic_spot: 'from-blue-400 to-blue-600',
      specialty: 'from-pink-400 to-pink-600',
      culture: 'from-amber-400 to-amber-600',
      heritage: 'from-purple-400 to-purple-600',
    };
    return colors[type] || 'from-gray-400 to-gray-600';
  };

  const getTypeBg = (type) => {
    const colors = {
      scenic_spot: 'bg-blue-50 border-blue-200',
      specialty: 'bg-pink-50 border-pink-200',
      culture: 'bg-amber-50 border-amber-200',
      heritage: 'bg-purple-50 border-purple-200',
    };
    return colors[type] || 'bg-gray-50 border-gray-200';
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      scenic_spot: 'bg-blue-100 text-blue-700',
      specialty: 'bg-pink-100 text-pink-700',
      culture: 'bg-amber-100 text-amber-700',
      heritage: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="pt-20 md:pt-24">
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b border-orange-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                搜索结果
              </h1>
              <p className="text-gray-600">
                关键词：<span className="text-orange-600 font-medium">"{query}"</span>
                {!loading && (
                  <span className="ml-2">
                    共找到 <span className="font-semibold text-gray-900">{results.length}</span> 个结果
                  </span>
                )}
              </p>
            </motion.div>
          </div>
        </div>

        <div className="bg-white border-b border-gray-200 sticky top-16 md:top-20 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-3 overflow-x-auto">
              <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
              {filters.map((filter) => {
                const Icon = filter.icon;
                const count = filter.key === 'all' 
                  ? Object.values(countByType).reduce((a, b) => a + b, 0)
                  : countByType[filter.key] || 0;

                return (
                  <motion.button
                    key={filter.key}
                    onClick={() => setActiveFilter(filter.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      activeFilter === filter.key
                        ? 'bg-gradient-to-r from-orange-400 to-amber-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Icon className="w-4 h-4" />
                    {filter.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                      activeFilter === filter.key
                        ? 'bg-white/20 text-white'
                        : 'bg-white text-gray-600'
                    }`}>
                      {count}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">搜索出错了</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                重新搜索
              </button>
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到相关结果</h3>
              <p className="text-gray-500 mb-6">
                没有找到与 "{query}" 相关的内容，请尝试其他关键词
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {['故宫', '长城', '北京烤鸭', '胡同', '博物馆'].map((keyword) => (
                  <button
                    key={keyword}
                    onClick={() => navigate(`/search?q=${encodeURIComponent(keyword)}`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-orange-50 text-gray-600 hover:text-orange-600 rounded-full text-sm transition-colors"
                  >
                    {keyword}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((item, index) => {
                const IconComponent = filters.find((f) => f.key === item.result_type)?.icon || Search;

                return (
                  <motion.div
                    key={`${item.result_type}-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group"
                  >
                    <Link to={item.url}>
                      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 border ${getTypeBg(item.result_type)}`}>
                        <div className="relative overflow-hidden h-48">
                          <img
                            src={item.image_url}
                            alt={item.name || item.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gradient-to-br ${getTypeColor(item.result_type)}">
                                  <div class="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                  </div>
                                </div>
                              `;
                            }}
                          />
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${getTypeBadgeColor(item.result_type)}`}>
                              <IconComponent className="w-3 h-3" />
                              {item.result_type_label}
                            </span>
                          </div>
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                            {item.name || item.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                            {truncateText(item.description, 100)}
                          </p>
                          <div className="flex items-center justify-between">
                            {item.location && (
                              <p className="text-xs text-gray-400 truncate flex-1">
                                {item.location}
                              </p>
                            )}
                            <span className="flex items-center gap-1 text-orange-500 text-sm font-medium group-hover:gap-2 transition-all">
                              查看详情
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default SearchResultsPage;
