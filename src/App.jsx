import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Settings, Clock, Zap, Target, Plus, Trash2, Play, Pause, Check, Archive, AlertCircle, MessageCircle, Send, Sparkles, Loader, Palette } from 'lucide-react';
import { evaluateTask as evaluateTaskAPI, generateGuide as generateGuideAPI, getChatResponse, getModelOptions } from './utils/geminiAPI';

export default function AlchemistCompass() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeTab, setActiveTab] = useState('want');
  const [tasks, setTasks] = useState({ want: [], should: [] });
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [mode, setMode] = useState('list');
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const timerRef = useRef(null);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-exp');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoEvaluate, setAutoEvaluate] = useState(false);
  
  // Loading states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [guide, setGuide] = useState(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  const modelOptions = getModelOptions();

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('alchemist-tasks');
    const savedApiKey = localStorage.getItem('alchemist-api-key');
    const savedModel = localStorage.getItem('alchemist-model');
    const savedNotifications = localStorage.getItem('alchemist-notifications');
    const savedAutoEval = localStorage.getItem('alchemist-auto-eval');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    if (savedNotifications !== null) {
      setNotificationsEnabled(savedNotifications === 'true');
    }
    if (savedAutoEval !== null) {
      setAutoEvaluate(savedAutoEval === 'true');
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('alchemist-tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Save settings
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('alchemist-api-key', apiKey);
    }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('alchemist-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('alchemist-notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('alchemist-auto-eval', autoEvaluate.toString());
  }, [autoEvaluate]);

  // Timer logic
  useEffect(() => {
    if (isRunning && !isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused, timeLeft]);

  // Auto-complete when timer ends
  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setMode('complete');
    }
  }, [timeLeft, isRunning]);

  // Delete task from list
  const deleteTask = (e, taskId) => {
    e.stopPropagation();
    if (window.confirm('このタスクを削除しますか？')) {
      setTasks(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(t => t.id !== taskId)
      }));
    }
  };

  // Add task with AI evaluation
  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsEvaluating(true);
    setErrorMessage('');
    
    try {
      let evaluation;
      if (apiKey) {
        evaluation = await evaluateTaskAPI(newTaskTitle, activeTab, {}, apiKey, selectedModel);
      } else {
        const impact = Math.floor(Math.random() * 4) + 7;
        const ease = Math.floor(Math.random() * 5) + 6;
        evaluation = {
          impact,
          ease,
          estimatedMinutes: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
          reason: 'API Keyを設定するとAI評価が有効になります',
          score: impact * ease
        };
      }

      const task = {
        id: Date.now(),
        title: newTaskTitle,
        category: activeTab,
        ...evaluation,
        createdAt: new Date().toISOString()
      };

      setTasks(prev => ({
        ...prev,
        [activeTab]: [...prev[activeTab], task].sort((a, b) => b.score - a.score)
      }));
      
      setNewTaskTitle('');
      setShowAddTask(false);
    } catch (error) {
      console.error('Task evaluation failed:', error);
      setErrorMessage(error.message || 'タスク評価に失敗しました。API Keyやモデル設定を確認してください。');
      
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsEvaluating(false);
    }
  };

  const selectTask = async (task) => {
    setSelectedTask(task);
    setMode('guide');
    setChatMessages([]);
    setGuide(null);
    setErrorMessage('');
    
    if (apiKey) {
      setIsLoadingGuide(true);
      try {
        const generatedGuide = await generateGuideAPI(task, {}, apiKey, selectedModel);
        setGuide(generatedGuide);
      } catch (error) {
        console.error('Guide generation failed:', error);
        setGuide({
          approach: 'MVP思考で素早く形にすることを重視。Decision Flowのような2時間完成を目指しましょう。',
          steps: [
            '最小限の機能（1-2機能）を紙に書き出し、優先度を決める（2分）',
            'プロトタイプを作成。完璧でなくてOK、まず動くものを（60分）',
            'テストして改善点をリストアップ。フィードバックループを開始（30分）'
          ],
          completion: '動作するMVPが完成し、次の改善点が明確になっていること'
        });
      } finally {
        setIsLoadingGuide(false);
      }
    } else {
      setGuide({
        approach: 'MVP思考で素早く形にすることを重視。Decision Flowのような2時間完成を目指しましょう。',
        steps: [
          '最小限の機能（1-2機能）を紙に書き出し、優先度を決める（2分）',
          'プロトタイプを作成。完璧でなくてOK、まず動くものを（60分）',
          'テストして改善点をリストアップ。フィードバックループを開始（30分）'
        ],
        completion: '動作するMVPが完成し、次の改善点が明確になっていること'
      });
    }
  };

  const startTimer = () => {
    setMode('timer');
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(5 * 60);
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const completeTask = (status) => {
    if (status === 'complete' || status === 'drop') {
      setTasks(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(t => t.id !== selectedTask.id)
      }));
    }
    setMode('list');
    setSelectedTask(null);
    setIsRunning(false);
    setTimeLeft(5 * 60);
    setCurrentPage('home');
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    if (apiKey) {
      setIsSendingMessage(true);
      try {
        const response = await getChatResponse(
          userMessage,
          {
            title: selectedTask.title,
            timeLeft
          },
          chatMessages,
          apiKey,
          selectedModel
        );
        setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error('Chat response failed:', error);
        setChatMessages(prev => [...prev, { 
          role: 'assistant', 
          content: '考えすぎず、まず手を動かしましょう。小さな一歩から始めてください。' 
        }]);
      } finally {
        setIsSendingMessage(false);
      }
    } else {
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: '考えすぎず、まず手を動かしましょう。小さな一歩から始めてください。' 
      }]);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const allTasks = [...tasks.want, ...tasks.should];
  const currentTasks = tasks[activeTab] || [];
  const avgScore = allTasks.length > 0 ? Math.round(allTasks.reduce((acc, t) => acc + t.score, 0) / allTasks.length) : 0;

  return (
    <div className="min-h-screen bg-black text-white font-mono flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center" style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.5)' }}>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">ALCHEMIST'S COMPASS</h1>
              <p className="text-xs text-gray-500">AI-Powered Task Management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {apiKey ? (
              <div className="px-3 py-1 rounded bg-green-500/20 border border-green-500/50 text-green-400 text-xs" style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}>
                ● ONLINE
              </div>
            ) : (
              <div className="px-3 py-1 rounded bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs" style={{ boxShadow: '0 2px 8px rgba(251,191,36,0.3)' }}>
                ⚠ OFFLINE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* HOME PAGE */}
        {currentPage === 'home' && mode === 'list' && (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('want')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'want'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-800'
                }`}
                style={activeTab === 'want' ? { boxShadow: '0 4px 12px rgba(59,130,246,0.5)' } : { boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  WANT ({currentTasks.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('should')}
                className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all ${
                  activeTab === 'should'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-900 text-gray-400 border border-gray-800'
                }`}
                style={activeTab === 'should' ? { boxShadow: '0 4px 12px rgba(6,182,212,0.5)' } : { boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  SHOULD ({tasks.should?.length || 0})
                </div>
              </button>
            </div>

            {/* Add Task Button */}
            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className="w-full py-4 mb-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-blue-500 text-gray-400 hover:text-blue-400 transition-all flex items-center justify-center gap-2"
                style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
              >
                <Plus className="w-5 h-5" />
                ADD NEW TASK
              </button>
            ) : (
              <div className="mb-6 p-4 rounded-xl bg-gray-900 border border-blue-500" style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.3)' }}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isEvaluating && addTask()}
                  placeholder="Enter task title..."
                  className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 mb-3 text-white outline-none focus:border-blue-500"
                  autoFocus
                  disabled={isEvaluating}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addTask}
                    disabled={isEvaluating}
                    className="flex-1 py-2 px-4 rounded-lg bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.4)' }}
                  >
                    {isEvaluating ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        EVALUATING...
                      </>
                    ) : (
                      'ADD'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskTitle('');
                      setErrorMessage('');
                    }}
                    disabled={isEvaluating}
                    className="py-2 px-4 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 disabled:opacity-50"
                    style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Task Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-gray-900 rounded-xl border border-gray-800 hover:border-blue-500 transition-all p-4 cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}
                  onClick={() => selectTask(task)}
                >
                  {/* Score Badge */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-white mb-1">{task.title}</h3>
                      <div className="text-xs text-gray-500">ID: #{task.id.toString().padStart(4, '0')}</div>
                    </div>
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-col" style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.6)' }}>
                      <div className="text-2xl font-bold">{task.score}</div>
                      <div className="text-[10px]">SCORE</div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="space-y-3 mb-4">
                    {/* Impact */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Zap className="w-3 h-3" />
                          IMPACT
                        </div>
                        <span className="text-xs font-mono text-white">{task.impact}/10</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                          style={{ width: `${(task.impact / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Ease */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Target className="w-3 h-3" />
                          EASE
                        </div>
                        <span className="text-xs font-mono text-white">{task.ease}/10</span>
                      </div>
                      <div className="h-2 bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-500"
                          style={{ width: `${(task.ease / 10) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-800">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Clock className="w-3 h-3" />
                        TIME ESTIMATE
                      </div>
                      <span className="text-xs font-mono text-white">{task.estimatedMinutes} MIN</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {task.reason && (
                    <div className="mb-3 text-xs text-cyan-400 opacity-80">
                      {task.reason}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTask(task);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 text-xs flex items-center justify-center gap-2" 
                      style={{ boxShadow: '0 2px 6px rgba(59,130,246,0.3)' }}
                    >
                      <Play className="w-3 h-3" />
                      START
                    </button>
                    <button
                      onClick={(e) => deleteTask(e, task.id)}
                      className="py-2 px-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30"
                      style={{ boxShadow: '0 2px 6px rgba(239,68,68,0.3)' }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {currentTasks.length === 0 && (
              <div className="text-center py-12 text-gray-600">
                <div className="text-4xl mb-2">○</div>
                <p className="text-sm">NO TASKS FOUND</p>
                <p className="text-xs mt-1 text-gray-700">Add a task to get started</p>
              </div>
            )}
          </>
        )}

        {/* GUIDE PAGE */}
        {currentPage === 'home' && mode === 'guide' && selectedTask && (
          <div className="space-y-6">
            <button
              onClick={() => setMode('list')}
              className="text-sm text-gray-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              ← BACK TO LIST
            </button>

            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <h2 className="text-xl font-bold mb-4 text-white">{selectedTask.title}</h2>
              
              {isLoadingGuide ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin text-blue-500" />
                </div>
              ) : guide && (
                <>
                  <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="text-xs font-bold text-blue-400 mb-2">YOUR APPROACH</div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {guide.approach}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-bold text-gray-400 mb-3">RECOMMENDED STEPS</div>
                    <div className="space-y-2">
                      {guide.steps.map((step, i) => (
                        <div key={i} className="p-3 rounded-lg bg-black border border-gray-800 text-sm text-gray-300 leading-relaxed">
                          {i + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="text-xs font-bold text-green-400 mb-2">COMPLETION CRITERIA</div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {guide.completion}
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={startTimer}
                className="w-full py-4 px-4 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center justify-center gap-2 font-bold"
                style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.5)' }}
              >
                <Play className="w-5 h-5" />
                START 5-MIN TIMER
              </button>
            </div>
          </div>
        )}

        {/* TIMER PAGE */}
        {currentPage === 'home' && mode === 'timer' && selectedTask && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-9xl font-bold text-blue-500 mb-4" style={{ textShadow: '0 4px 24px rgba(59,130,246,0.5)' }}>
                {formatTime(timeLeft)}
              </div>
              <div className="text-xl text-white mb-6">
                {selectedTask.title}
              </div>

              <div className="flex gap-3 justify-center mb-8">
                <button
                  onClick={togglePause}
                  className="py-3 px-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-300 transition-all flex items-center gap-2"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.4)' }}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setMode('complete');
                  }}
                  className="py-3 px-6 rounded-xl bg-blue-500 hover:bg-blue-600 text-white transition-all flex items-center gap-2"
                  style={{ boxShadow: '0 4px 12px rgba(59,130,246,0.5)' }}
                >
                  <Check className="w-5 h-5" />
                  COMPLETE
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center gap-2 mb-3 text-xs text-gray-400">
                <MessageCircle className="w-4 h-4" />
                ASK AI COACH
              </div>
              
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded-lg text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-blue-500/20 text-blue-300 ml-8 border border-blue-500/30'
                        : 'bg-black text-gray-300 mr-8 border border-gray-800'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="p-2 rounded-lg text-sm bg-black text-gray-300 mr-8 border border-gray-800 flex items-center gap-2">
                    <Loader className="w-3 h-3 animate-spin" />
                    Thinking...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && sendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 bg-black border border-gray-800 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSendingMessage}
                  className="py-2 px-4 rounded-lg bg-blue-500/20 border border-blue-500/50 text-blue-400 hover:bg-blue-500/30 disabled:opacity-50"
                  style={{ boxShadow: '0 2px 6px rgba(59,130,246,0.3)' }}
                >
                  {isSendingMessage ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COMPLETE PAGE */}
        {currentPage === 'home' && mode === 'complete' && selectedTask && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-white">TASK COMPLETED!</h2>
            <p className="text-gray-400">{selectedTask.title}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => completeTask('complete')}
                className="py-3 px-6 rounded-xl bg-green-500/20 border border-green-500/50 text-green-400 hover:bg-green-500/30 flex items-center gap-2"
                style={{ boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }}
              >
                <Check className="w-5 h-5" />
                DONE
              </button>
              <button
                onClick={() => completeTask('defer')}
                className="py-3 px-6 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 flex items-center gap-2"
                style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
              >
                <Clock className="w-5 h-5" />
                DEFER
              </button>
              <button
                onClick={() => completeTask('drop')}
                className="py-3 px-6 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 flex items-center gap-2"
                style={{ boxShadow: '0 2px 6px rgba(239,68,68,0.3)' }}
              >
                <Archive className="w-5 h-5" />
                DROP
              </button>
            </div>
          </div>
        )}

        {/* ANALYTICS PAGE */}
        {currentPage === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">ANALYTICS DASHBOARD</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div className="text-3xl font-bold text-blue-500">{allTasks.length}</div>
                <div className="text-xs text-gray-500 mt-1">TOTAL TASKS</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div className="text-3xl font-bold text-cyan-500">{tasks.want.length}</div>
                <div className="text-xs text-gray-500 mt-1">WANT TASKS</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div className="text-3xl font-bold text-green-500">{tasks.should.length}</div>
                <div className="text-xs text-gray-500 mt-1">SHOULD TASKS</div>
              </div>
              <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
                <div className="text-3xl font-bold text-purple-500">{avgScore}</div>
                <div className="text-xs text-gray-500 mt-1">AVG SCORE</div>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <h3 className="text-sm font-bold mb-4 text-gray-400">TASK DISTRIBUTION</h3>
              <div className="h-48 flex items-end justify-around gap-2">
                {[65, 45, 80, 55, 70, 60, 85].map((height, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-500 rounded-t transition-all duration-500" 
                    style={{ 
                      height: `${height}%`, 
                      boxShadow: '0 -2px 8px rgba(59,130,246,0.4)' 
                    }} 
                  />
                ))}
              </div>
              <div className="flex justify-around mt-2 text-xs text-gray-600">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </div>

            {/* Task Summary */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <h3 className="text-sm font-bold mb-4 text-gray-400">RECENT ACTIVITY</h3>
              {allTasks.length > 0 ? (
                <div className="space-y-2">
                  {allTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-black rounded-lg border border-gray-800">
                      <div className="flex-1">
                        <div className="text-sm text-white">{task.title}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {task.category === 'want' ? 'WANT' : 'SHOULD'} • Score: {task.score}
                        </div>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm font-bold" style={{ boxShadow: '0 2px 8px rgba(59,130,246,0.4)' }}>
                        {task.score}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-sm">No activity yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SETTINGS PAGE */}
        {currentPage === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">SETTINGS</h2>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-2">GEMINI API KEY</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIxxxxx..."
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500"
                    style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                      Get API Key
                    </a>
                    {' • Free tier available'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs text-gray-400 block mb-2">AI MODEL</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full bg-black border border-gray-800 rounded-lg px-3 py-2 text-white outline-none focus:border-blue-500" 
                    style={{ boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    {modelOptions.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex gap-3 text-xs text-gray-600">
                    <span>Speed: {modelOptions.find(m => m.id === selectedModel)?.speed}</span>
                    <span>Quality: {modelOptions.find(m => m.id === selectedModel)?.quality}</span>
                    <span>Cost: {modelOptions.find(m => m.id === selectedModel)?.cost}</span>
                  </div>
                </div>

                {/* Toggle Switches */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                  <span className="text-sm text-gray-400">NOTIFICATIONS</span>
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full relative transition-all ${
                      notificationsEnabled ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    style={notificationsEnabled ? { boxShadow: '0 2px 8px rgba(59,130,246,0.5)' } : { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    <div 
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                        notificationsEnabled ? 'right-0.5' : 'left-0.5'
                      }`}
                      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-gray-400">AUTO-EVALUATE</span>
                  <button
                    onClick={() => setAutoEvaluate(!autoEvaluate)}
                    className={`w-12 h-6 rounded-full relative transition-all ${
                      autoEvaluate ? 'bg-blue-500' : 'bg-gray-700'
                    }`}
                    style={autoEvaluate ? { boxShadow: '0 2px 8px rgba(59,130,246,0.5)' } : { boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)' }}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${
                        autoEvaluate ? 'right-0.5' : 'left-0.5'
                      }`}
                      style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Version Info */}
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.5)' }}>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>VERSION</span>
                <span className="font-mono">1.0.0</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                <span>BUILD</span>
                <span className="font-mono">2025.10.07</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="border-t border-gray-800 bg-black" style={{ boxShadow: '0 -4px 12px rgba(0,0,0,0.5)' }}>
        <div className="flex justify-around py-3">
          <button
            onClick={() => {
              setCurrentPage('home');
              setMode('list');
            }}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              currentPage === 'home' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'
            }`}
            style={currentPage === 'home' ? { boxShadow: '0 2px 12px rgba(59,130,246,0.4)' } : {}}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] font-bold">HOME</span>
          </button>
          <button
            onClick={() => setCurrentPage('analytics')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              currentPage === 'analytics' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'
            }`}
            style={currentPage === 'analytics' ? { boxShadow: '0 2px 12px rgba(59,130,246,0.4)' } : {}}
          >
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-bold">ANALYTICS</span>
          </button>
          <button
            onClick={() => setCurrentPage('settings')}
            className={`flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all ${
              currentPage === 'settings' ? 'text-blue-500' : 'text-gray-600 hover:text-gray-400'
            }`}
            style={currentPage === 'settings' ? { boxShadow: '0 2px 12px rgba(59,130,246,0.4)' } : {}}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold">SETTINGS</span>
          </button>
        </div>
      </div>
    </div>
  );
}