import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clock, Zap, Target, Plus, X, MessageCircle, Send, Play, Pause, Check, Archive, AlertCircle, ChevronRight, Settings, Loader, Trash2, Palette } from 'lucide-react';
import { evaluateTask as evaluateTaskAPI, generateGuide as generateGuideAPI, getChatResponse, getModelOptions } from './utils/geminiAPI';
import { getThemeOptions, applyTheme } from './utils/themes';

export default function AlchemistCompass() {
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
  const [selectedModel, setSelectedModel] = useState('gemini-2.5-flash');
  const [selectedTheme, setSelectedTheme] = useState('v0');
  const [showSettings, setShowSettings] = useState(false);
  
  // Loading states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [guide, setGuide] = useState(null);
  const [isLoadingGuide, setIsLoadingGuide] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  
  // Error state
  const [errorMessage, setErrorMessage] = useState('');

  const themeOptions = getThemeOptions();
  const modelOptions = getModelOptions();

  // Load from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem('alchemist-tasks');
    const savedApiKey = localStorage.getItem('alchemist-api-key');
    const savedModel = localStorage.getItem('alchemist-model');
    const savedTheme = localStorage.getItem('alchemist-theme');
    
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
    if (savedModel) {
      setSelectedModel(savedModel);
    }
    if (savedTheme) {
      setSelectedTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      applyTheme('v0');
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
    localStorage.setItem('alchemist-theme', selectedTheme);
    applyTheme(selectedTheme);
  }, [selectedTheme]);

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

  const currentTasks = tasks[activeTab] || [];

  return (
    <div className=\"min-h-screen bg-theme-primary text-theme-primary font-mono\">
      {/* Grid Background */}
      <div className=\"fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]\" />
      
      <div className=\"relative max-w-5xl mx-auto p-6\">
        {/* Header */}
        <div className=\"flex items-center justify-between mb-8\">
          <div className=\"flex items-center gap-3\">
            <Sparkles className=\"w-8 h-8 text-theme-accent-cyan\" />
            <h1 className=\"text-2xl font-bold gradient-text\">
              Alchemist's Compass
            </h1>
          </div>
          <div className=\"flex items-center gap-3\">
            {apiKey ? (
              <div className=\"text-xs text-theme-accent-emerald flex items-center gap-1\">
                ✓ AI有効
              </div>
            ) : (
              <div className=\"text-xs text-amber-400 flex items-center gap-1\">
                ⚠ API Key未設定
              </div>
            )}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className=\"p-2 rounded bg-theme-card border border-theme-default hover:border-theme-active text-theme-secondary transition-colors\"
            >
              <Settings className=\"w-4 h-4\" />
            </button>
          </div>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className=\"mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm\">
            {errorMessage}
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className=\"mb-6 p-4 rounded-lg glass-card border border-theme-default\">
            <h3 className=\"text-sm font-semibold mb-4 flex items-center gap-2 text-theme-primary\">
              <Settings className=\"w-4 h-4\" />
              設定
            </h3>
            <div className=\"space-y-4\">
              <div>
                <label className=\"text-xs text-theme-secondary block mb-1\">Gemini API Key</label>
                <input
                  type=\"password\"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder=\"AIxxxxx...\"
                  className=\"w-full py-2 px-3 rounded bg-theme-tertiary border border-theme-default outline-none focus:border-theme-active text-sm text-theme-primary\"
                />
                <p className=\"text-xs text-theme-tertiary mt-1\">
                  <a href=\"https://aistudio.google.com/apikey\" target=\"_blank\" rel=\"noopener noreferrer\" className=\"text-theme-accent-cyan hover:underline\">
                    API Keyを取得
                  </a>
                  　|　利用料は無料枠内で十分使えます
                </p>
              </div>

              <div>
                <label className=\"text-xs text-theme-secondary block mb-1\">AIモデル（推奨: Gemini 2.5 Flash）</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className=\"w-full py-2 px-3 rounded bg-theme-tertiary border border-theme-default outline-none focus:border-theme-active text-sm text-theme-primary\"
                >
                  {modelOptions.map(model => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
                <div className=\"mt-1 flex gap-3 text-xs text-theme-tertiary\">
                  <span>速度: {modelOptions.find(m => m.id === selectedModel)?.speed}</span>
                  <span>品質: {modelOptions.find(m => m.id === selectedModel)?.quality}</span>
                  <span>コスト: {modelOptions.find(m => m.id === selectedModel)?.cost}</span>
                </div>
              </div>

              <div>
                <label className=\"text-xs text-theme-secondary block mb-1 flex items-center gap-1\">
                  <Palette className=\"w-3 h-3\" />
                  UIテーマ
                </label>
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  className=\"w-full py-2 px-3 rounded bg-theme-tertiary border border-theme-default outline-none focus:border-theme-active text-sm text-theme-primary\"
                >
                  {themeOptions.map(theme => (
                    <option key={theme.value} value={theme.value}>
                      {theme.label} - {theme.description}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {mode === 'list' && (
          <>
            {/* Tab Navigation */}
            <div className=\"flex gap-2 mb-6\">
              <button
                onClick={() => setActiveTab('want')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'want'
                    ? 'glass-card border border-theme-active text-theme-accent-cyan'
                    : 'glass-card border border-theme-default text-theme-secondary hover:border-theme-hover'
                }`}
              >
                <div className=\"flex items-center justify-center gap-2\">
                  <Target className=\"w-4 h-4\" />
                  やりたいこと ({currentTasks.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('should')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'should'
                    ? 'glass-card border border-[rgba(167,139,250,0.4)] text-theme-accent-violet'
                    : 'glass-card border border-theme-default text-theme-secondary hover:border-theme-hover'
                }`}
              >
                <div className=\"flex items-center justify-center gap-2\">
                  <AlertCircle className=\"w-4 h-4\" />
                  やるべきこと ({tasks.should?.length || 0})
                </div>
              </button>
            </div>

            {/* Add Task Button */}
            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className=\"w-full py-4 px-4 mb-6 rounded-lg glass-card border border-theme-default hover:border-theme-active text-theme-secondary hover:text-theme-accent-cyan transition-all flex items-center justify-center gap-2\"
              >
                <Plus className=\"w-5 h-5\" />
                タスクを追加
              </button>
            ) : (
              <div className=\"mb-6 p-4 rounded-lg glass-card border border-theme-active\">
                <input
                  type=\"text\"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isEvaluating && addTask()}
                  placeholder=\"何をしますか？\"
                  className=\"w-full bg-transparent border-none outline-none text-theme-primary mb-3\"
                  autoFocus
                  disabled={isEvaluating}
                />
                <div className=\"flex gap-2\">
                  <button
                    onClick={addTask}
                    disabled={isEvaluating}
                    className=\"flex-1 py-2 px-4 rounded glass-card border border-theme-active text-theme-accent-cyan hover:bg-[rgba(34,211,238,0.1)] text-sm disabled:opacity-50 flex items-center justify-center gap-2\"
                  >
                    {isEvaluating ? (
                      <>
                        <Loader className=\"w-4 h-4 animate-spin\" />
                        AI評価中...
                      </>
                    ) : (
                      '追加'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskTitle('');
                      setErrorMessage('');
                    }}
                    disabled={isEvaluating}
                    className=\"py-2 px-4 rounded glass-card border border-theme-default text-theme-secondary hover:border-theme-hover text-sm disabled:opacity-50\"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {/* Task List - v0 Style */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
              {currentTasks.map(task => (
                <div
                  key={task.id}
                  className=\"gradient-border rounded-lg p-6 glass-card scale-on-hover cursor-pointer relative group\"
                  onClick={() => selectTask(task)}
                >
                  {/* Score Badge - v0 Style */}
                  <div className=\"absolute -top-3 -right-3 w-16 h-16 rounded-full score-badge flex items-center justify-center z-10\">
                    <span className=\"text-2xl font-bold font-mono text-white\">{task.score}</span>
                  </div>

                  {/* Delete Button - Show on hover */}
                  <button
                    onClick={(e) => deleteTask(e, task.id)}
                    className=\"absolute top-2 right-2 p-2 rounded hover:bg-red-500/10 text-theme-tertiary hover:text-red-400 transition-all opacity-0 group-hover:opacity-100\"
                  >
                    <Trash2 className=\"w-4 h-4\" />
                  </button>

                  {/* Task Title */}
                  <h3 className=\"text-lg font-semibold mb-6 pr-12 text-theme-primary leading-relaxed\">
                    {task.title}
                  </h3>

                  {/* Progress Bars - v0 Style */}
                  <div className=\"space-y-3\">
                    {/* Impact Bar */}
                    <div className=\"flex items-center gap-3 text-sm\">
                      <div className=\"flex items-center gap-2 text-theme-accent-coral min-w-[80px]\">
                        <Zap className=\"w-4 h-4\" />
                        <span className=\"font-mono\">Impact</span>
                      </div>
                      <div className=\"flex-1 h-2 bg-theme-tertiary rounded-full overflow-hidden\">
                        <div
                          className=\"h-full bg-gradient-to-r from-[var(--accent-coral)] to-[var(--accent-orange)] progress-bar\"
                          style={{ width: `${(task.impact / 10) * 100}%` }}
                        />
                      </div>
                      <span className=\"font-mono text-theme-secondary w-6 text-right\">{task.impact}</span>
                    </div>

                    {/* Ease Bar */}
                    <div className=\"flex items-center gap-3 text-sm\">
                      <div className=\"flex items-center gap-2 text-theme-accent-orange min-w-[80px]\">
                        <Target className=\"w-4 h-4\" />
                        <span className=\"font-mono\">Ease</span>
                      </div>
                      <div className=\"flex-1 h-2 bg-theme-tertiary rounded-full overflow-hidden\">
                        <div
                          className=\"h-full bg-gradient-to-r from-[var(--accent-orange)] to-[var(--accent-cyan)] progress-bar\"
                          style={{ width: `${(task.ease / 10) * 100}%` }}
                        />
                      </div>
                      <span className=\"font-mono text-theme-secondary w-6 text-right\">{task.ease}</span>
                    </div>

                    {/* Time */}
                    <div className=\"flex items-center gap-3 text-sm pt-2\">
                      <div className=\"flex items-center gap-2 text-theme-secondary min-w-[80px]\">
                        <Clock className=\"w-4 h-4\" />
                        <span className=\"font-mono\">Time</span>
                      </div>
                      <span className=\"font-mono text-theme-primary\">{task.estimatedMinutes}分</span>
                    </div>
                  </div>

                  {/* Reason */}
                  {task.reason && (
                    <div className=\"mt-4 text-xs text-theme-accent-cyan opacity-80\">
                      {task.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {currentTasks.length === 0 && (
              <div className=\"text-center py-12 text-theme-tertiary\">
                <Sparkles className=\"w-12 h-12 mx-auto mb-3 opacity-50\" />
                <p>タスクがありません</p>
                <p className=\"text-xs mt-1\">上のボタンから追加してください</p>
              </div>
            )}
          </>
        )}

        {mode === 'guide' && selectedTask && (
          <div className=\"space-y-6\">
            <button
              onClick={() => setMode('list')}
              className=\"text-sm text-theme-secondary hover:text-theme-accent-cyan flex items-center gap-1 transition-colors\"
            >
              ← 戻る
            </button>

            <div className=\"p-6 rounded-lg glass-card border border-theme-default\">
              <h2 className=\"text-xl font-bold mb-4 text-theme-primary\">{selectedTask.title}</h2>
              
              {isLoadingGuide ? (
                <div className=\"flex items-center justify-center py-8\">
                  <Loader className=\"w-8 h-8 animate-spin text-theme-accent-cyan\" />
                </div>
              ) : guide && (
                <>
                  <div className=\"mb-6 p-4 rounded bg-[rgba(34,211,238,0.05)] border border-[rgba(34,211,238,0.2)]\">
                    <div className=\"text-sm font-semibold text-theme-accent-cyan mb-2\">なぜこのアプローチが合うか</div>
                    <p className=\"text-sm text-theme-secondary leading-relaxed\">
                      {guide.approach}
                    </p>
                  </div>

                  <div className=\"mb-6\">
                    <div className=\"text-sm font-semibold text-theme-primary mb-3\">推奨ステップ</div>
                    <div className=\"space-y-2\">
                      {guide.steps.map((step, i) => (
                        <div key={i} className=\"p-3 rounded bg-theme-tertiary border border-theme-default text-sm text-theme-primary leading-relaxed\">
                          {i + 1}. {step}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className=\"mb-6 p-4 rounded bg-[rgba(52,211,153,0.05)] border border-[rgba(52,211,153,0.2)]\">
                    <div className=\"text-sm font-semibold text-theme-accent-emerald mb-2\">完了基準</div>
                    <p className=\"text-sm text-theme-secondary leading-relaxed\">
                      {guide.completion}
                    </p>
                  </div>
                </>
              )}

              <button
                onClick={startTimer}
                className=\"w-full py-4 px-4 rounded-lg glass-card border border-theme-active text-theme-accent-cyan hover:bg-[rgba(34,211,238,0.1)] transition-all flex items-center justify-center gap-2 font-semibold\"
              >
                <Play className=\"w-5 h-5\" />
                5分タイマーを開始
              </button>
            </div>
          </div>
        )}

        {mode === 'timer' && selectedTask && (
          <div className=\"space-y-6\">
            <div className=\"text-center\">
              <div className=\"text-9xl font-bold text-theme-accent-cyan mb-4\">
                {formatTime(timeLeft)}
              </div>
              <div className=\"text-xl text-theme-primary mb-6\">
                {selectedTask.title}
              </div>

              <div className=\"flex gap-3 justify-center mb-8\">
                <button
                  onClick={togglePause}
                  className=\"py-3 px-6 rounded-lg glass-card border border-theme-default hover:border-theme-active text-theme-secondary transition-colors flex items-center gap-2\"
                >
                  {isPaused ? <Play className=\"w-5 h-5\" /> : <Pause className=\"w-5 h-5\" />}
                  {isPaused ? '再開' : '一時停止'}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setMode('complete');
                  }}
                  className=\"py-3 px-6 rounded-lg glass-card border border-theme-active text-theme-accent-cyan hover:bg-[rgba(34,211,238,0.1)] flex items-center gap-2\"
                >
                  <Check className=\"w-5 h-5\" />
                  完了
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className=\"p-4 rounded-lg glass-card border border-theme-default\">
              <div className=\"flex items-center gap-2 mb-3 text-sm text-theme-secondary\">
                <MessageCircle className=\"w-4 h-4\" />
                質問・相談
              </div>
              
              <div className=\"space-y-2 mb-3 max-h-48 overflow-y-auto\">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-[rgba(34,211,238,0.1)] text-theme-accent-cyan ml-8'
                        : 'bg-theme-tertiary text-theme-secondary mr-8'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
                {isSendingMessage && (
                  <div className=\"p-2 rounded text-sm bg-theme-tertiary text-theme-secondary mr-8 flex items-center gap-2\">
                    <Loader className=\"w-3 h-3 animate-spin\" />
                    考え中...
                  </div>
                )}
              </div>

              <div className=\"flex gap-2\">
                <input
                  type=\"text\"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isSendingMessage && sendMessage()}
                  placeholder=\"質問を入力...\"
                  className=\"flex-1 py-2 px-3 rounded bg-theme-tertiary border border-theme-default outline-none focus:border-theme-active text-sm text-theme-primary\"
                  disabled={isSendingMessage}
                />
                <button
                  onClick={sendMessage}
                  disabled={isSendingMessage}
                  className=\"py-2 px-4 rounded glass-card border border-theme-active text-theme-accent-cyan hover:bg-[rgba(34,211,238,0.1)] disabled:opacity-50\"
                >
                  {isSendingMessage ? (
                    <Loader className=\"w-4 h-4 animate-spin\" />
                  ) : (
                    <Send className=\"w-4 h-4\" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'complete' && selectedTask && (
          <div className=\"text-center space-y-6\">
            <div className=\"text-6xl mb-4\">🎉</div>
            <h2 className=\"text-2xl font-bold text-theme-primary\">お疲れさまでした！</h2>
            <p className=\"text-theme-secondary\">{selectedTask.title}</p>

            <div className=\"flex gap-3 justify-center\">
              <button
                onClick={() => completeTask('complete')}
                className=\"py-3 px-6 rounded-lg glass-card border border-[rgba(52,211,153,0.4)] text-theme-accent-emerald hover:bg-[rgba(52,211,153,0.1)] flex items-center gap-2\"
              >
                <Check className=\"w-5 h-5\" />
                完了
              </button>
              <button
                onClick={() => completeTask('defer')}
                className=\"py-3 px-6 rounded-lg glass-card border border-theme-default hover:border-theme-hover text-theme-secondary flex items-center gap-2\"
              >
                <Clock className=\"w-5 h-5\" />
                保留
              </button>
              <button
                onClick={() => completeTask('drop')}
                className=\"py-3 px-6 rounded-lg glass-card border border-red-500/30 text-red-400 hover:bg-red-500/10 flex items-center gap-2\"
              >
                <Archive className=\"w-5 h-5\" />
                削除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}