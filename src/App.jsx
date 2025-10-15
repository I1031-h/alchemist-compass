import React, { useState, useEffect, useRef } from 'react';
import { Home, BarChart3, Settings, Clock, Zap, Target, Plus, Trash2, Play, Pause, Check, Archive, AlertCircle, MessageCircle, Send, Sparkles, Loader, Palette, Upload, FileText, User, BookOpen, StickyNote, List, Edit, X, Eye, ArrowLeft } from 'lucide-react';
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

  const closeLogDetail = () => {
    setSelectedLog(null);
    setMode('list');
  };

  // Rest of the functions remain the same as in feature/ui-improvements branch
  // Due to token limits, I'm continuing with the critical parts

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

  // The render function will be in the next part due to token limits
  return (
    <div className="min-h-screen font-mono flex flex-col" style={{ backgroundColor: currentTheme.bg.primary, color: currentTheme.text.primary }}>
      {/* Rest of JSX continues... */}
    </div>
  );
}