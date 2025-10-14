import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Settings, Clock, Zap, Target, Plus, Trash2, Play, Pause, Check, Archive, MessageCircle, Send, Sparkles, Loader, Palette, Upload, FileText, User, BookOpen, StickyNote, List, Edit, X, Eye } from 'lucide-react';
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
      
      // Create detailed execution summary
      const executionSummary = {
        approach: guide?.approach || '',
        steps: guide?.steps || [],
        completionCriteria: guide?.completion || '',
        plannedDuration: selectedDuration,
        actualDuration,
        timeDifference: actualDuration - selectedDuration,
        efficiency: selectedDuration > 0 ? Math.round((selectedDuration / actualDuration) * 100) : 100
      };

      const logEntry = {
        ...selectedTask,
        completedAt: new Date().toISOString(),
        actualDuration,
        plannedDuration: selectedDuration,
        postActionNote,
        executionSummary,
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

{/* Continuation in next message due to length... */}
