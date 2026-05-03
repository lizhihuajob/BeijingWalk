import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Brain,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Home,
  User,
  Star,
  Award,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  getQuizCategories,
  startQuiz,
  submitAnswer,
  getGameResult,
  getLeaderboard
} from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';

const QuizPage = () => {
  const [gameState, setGameState] = useState('categories');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [currentGame, setCurrentGame] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [answerTime, setAnswerTime] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  
  const timerRef = useRef(null);
  const { user, token, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/quiz' } } });
      return;
    }
    
    fetchData();
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isAuthenticated, navigate]);
  
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [categoriesData, leaderboardData] = await Promise.all([
        getQuizCategories(),
        getLeaderboard('score', 10)
      ]);
      setCategories(categoriesData || []);
      setLeaderboard(leaderboardData?.leaderboard || []);
    } catch (err) {
      console.error('Error fetching quiz data:', err);
      setError('加载数据失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const startTimer = () => {
    setQuestionStartTime(Date.now());
    setAnswerTime(0);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    timerRef.current = setInterval(() => {
      if (questionStartTime) {
        setAnswerTime(Math.floor((Date.now() - questionStartTime) / 1000));
      }
    }, 1000);
  };
  
  const handleStartGame = async (categoryId = null) => {
    if (!token) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const data = await startQuiz(token, categoryId, 10);
      setCurrentGame(data.game);
      setCurrentQuestion(data.current_question);
      setSelectedAnswer(null);
      setShowResult(false);
      setIsCorrect(null);
      setGameState('playing');
      startTimer();
    } catch (err) {
      console.error('Error starting quiz:', err);
      setError(err.response?.data?.error || '开始游戏失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectAnswer = (answer) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };
  
  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !currentGame || !token) return;
    
    setIsLoading(true);
    
    try {
      const timeSpent = questionStartTime 
        ? Math.floor((Date.now() - questionStartTime) / 1000) 
        : 0;
      
      const data = await submitAnswer(token, currentGame.id, selectedAnswer, timeSpent);
      
      setIsCorrect(data.is_correct);
      setShowResult(true);
      setCurrentGame(data.game);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (data.is_game_complete) {
        setTimeout(async () => {
          try {
            const result = await getGameResult(token, currentGame.id);
            setGameResult(result);
            setGameState('result');
          } catch (err) {
            console.error('Error fetching game result:', err);
          }
        }, 1500);
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('提交答案失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleNextQuestion = () => {
    if (!currentGame || !token) return;
    
    setSelectedAnswer(null);
    setShowResult(false);
    setIsCorrect(null);
    
    const nextIndex = currentGame.current_question_index;
    
    const gameQuestion = currentGame.questions?.[nextIndex];
    if (gameQuestion) {
      setCurrentQuestion(gameQuestion.question);
      startTimer();
    }
  };
  
  const handlePlayAgain = () => {
    setGameState('categories');
    setCurrentGame(null);
    setCurrentQuestion(null);
    setGameResult(null);
    setNewBadges([]);
    fetchData();
  };
  
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-amber-600 bg-amber-100';
      case 'hard':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  
  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };
  
  const getOptionButtonClass = (option) => {
    const baseClass = 'w-full p-4 rounded-xl text-left transition-all duration-300 border-2 ';
    
    if (showResult) {
      if (option === currentQuestion?.correct_option) {
        return baseClass + 'border-green-500 bg-green-50 text-green-800';
      }
      if (option === selectedAnswer && !isCorrect) {
        return baseClass + 'border-red-500 bg-red-50 text-red-800';
      }
      return baseClass + 'border-gray-200 bg-gray-50 text-gray-400';
    }
    
    if (selectedAnswer === option) {
      return baseClass + 'border-orange-500 bg-orange-50 text-orange-800';
    }
    
    return baseClass + 'border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-orange-50';
  };
  
  const renderCategories = () => (
    <div className="space-y-8">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-500 flex items-center justify-center shadow-2xl"
        >
          <Brain className="w-12 h-12 text-white" />
        </motion.div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          知识问答闯关
        </h1>
        <p className="text-lg text-gray-600 max-w-md mx-auto">
          测试你对北京文化、历史的了解，答对获得积分和徽章！
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleStartGame(null)}
          className="p-6 bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl text-white text-left shadow-lg hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold mb-1">随机挑战</h3>
              <p className="text-white/80 text-sm">随机抽取各类题目</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-white/90 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              约5分钟
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              10道题目
            </span>
          </div>
        </motion.button>
        
        {categories.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleStartGame(category.id)}
            className="p-6 bg-white rounded-2xl text-left shadow-lg hover:shadow-xl transition-all border border-gray-100"
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${category.color || 'from-gray-400 to-gray-500'} rounded-xl flex items-center justify-center text-2xl`}>
                {category.icon || '📚'}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {category.name}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">
                  {category.description}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                {category.question_count || 0} 道题目
              </span>
              <ArrowRight className="w-5 h-5 text-orange-500" />
            </div>
          </motion.button>
        ))}
      </div>
      
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-500" />
            积分排行榜
          </h2>
          <div className="space-y-3">
            {leaderboard.slice(0, 5).map((player, index) => (
              <div
                key={player.id}
                className={`flex items-center gap-4 p-3 rounded-xl ${
                  index === 0 ? 'bg-amber-50 border border-amber-200' :
                  index === 1 ? 'bg-gray-50 border border-gray-200' :
                  index === 2 ? 'bg-orange-50 border border-orange-200' :
                  'bg-gray-50/50'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-amber-500 text-white' :
                  index === 1 ? 'bg-gray-400 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold">
                  {player.nickname?.charAt(0) || player.username?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {player.nickname || player.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    答题正确率 {player.accuracy_rate}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600">
                    {player.total_score} 分
                  </p>
                  <p className="text-xs text-gray-400">
                    完成 {player.quizzes_completed} 次
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
  
  const renderPlaying = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => setGameState('categories')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>退出</span>
        </button>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-5 h-5" />
            <span className="font-mono">{answerTime}s</span>
          </div>
          <div className="flex items-center gap-2 text-orange-600">
            <Star className="w-5 h-5" />
            <span className="font-bold">{currentGame?.score || 0} 分</span>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
          <span>题目进度</span>
          <span>
            {currentGame?.current_question_index + 1} / {currentGame?.total_questions}
          </span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
            initial={{ width: 0 }}
            animate={{ 
              width: `${((currentGame?.current_question_index + 1) / currentGame?.total_questions) * 100}%` 
            }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
      
      <motion.div
        key={currentQuestion?.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-2xl shadow-xl p-6 mb-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(currentQuestion?.difficulty)}`}>
            {getDifficultyLabel(currentQuestion?.difficulty)}
          </span>
          <span className="text-orange-600 text-sm flex items-center gap-1">
            <Star className="w-4 h-4" />
            +{currentQuestion?.points || 10} 分
          </span>
        </div>
        
        <h2 className="text-xl font-bold text-gray-900 mb-8 leading-relaxed">
          {currentQuestion?.question_text}
        </h2>
        
        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionText = currentQuestion?.[`option_${option.toLowerCase()}`];
            if (!optionText) return null;
            
            return (
              <motion.button
                key={option}
                whileHover={!showResult ? { scale: 1.02 } : {}}
                whileTap={!showResult ? { scale: 0.98 } : {}}
                onClick={() => handleSelectAnswer(option)}
                disabled={showResult}
                className={getOptionButtonClass(option)}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    showResult
                      ? option === currentQuestion?.correct_option
                        ? 'bg-green-500 text-white'
                        : option === selectedAnswer && !isCorrect
                          ? 'bg-red-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      : selectedAnswer === option
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                  }`}>
                    {option}
                  </span>
                  <span className="flex-1">{optionText}</span>
                  {showResult && option === currentQuestion?.correct_option && (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  )}
                  {showResult && option === selectedAnswer && !isCorrect && (
                    <XCircle className="w-6 h-6 text-red-500" />
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
        
        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-6 p-4 rounded-xl ${
                isCorrect 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className={`font-semibold ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isCorrect 
                      ? `回答正确！+${currentQuestion?.points || 10} 分` 
                      : '回答错误'}
                  </p>
                  {currentQuestion?.explanation && (
                    <p className={`mt-2 text-sm ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      解析：{currentQuestion.explanation}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      <div className="flex gap-3">
        {!showResult ? (
          <button
            onClick={handleSubmitAnswer}
            disabled={!selectedAnswer || isLoading}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                确认答案
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        ) : (
          <button
            onClick={handleNextQuestion}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            {currentGame?.current_question_index < currentGame?.total_questions ? (
              <>
                下一题
                <ArrowRight className="w-5 h-5" />
              </>
            ) : (
              <>
                查看结果
                <Trophy className="w-5 h-5" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
  
  const renderResult = () => {
    if (!gameResult && !currentGame) return null;
    
    const result = gameResult || currentGame;
    const accuracy = result?.accuracy_rate || 0;
    const correctCount = result?.correct_count || 0;
    const totalQuestions = result?.total_questions || 0;
    const score = result?.score || 0;
    
    let resultMessage = '';
    let resultEmoji = '';
    
    if (accuracy >= 90) {
      resultMessage = '太棒了！你是北京文化专家！';
      resultEmoji = '🏆';
    } else if (accuracy >= 70) {
      resultMessage = '表现不错！继续加油！';
      resultEmoji = '🌟';
    } else if (accuracy >= 50) {
      resultMessage = '还需要努力学习哦！';
      resultEmoji = '💪';
    } else {
      resultMessage = '再接再厉，下次会更好！';
      resultEmoji = '📚';
    }
    
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="text-center mb-8"
        >
          <div className="text-8xl mb-6">{resultEmoji}</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            游戏完成！
          </h1>
          <p className="text-lg text-gray-600">{resultMessage}</p>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl p-8 mb-6"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-orange-400 to-amber-500 rounded-2xl flex items-center justify-center">
                <Star className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{score}</p>
              <p className="text-sm text-gray-500">获得积分</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{correctCount}</p>
              <p className="text-sm text-gray-500">答对题目</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-red-400 to-rose-500 rounded-2xl flex items-center justify-center">
                <XCircle className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {totalQuestions - correctCount}
              </p>
              <p className="text-sm text-gray-500">答错题目</p>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl flex items-center justify-center ${
                accuracy >= 70 
                  ? 'bg-gradient-to-br from-purple-400 to-pink-500'
                  : 'bg-gradient-to-br from-gray-400 to-gray-500'
              }`}>
                <Award className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{accuracy}%</p>
              <p className="text-sm text-gray-500">正确率</p>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200">
            <p className="text-center text-orange-800">
              <span className="font-semibold">当前总积分：</span>
              <span className="text-2xl font-bold ml-2">{user?.total_score || 0} 分</span>
            </p>
          </div>
        </motion.div>
        
        {gameResult?.questions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-xl p-6 mb-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">答题详情</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {gameResult.questions.map((item, index) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border ${
                    item.is_correct 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      item.is_correct ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {item.is_correct ? (
                        <CheckCircle className="w-4 h-4 text-white" />
                      ) : (
                        <XCircle className="w-4 h-4 text-white" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {index + 1}. {item.question?.question_text}
                      </p>
                      <div className="mt-2 space-y-1">
                        <p className={`text-sm ${
                          item.user_answer === item.question?.correct_option
                            ? 'text-green-700'
                            : 'text-red-700'
                        }`}>
                          你的答案：{item.user_answer}
                        </p>
                        <p className="text-sm text-green-700">
                          正确答案：{item.question?.correct_option}
                        </p>
                        {item.is_correct && (
                          <p className="text-sm text-orange-600">
                            +{item.points_earned} 分
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex gap-3"
        >
          <button
            onClick={handlePlayAgain}
            className="flex-1 py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-xl hover:from-orange-600 hover:to-amber-600 focus:ring-4 focus:ring-orange-500/30 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            再玩一次
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="flex-1 py-4 bg-white text-gray-700 font-semibold rounded-xl border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
          >
            <User className="w-5 h-5" />
            查看个人中心
          </button>
        </motion.div>
      </div>
    );
  };
  
  if (isLoading && gameState === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
        <Header />
        <div className="pt-24 pb-16 px-4 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 mx-auto text-orange-500 animate-spin mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Header />
      
      <div className="pt-24 pb-16 px-4">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md mx-auto mb-6 flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
              <button
                onClick={fetchData}
                className="ml-auto text-red-600 hover:text-red-800 text-sm font-medium"
              >
                重试
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        
        {gameState === 'categories' && renderCategories()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'result' && renderResult()}
      </div>
      
      <Footer />
    </div>
  );
};

export default QuizPage;
