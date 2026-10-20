import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  RotateCcw, 
  Bot, 
  User, 
  AlertCircle, 
  CheckCircle2, 
  ShieldAlert, 
  HelpCircle,
  FileSearch,
  Activity,
  Settings,
  Key,
  Cpu
} from 'lucide-react';
import { RiskItem, FmeaItem, SimulationResult } from '../../types/risk';
import { AiConfig, getStoredAiConfig, executeAiDiagnosis, executeAiChat } from '../../services/aiService';
import { AiModelSettingsModal } from '../AiModelSettingsModal';

interface Module7Props {
  risks: RiskItem[];
  fmeaItems: FmeaItem[];
  simResult: SimulationResult;
  caseTitle: string;
}

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  time: string;
  modelUsed?: string;
}

export const Module7AiAdvisor: React.FC<Module7Props> = ({
  risks,
  fmeaItems,
  simResult,
  caseTitle,
}) => {
  const [aiConfig, setAiConfig] = useState<AiConfig>(getStoredAiConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKeyWarning, setApiKeyWarning] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `您好！我是系统安全与风险分析工程专家 AI 随诊顾问。\n\n当前已载入案例工程：**${caseTitle}**（包含 ${risks.length} 项风险源、${fmeaItems.length} 项 FMEA 故障模式）。\n\n📌 **大模型调用提示**：本项目支持部署到 GitHub 由浏览器端直接调取。请点击右上角【⚙️ 模型设置】手工输入您的 API-Key 并选择模型（**gemini 3 flash** 或 **deepseek-v4-pro**）后即可调用。`,
      time: '刚刚',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [diagnosticReport, setDiagnosticReport] = useState<string | null>(null);

  // Sync settings when opened
  useEffect(() => {
    setAiConfig(getStoredAiConfig());
  }, [isSettingsOpen]);

  // Quick prompt questions
  const QUICK_PROMPTS = [
    '诊断当前 FMEA 是否存在打分主观偏差？',
    '分析子系统故障之间的多米诺联动传染效应',
    '评估当前缓解措施的成本效益与安全冗余',
    '结合 P80/P90 给出科学备用金与防线建议',
  ];

  const handleRunFullDiagnosis = async () => {
    const currentConfig = getStoredAiConfig();
    setAiConfig(currentConfig);

    // Hard requirement: All model calls must have an API-Key entered first
    if (!currentConfig.apiKey || !currentConfig.apiKey.trim()) {
      setApiKeyWarning('⚠️ 所有大模型调用必须输入 API-Key 后才能调用！已为您自动打开设置窗口，请输入并确认您的 API-Key。');
      setIsSettingsOpen(true);
      return;
    }

    setApiKeyWarning(null);
    setIsDiagnosing(true);

    try {
      const res = await executeAiDiagnosis(currentConfig, {
        risks,
        fmeaItems,
        metrics: {
          p50: Math.round(simResult.p50),
          p80: Math.round(simResult.p80),
          p90: Math.round(simResult.p90),
          var95: Math.round(simResult.var95),
        },
        activeCaseName: caseTitle,
      });
      setDiagnosticReport(res.text);
    } catch (e: any) {
      console.error(e);
      setDiagnosticReport(`诊断调用失败: ${e.message}\n\n请检查您输入的 API-Key 是否正确或具有调用额度。如需更换大模型，请点击右上角小齿轮。`);
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isSending) return;

    const currentConfig = getStoredAiConfig();
    setAiConfig(currentConfig);

    // Hard requirement: All model calls must have an API-Key entered first
    if (!currentConfig.apiKey || !currentConfig.apiKey.trim()) {
      setApiKeyWarning('⚠️ 所有大模型调用必须输入 API-Key 后才能调用！请点击右上角小齿轮输入 API-Key。');
      setIsSettingsOpen(true);
      return;
    }

    setApiKeyWarning(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsSending(true);

    try {
      const res = await executeAiChat(currentConfig, text, {
        activeCase: caseTitle,
        riskCount: risks.length,
        fmeaCount: fmeaItems.length,
        p80: Math.round(simResult.p80),
        p90: Math.round(simResult.p90),
      });

      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: res.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: res.model,
        },
      ]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: `大模型请求异常: ${e.message}\n请检查右上角小齿轮中的 API-Key 与模型选项。`,
          time: '刚刚',
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>模块 7 · 智能随诊协同中枢</span>
            </div>
            <div className="flex items-center space-x-2.5">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                AI 诊断与大模型 Q&A 随诊顾问
              </h2>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition shadow-2xs group flex items-center space-x-1"
                title="设置大模型：1. 手工输入 API-Key  2. 选择 gemini 3 flash 或 deepseek-v4-pro  3. 确认大模型"
                aria-label="设置大模型"
              >
                <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform duration-300 text-indigo-600" />
                <span className="text-[11px] font-semibold text-indigo-700 hidden sm:inline">模型设置</span>
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              基于大模型系统安全知识库，动态诊断 RPN 评分主观偏差、跨子系统风险联动传染效应与对策成本效益失衡风险。
            </p>
          </div>

          {/* Header Right Actions: Model Pill, Settings Gear Button, Run Diagnose Button */}
          <div className="flex items-center flex-wrap gap-2.5 self-start lg:self-center">
            {/* Active Model Pill */}
            <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500 font-medium">模型:</span>
              <strong className="text-slate-900 font-mono">{aiConfig.model}</strong>
              <div className="w-px h-3 bg-slate-300" />
              {aiConfig.apiKey.trim() ? (
                <span className="text-emerald-700 font-medium flex items-center space-x-1 text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Key已绑定</span>
                </span>
              ) : (
                <span className="text-rose-600 font-semibold text-[11px] flex items-center space-x-0.5">
                  <Key className="w-3 h-3" />
                  <span>需填Key</span>
                </span>
              )}
            </div>

            {/* Little Gear Settings Icon Button (小齿轮设置大模型图标) */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-2 rounded-xl text-xs font-semibold shadow-2xs transition"
              title="设置大模型 (手工输入 API-Key / 选择 gemini 3 flash 或 deepseek-v4-pro)"
            >
              <Settings className="w-4 h-4 text-indigo-600" />
              <span>模型设置</span>
            </button>

            {/* Run Full Diagnosis Button */}
            <button
              onClick={handleRunFullDiagnosis}
              disabled={isDiagnosing}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 ${isDiagnosing ? 'animate-spin' : ''}`} />
              <span>{isDiagnosing ? '大模型深度推演中...' : '一键专业系统全面体检'}</span>
            </button>
          </div>
        </div>

        {/* API Key Warning Alert if triggered */}
        {apiKeyWarning && (
          <div className="mt-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-2.5 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{apiKeyWarning}</span>
            </div>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-2.5 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded text-[11px] shrink-0"
            >
              立即配置 API-Key
            </button>
          </div>
        )}
      </div>

      {/* Main Grid: Left Diagnostic Report (if available or generated), Right Interactive Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Structured Diagnosis Report */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4 min-h-[500px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <FileSearch className="w-4 h-4 text-indigo-600" />
                <span>系统专家诊断体检报告</span>
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                  {aiConfig.model}
                </span>
                <span className="text-xs text-slate-400">
                  {diagnosticReport ? '已生成' : '待生成'}
                </span>
              </div>
            </div>

            {diagnosticReport ? (
              <div className="space-y-4 text-xs text-slate-700 leading-relaxed max-h-[620px] overflow-y-auto pr-1">
                <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 whitespace-pre-wrap font-sans">
                  {diagnosticReport}
                </div>
              </div>
            ) : (
              <div className="py-24 text-center text-slate-400 space-y-3">
                <ShieldAlert className="w-10 h-10 text-slate-300 mx-auto" />
                <div className="text-xs max-w-xs mx-auto">
                  尚未生成当前系统的完整体检报告。
                  <p className="text-[11px] text-slate-400 mt-1">
                    点击右上角的“一键专业系统全面体检”，选定的大模型将即时扫描所有 FMEA 评分偏差、联动传染矩阵与极端分位数。
                  </p>
                </div>
                <button
                  onClick={handleRunFullDiagnosis}
                  className="px-4 py-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold text-xs hover:bg-indigo-100 transition"
                >
                  立即生成诊断报告
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Q&A Chat Window */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col h-[580px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="text-xs font-bold text-slate-900">可靠性工程智能随诊顾问</h4>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 font-mono">
                    {aiConfig.model}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-600 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>在线 · 浏览器端直连已就绪</span>
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsSettingsOpen(true)}
                title="设置模型与API-Key"
                className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMessages(messages.slice(0, 1))}
                className="text-[11px] text-slate-400 hover:text-slate-600 transition"
              >
                清空对话
              </button>
            </div>
          </div>

          {/* Chat Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex items-start space-x-2 ${
                  m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    m.sender === 'user'
                      ? 'bg-slate-900 text-white'
                      : 'bg-indigo-100 text-indigo-700'
                  }`}
                >
                  {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 leading-relaxed whitespace-pre-wrap ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-tl-xs'
                  }`}
                >
                  {m.text}
                  <div
                    className={`text-[9px] mt-1 flex items-center justify-between space-x-2 ${
                      m.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    <span>{m.modelUsed ? `模型: ${m.modelUsed}` : ''}</span>
                    <span>{m.time}</span>
                  </div>
                </div>
              </div>
            ))}

            {isSending && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
                <Bot className="w-4 h-4 text-indigo-500 animate-pulse" />
                <span>顾问正在推演专业分析建议 ({aiConfig.model})...</span>
              </div>
            )}
          </div>

          {/* Quick Prompt Pills */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 flex space-x-1.5 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="shrink-0 text-[10px] bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 px-2 py-1 rounded-md transition"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                placeholder={
                  aiConfig.apiKey.trim()
                    ? `向 ${aiConfig.model} 提问 (例如: 如何规避黑天鹅)...`
                    : '请先点击右上角齿轮输入 API-Key 后方可提问...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isSending}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isSending}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-2 rounded-xl transition shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Model Settings Modal */}
      <AiModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={(newConfig) => {
          setAiConfig(newConfig);
          setApiKeyWarning(null);
        }}
      />
    </div>
  );
};
