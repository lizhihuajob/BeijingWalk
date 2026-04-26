import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scroll, ArrowRight } from 'lucide-react';

const CultureSection = ({ cultures, loading }) => {
  const navigate = useNavigate();

  const truncateText = (text, maxLength = 100) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <section id="culture" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 rounded-full w-48 mx-auto"></div>
            <div className="grid md:grid-cols-1 gap-8">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-lg">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/2 h-64 bg-gray-200"></div>
                    <div className="md:w-1/2 p-8 space-y-4">
                      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                      <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="culture" className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-6 shadow-lg">
            <Scroll className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            北京文化
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            探索北京悠久的历史文化，感受千年古都的独特魅力
          </p>
        </motion.div>

        <div className="space-y-16">
          {cultures.map((culture, index) => (
            <motion.div
              key={culture.id}
              className={`flex flex-col ${
                index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'
              } items-center gap-8 md:gap-12`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="w-full md:w-1/2">
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                  <div className="relative overflow-hidden rounded-3xl shadow-xl">
                    <img
                      src={culture.image_url}
                      alt={culture.title}
                      className="w-full h-64 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
                  {culture.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                  {truncateText(culture.description, 120)}
                </p>
                {culture.details && (
                  <p className="text-gray-500 leading-relaxed mb-6 line-clamp-2">
                    {truncateText(culture.details, 80)}
                  </p>
                )}
                <motion.button
                  onClick={() => navigate(`/culture/${culture.id}`)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-600 font-semibold rounded-full border border-orange-200 hover:bg-orange-50 transition-colors shadow-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  了解更多 <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CultureSection;