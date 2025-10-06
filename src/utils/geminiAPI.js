/**
 * Gemini API Integration
 * Handles task evaluation, guide generation, and chat responses
 */

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

/**
 * Call Gemini API with prompt
 * @param {string} prompt - The prompt to send
 * @param {string} apiKey - Gemini API key
 * @param {number} temperature - Temperature setting (0.0-1.0)
 * @returns {Promise<string>} - Generated text
 */
export async function callGeminiAPI(prompt, apiKey, temperature = 0.7) {
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
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
          maxOutputTokens: 1000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
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
 * @returns {Promise<object>} - Task evaluation
 */
export async function evaluateTask(title, category, userContext = {}, apiKey) {
  const prompt = `
あなたはパーソナルAIコーチです。以下のタスクを評価してください。

タスク: "${title}"
カテゴリ: ${category === 'want' ? 'やりたいこと' : 'やるべきこと'}

ユーザープロファイル:
- 完璧主義傾向あり（MVP思考を推奨）
- システム構築・自動化が得意
- 効率性と洗練性を重視
- Decision Flowを2時間で完成させた実績

以下の形式で評価してください:

{
  "impact": 7-10の整数（目標達成への影響度）,
  "ease": 6-10の整数（今すぐ始めやすさ）,
  "estimatedMinutes": 15, 30, 45, 60のいずれか,
  "reason": "このタスクを推奨する理由（30文字以内）"
}

JSON形式のみで回答してください。
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, 0.7);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const evaluation = JSON.parse(jsonMatch[0]);
      return {
        impact: evaluation.impact,
        ease: evaluation.ease,
        estimatedMinutes: evaluation.estimatedMinutes,
        reason: evaluation.reason,
        score: evaluation.impact * evaluation.ease
      };
    }
  } catch (error) {
    console.error('Task evaluation failed:', error);
  }

  // Fallback to mock evaluation
  return {
    impact: Math.floor(Math.random() * 4) + 7,
    ease: Math.floor(Math.random() * 5) + 6,
    estimatedMinutes: [15, 30, 45, 60][Math.floor(Math.random() * 4)],
    reason: 'AI評価に失敗しました（Mock）',
    score: 0
  };
}

/**
 * Generate execution guide for task
 * @param {object} task - Task object
 * @param {object} userContext - User profile data
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<object>} - Execution guide
 */
export async function generateGuide(task, userContext = {}, apiKey) {
  const prompt = `
タスク: "${task.title}"
カテゴリ: ${task.category === 'want' ? 'やりたいこと' : 'やるべきこと'}

ユーザープロファイル:
- 完璧主義傾向あり
- MVP思考を推奨
- Decision Flowを2時間で完成させた実績

このタスクの実行ガイドを生成してください:

{
  "approach": "なぜこのアプローチが合うか（50文字以内）",
  "steps": ["ステップ1", "ステップ2", "ステップ3"],
  "completion": "完了基準（30文字以内）"
}

JSON形式のみで回答してください。
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, 0.8);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.error('Guide generation failed:', error);
  }

  // Fallback guide
  return {
    approach: 'MVP思考で素早く形にすることを重視',
    steps: [
      '最小限の機能を定義する',
      '2時間で動くプロトタイプを作る',
      'フィードバックを得て改善する'
    ],
    completion: '動作するバージョンを完成させる'
  };
}

/**
 * Generate chat response
 * @param {string} message - User message
 * @param {object} taskContext - Current task context
 * @param {array} chatHistory - Previous messages
 * @param {string} apiKey - Gemini API key
 * @returns {Promise<string>} - AI response
 */
export async function getChatResponse(message, taskContext, chatHistory = [], apiKey) {
  const historyText = chatHistory.slice(-4).map(msg => 
    `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`
  ).join('\n');

  const prompt = `
あなたはパーソナルコーチです。実行中のタスクについて簡潔に答えてください。

現在のタスク: "${taskContext.title}"
経過時間: ${Math.floor((5 * 60 - taskContext.timeLeft) / 60)}分

過去の会話:
${historyText}

ユーザーの質問: "${message}"

50文字以内で答えてください。完璧主義を避け、行動を促すトーンで。
`;

  try {
    const text = await callGeminiAPI(prompt, apiKey, 0.9);
    return text.trim().slice(0, 200); // Max 200 chars
  } catch (error) {
    console.error('Chat response failed:', error);
    return '考えすぎず、まず手を動かしましょう。小さな一歩から始めてください。';
  }
}