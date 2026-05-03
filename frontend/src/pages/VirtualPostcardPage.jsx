import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Loader2, ChevronUp, Send, Image, MessageSquare, Mail, 
  Download, Share2, Heart, Check, X, ArrowRight, 
  LayoutTemplate, User, Edit3, Camera, MapPin,
  Copy, CheckCircle2, Eye
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getPostcardTemplates, getPostcardPhotos, createPostcard, sendPostcard } from '../services/api';

const photoTypes = [
  { id: 'all', name: '全部', icon: '🏛️' },
  { id: 'scenic', name: '景点', icon: '🏯' },
  { id: 'heritage', name: '非遗', icon: '🎨' },
  { id: 'culture', name: '文化', icon: '🎭' },
];

const mockPhotos = [
  {
    id: 1,
    type: 'scenic_spot',
    name: '故宫博物院',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Forbidden%20City%20Palace%20Museum%20Beijing%20traditional%20Chinese%20architecture%20red%20walls%20golden%20roofs&image_size=square_hd',
    description: '明清两代的皇家宫殿，世界上现存规模最大的木质结构建筑群',
    location: '北京市东城区',
    is_featured: true,
  },
  {
    id: 2,
    type: 'scenic_spot',
    name: '颐和园',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Summer%20Palace%20Beijing%20Kunming%20Lake%20Longevity%20Hill%20traditional%20Chinese%20garden%20architecture&image_size=square_hd',
    description: '中国现存规模最大、保存最完整的皇家园林',
    location: '北京市海淀区',
    is_featured: true,
  },
  {
    id: 3,
    type: 'scenic_spot',
    name: '天坛',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Temple%20of%20Heaven%20Beijing%20circular%20mound%20altar%20imperial%20roof%20blue%20tiles%20traditional%20architecture&image_size=square_hd',
    description: '明清两代皇帝祭天、祈谷的场所，中国现存最大的古代祭祀性建筑群',
    location: '北京市东城区',
    is_featured: true,
  },
  {
    id: 4,
    type: 'heritage',
    name: '景泰蓝',
    icon: '🎨',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Cloisonne%20artwork%20traditional%20Chinese%20enamel%20craft%20colorful%20vase%20blue%20gold%20patterns&image_size=square_hd',
    description: '国家级非物质文化遗产，又称铜胎掐丝珐琅，是北京特有的传统工艺',
    is_featured: false,
  },
  {
    id: 5,
    type: 'heritage',
    name: '京绣',
    icon: '🧵',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20embroidery%20Jingxiu%20traditional%20Chinese%20silk%20needlework%20intricate%20patterns%20gold%20thread&image_size=square_hd',
    description: '又称宫绣，明清两代的宫廷刺绣，针法精细、配色华丽',
    is_featured: false,
  },
  {
    id: 6,
    type: 'culture',
    name: '京剧',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Peking%20Opera%20performer%20traditional%20Chinese%20theater%20colorful%20costume%20mask%20makeup%20stage%20performance&image_size=square_hd',
    description: '中国国粹，集唱、念、做、打于一体的综合性表演艺术',
    is_featured: false,
  },
  {
    id: 7,
    type: 'culture',
    name: '胡同文化',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Beijing%20hutong%20alleyway%20traditional%20courtyard%20houses%20grey%20brick%20walls%20red%20gates%20old%20street&image_size=square_hd',
    description: '老北京特有的民居形式，承载着北京人的生活记忆',
    is_featured: false,
  },
  {
    id: 8,
    type: 'scenic_spot',
    name: '长城',
    image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Great%20Wall%20of%20China%20Mutianyu%20section%20majestic%20mountain%20landscape%20ancient%20fortification%20sunset&image_size=square_hd',
    description: '世界文化遗产，中华民族的象征，东起山海关西至嘉峪关',
    location: '北京市怀柔区',
    is_featured: true,
  },
];

const defaultTemplates = [
  {
    template_id: 'default',
    name: '经典明信片',
    description: '传统风格的明信片设计',
    category: '经典',
    preview_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Chinese%20postcard%20template%20red%20gold%20colors%20elegant%20border%20design&image_size=square',
    background_color: '#fffaf0',
    text_color: '#1f2937',
    accent_color: '#f59e0b',
    font_family: 'serif',
    text_position: 'bottom',
    has_decorations: true,
    is_featured: true,
  },
  {
    template_id: 'modern',
    name: '现代简约',
    description: '简洁现代的设计风格',
    category: '现代',
    preview_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20minimalist%20postcard%20template%20clean%20white%20design%20thin%20borders&image_size=square',
    background_color: '#ffffff',
    text_color: '#111827',
    accent_color: '#3b82f6',
    font_family: 'sans-serif',
    text_position: 'right',
    has_decorations: false,
    is_featured: true,
  },
  {
    template_id: 'vintage',
    name: '复古怀旧',
    description: '怀旧复古的老照片风格',
    category: '复古',
    preview_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vintage%20sepia%20postcard%20template%20old%20photo%20style%20decorative%2ornamental%20border&image_size=square',
    background_color: '#fef3c7',
    text_color: '#78350f',
    accent_color: '#92400e',
    font_family: 'serif',
    text_position: 'bottom',
    has_decorations: true,
    is_featured: true,
  },
  {
    template_id: 'festive',
    name: '喜庆节日',
    description: '喜庆的节日主题设计',
    category: '节日',
    preview_image_url: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=festive%20Chinese%20postcard%20template%20red%20gold%20lanterns%20fireworks%20celebration&image_size=square',
    background_color: '#fef2f2',
    text_color: '#991b1b',
    accent_color: '#dc2626',
    font_family: 'serif',
    text_position: 'top',
    has_decorations: true,
    is_featured: false,
  },
];

const VirtualPostcardPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [selectedPhotoType, setSelectedPhotoType] = useState('all');
  const [photos, setPhotos] = useState(mockPhotos);
  const [templates, setTemplates] = useState(defaultTemplates);
  
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(defaultTemplates[0]);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdPostcard, setCreatedPostcard] = useState(null);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [photosResult, templatesResult] = await Promise.all([
          getPostcardPhotos('all'),
          getPostcardTemplates({ featured: true }),
        ]);
        
        if (photosResult.photos && photosResult.photos.length > 0) {
          setPhotos(photosResult.photos);
        }
        if (templatesResult.templates && templatesResult.templates.length > 0) {
          setTemplates(templatesResult.templates);
          setSelectedTemplate(templatesResult.templates[0]);
        }
      } catch (err) {
        console.error('Failed to fetch data:', err);
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

  const filteredPhotos = selectedPhotoType === 'all' 
    ? photos 
    : photos.filter(photo => {
        if (selectedPhotoType === 'scenic') return photo.type === 'scenic_spot';
        if (selectedPhotoType === 'heritage') return photo.type === 'heritage';
        if (selectedPhotoType === 'culture') return photo.type === 'culture';
        return true;
      });

  const selectPhoto = (photo) => {
    setSelectedPhoto(photo);
    setCurrentStep(2);
  };

  const selectTemplate = (template) => {
    setSelectedTemplate(template);
  };

  const goToNextStep = () => {
    if (currentStep === 2 && selectedTemplate) {
      setCurrentStep(3);
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openPreview = () => {
    setShowPreviewModal(true);
  };

  const createAndSendPostcard = async () => {
    try {
      setLoading(true);
      
      const sessionId = localStorage.getItem('visitorId') || `postcard_${Date.now()}`;
      
      const postcardData = {
        session_id: sessionId,
        image_url: selectedPhoto?.image_url,
        template_id: selectedTemplate?.template_id,
        message: message,
        sender_name: senderName,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        scenic_spot_id: selectedPhoto?.type === 'scenic_spot' ? selectedPhoto.id : null,
        heritage_id: selectedPhoto?.type === 'heritage' ? selectedPhoto.id : null,
      };

      const result = await createPostcard(postcardData);
      setCreatedPostcard(result);

      if (recipientEmail) {
        await sendPostcard(result.id, recipientEmail);
      }

      setShowPreviewModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Failed to create postcard:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyShareUrl = () => {
    const shareUrl = createdPostcard?.share_url || `${window.location.origin}/postcard/${createdPostcard?.id}`;
    navigator.clipboard?.writeText(shareUrl).then(() => {
      setShareUrlCopied(true);
      setTimeout(() => setShareUrlCopied(false), 2000);
    });
  };

  const resetForm = () => {
    setCurrentStep(1);
    setSelectedPhoto(null);
    setSelectedTemplate(defaultTemplates[0]);
    setMessage('');
    setSenderName('');
    setRecipientName('');
    setRecipientEmail('');
    setShowSuccessModal(false);
    setCreatedPostcard(null);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'scenic_spot': return '景点';
      case 'heritage': return '非遗';
      case 'culture': return '文化';
      default: return '其他';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'scenic_spot': return '🏯';
      case 'heritage': return '🎨';
      case 'culture': return '🎭';
      default: return '📷';
    }
  };

  const steps = [
    { id: 1, name: '选择照片', icon: <Camera className="w-5 h-5" /> },
    { id: 2, name: '选择样式', icon: <LayoutTemplate className="w-5 h-5" /> },
    { id: 3, name: '添加留言', icon: <Edit3 className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-rose-50">
      <Header />
      
      <main className="pt-20">
        <div className="relative h-72 md:h-80 bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center px-4"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
                <Send className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                虚拟明信片
              </h1>
              <p className="text-lg md:text-xl text-white/90 max-w-xl mx-auto">
                选择景点照片，写下温馨祝福，生成专属电子明信片送给亲朋好友
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-center mb-12">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 ${
                    currentStep === step.id
                      ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg'
                      : currentStep > step.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      step.icon
                    )}
                    <span className="font-medium text-sm">{step.name}</span>
                  </div>
                </motion.div>
                {index < steps.length - 1 && (
                  <div className={`w-16 md:w-24 h-1 mx-2 rounded-full ${
                    currentStep > step.id ? 'bg-green-400' : 'bg-gray-200'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">选择一张照片</h2>
                      <p className="text-gray-500">从精选的北京景点、非遗和文化照片中选择一张</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-8">
                    {photoTypes.map((type) => (
                      <motion.button
                        key={type.id}
                        onClick={() => setSelectedPhotoType(type.id)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
                          selectedPhotoType === type.id
                            ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <span className="text-lg">{type.icon}</span>
                        <span>{type.name}</span>
                      </motion.button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {filteredPhotos.map((photo, index) => (
                      <motion.div
                        key={`${photo.id}-${photo.type}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        onClick={() => selectPhoto(photo)}
                        className={`group cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                          selectedPhoto?.id === photo.id && selectedPhoto?.type === photo.type
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={photo.image_url}
                            alt={photo.name}
                            className="w-full h-40 md:h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                          
                          <div className="absolute top-3 left-3">
                            <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 flex items-center gap-1">
                              <span>{getTypeIcon(photo.type)}</span>
                              {getTypeLabel(photo.type)}
                            </span>
                          </div>

                          {selectedPhoto?.id === photo.id && selectedPhoto?.type === photo.type && (
                            <div className="absolute top-3 right-3">
                              <div className="w-8 h-8 rounded-full bg-rose-500 flex items-center justify-center shadow-lg">
                                <Check className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          )}

                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-bold text-base mb-1">{photo.name}</h3>
                            {photo.location && (
                              <p className="text-white/80 text-xs flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {photo.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {filteredPhotos.length === 0 && (
                    <div className="text-center py-16">
                      <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无相关照片</h3>
                      <p className="text-gray-400">请尝试选择其他分类</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                        <LayoutTemplate className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">选择明信片样式</h2>
                        <p className="text-gray-500">选择一款喜欢的样式来设计您的明信片</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={goToPrevStep}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4" />
                      返回
                    </motion.button>
                  </div>

                  {selectedPhoto && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-2xl flex items-center gap-4">
                      <img
                        src={selectedPhoto.image_url}
                        alt={selectedPhoto.name}
                        className="w-20 h-20 rounded-xl object-cover"
                      />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">已选择的照片</p>
                        <h3 className="font-bold text-gray-900">{selectedPhoto.name}</h3>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {templates.map((template, index) => (
                      <motion.div
                        key={template.template_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -4 }}
                        onClick={() => selectTemplate(template)}
                        className={`cursor-pointer rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 ${
                          selectedTemplate?.template_id === template.template_id
                            ? 'border-rose-500 ring-2 ring-rose-200'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="relative">
                          <img
                            src={template.preview_image_url}
                            alt={template.name}
                            className="w-full h-32 md:h-40 object-cover"
                          />
                          <div className="absolute inset-0" style={{ backgroundColor: `${template.background_color}30` }}></div>
                          {selectedTemplate?.template_id === template.template_id && (
                            <div className="absolute top-3 right-3">
                              <div className="w-7 h-7 rounded-full bg-rose-500 flex items-center justify-center shadow-lg">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          )}
                          {template.is_featured && (
                            <div className="absolute top-3 left-3">
                              <span className="px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-bold">
                                热门
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="p-3 bg-white">
                          <h4 className="font-bold text-gray-900 text-sm">{template.name}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{template.description}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      onClick={goToNextStep}
                      disabled={!selectedTemplate}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${
                        selectedTemplate
                          ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg hover:shadow-xl'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      whileHover={selectedTemplate ? { scale: 1.05 } : {}}
                      whileTap={selectedTemplate ? { scale: 0.95 } : {}}
                    >
                      下一步
                      <ArrowRight className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center">
                          <Edit3 className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-gray-900">添加留言信息</h2>
                          <p className="text-gray-500">填写您的祝福和收件人信息</p>
                        </div>
                      </div>
                      <motion.button
                        onClick={goToPrevStep}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-4 h-4" />
                        返回
                      </motion.button>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-rose-500" />
                          您的祝福留言
                        </label>
                        <textarea
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          placeholder="写下您想对朋友说的话..."
                          rows={4}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-300 resize-none"
                          maxLength={200}
                        />
                        <p className="text-right text-xs text-gray-400 mt-1">
                          {message.length}/200
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <User className="w-4 h-4 text-rose-500" />
                            您的名字
                          </label>
                          <input
                            type="text"
                            value={senderName}
                            onChange={(e) => setSenderName(e.target.value)}
                            placeholder="请输入您的名字"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                            <Heart className="w-4 h-4 text-rose-500" />
                            收件人名字
                          </label>
                          <input
                            type="text"
                            value={recipientName}
                            onChange={(e) => setRecipientName(e.target.value)}
                            placeholder="请输入收件人名字"
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-300"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                          <Mail className="w-4 h-4 text-rose-500" />
                          收件人邮箱
                          <span className="text-gray-400 font-normal">（可选，用于发送明信片）</span>
                        </label>
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="请输入收件人邮箱地址"
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all duration-300"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100">
                      <motion.button
                        onClick={goToPrevStep}
                        className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        上一步
                      </motion.button>
                      <motion.button
                        onClick={openPreview}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Eye className="w-5 h-5" />
                        预览明信片
                      </motion.button>
                    </div>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                      <LayoutTemplate className="w-5 h-5 text-rose-500" />
                      实时预览
                    </h3>
                    
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-lg aspect-[4/3]"
                      style={{ backgroundColor: selectedTemplate?.background_color || '#fffaf0' }}
                    >
                      {selectedPhoto && (
                        <img
                          src={selectedPhoto.image_url}
                          alt={selectedPhoto.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      
                      {selectedTemplate?.has_decorations && (
                        <>
                          <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                          <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                        </>
                      )}
                      
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        {selectedPhoto?.name && (
                          <h4 className="text-white font-bold text-lg mb-2" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                            {selectedPhoto.name}
                          </h4>
                        )}
                        
                        {message ? (
                          <p className="text-white/90 text-sm leading-relaxed" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                            "{message}"
                          </p>
                        ) : (
                          <p className="text-white/50 text-sm italic">
                            您的祝福将显示在这里...
                          </p>
                        )}
                        
                        {(senderName || recipientName) && (
                          <div className="mt-3 flex items-center justify-between text-white/80 text-sm">
                            <span>
                              {senderName ? `来自: ${senderName}` : ''}
                            </span>
                            <span>
                              {recipientName ? `致: ${recipientName}` : ''}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-sm text-gray-500">
                      <span>样式: {selectedTemplate?.name || '默认'}</span>
                      <span>照片: {selectedPhoto?.name || '未选择'}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
            className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-rose-500 to-pink-500 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center z-50"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronUp className="w-7 h-7" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowPreviewModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative bg-gradient-to-br from-rose-500 via-pink-500 to-red-500 p-6">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
                
                <h2 className="text-2xl font-bold text-white">预览您的明信片</h2>
                <p className="text-white/80 mt-1">确认无误后即可发送</p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div 
                  className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/3] mx-auto max-w-lg"
                  style={{ backgroundColor: selectedTemplate?.background_color || '#fffaf0' }}
                >
                  {selectedPhoto && (
                    <img
                      src={selectedPhoto.image_url}
                      alt={selectedPhoto.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent"></div>
                  
                  {selectedTemplate?.has_decorations && (
                    <>
                      <div className="absolute top-6 left-6 w-20 h-20 border-t-2 border-l-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                      <div className="absolute top-6 right-6 w-20 h-20 border-t-2 border-r-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                      <div className="absolute bottom-6 left-6 w-20 h-20 border-b-2 border-l-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                      <div className="absolute bottom-6 right-6 w-20 h-20 border-b-2 border-r-2" style={{ borderColor: selectedTemplate?.accent_color || '#f59e0b' }}></div>
                    </>
                  )}
                  
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {selectedPhoto?.name && (
                      <h4 className="text-white font-bold text-2xl mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                        {selectedPhoto.name}
                      </h4>
                    )}
                    
                    {message && (
                      <p className="text-white/95 text-base leading-relaxed mb-4" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                        "{message}"
                      </p>
                    )}
                    
                    {(senderName || recipientName) && (
                      <div className="flex items-center justify-between text-white/90 text-sm">
                        <span className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          {senderName ? `来自: ${senderName}` : ''}
                        </span>
                        <span>
                          {recipientName ? `致: ${recipientName}` : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">照片</span>
                    <span className="font-medium text-gray-900">{selectedPhoto?.name || '未选择'}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">样式</span>
                    <span className="font-medium text-gray-900">{selectedTemplate?.name || '默认'}</span>
                  </div>
                  {recipientEmail && (
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                      <span className="text-green-700">将发送至</span>
                      <span className="font-medium text-green-800">{recipientEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-4">
                <motion.button
                  onClick={() => setShowPreviewModal(false)}
                  className="flex-1 py-3 rounded-xl font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  返回修改
                </motion.button>
                <motion.button
                  onClick={createAndSendPostcard}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {recipientEmail ? '发送明信片' : '生成明信片'}
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl max-w-md w-full overflow-hidden text-center"
            >
              <div className="relative bg-gradient-to-br from-green-500 to-emerald-500 p-8">
                <div className="w-20 h-20 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">明信片创建成功！</h2>
                <p className="text-white/80 mt-2">
                  {recipientEmail ? '已发送至收件人邮箱' : '您可以分享链接给朋友'}
                </p>
              </div>

              <div className="p-6">
                {createdPostcard && (
                  <div className="mb-6">
                    <div 
                      className="relative rounded-xl overflow-hidden shadow-md aspect-[4/3] mx-auto max-w-sm"
                      style={{ backgroundColor: selectedTemplate?.background_color || '#fffaf0' }}
                    >
                      {selectedPhoto && (
                        <img
                          src={selectedPhoto.image_url}
                          alt={selectedPhoto.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h4 className="text-white font-bold">{selectedPhoto?.name}</h4>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <motion.button
                    onClick={copyShareUrl}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {shareUrlCopied ? (
                      <>
                        <Check className="w-5 h-5 text-green-500" />
                        已复制链接
                      </>
                    ) : (
                      <>
                        <Copy className="w-5 h-5" />
                        复制分享链接
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={resetForm}
                    className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-rose-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Camera className="w-5 h-5" />
                    再做一张
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VirtualPostcardPage;
