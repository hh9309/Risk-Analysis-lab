/**
 * AI Model Service for GitHub Pages (browser-direct) and Server-proxied deployment
 * Supports:
 * 1. gemini 3 flash (Google Gemini API)
 * 2. deepseek-v4-pro (DeepSeek API OpenAI-compatible endpoint)
 */

export type SupportedModel = 'gemini 3 flash' | 'deepseek-v4-pro';

export interface AiConfig {
  apiKey: string;
  model: SupportedModel;
}

const STORAGE_KEY = 'sys_risk_ai_config';

export function getStoredAiConfig(): AiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        apiKey: parsed.apiKey || '',
        model: parsed.model === 'deepseek-v4-pro' ? 'deepseek-v4-pro' : 'gemini 3 flash',
      };
    }
  } catch (e) {
    console.error('Failed to read ai config from localStorage', e);
  }
  return {
    apiKey: '',
    model: 'gemini 3 flash',
  };
}

export function saveStoredAiConfig(config: AiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save ai config to localStorage', e);
  }
}

/**
 * Direct browser call to Gemini REST API (GitHub Pages friendly)
 */
async function callGeminiDirect(apiKey: string, prompt: string, systemInstruction?: string): Promise<string> {
  // Using gemini-2.5-flash endpoint standard for browser REST calls
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
  
  const payload: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }],
      },
    ],
  };

  if (systemInstruction) {
    payload.systemInstruction = {
      parts: [{ text: systemInstruction }],
    };
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Gemini API 错误: ${message}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Gemini API 未返回有效文本内容');
  }
  return text;
}

/**
 * Direct browser call to DeepSeek API (GitHub Pages friendly, OpenAI-compatible)
 */
async function callDeepSeekDirect(apiKey: string, prompt: string, systemInstruction?: string): Promise<string> {
  const url = 'https://api.deepseek.com/chat/completions';
  
  const messages = [];
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat', // maps to DeepSeek V3 / V4 pro series
      messages,
      temperature: 0.5,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`DeepSeek API 错误: ${message}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) {
    throw new Error('DeepSeek API 未返回有效文本内容');
  }
  return text;
}

/**
 * Unified dispatch for AI Diagnosis
 */
export async function executeAiDiagnosis(
  config: AiConfig,
  contextData: {
    risks: any[];
    fmeaItems: any[];
    metrics: any;
    activeCaseName: string;
  }
): Promise<{ text: string; model: string }> {
  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error('未配置 API-Key，所有大模型调用必须输入 API-Key 后才能调用！');
  }

  const { risks, fmeaItems, metrics, activeCaseName } = contextData;
  const summaryContext = `
当前正在分析的案例/工程: ${activeCaseName || '自定义系统工程'}
风险项数量: ${risks?.length || 0}
FMEA故障模式项: ${fmeaItems?.length || 0}
高RPN项 (RPN > 150): ${fmeaItems?.filter((f: any) => (f.rpn || f.severity * f.occurrence * f.detection) > 150).length || 0}
系统蒙特卡洛指标: P50=${metrics?.p50 || 'N/A'}, P80=${metrics?.p80 || 'N/A'}, P90=${metrics?.p90 || 'N/A'}, VaR95=${metrics?.var95 || 'N/A'}

详细FMEA列表:
${(fmeaItems || []).slice(0, 10).map((f: any, idx: number) => 
  `${idx + 1}. [${f.subsystem || '子系统'}] ${f.failureMode}: S=${f.severity}, O=${f.occurrence}, D=${f.detection}, RPN=${f.severity * f.occurrence * f.detection}, 改善措施: ${f.mitigation || '无'}`
).join('\n')}
`;

  const prompt = `你是一位世界顶级的系统安全工程、FMEA与系统风险分析科学家（具有航空航天、核电与高端制造实战经验）。
请对以下系统风险与FMEA数据进行深度、严谨、客观的专业诊断。

系统数据背景:
${summaryContext}

请从以下四个维度进行结构化深度诊断，并给出尖锐洞察与优化建议（语言必须专业、客观、淡雅、切中要害）：
1. 【RPN评分主观偏差诊断】：审查S(严酷度)、O(频度)、D(探测度)是否存在专家打分趋中效应、对极端不可逆后果（如单点致命失效）的低估、或对探测度D过度乐观导致的RPN失真；
2. 【风险联动与传染网络诊断】：分析不同子系统故障之间的多米诺传导机制；
3. 【缓解措施成本效益与安全冗余失衡评估】：评估现有对策是否陷入“过度规避低风险却轻视尾部极值”或“对策执行成本与收益不对称”的陷阱；
4. 【P80/P90决策建议】：结合不确定性分位数，给出系统备用金留存或容灾备用方案的具体指导。

请使用精炼专业的Markdown输出，包含明确的要点与结论。`;

  const sysInstruction = '你是一位顶级系统可靠性与风险工程院士级专家，回答严密、专业、客观，注重工程系统学逻辑。';

  // 1. Try local server proxy first if available
  try {
    const res = await fetch('/api/ai/diagnose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...contextData,
        customApiKey: config.apiKey,
        selectedModel: config.model,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.diagnosis) {
        return { text: data.diagnosis, model: config.model };
      }
    }
  } catch (proxyErr) {
    console.log('Server proxy unreachable, falling back to direct browser call (GitHub Pages mode)');
  }

  // 2. Direct browser call for GitHub Pages
  if (config.model === 'deepseek-v4-pro') {
    const text = await callDeepSeekDirect(config.apiKey, prompt, sysInstruction);
    return { text, model: 'deepseek-v4-pro' };
  } else {
    const text = await callGeminiDirect(config.apiKey, prompt, sysInstruction);
    return { text, model: 'gemini 3 flash' };
  }
}

/**
 * Unified dispatch for AI Chat Q&A
 */
export async function executeAiChat(
  config: AiConfig,
  message: string,
  contextData?: any
): Promise<{ text: string; model: string }> {
  if (!config.apiKey || !config.apiKey.trim()) {
    throw new Error('未配置 API-Key，所有大模型调用必须输入 API-Key 后才能调用！');
  }

  const sysInstruction = `你是一位嵌入在“系统风险分析 WebApp 实验室”的首席风险与可靠性工程顾问。
用户正在研究故障模式(FMEA)、5x5/3x3概率影响矩阵、蒙特卡洛不确定性模拟(P80/P90)、故障树(FTA)以及海外工程、芯片供应链、关键基础设施网安、航天发射、新能源投资、智能汽车等典型案例。
回答风格要求：淡雅、学术、严谨、结构清晰，多结合数学公式、工程标准(如 ISO 31000, IEC 60812, ISO 26262, AIAG-VDA)给出落地的可操作建议。`;

  let prompt = message;
  if (contextData) {
    prompt = `[当前系统工程背景: ${JSON.stringify(contextData).slice(0, 800)}]\n\n用户咨询问题: ${message}`;
  }

  // 1. Try local server proxy first
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        context: contextData,
        customApiKey: config.apiKey,
        selectedModel: config.model,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.reply) {
        return { text: data.reply, model: config.model };
      }
    }
  } catch (proxyErr) {
    console.log('Server proxy unreachable, falling back to direct browser call (GitHub Pages mode)');
  }

  // 2. Direct browser call
  if (config.model === 'deepseek-v4-pro') {
    const text = await callDeepSeekDirect(config.apiKey, prompt, sysInstruction);
    return { text, model: 'deepseek-v4-pro' };
  } else {
    const text = await callGeminiDirect(config.apiKey, prompt, sysInstruction);
    return { text, model: 'gemini 3 flash' };
  }
}
