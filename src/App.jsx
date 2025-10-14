import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Settings, Clock, Zap, Target, Plus, Trash2, Play, Pause, Check, Archive, AlertCircle, MessageCircle, Send, Sparkles, Loader, Palette, Upload, FileText, User, BookOpen, StickyNote, List, Edit, X, Eye } from 'lucide-react';
import { evaluateTask as evaluateTaskAPI, generateGuide as generateGuideAPI, getChatResponse, getModelOptions, bulkEvaluateTasks } from './utils/geminiAPI';
import { themes, applyTheme } from './utils/themes';

export default function AlchemistCompass() {
  const [currentPage, setCurrentPage] = useState('home');
  const [activeTab, setActiveTab] = useState('want');
  const [tasks, setTasks] = useState({ want: [], should: [] });
  const [actionLogs, setActionLogs] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [bulkTaskText, setBulkTaskText] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [mode, setMode] = useState('list');
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [preActionNote, setPreActionNote] = useState('');
  const [postActionNote, setPostActionNote] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [editingLogIndex, setEditingLogIndex] = useState(null);
  const [editingLogData, setEditingLogData] = useState(null);
  const timerRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Settings
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gemini-2.0-flash-exp');
  const [selectedTheme, setSelectedTheme] = useState('dashboard');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoEvaluate, setAutoEvaluate] = useState(false);
  
  // Personalization
  const [userName, setUserName] = useState('');
  const [userContext, setUserContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  
  // Loading states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [guide, setGuide] = useState(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  const modelOptions = getModelOptions();
  const themeOptions = Object.values(themes);
  const durationOptions = [5, 10, 15, 25, 30];

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('alchemist-tasks');
    const savedActionLogs = localStorage.getItem('alchemist-action-logs');
    const savedApiKey = localStorage.getItem('alchemist-api-key');
    const savedModel = localStorage.getItem('alchemist-model');
    const savedTheme = localStorage.getItem('alchemist-theme');
    const savedNotifications = localStorage.getItem('alchemist-notifications');
    const savedAutoEval = localStorage.getItem('alchemist-auto-eval');
    const savedUserName = localStorage.getItem('alchemist-user-name');
    const savedUserContext = localStorage.getItem('alchemist-user-context');
    const savedCustomInstructions = localStorage.getItem('alchemist-custom-instructions');
    const savedFiles = localStorage.getItem('alchemist-uploaded-files');
    
    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedActionLogs) setActionLogs(JSON.parse(savedActionLogs));
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedModel) setSelectedModel(savedModel);
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('dashboard');
    }
    if (savedNotifications !== null) setNotificationsEnabled(savedNotifications === 'true');
    if (savedAutoEval !== null) setAutoEvaluate(savedAutoEval === 'true');
    if (savedUserName) setUserName(savedUserName);
    if (savedUserContext) setUserContext(savedUserContext);
    if (savedCustomInstructions) setCustomInstructions(savedCustomInstructions);
    if (savedFiles) setUploadedFiles(JSON.parse(savedFiles));
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('alchemist-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('alchemist-action-logs', JSON.stringify(actionLogs));
  }, [actionLogs]);

  useEffect(() => {
    if (apiKey) localStorage.setItem('alchemist-api-key', apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('alchemist-model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('alchemist-theme', selectedTheme);
    applyTheme(selectedTheme);
  }, [selectedTheme]);

  useEffect(() => {
    localStorage.setItem('alchemist-notifications', notificationsEnabled.toString());
  }, [notificationsEnabled]);

  useEffect(() => {
    localStorage.setItem('alchemist-auto-eval', autoEvaluate.toString());
  }, [autoEvaluate]);

  useEffect(() => {
    if (userName) localStorage.setItem('alchemist-user-name', userName);
  }, [userName]);

  useEffect(() => {
    if (userContext) localStorage.setItem('alchemist-user-context', userContext);
  }, [userContext]);

  useEffect(() => {
    if (customInstructions) localStorage.setItem('alchemist-custom-instructions', customInstructions);
  }, [customInstructions]);

  useEffect(() => {
    localStorage.setItem('alchemist-uploaded-files', JSON.stringify(uploadedFiles));
  }, [uploadedFiles]);

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

  useEffect(() => {
    if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setMode('complete');
    }
  }, [timeLeft, isRunning]);

  // File upload handler
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
      setErrorMessage('Only .md and .txt files are supported');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const newFile = {
        id: Date.now(),
        name: file.name,
        content: content,
        uploadedAt: new Date().toISOString()
      };
      setUploadedFiles(prev => [...prev, newFile]);
    };
    reader.readAsText(file);
  };

  const deleteFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const deleteTask = (e, taskId) => {
    e.stopPropagation();
    if (window.confirm('このタスクを削除しますか?')) {
      setTasks(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(t => t.id !== taskId)
      }));
    }
  };

  const bulkDeleteTasks = () => {
    if (window.confirm(`${activeTab.toUpperCase()}ボードの全てのタスク (${tasks[activeTab].length}件) を削除しますか?`)) {
      setTasks(prev => ({
        ...prev,
        [activeTab]: []
      }));
    }
  };

  const deleteLog = (index) => {
    if (window.confirm('このログを削除しますか?')) {
      setActionLogs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const startEditingLog = (index) => {
    setEditingLogIndex(index);
    setEditingLogData({ ...actionLogs[index] });
  };

  const saveEditedLog = () => {
    if (editingLogIndex !== null && editingLogData) {
      setActionLogs(prev => prev.map((log, i) => i === editingLogIndex ? editingLogData : log));
      setEditingLogIndex(null);
      setEditingLogData(null);
    }
  };

  const cancelEditingLog = () => {
    setEditingLogIndex(null);
    setEditingLogData(null);
  };

  const viewLogDetail = (log) => {
    setSelectedLog(log);
    setMode('log-detail');
    setCurrentPage('logs');
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;
    
    setIsEvaluating(true);
    setErrorMessage('');
    
    try {
      let evaluation;
      const personalContext = {
        userName,
        userContext,
        customInstructions,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name, content: f.content }))
      };

      if (apiKey) {
        evaluation = await evaluateTaskAPI(newTaskTitle, activeTab, personalContext, apiKey, selectedModel);
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
        createdAt: new Date().toISOString(),
        preActionNote: '',
        postActionNote: ''
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

  const processBulkTasks = async () => {
    if (!bulkTaskText.trim()) return;
    
    setIsBulkProcessing(true);
    setErrorMessage('');
    
    try {
      const personalContext = {
        userName,
        userContext,
        customInstructions,
        uploadedFiles: uploadedFiles.map(f => ({ name: f.name, content: f.content }))
      };

      let newTasks;
      if (apiKey) {
        newTasks = await bulkEvaluateTasks(bulkTaskText, personalContext, apiKey, selectedModel);
      } else {
        const lines = bulkTaskText.split('\n').filter(line => line.trim());
        newTasks = lines.map(line => {
          const impact = Math.floor(Math.random() * 4) + 7;
          const ease = Math.floor(Math.random() * 5) + 6;
          return {
            title: line.trim(),
            category: 'want',
            impact,
            ease,
            estimatedMinutes: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
            reason: 'API Keyを設定するとAI評価が有効になります',
            score: impact * ease,
            preActionNote: '',
            postActionNote: ''
          };
        });
      }

      const tasksWithMeta = newTasks.map((task, index) => ({
        ...task,
        id: Date.now() + index,
        createdAt: new Date().toISOString()
      }));

      setTasks(prev => {
        const updated = { ...prev };
        tasksWithMeta.forEach(task => {
          const category = task.category || 'want';
          updated[category] = [...(updated[category] || []), task].sort((a, b) => b.score - a.score);
        });
        return updated;
      });

      setBulkTaskText('');
      setShowBulkAdd(false);
    } catch (error) {
      console.error('Bulk task processing failed:', error);
      setErrorMessage(error.message || '一括追加に失敗しました。API Keyやモデル設定を確認してください。');
      setTimeout(() => setErrorMessage(''), 5000);
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const selectTask = async (task) => {
    setSelectedTask(task);
    setMode('guide');
    setChatMessages([]);
    setGuide(null);
    setErrorMessage('');
    setPreActionNote(task.preActionNote || '');
    
    const personalContext = {
      userName,
      userContext,
      customInstructions,
      uploadedFiles: uploadedFiles.map(f => ({ name: f.name, content: f.content }))
    };
    
    if (apiKey) {
      setIsLoadingGuide(true);
      try {
        const generatedGuide = await generateGuideAPI(task, personalContext, apiKey, selectedModel);
        setGuide(generatedGuide);
      } catch (error) {
        console.error('Guide generation failed:', error);
        setGuide({
          approach: 'MVP思考で素早く形にすることを重視。Decision Flowのような2時間完成を目指しましょう。',
          steps: [
            '最小限の機能(1-2機能)を紙に書き出し、優先度を決める(2分)',
            'プロトタイプを作成。完璧でなくてOK、まず動くものを(60分)',
            'テストして改善点をリストアップ。フィードバックループを開始(30分)'
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
          '最小限の機能(1-2機能)を紙に書き出し、優先度を決める(2分)',
          'プロトタイプを作成。完璧でなくてOK、まず動くものを(60分)',
          'テストして改善点をリストアップ。フィードバックループを開始(30分)'
        ],
        completion: '動作するMVPが完成し、次の改善点が明確になっていること'
      });
    }
  };

  const savePreActionNote = () => {
    setTasks(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(t => 
        t.id === selectedTask.id ? { ...t, preActionNote } : t
      )
    }));
    setSelectedTask(prev => ({ ...prev, preActionNote }));
  };

  const startTimer = () => {
    setMode('timer');
    setIsRunning(true);
    setIsPaused(false);
    setTimeLeft(selectedDuration * 60);
    setStartTime(Date.now());
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const completeTask = (status) => {
    if (status === 'complete') {
      const actualDuration = startTime ? Math.floor((Date.now() - startTime) / 1000 / 60) : selectedDuration;
      const logEntry = {
        ...selectedTask,
        completedAt: new Date().toISOString(),
        actualDuration,
        plannedDuration: selectedDuration,
        postActionNote,
        status: 'completed'
      };
      setActionLogs(prev => [logEntry, ...prev]);
      
      setTasks(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(t => t.id !== selectedTask.id)
      }));
    } else if (status === 'drop') {
      setTasks(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].filter(t => t.id !== selectedTask.id)
      }));
    }
    
    setMode('list');
    setSelectedTask(null);
    setIsRunning(false);
    setTimeLeft(selectedDuration * 60);
    setPostActionNote('');
    setPreActionNote('');
    setStartTime(null);
    setGuide(null);
    setCurrentPage('home');
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    
    const personalContext = {
      userName,
      userContext,
      customInstructions,
      uploadedFiles: uploadedFiles.map(f => ({ name: f.name, content: f.content }))
    };
    
    if (apiKey) {
      setIsSendingMessage(true);
      try {
        const response = await getChatResponse(
          userMessage,
          {
            title: selectedTask.title,
            timeLeft,
            guide,
            ...personalContext
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

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const allTasks = [...tasks.want, ...tasks.should];
  const currentTasks = tasks[activeTab] || [];
  const avgScore = allTasks.length > 0 ? Math.round(allTasks.reduce((acc, t) => acc + t.score, 0) / allTasks.length) : 0;

  const currentTheme = themes[selectedTheme] || themes.dashboard;

  return (
    <div className="min-h-screen font-mono flex flex-col" style={{ backgroundColor: currentTheme.bg.primary, color: currentTheme.text.primary }}>
      {/* Header */}
      <div className="px-6 py-4" style={{ 
        borderBottom: `1px solid ${currentTheme.border.default}`,
        boxShadow: currentTheme.shadow.card 
      }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">ALCHEMIST'S COMPASS</h1>
            <p className="text-xs" style={{ color: currentTheme.text.tertiary }}>AI-Powered Task Management</p>
          </div>
          <div className="flex items-center gap-2">
            {apiKey ? (
              <div 
                className="px-3 py-1 rounded text-xs" 
                style={{ 
                  backgroundColor: `${currentTheme.status.success}20`,
                  border: `1px solid ${currentTheme.status.success}50`,
                  color: currentTheme.status.success,
                  boxShadow: `0 2px 8px ${currentTheme.status.success}30`
                }}
              >
                ● ONLINE
              </div>
            ) : (
              <div 
                className="px-3 py-1 rounded text-xs" 
                style={{ 
                  backgroundColor: `${currentTheme.status.warning}20`,
                  border: `1px solid ${currentTheme.status.warning}50`,
                  color: currentTheme.status.warning,
                  boxShadow: `0 2px 8px ${currentTheme.status.warning}30`
                }}
              >
                ⚠ OFFLINE
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div 
          className="mx-6 mt-4 p-4 rounded-xl text-sm"
          style={{
            backgroundColor: `${currentTheme.status.error}10`,
            border: `1px solid ${currentTheme.status.error}30`,
            color: currentTheme.status.error
          }}
        >
          {errorMessage}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* HOME PAGE - LIST MODE */}
        {currentPage === 'home' && mode === 'list' && (
          <>
            {/* Tab Navigation with Bulk Delete */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('want')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                style={activeTab === 'want' ? {
                  background: currentTheme.gradient.primary,
                  color: '#ffffff',
                  boxShadow: currentTheme.shadow.accent
                } : {
                  backgroundColor: currentTheme.bg.secondary,
                  color: currentTheme.text.secondary,
                  border: `1px solid ${currentTheme.border.default}`,
                  boxShadow: currentTheme.shadow.subtle
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  WANT ({tasks.want.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('should')}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm transition-all"
                style={activeTab === 'should' ? {
                  background: currentTheme.gradient.secondary,
                  color: '#ffffff',
                  boxShadow: currentTheme.shadow.accentAlt
                } : {
                  backgroundColor: currentTheme.bg.secondary,
                  color: currentTheme.text.secondary,
                  border: `1px solid ${currentTheme.border.default}`,
                  boxShadow: currentTheme.shadow.subtle
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock className="w-4 h-4" />
                  SHOULD ({tasks.should.length})
                </div>
              </button>
              {currentTasks.length > 0 && (
                <button
                  onClick={bulkDeleteTasks}
                  className="py-3 px-4 rounded-xl transition-all"
                  style={{
                    backgroundColor: `${currentTheme.status.error}20`,
                    border: `1px solid ${currentTheme.status.error}50`,
                    color: currentTheme.status.error,
                    boxShadow: `0 2px 6px ${currentTheme.status.error}30`
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Add Task Buttons */}
            <div className="flex gap-2 mb-6">
              {!showAddTask && !showBulkAdd ? (
                <>
                  <button
                    onClick={() => setShowAddTask(true)}
                    className="flex-1 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: currentTheme.bg.secondary,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.secondary,
                      boxShadow: currentTheme.shadow.button
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    ADD TASK
                  </button>
                  <button
                    onClick={() => setShowBulkAdd(true)}
                    className="flex-1 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: currentTheme.bg.secondary,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.secondary,
                      boxShadow: currentTheme.shadow.button
                    }}
                  >
                    <List className="w-5 h-5" />
                    BULK ADD
                  </button>
                </>
              ) : null}
            </div>

            {/* Single Task Add */}
            {showAddTask && (
              <div 
                className="mb-6 p-4 rounded-xl"
                style={{
                  backgroundColor: currentTheme.bg.secondary,
                  border: `1px solid ${currentTheme.accent.primary}`,
                  boxShadow: `0 4px 12px ${currentTheme.accent.primary}30`
                }}
              >
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isEvaluating && addTask()}
                  placeholder="Enter task title..."
                  className="w-full rounded-lg px-3 py-2 mb-3 outline-none"
                  style={{
                    backgroundColor: currentTheme.bg.input,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.primary
                  }}
                  autoFocus
                  disabled={isEvaluating}
                />
                <div className="flex gap-2">
                  <button
                    onClick={addTask}
                    disabled={isEvaluating}
                    className="flex-1 py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background: currentTheme.gradient.primary,
                      color: '#ffffff',
                      boxShadow: currentTheme.shadow.accent
                    }}
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
                    className="py-2 px-4 rounded-lg disabled:opacity-50"
                    style={{
                      backgroundColor: currentTheme.bg.tertiary,
                      color: currentTheme.text.secondary,
                      boxShadow: currentTheme.shadow.subtle
                    }}
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            {/* Bulk Task Add */}
            {showBulkAdd && (
              <div 
                className="mb-6 p-4 rounded-xl"
                style={{
                  backgroundColor: currentTheme.bg.secondary,
                  border: `1px solid ${currentTheme.accent.secondary}`,
                  boxShadow: `0 4px 12px ${currentTheme.accent.secondary}30`
                }}
              >
                <div className="text-xs mb-2" style={{ color: currentTheme.text.secondary }}>
                  NotionやObsidianからコピペしてタスクを一括追加
                </div>
                <textarea
                  value={bulkTaskText}
                  onChange={(e) => setBulkTaskText(e.target.value)}
                  placeholder={"タスク1\nタスク2\nタスク3\n...\n\n1行1タスクで入力してください"}
                  rows={6}
                  className="w-full rounded-lg px-3 py-2 mb-3 outline-none resize-none"
                  style={{
                    backgroundColor: currentTheme.bg.input,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.primary
                  }}
                  autoFocus
                  disabled={isBulkProcessing}
                />
                <div className="flex gap-2">
                  <button
                    onClick={processBulkTasks}
                    disabled={isBulkProcessing}
                    className="flex-1 py-2 px-4 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2"
                    style={{
                      background: currentTheme.gradient.secondary,
                      color: '#ffffff',
                      boxShadow: currentTheme.shadow.accentAlt
                    }}
                  >
                    {isBulkProcessing ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        PROCESSING...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        AI AUTO-CLASSIFY & ADD
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowBulkAdd(false);
                      setBulkTaskText('');
                      setErrorMessage('');
                    }}
                    disabled={isBulkProcessing}
                    className="py-2 px-4 rounded-lg disabled:opacity-50"
                    style={{
                      backgroundColor: currentTheme.bg.tertiary,
                      color: currentTheme.text.secondary,
                      boxShadow: currentTheme.shadow.subtle
                    }}
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
                  className="rounded-xl p-4 cursor-pointer transition-all"
                  style={{
                    backgroundColor: currentTheme.bg.secondary,
                    border: `1px solid ${currentTheme.border.default}`,
                    boxShadow: currentTheme.shadow.card
                  }}
                  onClick={() => selectTask(task)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.accent.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = currentTheme.border.default;
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold mb-1" style={{ color: currentTheme.text.primary }}>{task.title}</h3>
                      <div className="text-xs" style={{ color: currentTheme.text.tertiary }}>ID: #{task.id.toString().padStart(4, '0')}</div>
                    </div>
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center flex-col"
                      style={{
                        background: currentTheme.gradient.primary,
                        boxShadow: currentTheme.shadow.badge
                      }}
                    >
                      <div className="text-2xl font-bold text-white">{task.score}</div>
                      <div className="text-[10px] text-white">SCORE</div>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.text.secondary }}>
                          <Zap className="w-3 h-3" />
                          IMPACT
                        </div>
                        <span className="text-xs font-mono" style={{ color: currentTheme.text.primary }}>{task.impact}/10</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentTheme.bg.input }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${(task.impact / 10) * 100}%`,
                            background: currentTheme.gradient.primary
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.text.secondary }}>
                          <Target className="w-3 h-3" />
                          EASE
                        </div>
                        <span className="text-xs font-mono" style={{ color: currentTheme.text.primary }}>{task.ease}/10</span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentTheme.bg.input }}>
                        <div
                          className="h-full transition-all duration-500"
                          style={{ 
                            width: `${(task.ease / 10) * 100}%`,
                            background: currentTheme.gradient.secondary
                          }}
                        />
                      </div>
                    </div>

                    <div 
                      className="flex items-center justify-between pt-2"
                      style={{ borderTop: `1px solid ${currentTheme.border.default}` }}
                    >
                      <div className="flex items-center gap-2 text-xs" style={{ color: currentTheme.text.secondary }}>
                        <Clock className="w-3 h-3" />
                        TIME ESTIMATE
                      </div>
                      <span className="text-xs font-mono" style={{ color: currentTheme.text.primary }}>{task.estimatedMinutes} MIN</span>
                    </div>
                  </div>

                  {task.reason && (
                    <div className="mb-3 text-xs opacity-80" style={{ color: currentTheme.accent.primary }}>
                      {task.reason}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        selectTask(task);
                      }}
                      className="flex-1 py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-2" 
                      style={{
                        backgroundColor: `${currentTheme.accent.primary}20`,
                        border: `1px solid ${currentTheme.accent.primary}50`,
                        color: currentTheme.accent.primary,
                        boxShadow: `0 2px 6px ${currentTheme.accent.primary}30`
                      }}
                    >
                      <Play className="w-3 h-3" />
                      START
                    </button>
                    <button
                      onClick={(e) => deleteTask(e, task.id)}
                      className="py-2 px-3 rounded-lg"
                      style={{
                        backgroundColor: `${currentTheme.status.error}20`,
                        border: `1px solid ${currentTheme.status.error}50`,
                        color: currentTheme.status.error,
                        boxShadow: `0 2px 6px ${currentTheme.status.error}30`
                      }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {currentTasks.length === 0 && (
              <div className="text-center py-12" style={{ color: currentTheme.text.tertiary }}>
                <div className="text-4xl mb-2">○</div>
                <p className="text-sm">NO TASKS FOUND</p>
                <p className="text-xs mt-1">Add a task to get started</p>
              </div>
            )}
          </>
        )}

        {/* HOME PAGE - GUIDE MODE */}
        {currentPage === 'home' && mode === 'guide' && selectedTask && (
          <div className="space-y-6">
            <button
              onClick={() => setMode('list')}
              className="text-sm flex items-center gap-1 transition-colors"
              style={{ color: currentTheme.text.secondary }}
              onMouseEnter={(e) => e.currentTarget.style.color = currentTheme.accent.primary}
              onMouseLeave={(e) => e.currentTarget.style.color = currentTheme.text.secondary}
            >
              ← BACK TO LIST
            </button>

            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <h2 className="text-xl font-bold mb-4" style={{ color: currentTheme.text.primary }}>{selectedTask.title}</h2>
              
              {/* Pre-Action Sticky Note */}
              <div 
                className="mb-6 p-4 rounded-lg"
                style={{
                  backgroundColor: `${currentTheme.status.warning}10`,
                  border: `1px solid ${currentTheme.status.warning}30`
                }}
              >
                <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: currentTheme.status.warning }}>
                  <StickyNote className="w-4 h-4" />
                  PRE-ACTION NOTE (行動前のコア信念・メモ)
                </div>
                <textarea
                  value={preActionNote}
                  onChange={(e) => setPreActionNote(e.target.value)}
                  onBlur={savePreActionNote}
                  placeholder="このタスクに取り組む前の気持ち、意図、目標などを記録..."
                  rows={3}
                  className="w-full rounded px-2 py-1 text-sm outline-none resize-none"
                  style={{
                    backgroundColor: currentTheme.bg.input,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.primary
                  }}
                />
              </div>
              
              {isLoadingGuide ? (
                <div className="flex items-center justify-center py-8">
                  <Loader className="w-8 h-8 animate-spin" style={{ color: currentTheme.accent.primary }} />
                </div>
              ) : guide && (
                <>
                  <div 
                    className="mb-6 p-4 rounded-lg"
                    style={{
                      backgroundColor: `${currentTheme.accent.primary}10`,
                      border: `1px solid ${currentTheme.accent.primary}30`
                    }}
                  >
                    <div className="text-xs font-bold mb-2" style={{ color: currentTheme.accent.primary }}>YOUR APPROACH</div>
                    <p className="text-sm leading-relaxed" style={{ color: currentTheme.text.secondary }}>
                      {guide.approach}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs font-bold mb-3" style={{ color: currentTheme.text.secondary }}>RECOMMENDED STEPS</div>
                    <div className="space-y-2">
                      {guide.steps.map((step, i) => (
                        <div 
                          key={i} 
                          className="p-3 rounded-lg text-sm leading-relaxed"
                          style={{
                            backgroundColor: currentTheme.bg.input,
                            border: `1px solid ${currentTheme.border.default}`,
                            color: currentTheme.text.primary
                          }}
                        >
                          {i + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div 
                    className="mb-6 p-4 rounded-lg"
                    style={{
                      backgroundColor: `${currentTheme.status.success}10`,
                      border: `1px solid ${currentTheme.status.success}30`
                    }}
                  >
                    <div className="text-xs font-bold mb-2" style={{ color: currentTheme.status.success }}>COMPLETION CRITERIA</div>
                    <p className="text-sm leading-relaxed" style={{ color: currentTheme.text.secondary }}>
                      {guide.completion}
                    </p>
                  </div>

                  {/* Chat Interface in Guide Mode */}
                  <div 
                    className="mb-6 rounded-xl p-4"
                    style={{
                      backgroundColor: currentTheme.bg.tertiary,
                      border: `1px solid ${currentTheme.border.default}`,
                      boxShadow: currentTheme.shadow.subtle
                    }}
                  >
                    <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: currentTheme.text.secondary }}>
                      <MessageCircle className="w-4 h-4" />
                      FEEDBACK & QUESTIONS
                    </div>
                    
                    <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                      {chatMessages.map((msg, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg text-sm leading-relaxed"
                          style={msg.role === 'user' ? {
                            backgroundColor: `${currentTheme.accent.primary}20`,
                            color: currentTheme.accent.primary,
                            border: `1px solid ${currentTheme.accent.primary}30`,
                            marginLeft: '2rem'
                          } : {
                            backgroundColor: currentTheme.bg.input,
                            color: currentTheme.text.secondary,
                            border: `1px solid ${currentTheme.border.default}`,
                            marginRight: '2rem'
                          }}
                        >
                          {msg.content}
                        </div>
                      ))}
                      {isSendingMessage && (
                        <div 
                          className="p-2 rounded-lg text-sm flex items-center gap-2"
                          style={{
                            backgroundColor: currentTheme.bg.input,
                            color: currentTheme.text.secondary,
                            border: `1px solid ${currentTheme.border.default}`,
                            marginRight: '2rem'
                          }}
                        >
                          <Loader className="w-3 h-3 animate-spin" />
                          Thinking...
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && sendMessage()}
                        placeholder="このアプローチについて質問やフィードバックを..."
                        className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                        style={{
                          backgroundColor: currentTheme.bg.input,
                          border: `1px solid ${currentTheme.border.default}`,
                          color: currentTheme.text.primary
                        }}
                        disabled={isSendingMessage}
                      />
                      <button
                        onClick={sendMessage}
                        disabled={isSendingMessage}
                        className="py-2 px-4 rounded-lg disabled:opacity-50"
                        style={{
                          backgroundColor: `${currentTheme.accent.primary}20`,
                          border: `1px solid ${currentTheme.accent.primary}50`,
                          color: currentTheme.accent.primary,
                          boxShadow: `0 2px 6px ${currentTheme.accent.primary}30`
                        }}
                      >
                        {isSendingMessage ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Timer Duration Selector */}
              <div className="mb-4">
                <div className="text-xs font-bold mb-2" style={{ color: currentTheme.text.secondary }}>SELECT TIMER DURATION</div>
                <div className="flex gap-2">
                  {durationOptions.map(duration => (
                    <button
                      key={duration}
                      onClick={() => setSelectedDuration(duration)}
                      className="flex-1 py-2 rounded-lg text-sm transition-all"
                      style={selectedDuration === duration ? {
                        background: currentTheme.gradient.primary,
                        color: '#ffffff',
                        boxShadow: currentTheme.shadow.accent
                      } : {
                        backgroundColor: currentTheme.bg.input,
                        border: `1px solid ${currentTheme.border.default}`,
                        color: currentTheme.text.secondary
                      }}
                    >
                      {duration}m
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startTimer}
                className="w-full py-4 px-4 rounded-xl transition-all flex items-center justify-center gap-2 font-bold"
                style={{
                  background: currentTheme.gradient.primary,
                  color: '#ffffff',
                  boxShadow: currentTheme.shadow.accent
                }}
              >
                <Play className="w-5 h-5" />
                START {selectedDuration}-MIN TIMER
              </button>
            </div>
          </div>
        )}

        {/* HOME PAGE - TIMER MODE */}
        {currentPage === 'home' && mode === 'timer' && selectedTask && (
          <div className="space-y-6">
            <div className="text-center">
              <div 
                className="text-9xl font-bold mb-4" 
                style={{ 
                  color: currentTheme.accent.primary,
                  textShadow: `0 4px 24px ${currentTheme.accent.primary}50`
                }}
              >
                {formatTime(timeLeft)}
              </div>
              <div className="text-xl mb-6" style={{ color: currentTheme.text.primary }}>
                {selectedTask.title}
              </div>

              <div className="flex gap-3 justify-center mb-8">
                <button
                  onClick={togglePause}
                  className="py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: currentTheme.bg.secondary,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.secondary,
                    boxShadow: currentTheme.shadow.button
                  }}
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? 'RESUME' : 'PAUSE'}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setMode('complete');
                  }}
                  className="py-3 px-6 rounded-xl transition-all flex items-center gap-2"
                  style={{
                    background: currentTheme.gradient.primary,
                    color: '#ffffff',
                    boxShadow: currentTheme.shadow.accent
                  }}
                >
                  <Check className="w-5 h-5" />
                  COMPLETE
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div 
              className="rounded-xl p-4"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <div className="flex items-center gap-2 mb-3 text-xs" style={{ color: currentTheme.text.secondary }}>
                <MessageCircle className="w-4 h-4" />
                ASK AI COACH
              </div>
              
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg text-sm leading-relaxed"
                    style={msg.role === 'user' ? {
                      backgroundColor: `${currentTheme.accent.primary}20`,
                      color: currentTheme.accent.primary,
                      border: `1px solid ${currentTheme.accent.primary}30`,
                      marginLeft: '2rem'
                    } : {
                      backgroundColor: currentTheme.bg.input,
                      color: currentTheme.text.secondary,
                      border: `1px solid ${currentTheme.border.default}`,
                      marginRight: '2rem'
                    }}
                  >
                    {msg.content}
                  </div>
                ))}
                {isSendingMessage && (
                  <div 
                    className="p-2 rounded-lg text-sm flex items-center gap-2"
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      color: currentTheme.text.secondary,
                      border: `1px solid ${currentTheme.border.default}`,
                      marginRight: '2rem'
                    }}
                  >
                    <Loader className="w-3 h-3 animate-spin" />
                    Thinking...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && sendMessage()}
                  placeholder="Type your question..."
                  className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                  style={{
                    backgroundColor: currentTheme.bg.input,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.primary
                  }}
                  disabled={isSendingMessage}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSendingMessage}
                  className="py-2 px-4 rounded-lg disabled:opacity-50"
                  style={{
                    backgroundColor: `${currentTheme.accent.primary}20`,
                    border: `1px solid ${currentTheme.accent.primary}50`,
                    color: currentTheme.accent.primary,
                    boxShadow: `0 2px 6px ${currentTheme.accent.primary}30`
                  }}
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

        {/* HOME PAGE - COMPLETE MODE */}
        {currentPage === 'home' && mode === 'complete' && selectedTask && (
          <div className="space-y-6">
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold" style={{ color: currentTheme.text.primary }}>TASK COMPLETED!</h2>
              <p style={{ color: currentTheme.text.secondary }}>{selectedTask.title}</p>
            </div>

            {/* Post-Action Sticky Note */}
            <div 
              className="p-4 rounded-lg"
              style={{
                backgroundColor: `${currentTheme.status.success}10`,
                border: `1px solid ${currentTheme.status.success}30`
              }}
            >
              <div className="flex items-center gap-2 text-xs font-bold mb-2" style={{ color: currentTheme.status.success }}>
                <StickyNote className="w-4 h-4" />
                POST-ACTION NOTE (学びや気づき)
              </div>
              <textarea
                value={postActionNote}
                onChange={(e) => setPostActionNote(e.target.value)}
                placeholder="このタスクから学んだこと、改善点、次に活かせることを記録..."
                rows={4}
                className="w-full rounded px-2 py-1 text-sm outline-none resize-none"
                style={{
                  backgroundColor: currentTheme.bg.input,
                  border: `1px solid ${currentTheme.border.default}`,
                  color: currentTheme.text.primary
                }}
              />
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => completeTask('complete')}
                className="py-3 px-6 rounded-xl flex items-center gap-2"
                style={{
                  backgroundColor: `${currentTheme.status.success}20`,
                  border: `1px solid ${currentTheme.status.success}50`,
                  color: currentTheme.status.success,
                  boxShadow: `0 2px 8px ${currentTheme.status.success}30`
                }}
              >
                <Check className="w-5 h-5" />
                DONE
              </button>
              <button
                onClick={() => completeTask('defer')}
                className="py-3 px-6 rounded-xl flex items-center gap-2"
                style={{
                  backgroundColor: currentTheme.bg.secondary,
                  border: `1px solid ${currentTheme.border.default}`,
                  color: currentTheme.text.secondary,
                  boxShadow: currentTheme.shadow.subtle
                }}
              >
                <Clock className="w-5 h-5" />
                DEFER
              </button>
              <button
                onClick={() => completeTask('drop')}
                className="py-3 px-6 rounded-xl flex items-center gap-2"
                style={{
                  backgroundColor: `${currentTheme.status.error}20`,
                  border: `1px solid ${currentTheme.status.error}50`,
                  color: currentTheme.status.error,
                  boxShadow: `0 2px 6px ${currentTheme.status.error}30`
                }}
              >
                <Archive className="w-5 h-5" />
                DROP
              </button>
            </div>
          </div>
        )}

        {/* ACTION LOG PAGE with Edit/Delete */}
        {currentPage === 'logs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">ACTION LOG</h2>
              <div className="text-sm" style={{ color: currentTheme.text.tertiary }}>
                {actionLogs.length} 完了済みタスク
              </div>
            </div>

            {actionLogs.length === 0 ? (
              <div className="text-center py-12" style={{ color: currentTheme.text.tertiary }}>
                <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">まだ記録がありません</p>
                <p className="text-xs mt-1">タスクを完了すると、ここに記録されます</p>
              </div>
            ) : (
              <div className="space-y-4">
                {actionLogs.map((log, index) => (
                  <div
                    key={index}
                    className="rounded-xl p-6"
                    style={{
                      backgroundColor: currentTheme.bg.secondary,
                      border: `1px solid ${currentTheme.border.default}`,
                      boxShadow: currentTheme.shadow.card
                    }}
                  >
                    {editingLogIndex === index ? (
                      /* Editing Mode */
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={editingLogData.title}
                          onChange={(e) => setEditingLogData({...editingLogData, title: e.target.value})}
                          className="w-full rounded-lg px-3 py-2 text-lg font-bold outline-none"
                          style={{
                            backgroundColor: currentTheme.bg.input,
                            border: `1px solid ${currentTheme.border.default}`,
                            color: currentTheme.text.primary
                          }}
                        />
                        
                        <div>
                          <label className="text-xs block mb-1" style={{ color: currentTheme.text.secondary }}>行動前メモ</label>
                          <textarea
                            value={editingLogData.preActionNote || ''}
                            onChange={(e) => setEditingLogData({...editingLogData, preActionNote: e.target.value})}
                            rows={2}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            style={{
                              backgroundColor: currentTheme.bg.input,
                              border: `1px solid ${currentTheme.border.default}`,
                              color: currentTheme.text.primary
                            }}
                          />
                        </div>

                        <div>
                          <label className="text-xs block mb-1" style={{ color: currentTheme.text.secondary }}>学びと気づき</label>
                          <textarea
                            value={editingLogData.postActionNote || ''}
                            onChange={(e) => setEditingLogData({...editingLogData, postActionNote: e.target.value})}
                            rows={3}
                            className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none"
                            style={{
                              backgroundColor: currentTheme.bg.input,
                              border: `1px solid ${currentTheme.border.default}`,
                              color: currentTheme.text.primary
                            }}
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={saveEditedLog}
                            className="flex-1 py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                            style={{
                              background: currentTheme.gradient.primary,
                              color: '#ffffff',
                              boxShadow: currentTheme.shadow.accent
                            }}
                          >
                            <Check className="w-4 h-4" />
                            SAVE
                          </button>
                          <button
                            onClick={cancelEditingLog}
                            className="py-2 px-4 rounded-lg"
                            style={{
                              backgroundColor: currentTheme.bg.tertiary,
                              color: currentTheme.text.secondary,
                              boxShadow: currentTheme.shadow.subtle
                            }}
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Display Mode */
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2" style={{ color: currentTheme.text.primary }}>
                              {log.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs" style={{ color: currentTheme.text.tertiary }}>
                              <span>{formatDate(log.completedAt)}</span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {log.actualDuration}分
                              </span>
                              <span>•</span>
                              <span className={log.category === 'want' ? 'text-cyan-400' : 'text-violet-400'}>
                                {log.category.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="px-3 py-1 rounded text-xs"
                              style={{
                                backgroundColor: `${currentTheme.status.success}20`,
                                border: `1px solid ${currentTheme.status.success}50`,
                                color: currentTheme.status.success
                              }}
                            >
                              COMPLETED
                            </div>
                            <button
                              onClick={() => startEditingLog(index)}
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: `${currentTheme.accent.primary}20`,
                                border: `1px solid ${currentTheme.accent.primary}50`,
                                color: currentTheme.accent.primary
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => deleteLog(index)}
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: `${currentTheme.status.error}20`,
                                border: `1px solid ${currentTheme.status.error}50`,
                                color: currentTheme.status.error
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs" style={{ color: currentTheme.text.secondary }}>IMPACT</span>
                              <span className="text-xs" style={{ color: currentTheme.text.primary }}>{log.impact}/10</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentTheme.bg.input }}>
                              <div
                                className="h-full"
                                style={{ 
                                  width: `${(log.impact / 10) * 100}%`,
                                  background: currentTheme.gradient.primary
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs" style={{ color: currentTheme.text.secondary }}>EASE</span>
                              <span className="text-xs" style={{ color: currentTheme.text.primary }}>{log.ease}/10</span>
                            </div>
                            <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: currentTheme.bg.input }}>
                              <div
                                className="h-full"
                                style={{ 
                                  width: `${(log.ease / 10) * 100}%`,
                                  background: currentTheme.gradient.secondary
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {log.preActionNote && (
                          <div 
                            className="mb-3 p-3 rounded-lg"
                            style={{
                              backgroundColor: `${currentTheme.status.warning}10`,
                              border: `1px solid ${currentTheme.status.warning}30`
                            }}
                          >
                            <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: currentTheme.status.warning }}>
                              <StickyNote className="w-3 h-3" />
                              行動前メモ
                            </div>
                            <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                              {log.preActionNote}
                            </p>
                          </div>
                        )}

                        {log.postActionNote && (
                          <div 
                            className="p-3 rounded-lg"
                            style={{
                              backgroundColor: `${currentTheme.status.success}10`,
                              border: `1px solid ${currentTheme.status.success}30`
                            }}
                          >
                            <div className="text-xs font-bold mb-1 flex items-center gap-1" style={{ color: currentTheme.status.success }}>
                              <StickyNote className="w-3 h-3" />
                              学びと気づき
                            </div>
                            <p className="text-sm" style={{ color: currentTheme.text.secondary }}>
                              {log.postActionNote}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ANALYTICS PAGE */}
        {currentPage === 'analytics' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">ANALYTICS DASHBOARD</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'TOTAL TASKS', value: allTasks.length, color: currentTheme.accent.primary },
                { label: 'COMPLETED', value: actionLogs.length, color: currentTheme.status.success },
                { label: 'WANT TASKS', value: tasks.want.length, color: currentTheme.accent.secondary },
                { label: 'AVG SCORE', value: avgScore, color: currentTheme.accent.tertiary }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="rounded-xl p-4"
                  style={{
                    backgroundColor: currentTheme.bg.secondary,
                    border: `1px solid ${currentTheme.border.default}`,
                    boxShadow: currentTheme.shadow.card
                  }}
                >
                  <div className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</div>
                  <div className="text-xs mt-1" style={{ color: currentTheme.text.tertiary }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <h3 className="text-sm font-bold mb-4" style={{ color: currentTheme.text.secondary }}>RECENT ACTIVITY</h3>
              <div className="h-48 flex items-end justify-around gap-2">
                {actionLogs.slice(0, 7).reverse().map((log, i) => {
                  const height = Math.min((log.actualDuration / 60) * 100, 100);
                  return (
                    <div 
                      key={i}
                      className="flex-1 rounded-t transition-all duration-500" 
                      style={{ 
                        height: `${height}%`,
                        background: currentTheme.gradient.primary,
                        boxShadow: `0 -2px 8px ${currentTheme.accent.primary}40`,
                        minHeight: '10%'
                      }} 
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS PAGE - keeping existing implementation */}
        {currentPage === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">SETTINGS</h2>
            
            {/* AI Configuration */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.text.primary }}>
                <Sparkles className="w-4 h-4" />
                AI CONFIGURATION
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>GEMINI API KEY</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIxxxxx..."
                    className="w-full rounded-lg px-3 py-2 outline-none"
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.primary,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  />
                  <p className="text-xs mt-1" style={{ color: currentTheme.text.tertiary }}>
                    <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" style={{ color: currentTheme.accent.primary }} className="hover:underline">
                      Get API Key
                    </a>
                    {' • Free tier available'}
                  </p>
                </div>
                
                <div>
                  <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>AI MODEL</label>
                  <select 
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 outline-none" 
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.primary,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {modelOptions.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 flex gap-3 text-xs" style={{ color: currentTheme.text.tertiary }}>
                    <span>Speed: {modelOptions.find(m => m.id === selectedModel)?.speed}</span>
                    <span>Quality: {modelOptions.find(m => m.id === selectedModel)?.quality}</span>
                    <span>Cost: {modelOptions.find(m => m.id === selectedModel)?.cost}</span>
                  </div>
                </div>

                <div 
                  className="flex items-center justify-between pt-4"
                  style={{ borderTop: `1px solid ${currentTheme.border.default}` }}
                >
                  <span className="text-sm" style={{ color: currentTheme.text.secondary }}>NOTIFICATIONS</span>
                  <button 
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className="w-12 h-6 rounded-full relative transition-all"
                    style={notificationsEnabled ? {
                      background: currentTheme.gradient.primary,
                      boxShadow: `0 2px 8px ${currentTheme.accent.primary}50`
                    } : {
                      backgroundColor: currentTheme.bg.tertiary,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div 
                      className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ 
                        [notificationsEnabled ? 'right' : 'left']: '0.125rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)' 
                      }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm" style={{ color: currentTheme.text.secondary }}>AUTO-EVALUATE</span>
                  <button
                    onClick={() => setAutoEvaluate(!autoEvaluate)}
                    className="w-12 h-6 rounded-full relative transition-all"
                    style={autoEvaluate ? {
                      background: currentTheme.gradient.primary,
                      boxShadow: `0 2px 8px ${currentTheme.accent.primary}50`
                    } : {
                      backgroundColor: currentTheme.bg.tertiary,
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all"
                      style={{ 
                        [autoEvaluate ? 'right' : 'left']: '0.125rem',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.3)' 
                      }}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Personalization */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.text.primary }}>
                <User className="w-4 h-4" />
                PERSONALIZATION
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>YOUR NAME</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your name (optional)"
                    className="w-full rounded-lg px-3 py-2 outline-none"
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.primary
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>USER CONTEXT</label>
                  <textarea
                    value={userContext}
                    onChange={(e) => setUserContext(e.target.value)}
                    placeholder="Brief description of yourself, your goals, work style, etc."
                    rows={3}
                    className="w-full rounded-lg px-3 py-2 outline-none resize-none"
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.primary
                    }}
                  />
                </div>

                <div>
                  <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>CUSTOM INSTRUCTIONS</label>
                  <textarea
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value)}
                    placeholder="How should AI assist you? e.g., 'Be concise', 'Focus on MVP approach', 'Challenge perfectionism'"
                    rows={4}
                    className="w-full rounded-lg px-3 py-2 outline-none resize-none"
                    style={{
                      backgroundColor: currentTheme.bg.input,
                      border: `1px solid ${currentTheme.border.default}`,
                      color: currentTheme.text.primary
                    }}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs" style={{ color: currentTheme.text.secondary }}>UPLOADED FILES ({uploadedFiles.length})</label>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs px-3 py-1 rounded-lg flex items-center gap-1"
                      style={{
                        backgroundColor: `${currentTheme.accent.primary}20`,
                        border: `1px solid ${currentTheme.accent.primary}50`,
                        color: currentTheme.accent.primary
                      }}
                    >
                      <Upload className="w-3 h-3" />
                      UPLOAD .MD/.TXT
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".md,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="space-y-2">
                      {uploadedFiles.map(file => (
                        <div 
                          key={file.id}
                          className="flex items-center justify-between p-2 rounded"
                          style={{
                            backgroundColor: currentTheme.bg.input,
                            border: `1px solid ${currentTheme.border.default}`
                          }}
                        >
                          <div className="flex items-center gap-2 flex-1">
                            <FileText className="w-4 h-4" style={{ color: currentTheme.accent.primary }} />
                            <span className="text-xs truncate" style={{ color: currentTheme.text.primary }}>{file.name}</span>
                          </div>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="text-xs px-2 py-1 rounded"
                            style={{ color: currentTheme.status.error }}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="text-xs mt-2" style={{ color: currentTheme.text.tertiary }}>
                    Upload your context files (e.g., パーソナライズ用.md) for better personalization
                  </p>
                </div>
              </div>
            </div>

            {/* Appearance */}
            <div 
              className="rounded-xl p-6"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: currentTheme.text.primary }}>
                <Palette className="w-4 h-4" />
                APPEARANCE
              </h3>
              <div>
                <label className="text-xs block mb-2" style={{ color: currentTheme.text.secondary }}>THEME</label>
                <select 
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className="w-full rounded-lg px-3 py-2 outline-none" 
                  style={{
                    backgroundColor: currentTheme.bg.input,
                    border: `1px solid ${currentTheme.border.default}`,
                    color: currentTheme.text.primary
                  }}
                >
                  {themeOptions.map(theme => (
                    <option key={theme.id} value={theme.id}>
                      {theme.name} - {theme.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Version Info */}
            <div 
              className="rounded-xl p-4"
              style={{
                backgroundColor: currentTheme.bg.secondary,
                border: `1px solid ${currentTheme.border.default}`,
                boxShadow: currentTheme.shadow.card
              }}
            >
              <div className="flex items-center justify-between text-xs" style={{ color: currentTheme.text.tertiary }}>
                <span>VERSION</span>
                <span className="font-mono">1.3.0</span>
              </div>
              <div className="flex items-center justify-between text-xs mt-2" style={{ color: currentTheme.text.tertiary }}>
                <span>BUILD</span>
                <span className="font-mono">2025.10.14</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div 
        style={{ 
          borderTop: `1px solid ${currentTheme.border.default}`,
          backgroundColor: currentTheme.bg.primary,
          boxShadow: currentTheme.shadow.cardInverted
        }}
      >
        <div className="flex justify-around py-3">
          {[
            { page: 'home', icon: Home, label: 'HOME' },
            { page: 'logs', icon: BookOpen, label: 'LOGS' },
            { page: 'analytics', icon: BarChart3, label: 'STATS' },
            { page: 'settings', icon: Settings, label: 'SETTINGS' }
          ].map(({ page, icon: Icon, label }) => (
            <button
              key={page}
              onClick={() => {
                setCurrentPage(page);
                if (page === 'home') setMode('list');
              }}
              className="flex flex-col items-center gap-1 px-6 py-2 rounded-xl transition-all"
              style={currentPage === page ? {
                color: currentTheme.accent.primary,
                boxShadow: `0 2px 12px ${currentTheme.accent.primary}40`
              } : {
                color: currentTheme.text.tertiary
              }}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}