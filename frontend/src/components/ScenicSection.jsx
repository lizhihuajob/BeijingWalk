import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Building, ArrowRight } from 'lucide-react';

const ScenicSection = ({ scenicSpots, loading }) => {
  const navigate = useNavigate();

  const truncateText = (text, maxLength = 50) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <section id="scenic" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-12">
            <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto"></div>
            <div className="h-64 bg-gray-200 rounded-3xl mb-8"></div>
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden">
                  <div className="h-32 bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-5 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const featuredSpot = scenicSpots.find((spot) => spot.is_featured);
  const otherSpots = scenicSpots.filter((spot) => !spot.is_featured);

  return (
    <section id="scenic" className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-500 mb-6 shadow-lg">
            <Building className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            名胜古迹
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            探索北京千年历史的著名景点，感受中华文明的博大精深
          </p>
        </motion.div>

        {featuredSpot && (
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="group relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="relative h-64 md:h-96">
                <img
                  src={featuredSpot.image_url}
                  alt={featuredSpot.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-3">
                  推荐景点
                </span>
                <h3 className="text-2xl md:text-4xl font-bold text-white mb-3">
                  {featuredSpot.name}
                </h3>
                <p className="text-white/80 text-lg max-w-2xl mb-4 line-clamp-2">
                  {truncateText(featuredSpot.description, 80)}
                </p>
                <motion.button
                  onClick={() => navigate(`/scenic-spot/${featuredSpot.id}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  了解更多 <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {otherSpots.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherSpots.map((spot, index) => (
              <motion.div
                key={spot.id}
                className="group h-full"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full flex flex-col">
                  <div className="relative overflow-hidden h-48">
                    <img
                      src={spot.image_url}
                      alt={spot.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {spot.name}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4 flex-1 line-clamp-3">
                      {truncateText(spot.description, 50)}
                    </p>
                    <motion.button
                      onClick={() => navigate(`/scenic-spot/${spot.id}`)}
                      className="text-blue-500 hover:text-blue-600 text-sm font-medium flex items-center gap-1 transition-colors"
                      whileHover={{ x: 3 }}
                    >
                      查看详情 <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ScenicSection;