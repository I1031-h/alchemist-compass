import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Clock, Zap, Target, Plus, X, MessageCircle, Send, Play, Pause, Check, Archive, AlertCircle, ChevronRight } from 'lucide-react';

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

  // Load tasks from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alchemist-tasks');
    if (saved) {
      setTasks(JSON.parse(saved));
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('alchemist-tasks', JSON.stringify(tasks));
  }, [tasks]);

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

  // Mock AI evaluation
  const evaluateTask = (title) => {
    const impact = Math.floor(Math.random() * 4) + 7;
    const ease = Math.floor(Math.random() * 5) + 6;
    const estimatedMinutes = [15, 30, 45, 60][Math.floor(Math.random() * 4)];
    const reasons = [
      'あなたの価値観と一致します',
      'すぐに始められます',
      '長期的な成長に繋がります',
      'システム構築のスキルを活かせます',
      '短時間で成果が得られます'
    ];
    
    return {
      id: Date.now(),
      title,
      impact,
      ease,
      estimatedMinutes,
      reason: reasons[Math.floor(Math.random() * reasons.length)],
      score: impact * ease,
      createdAt: new Date().toISOString()
    };
  };

  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    const task = evaluateTask(newTaskTitle);
    setTasks(prev => ({
      ...prev,
      [activeTab]: [...prev[activeTab], task].sort((a, b) => b.score - a.score)
    }));
    setNewTaskTitle('');
    setShowAddTask(false);
  };

  const selectTask = (task) => {
    setSelectedTask(task);
    setMode('guide');
    setChatMessages([]);
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

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, 
      { role: 'user', content: chatInput },
      { role: 'assistant', content: '考えすぎず、まず手を動かしましょう。小さな一歩から始めてください。' }
    ]);
    setChatInput('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentTasks = tasks[activeTab] || [];

  return (
    <div className="min-h-screen bg-black text-slate-100 font-mono">
      {/* Grid Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      
      <div className="relative max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-cyan-400" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Alchemist's Compass
            </h1>
          </div>
          <div className="text-xs text-slate-500">
            Phase 1 MVP
          </div>
        </div>

        {mode === 'list' && (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setActiveTab('want')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'want'
                    ? 'bg-cyan-500/10 border border-cyan-500/30 text-cyan-400'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Target className="w-4 h-4" />
                  やりたいこと ({currentTasks.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('should')}
                className={`flex-1 py-3 px-4 rounded-lg font-semibold text-sm transition-all ${
                  activeTab === 'should'
                    ? 'bg-violet-500/10 border border-violet-500/30 text-violet-400'
                    : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  やるべきこと ({tasks.should?.length || 0})
                </div>
              </button>
            </div>

            {/* Add Task Button */}
            {!showAddTask ? (
              <button
                onClick={() => setShowAddTask(true)}
                className="w-full py-4 px-4 mb-4 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                タスクを追加
              </button>
            ) : (
              <div className="mb-4 p-4 rounded-lg bg-slate-900/60 border border-cyan-500/30">
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addTask()}
                  placeholder="何をしますか？"
                  className="w-full bg-transparent border-none outline-none text-slate-100 mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={addTask}
                    className="flex-1 py-2 px-4 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 text-sm"
                  >
                    追加
                  </button>
                  <button
                    onClick={() => {
                      setShowAddTask(false);
                      setNewTaskTitle('');
                    }}
                    className="py-2 px-4 rounded bg-slate-800/50 border border-slate-700 text-slate-400 hover:border-slate-600 text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}

            {/* Task List */}
            <div className="space-y-3">
              {currentTasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => selectTask(task)}
                  className="w-full p-4 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-cyan-500/30 transition-all text-left group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100 mb-2">{task.title}</div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          Impact: {task.impact}
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Ease: {task.ease}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.estimatedMinutes}分
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-cyan-400/80">
                        {task.reason}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-cyan-400">
                        {task.score}
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {currentTasks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>タスクがありません</p>
                <p className="text-xs mt-1">上のボタンから追加してください</p>
              </div>
            )}
          </>
        )}

        {mode === 'guide' && selectedTask && (
          <div className="space-y-6">
            <button
              onClick={() => setMode('list')}
              className="text-sm text-slate-400 hover:text-cyan-400 flex items-center gap-1"
            >
              ← 戻る
            </button>

            <div className="p-6 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800">
              <h2 className="text-xl font-bold mb-4">{selectedTask.title}</h2>
              
              <div className="mb-6 p-4 rounded bg-cyan-500/5 border border-cyan-500/20">
                <div className="text-sm font-semibold text-cyan-400 mb-2">なぜこのアプローチが合うか</div>
                <p className="text-sm text-slate-300">
                  MVP思考で素早く形にすることを重視。Decision Flowの成功パターン（2時間完成）を参考に、完璧を求めず動くものを作りましょう。
                </p>
              </div>

              <div className="mb-6">
                <div className="text-sm font-semibold text-slate-300 mb-3">推奨ステップ</div>
                <div className="space-y-2">
                  <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-sm">
                    1. 最小限の機能を定義する
                  </div>
                  <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-sm">
                    2. 2時間で動くプロトタイプを作る
                  </div>
                  <div className="p-3 rounded bg-slate-800/50 border border-slate-700 text-sm">
                    3. フィードバックを得て改善する
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 rounded bg-emerald-500/5 border border-emerald-500/20">
                <div className="text-sm font-semibold text-emerald-400 mb-2">完了基準</div>
                <p className="text-sm text-slate-300">
                  動作するバージョンを完成させる
                </p>
              </div>

              <button
                onClick={startTimer}
                className="w-full py-4 px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 transition-all flex items-center justify-center gap-2 font-semibold"
              >
                <Play className="w-5 h-5" />
                5分タイマーを開始
              </button>
            </div>
          </div>
        )}

        {mode === 'timer' && selectedTask && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="text-9xl font-bold text-cyan-400 mb-4">
                {formatTime(timeLeft)}
              </div>
              <div className="text-xl text-slate-300 mb-6">
                {selectedTask.title}
              </div>

              <div className="flex gap-3 justify-center mb-8">
                <button
                  onClick={togglePause}
                  className="py-3 px-6 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 text-slate-300 flex items-center gap-2"
                >
                  {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                  {isPaused ? '再開' : '一時停止'}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setMode('complete');
                  }}
                  className="py-3 px-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20 flex items-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  完了
                </button>
              </div>
            </div>

            {/* Chat Interface */}
            <div className="p-4 rounded-lg bg-slate-900/60 backdrop-blur-xl border border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-sm text-slate-400">
                <MessageCircle className="w-4 h-4" />
                質問・相談
              </div>
              
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-2 rounded text-sm ${
                      msg.role === 'user'
                        ? 'bg-cyan-500/10 text-cyan-100 ml-8'
                        : 'bg-slate-800/50 text-slate-300 mr-8'
                    }`}
                  >
                    {msg.content}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="質問を入力..."
                  className="flex-1 py-2 px-3 rounded bg-slate-800/50 border border-slate-700 outline-none focus:border-cyan-500/30 text-sm"
                />
                <button
                  onClick={sendMessage}
                  className="py-2 px-4 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {mode === 'complete' && selectedTask && (
          <div className="text-center space-y-6">
            <div className="text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold">お疲れさまでした！</h2>
            <p className="text-slate-400">{selectedTask.title}</p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => completeTask('complete')}
                className="py-3 px-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                完了
              </button>
              <button
                onClick={() => completeTask('defer')}
                className="py-3 px-6 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 flex items-center gap-2"
              >
                <Clock className="w-5 h-5" />
                保留
              </button>
              <button
                onClick={() => completeTask('drop')}
                className="py-3 px-6 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center gap-2"
              >
                <Archive className="w-5 h-5" />
                削除
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}