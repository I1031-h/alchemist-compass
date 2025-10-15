/**
 * Gemini API Integration
 * Handles task evaluation, guide generation, and chat responses
 */

const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/**
 * Available Gemini models (Updated October 2025)
 */
export const GEMINI_MODELS = {
  // Gemini 2.5 Series - Latest & Best
  'gemini-2.5-flash': {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: '最高のコスパ・Thinking機能搭載（推奨）',
    speed: '⚡⚡⚡',
    quality: '⭐⭐⭐⭐',
    cost: '💰',
  },
  'gemini-2.5-pro': {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    description: '最高品質・Deep Thinkingモード',
    speed: '⚡⚡',
    quality: '⭐⭐⭐⭐⭐',
    cost: '💰💰💰',
  },
  'gemini-2.5-flash-lite': {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash-Lite',
    description: '最速・最低コスト・大量処理向け',
    speed: '⚡⚡⚡⚡',
    quality: '⭐⭐⭐',
    cost: '💰 (最安)',
  },
  
  // Gemini 2.0 Series
  'gemini-2.0-flash-exp': {
    id: 'gemini-2.0-flash-exp',
    name: 'Gemini 2.0 Flash (Experimental)',
    description: '実験版・高速',
    speed: '⚡⚡⚡',
    quality: '⭐⭐⭐',
    cost: '💰',
  },
  'gemini-2.0-flash-thinking-exp-1219': {
    id: 'gemini-2.0-flash-thinking-exp-1219',
    name: 'Gemini 2.0 Flash Thinking',
    description: '思考プロセス付き',
    speed: '⚡⚡',
    quality: '⭐⭐⭐⭐',
    cost: '💰💰',
  },
  
  // Gemini 1.5 Series - Stable
  'gemini-1.5-flash': {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    description: 'バランス型・安定版',
    speed: '⚡⚡⚡',
    quality: '⭐⭐⭐',
    cost: '💰',
  },
  'gemini-1.5-pro': {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    description: '1.5世代の最高品質',
    speed: '⚡⚡',
    quality: '⭐⭐⭐⭐',
    cost: '💰💰💰',
  },
};

/**
 * Get model options for selector
 */
export function getModelOptions() {
  return Object.values(GEMINI_MODELS);
}

/**
 * Call Gemini API with prompt
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @param {number} temperature - Temperature setting (0.0-1.0)
 * @param {number} maxOutputTokens - Maximum output tokens
 * @returns {Promise<string>} - Generated text
 */
export async function callGeminiAPI(
  prompt, 
  apiKey, 
  model = 'gemini-2.5-flash', 
  temperature = 0.7,
  maxOutputTokens = 2000
) {
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  const apiUrl = `${GEMINI_API_BASE}/${model}:generateContent`;

  try {
    const response = await fetch(`${apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_NONE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_NONE'
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData?.error?.message || `HTTP ${response.status}`;
      throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    // Check if response has content
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('No content in API response');
    }
    
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API call failed:', error);
    throw error;
  }
}

/**
 * Evaluate task with AI
 * @param {string} title - Task title
 * @param {string} category - 'want' or 'should'
 * @param {object} userContext - User profile data
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @returns {Promise<object>} - Task evaluation
 */
export async function evaluateTask(title, category, userContext = {}, apiKey, model = 'gemini-2.5-flash') {
  const prompt = `あなたはパーソナルAIコーチです。以下のタスクを評価してください。

【タスク】
"${title}"

【カテゴリ】
${category === 'want' ? 'やりたいこと（内発的動機）' : 'やるべきこと（外発的動機）'}

【ユーザープロファイル】
- 22歳、独立したクリエイター・システムビルダー
- 完璧主義傾向あり（MVP思考・Small Win戦略を推奨）
- システム構築・自動化・効率化が得意
- 効率性と洗練性を重視（「美しい仕組み」を好む）
- Decision Flowを2時間で完成させた実績（高速プロトタイピング能力）
- 知的好奇心が強く、深い分析を好む
- 自律性とコントロール感を重視

【評価基準】
1. **Impact（影響度）**: このタスクが目標達成にどれだけ貢献するか
   - ユーザーの価値観（効率性、自律性、創造性）との合致度
   - スキル成長への寄与度
   - 実際の成果物やポートフォリオへの影響
   - 7-10の整数で評価

2. **Ease（始めやすさ）**: 今すぐ取り掛かれるか
   - 必要なリソースの準備状況
   - 認知的負荷の低さ
   - 最初の一歩の明確さ
   - 6-10の整数で評価

3. **EstimatedMinutes**: 実際の所要時間（15, 30, 45, 60のいずれか）

4. **Reason**: このタスクを推奨する理由
   - ユーザーの強みをどう活かせるか
   - なぜ今やるべきか
   - 40-60文字で具体的に

【出力形式】
以下のJSON形式**のみ**で回答してください。説明文は不要です。

{
  "impact": 7-10の整数,
  "ease": 6-10の整数,
  "estimatedMinutes": 15 or 30 or 45 or 60,
  "reason": "推奨理由（40-60文字）"
}
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, model, 0.7, 1000);
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const evaluation = JSON.parse(jsonMatch[0]);
    
    // Validate response
    if (!evaluation.impact || !evaluation.ease || !evaluation.estimatedMinutes || !evaluation.reason) {
      throw new Error('Incomplete evaluation data');
    }
    
    return {
      impact: Math.max(7, Math.min(10, evaluation.impact)),
      ease: Math.max(6, Math.min(10, evaluation.ease)),
      estimatedMinutes: [15, 30, 45, 60].includes(evaluation.estimatedMinutes) 
        ? evaluation.estimatedMinutes 
        : 30,
      reason: evaluation.reason.slice(0, 100),
      score: evaluation.impact * evaluation.ease
    };
  } catch (error) {
    console.error('Task evaluation failed:', error);
    throw new Error(`タスク評価に失敗しました: ${error.message}`);
  }
}

/**
 * Bulk evaluate multiple tasks with AI
 * @param {string} tasksText - Multi-line text with one task per line
 * @param {object} userContext - User profile data
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @returns {Promise<array>} - Array of evaluated tasks
 */
export async function bulkEvaluateTasks(tasksText, userContext = {}, apiKey, model = 'gemini-2.5-flash') {
  const lines = tasksText.split('\n').filter(line => line.trim()).slice(0, 20); // Max 20 tasks
  
  if (lines.length === 0) {
    throw new Error('No tasks to evaluate');
  }

  const tasksFormatted = lines.map((line, i) => `${i + 1}. ${line.trim()}`).join('\n');

  const prompt = `あなたはパーソナルAIコーチです。以下のタスクリストを一括評価してください。

【タスクリスト】
${tasksFormatted}

【ユーザープロファイル】
- 22歳、独立したクリエイター・システムビルダー
- 完璧主義傾向あり（MVP思考を推奨）
- システム構築・自動化・効率化が得意
- 効率性と洗練性を重視
- 自律性とコントロール感を重視

【評価タスク】
各タスクについて：
1. **Category**: "want"（やりたいこと・内発的動機）または "should"（やるべきこと・外発的動機）
2. **Impact**: 7-10の整数（目標達成への貢献度）
3. **Ease**: 6-10の整数（始めやすさ）
4. **EstimatedMinutes**: 15, 30, 45, 60のいずれか
5. **Reason**: 推奨理由（30-50文字）

【判定基準】
- **Want**: 好奇心・創造性・学習・自己成長が主目的
- **Should**: 責任・義務・メンテナンス・他者の期待が主目的

【出力形式】
以下のJSON配列形式**のみ**で回答してください。

[
  {
    "title": "タスク1のタイトル",
    "category": "want" or "should",
    "impact": 7-10の整数,
    "ease": 6-10の整数,
    "estimatedMinutes": 15 or 30 or 45 or 60,
    "reason": "推奨理由（30-50文字）"
  },
  ...
]
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, model, 0.7, 4000);
    
    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      throw new Error('No JSON array found in response');
    }
    
    const tasks = JSON.parse(jsonMatch[0]);
    
    if (!Array.isArray(tasks) || tasks.length === 0) {
      throw new Error('Invalid task array');
    }
    
    // Validate and clean tasks
    return tasks.map(task => ({
      title: task.title?.slice(0, 200) || 'Untitled Task',
      category: task.category === 'should' ? 'should' : 'want',
      impact: Math.max(7, Math.min(10, task.impact || 7)),
      ease: Math.max(6, Math.min(10, task.ease || 7)),
      estimatedMinutes: [15, 30, 45, 60].includes(task.estimatedMinutes) 
        ? task.estimatedMinutes 
        : 30,
      reason: task.reason?.slice(0, 100) || 'AI評価完了',
      score: (task.impact || 7) * (task.ease || 7),
      preActionNote: '',
      postActionNote: ''
    }));
  } catch (error) {
    console.error('Bulk task evaluation failed:', error);
    throw new Error(`一括評価に失敗しました: ${error.message}`);
  }
}

/**
 * Generate execution guide for task
 * @param {object} task - Task object
 * @param {object} userContext - User profile data
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @returns {Promise<object>} - Execution guide
 */
export async function generateGuide(task, userContext = {}, apiKey, model = 'gemini-2.5-flash') {
  const prompt = `あなたはパーソナルAIコーチです。以下のタスクの実行ガイドを生成してください。

【タスク】
"${task.title}"

【タスク評価】
- Impact: ${task.impact}/10
- Ease: ${task.ease}/10
- 推定時間: ${task.estimatedMinutes}分
- カテゴリ: ${task.category === 'want' ? 'やりたいこと' : 'やるべきこと'}

【ユーザープロファイル】
- 完璧主義傾向あり → MVP思考・Small Win戦略を推奨
- Decision Flowを2時間で完成させた実績
- 高速プロトタイピング能力
- システム思考・効率重視
- 自律性を重んじる

【ガイド生成の方針】
1. **Approach**: なぜこのアプローチがユーザーに合うか
   - ユーザーの強み（システム思考、高速実装）との接続
   - 完璧主義を回避するための戦略
   - 60-80文字で具体的に

2. **Steps**: 実行ステップ（3-4ステップ）
   - 各ステップは具体的なアクション
   - 最初のステップは即座に実行可能
   - MVP思考：最小限で動くものを優先
   - 各ステップ50-80文字

3. **Completion**: 完了基準
   - 「完璧」ではなく「十分」のライン
   - 測定可能な基準
   - 40-60文字

【出力形式】
以下のJSON形式**のみ**で回答してください。

{
  "approach": "なぜこのアプローチが合うか（60-80文字）",
  "steps": [
    "ステップ1の具体的なアクション（50-80文字）",
    "ステップ2の具体的なアクション（50-80文字）",
    "ステップ3の具体的なアクション（50-80文字）"
  ],
  "completion": "完了基準（40-60文字）"
}
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, model, 0.8, 1500);
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const guide = JSON.parse(jsonMatch[0]);
    
    // Validate response
    if (!guide.approach || !guide.steps || !Array.isArray(guide.steps) || !guide.completion) {
      throw new Error('Incomplete guide data');
    }
    
    return {
      approach: guide.approach.slice(0, 150),
      steps: guide.steps.map(step => step.slice(0, 150)),
      completion: guide.completion.slice(0, 100)
    };
  } catch (error) {
    console.error('Guide generation failed:', error);
    throw new Error(`ガイド生成に失敗しました: ${error.message}`);
  }
}

/**
 * Generate post-action summary and insights
 * NEW FUNCTION - Auto-generates "what you did" after completing a task
 * @param {object} task - Completed task object
 * @param {number} actualDuration - Actual time spent in minutes
 * @param {string} preActionNote - Note before action
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @returns {Promise<string>} - Generated summary
 */
export async function generateActionSummary(task, actualDuration, preActionNote = '', apiKey, model = 'gemini-2.5-flash') {
  const timeDiff = actualDuration - (task.plannedDuration || task.estimatedMinutes || 30);
  const timeDiffText = timeDiff > 0 
    ? `予定より${timeDiff}分長くかかった` 
    : timeDiff < 0 
    ? `予定より${Math.abs(timeDiff)}分早く完了` 
    : '予定通り完了';

  const prompt = `あなたはパーソナルAIコーチです。完了したタスクについて、ユーザーが「何をやったか」「何を学んだか」を自動記録してください。

【完了したタスク】
- タイトル: "${task.title}"
- カテゴリ: ${task.category === 'want' ? 'やりたいこと' : 'やるべきこと'}
- 実際の作業時間: ${actualDuration}分
- 予定時間: ${task.plannedDuration || task.estimatedMinutes || 30}分
- 時間差: ${timeDiffText}
- Impact評価: ${task.impact}/10
- Ease評価: ${task.ease}/10

${preActionNote ? `【行動前のメモ】\n${preActionNote}\n` : ''}

【記録の方針】
1. **何をやったか**: タスクから推測される具体的な行動内容
   - システム構築・自動化・コーディング・デザイン・学習など
   - 技術的な詳細や使用ツールを含める
   - 50-80文字で具体的に

2. **学びと気づき**: このタスクから得られた洞察
   - 効率化のヒント
   - 今後の改善点
   - 新しい発見や理解
   - 40-60文字で簡潔に

【出力形式】
以下の形式で、改行で区切って出力してください。

【実施内容】
(何をやったか 50-80文字)

【学びと気づき】
(学んだこと 40-60文字)
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, model, 0.8, 500);
    return text.trim().slice(0, 300);
  } catch (error) {
    console.error('Action summary generation failed:', error);
    // Fallback summary
    return `【実施内容】\n「${task.title}」を${actualDuration}分で完了。${timeDiffText}。\n\n【学びと気づき】\nタスクを完了できました。次回はさらに効率化を目指します。`;
  }
}

/**
 * Generate chat response
 * @param {string} message - User message
 * @param {object} taskContext - Current task context
 * @param {array} chatHistory - Previous messages
 * @param {string} apiKey - Gemini API key
 * @param {string} model - Model ID
 * @returns {Promise<string>} - AI response
 */
export async function getChatResponse(message, taskContext, chatHistory = [], apiKey, model = 'gemini-2.5-flash') {
  const historyText = chatHistory.slice(-4).map(msg => 
    `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
  ).join('\n');

  const elapsedMinutes = Math.floor((5 * 60 - taskContext.timeLeft) / 60);
  const remainingMinutes = Math.floor(taskContext.timeLeft / 60);

  const prompt = `あなたはパーソナルAIコーチです。実行中のタスクについて答えてください。

【現在の状況】
- タスク: "${taskContext.title}"
- 経過時間: ${elapsedMinutes}分
- 残り時間: ${remainingMinutes}分

【過去の会話】
${historyText || 'なし'}

【ユーザーの質問】
"${message}"

【応答の方針】
- 完璧主義を避け、行動を促すトーンで
- 具体的で実用的なアドバイス
- ユーザーの強み（システム思考、高速実装）を活かす
- 80-120文字で簡潔に
- 必要に応じて質問で問い返す

【応答】
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, model, 0.9, 500);
    return text.trim().slice(0, 300);
  } catch (error) {
    console.error('Chat response failed:', error);
    throw new Error(`チャット応答に失敗しました: ${error.message}`);
  }
}