import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Heart, Map } from 'lucide-react';
import { getSiteConfig, getNavigations } from '../services/api';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [siteConfig, setSiteConfig] = useState({
    site_name: '北京旅游',
    site_description: '探索千年古都的魅力，感受历史与现代的完美交融。',
    contact_address: '北京市东城区',
    contact_phone: '400-123-4567',
    contact_email: 'info@beijingwalk.com',
    copyright_text: '',
    footer_links: null,
  });
  const [quickLinks, setQuickLinks] = useState([
    { path: '/', label: '首页' },
    { path: '/culture', label: '北京文化' },
    { path: '/specialties', label: '地方特产' },
    { path: '/scenic', label: '名胜古迹' },
    { path: '/heritage', label: '非物质文化遗产' },
    { path: '/guestbook', label: '留言板' },
  ]);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const [configData, navigationsData] = await Promise.all([
          getSiteConfig(),
          getNavigations(),
        ]);
        
        if (configData) {
          setSiteConfig(configData);
        }
        if (navigationsData && navigationsData.length > 0) {
          setQuickLinks(navigationsData);
        }
      } catch (err) {
        console.error('Failed to fetch config:', err);
      }
    };

    fetchConfig();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">京</span>
              </div>
              <span className="text-xl font-semibold">{siteConfig.site_name || '北京旅游'}</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              {siteConfig.site_description || '探索千年古都的魅力，感受历史与现代的完美交融。北京旅游，带你发现不一样的北京。'}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">快速导航</h3>
            <nav className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-gray-400 hover:text-white text-sm transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold mb-4">联系方式</h3>
            <div className="space-y-3">
              {siteConfig.contact_address && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4 text-orange-500" />
                  <span>{siteConfig.contact_address}</span>
                </div>
              )}
              {siteConfig.contact_phone && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Phone className="w-4 h-4 text-orange-500" />
                  <span>{siteConfig.contact_phone}</span>
                </div>
              )}
              {siteConfig.contact_email && (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4 text-orange-500" />
                  <span>{siteConfig.contact_email}</span>
                </div>
              )}
              {!siteConfig.contact_address && !siteConfig.contact_phone && !siteConfig.contact_email && (
                <>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>北京市东城区</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Phone className="w-4 h-4 text-orange-500" />
                    <span>400-123-4567</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <Mail className="w-4 h-4 text-orange-500" />
                    <span>info@beijingwalk.com</span>
                  </div>
                </>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold mb-4">热门景点</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-orange-500" />
                <span>故宫博物院</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-orange-500" />
                <span>颐和园</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-orange-500" />
                <span>天坛公园</span>
              </div>
              <div className="flex items-center gap-2">
                <Map className="w-4 h-4 text-orange-500" />
                <span>明十三陵</span>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              {siteConfig.copyright_text || `© ${currentYear} ${siteConfig.site_name || '北京旅游'}. All rights reserved.`}
            </p>
            <p className="text-gray-500 text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-red-500 fill-current" /> for Beijing
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
