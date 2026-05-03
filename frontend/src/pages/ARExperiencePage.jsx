import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, ChevronUp, Glasses, Clock, Star, Layers, Play, Pause, StepForward, X, ArrowLeft, Users } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getARExperiences, getHeritages } from '../services/api';

const mockARExperiences = [
  {
    id: 1,
    heritage_id: 1,
    name: '景泰蓝制作工艺',
    description: '通过AR技术，沉浸式体验景泰蓝的制作全过程。从制胎、掐丝、点蓝到烧蓝、磨光、镀金，每一个步骤都可以360度交互式体验。',
    short_description: '沉浸式体验景泰蓝的传统制作工艺',
    category: '传统工艺',
    icon: '🎨',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cloisonne%20making%20craft%20traditional%20Chinese%20art%20enamel%20work%20colorful%20metalwork&image_size=square_hd',
    steps: [
      { id: 1, title: '制胎', description: '用紫铜板制作胎型', duration: '30分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=copper%20sheet%20shaping%20traditional%20craftsman%20working&image_size=square' },
      { id: 2, title: '掐丝', description: '用铜丝掐出图案', duration: '60分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=filigree%20work%20copper%20wire%20pattern%20traditional%20craft&image_size=square' },
      { id: 3, title: '点蓝', description: '填充珐琅彩釉', duration: '45分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=enamel%20filling%20colorful%20glaze%20traditional%20artisan&image_size=square' },
      { id: 4, title: '烧蓝', description: '高温烧制', duration: '20分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=kiln%20firing%20enamel%20high%20temperature%20traditional%20craft&image_size=square' },
      { id: 5, title: '磨光', description: '打磨抛光', duration: '30分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=polishing%20metalwork%20traditional%20craftsman%20finishing&image_size=square' },
      { id: 6, title: '镀金', description: '表面镀金', duration: '25分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20plating%20traditional%20craft%20finishing%20process&image_size=square' },
    ],
    materials: [
      { name: '紫铜板', description: '制作胎型的主要材料' },
      { name: '铜丝', description: '用于掐丝制作图案' },
      { name: '珐琅釉料', description: '多种颜色的彩釉' },
      { name: '焊药', description: '用于焊接铜丝' },
      { name: '金液', description: '用于镀金工序' },
    ],
    tools: [
      { name: '剪刀', description: '裁剪铜丝和铜板' },
      { name: '镊子', description: '夹取铜丝' },
      { name: '焊枪', description: '焊接铜丝' },
      { name: '蓝枪', description: '点蓝工具' },
      { name: '砂轮', description: '磨光工具' },
    ],
    duration_minutes: 180,
    difficulty_level: '较难',
    featured: true,
    order: 1,
    view_count: 1256,
    completion_count: 342,
  },
  {
    id: 2,
    heritage_id: 3,
    name: '京绣刺绣技艺',
    description: '京绣是中国传统刺绣技艺之一，以其精细的针法和华丽的配色著称。通过AR体验，您将亲手学习平针绣、打籽绣、盘金绣等经典针法。',
    short_description: '学习宫廷刺绣的传统针法技艺',
    category: '传统服饰',
    icon: '🧵',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20embroidery%20Jingxiu%20traditional%20Chinese%20silk%20needlework%20gold%20thread&image_size=square_hd',
    steps: [
      { id: 1, title: '设计图案', description: '在丝绸上绘制图案', duration: '20分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=drawing%20pattern%20on%20silk%20fabric%20traditional%20embroidery&image_size=square' },
      { id: 2, title: '绷框', description: '将丝绸固定在绷架上', duration: '10分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=stretching%20silk%20fabric%20on%20embroidery%20frame%20traditional%20craft&image_size=square' },
      { id: 3, title: '平针绣', description: '基础针法练习', duration: '40分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=basic%20stitch%20embroidery%20traditional%20Chinese%20needlework&image_size=square' },
      { id: 4, title: '打籽绣', description: '结子绣法', duration: '60分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=seed%20stitch%20embroidery%20knot%20stitch%20traditional%20craft&image_size=square' },
      { id: 5, title: '盘金绣', description: '金线盘绕技法', duration: '50分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20thread%20couching%20embroidery%20traditional%20palace%20style&image_size=square' },
    ],
    materials: [
      { name: '丝绸面料', description: '优质桑蚕丝面料' },
      { name: '丝线', description: '桑蚕丝染色丝线' },
      { name: '金线', description: '用于盘金绣' },
      { name: '银线', description: '用于装饰刺绣' },
    ],
    tools: [
      { name: '绣花针', description: '不同型号的刺绣针' },
      { name: '绷架', description: '固定面料的工具' },
      { name: '剪刀', description: '专业绣花剪' },
      { name: '穿线器', description: '辅助穿线' },
    ],
    duration_minutes: 120,
    difficulty_level: '中等',
    featured: true,
    order: 2,
    view_count: 892,
    completion_count: 215,
  },
  {
    id: 3,
    heritage_id: null,
    name: '皮影戏表演体验',
    description: '皮影戏是中国古老的传统艺术形式。通过AR技术，您可以亲手操作皮影人物，体验光影交织的神奇魅力，学习经典剧目片段。',
    short_description: '亲手操作皮影，体验传统光影艺术',
    category: '传统艺术',
    icon: '🎭',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shadow%20puppetry%20traditional%20Chinese%20art%20leather%20figures%20light%20show&image_size=square_hd',
    steps: [
      { id: 1, title: '了解皮影', description: '认识皮影的历史和制作', duration: '15分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shadow%20puppet%20history%20introduction%20traditional%20Chinese%20art&image_size=square' },
      { id: 2, title: '学习操杆', description: '掌握皮影的基本操作', duration: '25分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=learning%20to%20manipulate%20shadow%20puppet%20rods%20traditional%20craft&image_size=square' },
      { id: 3, title: '基础动作', description: '走路、转身、手势等', duration: '30分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shadow%20puppet%20basic%20movements%20walking%20turning%20gestures&image_size=square' },
      { id: 4, title: '剧目片段', description: '学习经典片段表演', duration: '40分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=shadow%20puppetry%20performance%20classical%20scene%20traditional%20theater&image_size=square' },
    ],
    materials: [
      { name: '驴皮', description: '传统皮影制作材料' },
      { name: '颜料', description: '矿物颜料着色' },
      { name: '桐油', description: '透明涂层' },
    ],
    tools: [
      { name: '刻刀', description: '雕刻皮影图案' },
      { name: '操杆', description: '控制皮影动作' },
      { name: '光源', description: '表演用灯光' },
    ],
    duration_minutes: 90,
    difficulty_level: '简单',
    featured: true,
    order: 3,
    view_count: 1520,
    completion_count: 567,
  },
  {
    id: 4,
    heritage_id: null,
    name: '北京烤鸭制作体验',
    description: '北京烤鸭是中国最著名的菜肴之一。通过AR体验，您将学习从选鸭、晾坯、烤鸭到片鸭的完整制作流程，感受中华美食的精湛技艺。',
    short_description: '体验中华美食的精湛制作技艺',
    category: '传统美食',
    icon: '🦆',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Peking%20Duck%20preparation%20traditional%20Chinese%20cuisine%20roasting%20duck&image_size=square_hd',
    steps: [
      { id: 1, title: '选鸭', description: '了解优质北京鸭的特点', duration: '10分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=selecting%20Peking%20duck%20high%20quality%20duck%20breed&image_size=square' },
      { id: 2, title: '处理', description: '清洗和吹气处理', duration: '15分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cleaning%20and%20preparing%20Peking%20duck%20traditional%20method&image_size=square' },
      { id: 3, title: '晾坯', description: '风干定型过程', duration: '30分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20drying%20Peking%20duck%20preparation%20traditional%20process&image_size=square' },
      { id: 4, title: '烤鸭', description: '果木挂炉烤制', duration: '45分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=roasting%20Peking%20duck%20wood%20fired%20oven%20traditional%20cooking&image_size=square' },
      { id: 5, title: '片鸭', description: '精致刀工片鸭', duration: '20分钟', image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=slicing%20Peking%20duck%20master%20knife%20skills%20traditional%20cuisine&image_size=square' },
    ],
    materials: [
      { name: '北京鸭', description: '优质北京填鸭' },
      { name: '麦芽糖', description: '脆皮上色' },
      { name: '荷叶饼', description: '卷鸭肉的薄饼' },
      { name: '甜面酱', description: '传统蘸酱' },
    ],
    tools: [
      { name: '挂炉', description: '传统果木烤炉' },
      { name: '片鸭刀', description: '专业片鸭刀具' },
      { name: '晾鸭架', description: '晾坯专用架' },
    ],
    duration_minutes: 100,
    difficulty_level: '中等',
    featured: false,
    order: 4,
    view_count: 2103,
    completion_count: 892,
  },
];

const categories = [
  { id: 'all', name: '全部', icon: '✨' },
  { id: '传统工艺', name: '传统工艺', icon: '🎨' },
  { id: '传统服饰', name: '传统服饰', icon: '🧵' },
  { id: '传统艺术', name: '传统艺术', icon: '🎭' },
  { id: '传统美食', name: '传统美食', icon: '🍜' },
];

const ARExperiencePage = () => {
  const navigate = useNavigate();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        try {
          const result = await getARExperiences({ featured: true });
          if (result.experiences && result.experiences.length > 0) {
            setExperiences(result.experiences);
          } else {
            setExperiences(mockARExperiences);
          }
        } catch (err) {
          setExperiences(mockARExperiences);
        }
      } catch (err) {
        console.error('Failed to fetch AR experiences:', err);
        setExperiences(mockARExperiences);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredExperiences = selectedCategory === 'all' 
    ? experiences 
    : experiences.filter(exp => exp.category === selectedCategory);

  const openExperience = (experience) => {
    setSelectedExperience(experience);
    setCurrentStep(0);
    setShowExperienceModal(true);
  };

  const nextStep = () => {
    if (selectedExperience && currentStep < (selectedExperience.steps?.length || 0) - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
    }
    return `${minutes}分钟`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="pt-24 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
            <p className="text-gray-600 text-lg">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Header />
      
      <main className="pt-20">
        <div className="relative h-80 md:h-96 bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm mb-6">
                <Glasses className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
                AR 非遗体验
              </h1>
              <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
                沉浸式体验传统技艺，亲手学习千年传承的非遗工艺
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-6 py-3 rounded-full font-medium transition-all duration-300 flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="grid md:grid-cols-3 gap-6">
              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 text-center border border-violet-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Layers className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">分步骤学习</h3>
                <p className="text-gray-500 text-sm">每个工艺都分解为清晰的步骤，循序渐进学习</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-3xl p-8 text-center border border-fuchsia-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-fuchsia-400 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Glasses className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">AR 沉浸式</h3>
                <p className="text-gray-500 text-sm">通过AR技术，身临其境地体验传统技艺</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -4 }}
                className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 text-center border border-indigo-100"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">专业指导</h3>
                <p className="text-gray-500 text-sm">每个步骤都有详细的说明和示范，确保学习效果</p>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-1 h-12 bg-gradient-to-b from-violet-500 to-purple-500 rounded-full"></div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === 'all' ? '全部体验项目' : categories.find(c => c.id === selectedCategory)?.name || '体验项目'}
                </h2>
                <p className="text-gray-500">共 {filteredExperiences.length} 个体验项目</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredExperiences.map((experience, index) => (
              <motion.div
                key={experience.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="group"
              >
                <motion.div
                  className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 h-full"
                  whileHover={{ y: -8 }}
                >
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10 flex gap-2">
                      <div className="w-14 h-14 rounded-2xl bg-white/95 backdrop-blur-sm flex items-center justify-center shadow-xl border border-white/50">
                        <span className="text-3xl">{experience.icon}</span>
                      </div>
                      {experience.featured && (
                        <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold">
                          热门
                        </div>
                      )}
                    </div>

                    <div className="relative overflow-hidden h-56">
                      <img
                        src={experience.image_url}
                        alt={experience.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-4 text-white/90 text-sm">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {formatDuration(experience.duration_minutes)}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Star className="w-4 h-4" />
                            {experience.difficulty_level}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            {experience.view_count} 人浏览
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-colors">
                        {experience.name}
                      </h3>
                      <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-xs font-medium">
                        {experience.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                      {truncateText(experience.description, 100)}
                    </p>

                    {experience.steps && experience.steps.length > 0 && (
                      <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                        <Layers className="w-4 h-4 text-violet-500" />
                        <span>共 {experience.steps.length} 个步骤</span>
                      </div>
                    )}

                    <motion.button
                      onClick={() => openExperience(experience)}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Play className="w-5 h-5" />
                      开始体验
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {filteredExperiences.length === 0 && (
            <div className="text-center py-20">
              <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">暂无相关体验项目</h3>
              <p className="text-gray-400">请尝试选择其他分类</p>
            </div>
          )}
        </div>
      </main>

      <Footer />

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showExperienceModal && selectedExperience && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowExperienceModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 p-8">
                <button
                  onClick={() => setShowExperienceModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                    <span className="text-3xl">{selectedExperience.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                      {selectedExperience.name}
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">
                      {selectedExperience.short_description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-white/90 text-sm">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {formatDuration(selectedExperience.duration_minutes)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Star className="w-4 h-4" />
                        {selectedExperience.difficulty_level}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4" />
                        {selectedExperience.steps?.length || 0} 个步骤
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {selectedExperience.steps && selectedExperience.steps.length > 0 && (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">
                        步骤 {currentStep + 1} / {selectedExperience.steps.length}
                      </h3>
                      <div className="flex items-center gap-2">
                        <motion.button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          <span className="text-sm font-medium">{isPlaying ? '暂停' : '自动播放'}</span>
                        </motion.button>
                      </div>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                      <motion.div
                        className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / selectedExperience.steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>

                    {selectedExperience.steps[currentStep] && (
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                            {currentStep + 1}
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-gray-900 mb-2">
                              {selectedExperience.steps[currentStep].title}
                            </h4>
                            <p className="text-gray-600 leading-relaxed">
                              {selectedExperience.steps[currentStep].description}
                            </p>
                            <p className="text-violet-600 text-sm mt-2 flex items-center gap-1.5">
                              <Clock className="w-4 h-4" />
                              预计时长: {selectedExperience.steps[currentStep].duration}
                            </p>
                          </div>
                        </div>
                        
                        {selectedExperience.steps[currentStep].image && (
                          <div className="mt-4 rounded-xl overflow-hidden">
                            <img
                              src={selectedExperience.steps[currentStep].image}
                              alt={selectedExperience.steps[currentStep].title}
                              className="w-full h-48 object-cover"
                            />
                          </div>
                        )}
                      </motion.div>
                    )}

                    <div className="flex items-center justify-center gap-2 mt-8">
                      {selectedExperience.steps.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentStep(idx)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            idx === currentStep
                              ? 'bg-violet-500 w-8'
                              : idx < currentStep
                              ? 'bg-violet-300'
                              : 'bg-gray-300 hover:bg-gray-400'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-100">
                      <motion.button
                        onClick={prevStep}
                        disabled={currentStep === 0}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                          currentStep === 0
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        whileHover={currentStep > 0 ? { scale: 1.05 } : {}}
                        whileTap={currentStep > 0 ? { scale: 0.95 } : {}}
                      >
                        <ArrowLeft className="w-5 h-5" />
                        上一步
                      </motion.button>

                      <motion.button
                        onClick={nextStep}
                        disabled={currentStep >= (selectedExperience.steps?.length || 0) - 1}
                        className={`flex items-center gap-2 px-8 py-3 rounded-xl font-medium transition-all ${
                          currentStep >= (selectedExperience.steps?.length || 0) - 1
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-lg hover:shadow-xl'
                        }`}
                        whileHover={currentStep < (selectedExperience.steps?.length || 0) - 1 ? { scale: 1.05 } : {}}
                        whileTap={currentStep < (selectedExperience.steps?.length || 0) - 1 ? { scale: 0.95 } : {}}
                      >
                        下一步
                        <StepForward className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </>
                )}

                {(!selectedExperience.steps || selectedExperience.steps.length === 0) && (
                  <div className="text-center py-12">
                    <Sparkles className="w-16 h-16 text-violet-300 mx-auto mb-4" />
                    <p className="text-gray-500">该体验的详细步骤正在开发中...</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ARExperiencePage;
