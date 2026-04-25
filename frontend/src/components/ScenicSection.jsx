import React from 'react';
import { motion } from 'framer-motion';
import { Scroll, ArrowRight } from 'lucide-react';

const CultureSection = ({ cultures }) => {
  if (!cultures || cultures.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
  };

  return (
    <section id="culture" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-2 rounded-full bg-red-100 text-red-600 text-sm font-medium mb-4">
            北京文化
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            千年古都的文化底蕴
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            北京作为六朝古都，承载着中华民族几千年的历史文化，是中华文明的重要象征
          </p>
        </motion.div>

        <motion.div
          className="space-y-24"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {cultures.map((culture, index) => (
            <motion.div
              key={culture.id}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } gap-12 items-center`}
              variants={itemVariants}
            >
              <div className="w-full lg:w-1/2">
                <motion.div
                  className="relative rounded-3xl overflow-hidden shadow-2xl"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={culture.image_url}
                    alt={culture.title}
                    className="w-full h-80 md:h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </motion.div>
              </div>

              <div className="w-full lg:w-1/2 space-y-6">
                <h3 className="text-3xl font-bold text-gray-900">
                  {culture.title}
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  {culture.description}
                </p>
                {culture.details && (
                  <p className="text-gray-600 leading-relaxed">
                    {culture.details}
                  </p>
                )}
                <motion.button
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-orange-500 text-white font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  了解更多 <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CultureSection;