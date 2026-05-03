import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Clock, ChevronRight } from 'lucide-react';
import { getHotKeywords, globalSearch } from '../services/api';

const SearchBar = ({ className = '', placeholder = '搜索景点、特产、文化、非遗...' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [hotKeywords, setHotKeywords] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchHotKeywords = async () => {
      try {
        const data = await getHotKeywords(7, 8);
        setHotKeywords(data.hot_keywords || []);
      } catch (error) {
        console.error('Failed to fetch hot keywords:', error);
        setHotKeywords([
          { keyword: '故宫', search_count: 0 },
          { keyword: '长城', search_count: 0 },
          { keyword: '颐和园', search_count: 0 },
          { keyword: '天坛', search_count: 0 },
          { keyword: '北京烤鸭', search_count: 0 },
          { keyword: '胡同', search_count: 0 },
          { keyword: '博物馆', search_count: 0 },
          { keyword: '雍和宫', search_count: 0 },
        ]);
      }
    };

    fetchHotKeywords();

    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      return;
    }

    const debounceTimer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await globalSearch(query, 'all', 5, 0);
        setSuggestions(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (searchQuery = query) => {
    if (!searchQuery.trim()) return;

    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter((s) => s !== searchQuery),
    ].slice(0, 10);

    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));

    navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    setIsFocused(false);
    setQuery('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearQuery = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getTypeColor = (type) => {
    const colors = {
      scenic_spot: 'bg-blue-100 text-blue-700',
      specialty: 'bg-pink-100 text-pink-700',
      culture: 'bg-amber-100 text-amber-700',
      heritage: 'bg-purple-100 text-purple-700',
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getTypeLabel = (type) => {
    const labels = {
      scenic_spot: '景点',
      specialty: '特产',
      culture: '文化',
      heritage: '非遗',
    };
    return labels[type] || '其他';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-20 py-3 bg-white border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all duration-300 text-gray-700 placeholder-gray-400"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <button
              onClick={clearQuery}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <motion.button
            onClick={() => handleSearch()}
            className="px-4 py-1.5 bg-gradient-to-r from-orange-400 to-amber-500 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            搜索
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-96 overflow-y-auto"
          >
            {suggestions.length > 0 ? (
              <div className="p-3">
                <p className="text-xs text-gray-400 font-medium mb-2 px-2">搜索建议</p>
                {suggestions.map((item, index) => (
                  <motion.button
                    key={`${item.result_type}-${item.id}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      navigate(item.url);
                      setIsFocused(false);
                      setQuery('');
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={item.image_url}
                        alt={item.name || item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name || item.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {item.description?.substring(0, 50)}
                      </p>
                    </div>
                    <span className={`flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.result_type)}`}>
                      {getTypeLabel(item.result_type)}
                    </span>
                  </motion.button>
                ))}
              </div>
            ) : query.length >= 2 && isLoading ? (
              <div className="p-6 text-center">
                <div className="w-6 h-6 border-2 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-sm text-gray-500">搜索中...</p>
              </div>
            ) : (
              <div className="p-4">
                {hotKeywords.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3 px-1">
                      <TrendingUp className="w-4 h-4 text-orange-500" />
                      <span className="text-xs text-gray-400 font-medium">热门搜索</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {hotKeywords.map((item, index) => (
                        <motion.button
                          key={item.keyword}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setQuery(item.keyword);
                            handleSearch(item.keyword);
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 rounded-full text-sm transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {item.keyword}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-xs text-gray-400 font-medium">最近搜索</span>
                      </div>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        清除
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((item, index) => (
                        <motion.button
                          key={item}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => {
                            setQuery(item);
                            handleSearch(item);
                          }}
                          className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-full text-sm transition-colors flex items-center gap-1"
                        >
                          <Clock className="w-3 h-3" />
                          {item}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                )}

                {hotKeywords.length === 0 && recentSearches.length === 0 && (
                  <div className="text-center py-6">
                    <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">输入关键词开始搜索</p>
                  </div>
                )}
              </div>
            )}

            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => {
                  navigate('/itinerary');
                  setIsFocused(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
                智能行程规划
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
