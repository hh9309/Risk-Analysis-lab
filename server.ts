import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// AI Diagnostic Endpoint
app.post('/api/ai/diagnose', async (req: Request, res: Response) => {
  try {
    const { risks, fmeaItems, metrics, activeCaseName, customApiKey, selectedModel } = req.body;
    const effectiveKey = customApiKey || apiKey;

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        error: '未配置 API-Key，所有大模型调用必须输入 API-Key 后才能调用！',
      });
    }

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

    const diagnosticPrompt = `你是一位世界顶级的系统安全工程、FMEA与系统风险分析科学家（具有航空航天、核电与高端制造实战经验）。
请对以下系统风险与FMEA数据进行深度、严谨、客观的专业诊断。

系统数据背景:
${summaryContext}

请从以下维度进行结构化深度诊断，并给出尖锐洞察与优化建议（语言必须专业、客观、淡雅、切中要害）：
1. 【RPN评分主观偏差诊断】：审查S(严酷度)、O(频度)、D(探测度)是否存在专家打分趋中效应、对极端不可逆后果（如单点致命失效）的低估、或对探测度D过度乐观导致的RPN失真；
2. 【风险联动与传染网络诊断】：分析不同子系统故障之间的多米诺传导机制；
3. 【缓解措施成本效益与安全冗余失衡评估】：评估现有对策是否陷入“过度规避低风险却轻视尾部极值”或“对策执行成本与收益不对称”的陷阱；
4. 【P80/P90决策建议】：结合不确定性分位数，给出系统备用金留存或容灾备用方案的具体指导。

请使用精炼专业的Markdown输出，包含明确的要点与结论。`;

    let diagnosisText = '';

    if (selectedModel === 'deepseek-v4-pro') {
      // Call DeepSeek API
      try {
        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: '你是一位顶级系统可靠性与风险工程院士级专家，回答严密、专业、客观，注重工程系统学逻辑。' },
              { role: 'user', content: diagnosticPrompt },
            ],
            temperature: 0.4,
          }),
        });
        if (dsRes.ok) {
          const dsData = await dsRes.json();
          diagnosisText = dsData?.choices?.[0]?.message?.content || '';
        }
      } catch (dsErr) {
        console.warn('DeepSeek proxy call failed:', dsErr);
      }
    } else {
      // Gemini 3 Flash
      try {
        const client = customApiKey
          ? new GoogleGenAI({
              apiKey: customApiKey,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
            })
          : aiClient;

        if (client) {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI request timeout')), 10000)
          );
          const response: any = await Promise.race([
            client.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: diagnosticPrompt,
              config: {
                temperature: 0.4,
                systemInstruction: '你是一位顶级系统可靠性与风险工程院士级专家，回答严密、专业、客观，注重工程系统学逻辑。',
              },
            }),
            timeoutPromise,
          ]);
          diagnosisText = response?.text || '';
        }
      } catch (geminiErr) {
        console.warn('Gemini diagnosis fallback triggered:', geminiErr);
      }
    }

    if (diagnosisText) {
      return res.json({
        success: true,
        diagnosis: diagnosisText,
        model: selectedModel || 'gemini 3 flash',
      });
    }

    throw new Error('大模型未能生成诊断内容，请检查 API-Key 是否有效');
  } catch (error: any) {
    console.error('Diagnosis API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '诊断服务异常',
    });
  }
});

// AI Chat Q&A Endpoint
app.post('/api/ai/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, context, customApiKey, selectedModel } = req.body;
    const effectiveKey = customApiKey || apiKey;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!effectiveKey) {
      return res.status(400).json({
        success: false,
        error: '未配置 API-Key，所有大模型调用必须输入 API-Key 后才能调用！',
      });
    }

    const systemInstruction = `你是一位嵌入在“系统风险分析 WebApp 实验室”的首席风险与可靠性工程顾问。
用户正在研究故障模式(FMEA)、5x5/3x3概率影响矩阵、蒙特卡洛不确定性模拟(P80/P90)、故障树(FTA)以及海外工程、芯片供应链、关键基础设施网安、航天发射、新能源投资、智能汽车等典型案例。
回答风格要求：淡雅、学术、严谨、结构清晰，多结合数学公式、工程标准(如 ISO 31000, IEC 60812, ISO 26262, AIAG-VDA)给出落地的可操作建议。`;

    let promptWithContext = message;
    if (context) {
      promptWithContext = `[当前系统状态背景: ${JSON.stringify(context).slice(0, 800)}]\n\n用户问题: ${message}`;
    }

    let replyText = '';

    if (selectedModel === 'deepseek-v4-pro') {
      try {
        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${effectiveKey.trim()}`,
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: systemInstruction },
              { role: 'user', content: promptWithContext },
            ],
            temperature: 0.5,
          }),
        });
        if (dsRes.ok) {
          const dsData = await dsRes.json();
          replyText = dsData?.choices?.[0]?.message?.content || '';
        }
      } catch (dsErr) {
        console.warn('DeepSeek chat proxy failed:', dsErr);
      }
    } else {
      try {
        const client = customApiKey
          ? new GoogleGenAI({
              apiKey: customApiKey,
              httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
            })
          : aiClient;

        if (client) {
          const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('AI request timeout')), 10000)
          );

          const response: any = await Promise.race([
            client.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: promptWithContext,
              config: {
                systemInstruction,
                temperature: 0.5,
              },
            }),
            timeoutPromise,
          ]);

          replyText = response?.text || '';
        }
      } catch (geminiErr) {
        console.warn('Gemini chat fallback triggered:', geminiErr);
      }
    }

    if (replyText) {
      return res.json({
        success: true,
        reply: replyText,
      });
    }

    throw new Error('大模型未能回复，请核对 API-Key 是否有效');
  } catch (error: any) {
    console.error('Chat API error:', error);
    res.status(500).json({
      success: false,
      error: error.message || '对话服务异常',
    });
  }
});

// Setup Vite in Dev or Serve Static in Production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 System Risk Analysis Lab server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
