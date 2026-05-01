import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, Smartphone, Calendar, Clock, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getScenicSpotById, getBookingGuideByScenicSpot } from '../services/api';
import { useI18n } from '../i18n';

const TicketBookingGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  const [scenicSpot, setScenicSpot] = useState(null);
  const [bookingGuide, setBookingGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [scenicSpotData, guideData] = await Promise.all([
          getScenicSpotById(id),
          getBookingGuideByScenicSpot(id),
        ]);
        
        setScenicSpot(scenicSpotData);
        if (guideData) {
          setBookingGuide(guideData);
        }
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(t('error.loadFailed'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, language, t]);

  const getDefaultGuideData = () => ({
    title: t('ticketGuide.defaultTitle', { name: scenicSpot?.name || '' }),
    description: t('ticketGuide.defaultDescription'),
    steps: [
      {
        title: t('ticketGuide.defaultStepTitle'),
        content: t('ticketGuide.defaultStepContent'),
        note: t('ticketGuide.defaultStepNote'),
      }
    ],
    importantNotes: [
      t('ticketGuide.defaultNote1'),
      t('ticketGuide.defaultNote2'),
      t('ticketGuide.defaultNote3'),
    ],
    contactInfo: null
  });

  const getGuideData = () => {
    if (!bookingGuide) {
      return getDefaultGuideData();
    }

    let steps = [];
    if (bookingGuide.steps) {
      try {
        steps = typeof bookingGuide.steps === 'string' ? JSON.parse(bookingGuide.steps) : bookingGuide.steps;
      } catch (e) {
        console.error('Failed to parse steps:', e);
      }
    }

    let importantNotes = [];
    if (bookingGuide.important_notes) {
      try {
        importantNotes = typeof bookingGuide.important_notes === 'string' ? JSON.parse(bookingGuide.important_notes) : bookingGuide.important_notes;
      } catch (e) {
        console.error('Failed to parse important_notes:', e);
      }
    }

    let contactInfo = null;
    if (bookingGuide.contact_phone || bookingGuide.contact_work_time) {
      contactInfo = {
        phone: bookingGuide.contact_phone,
        workTime: bookingGuide.contact_work_time
      };
    }

    return {
      title: bookingGuide.title || getDefaultGuideData().title,
      description: bookingGuide.description || getDefaultGuideData().description,
      steps: steps.length > 0 ? steps : getDefaultGuideData().steps,
      importantNotes: importantNotes.length > 0 ? importantNotes : getDefaultGuideData().importantNotes,
      contactInfo: contactInfo
    };
  };

  const guideData = getGuideData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">{t('common.loading')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="fixed top-20 right-4 md:right-8 z-40">
          <motion.button
            onClick={() => id ? navigate(`/scenic-spot/${id}`) : navigate(-1)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full shadow-lg hover:bg-white transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">{t('ticketGuide.backToDetail')}</span>
          </motion.button>
        </div>

        <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm mb-6"
            >
              <Ticket className="w-4 h-4" />
              <span>{t('ticketGuide.officialGuide')}</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold text-white mb-4"
            >
              {guideData.title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto"
            >
              {guideData.description}
            </motion.p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
              {t('ticketGuide.bookingMethod')}
            </h2>
            <div className="space-y-6">
              {guideData.steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 bg-white text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </span>
                      {step.title}
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-4">
                      {step.content}
                    </div>
                    <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-4">
                      <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800">{step.note}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-12"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-amber-600" />
              {t('ticketGuide.importantNotes')}
            </h2>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <ul className="space-y-3">
                {guideData.importantNotes.map((note, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {guideData.contactInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-600" />
                {t('ticketGuide.contactInfo')}
              </h2>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('ticketGuide.servicePhone')}</p>
                      <p className="text-lg font-bold text-gray-900">{guideData.contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">{t('ticketGuide.workTime')}</p>
                      <p className="text-lg font-bold text-gray-900">{guideData.contactInfo.workTime}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {scenicSpot?.ticket_url && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="text-center"
            >
              <a
                href={scenicSpot.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-lg rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <ExternalLink className="w-5 h-5" />
                {t('ticketGuide.visitOfficialSite')}
              </a>
              <p className="text-sm text-gray-500 mt-3">
                {t('ticketGuide.openInNewWindow')}
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TicketBookingGuide;
