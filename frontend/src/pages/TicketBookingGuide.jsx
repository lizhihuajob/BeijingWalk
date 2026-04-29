import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Ticket, Smartphone, Calendar, Clock, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getScenicSpotById } from '../services/api';

const TicketBookingGuide = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [scenicSpot, setScenicSpot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchScenicSpot = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await getScenicSpotById(id);
        setScenicSpot(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch scenic spot:', err);
        setError('加载景点信息失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchScenicSpot();
  }, [id]);

  const getBookingGuide = (spotName) => {
    const guides = {
      '故宫博物院': {
        title: '故宫博物院购票指南',
        description: '故宫博物院实行全体观众实名制预约参观，不售当日票，请提前预约。',
        steps: [
          {
            title: '方式一：微信小程序预约（推荐）',
            content: '1. 打开微信，搜索"故宫博物院"小程序\n2. 点击"购票预约" → "在线订票"\n3. 选择参观日期和门票类型\n4. 填写个人身份信息\n5. 完成支付，获得预约凭证',
            note: '这是最便捷的购票方式，建议提前7天预约'
          },
          {
            title: '方式二：官方网站预约',
            content: '1. 访问故宫博物院官方订票网站：https://ticket.dpm.org.cn/\n2. 点击"个人订票"按钮\n3. 注册/登录账号\n4. 选择参观日期和门票类型\n5. 填写身份信息并完成支付',
            note: '网站与小程序共享库存，预约时间相同'
          }
        ],
        importantNotes: [
          '门票提前7天20:00开售，建议提前预约',
          '所有观众须实名预约，同一证件每个参观日仅能预约一张门票',
          '周一闭馆（法定节假日除外），请避开周一参观',
          '未使用的门票可于参观前一日24:00前通过原渠道退票',
          '参观当日20:00前仍可退票，但计为1次爽约',
          '半年内累计爽约3次，60日内将无法购买门票'
        ],
        contactInfo: {
          phone: '010-86489090',
          workTime: '08:00-20:00（全年无休）'
        }
      },
      '天坛公园': {
        title: '天坛公园购票指南',
        description: '天坛公园可通过"畅游公园"平台或现场购票，建议提前预约避免排队。',
        steps: [
          {
            title: '方式一：畅游公园平台预约',
            content: '1. 打开微信，搜索"畅游公园"公众号或小程序\n2. 选择"天坛公园"\n3. 选择门票类型（大门票或联票）\n4. 填写预约信息\n5. 完成支付',
            note: '联票包含大门票、祈年殿、圜丘、回音壁，推荐购买'
          },
          {
            title: '方式二：现场购票',
            content: '1. 前往公园南门、东门、西门、北门售票处\n2. 选择门票类型\n3. 现金或扫码支付\n4. 获取门票入园',
            note: '旺季建议提前网上预约，避免现场排队'
          }
        ],
        importantNotes: [
          '旺季（4月1日-10月31日）：大门票15元，联票34元',
          '淡季（11月1日-3月31日）：大门票10元，联票28元',
          '学生凭学生证半价优惠',
          '60岁以上老人、军人等凭证免票',
          '公园开放时间：6:00-22:00，景点开放时间：8:00-18:00'
        ],
        contactInfo: {
          phone: '010-67028866',
          workTime: '工作时间咨询'
        }
      },
      '明十三陵': {
        title: '明十三陵购票指南',
        description: '明十三陵可通过"昌平文旅集团"小程序或官方网站预约购票。',
        steps: [
          {
            title: '方式一：微信小程序预约（推荐）',
            content: '1. 打开微信，搜索"昌平文旅集团"小程序\n2. 选择"明十三陵"景区\n3. 选择要参观的景点（长陵、定陵、昭陵、神道）\n4. 选择参观日期和门票类型\n5. 填写个人信息并完成支付',
            note: '购买联票更划算，包含多个景点'
          },
          {
            title: '方式二：官方网站购票',
            content: '1. 访问明十三陵官方网站：https://www.mingshisanling.com/ticket.html\n2. 点击"在线预订"\n3. 选择景点和门票类型\n4. 填写预约信息\n5. 完成支付',
            note: '各景点分开售票，也可购买联票'
          }
        ],
        importantNotes: [
          '联票98元/人（含长陵、定陵、总神道）',
          '单票：长陵45元、定陵60元、昭陵30元、总神道30元（旺季价格）',
          '学生凭学生证半价优惠',
          '60岁以上老人、残疾人、现役军人凭证免票',
          '旺季开放时间：8:00-17:30，淡季：8:30-17:00',
          '建议下午3点前进入陵区，避免赶不上深度游览'
        ],
        contactInfo: {
          phone: '010-60761005',
          workTime: '工作时间咨询'
        }
      }
    };

    return guides[spotName] || {
      title: `${spotName || '景点'}购票指南`,
      description: '请通过官方渠道购买门票，确保顺利入园。',
      steps: [
        {
          title: '官方渠道购票',
          content: '请访问景点官方网站或关注官方公众号/小程序进行购票。\n\n避免通过非官方渠道购票，以免造成损失。',
          note: '建议提前3-7天预约，避免门票售罄'
        }
      ],
      importantNotes: [
        '请携带购票时使用的有效身份证件原件',
        '建议提前了解景区开放时间和限流政策',
        '如有疑问，请联系景区官方客服'
      ],
      contactInfo: null
    };
  };

  const guideData = scenicSpot ? getBookingGuide(scenicSpot.name) : getBookingGuide('');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
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
            <span className="text-sm font-medium">返回景点详情</span>
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
              <span>官方购票指南</span>
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
              购票方式
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
              重要提示
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
                联系方式
              </h2>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">客服电话</p>
                      <p className="text-lg font-bold text-gray-900">{guideData.contactInfo.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">工作时间</p>
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
                访问官方购票网站
              </a>
              <p className="text-sm text-gray-500 mt-3">
                将在新窗口打开官方网站
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
