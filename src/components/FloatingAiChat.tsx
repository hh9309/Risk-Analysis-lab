import React, { useState, useEffect } from 'react';
import { Sparkles, X, Send, Bot, User, Settings, AlertCircle, Key } from 'lucide-react';
import { RiskItem, FmeaItem } from '../types/risk';
import { AiConfig, getStoredAiConfig, executeAiChat } from '../services/aiService';
import { AiModelSettingsModal } from './AiModelSettingsModal';

interface FloatingAiChatProps {
  isOpen: boolean;
  onClose: () => void;
  caseTitle: string;
  risks: RiskItem[];
  fmeaItems: FmeaItem[];
}

export const FloatingAiChat: React.FC<FloatingAiChatProps> = ({
  isOpen,
  onClose,
  caseTitle,
  risks,
  fmeaItems,
}) => {
  const [aiConfig, setAiConfig] = useState<AiConfig>(getStoredAiConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; model?: string }>>([
    {
      sender: 'ai',
      text: `您好！我是当前工程【${caseTitle}】的随诊 AI 专家。\n\n请点击右上角 ⚙️ 齿轮图标输入您的 API-Key 并选择模型（gemini 3 flash 或 deepseek-v4-pro）即可开启随诊对话。`,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAiConfig(getStoredAiConfig());
      setWarning(null);
    }
  }, [isOpen, isSettingsOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const currentConfig = getStoredAiConfig();
    setAiConfig(currentConfig);

    // Hard requirement: Must have API-Key before calling
    if (!currentConfig.apiKey || !currentConfig.apiKey.trim()) {
      setWarning('⚠️ 所有大模型调用必须输入 API-Key 后方能调用！请点击齿轮输入。');
      setIsSettingsOpen(true);
      return;
    }

    setWarning(null);
    setMessages(prev => [...prev, { sender: 'user', text }]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await executeAiChat(currentConfig, text, {
        caseTitle,
        riskCount: risks.length,
        fmeaCount: fmeaItems.length,
      });
      setMessages(prev => [...prev, { sender: 'ai', text: res.text, model: res.model }]);
    } catch (e: any) {
      setMessages(prev => [
        ...prev, 
        { 
          sender: 'ai', 
          text: `调用失败: ${e.message}\n请点击右上角小齿轮检查 API-Key 或切换模型。` 
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[530px] transition-all">
        {/* Header */}
        <div className="bg-slate-900 text-white p-3.5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <h4 className="text-xs font-bold">系统风险 AI 专家随诊</h4>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-900/80 text-indigo-200 font-mono border border-indigo-700">
                  {aiConfig.model}
                </span>
              </div>
              <span className="text-[10px] text-slate-400 block font-mono truncate max-w-[170px]">
                {caseTitle}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsSettingsOpen(true)}
              title="设置大模型与API-Key"
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Warning Notification if API-Key missing */}
        {warning && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-3 py-1.5 text-[11px] flex items-center justify-between">
            <span className="truncate">{warning}</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="underline font-bold text-amber-950 shrink-0 ml-1"
            >
              配置Key
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-3 text-xs bg-slate-50/50">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${
                m.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-xs ${
                  m.sender === 'user' ? 'bg-slate-900 text-white' : 'bg-indigo-100 text-indigo-700'
                }`}
              >
                {m.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div
                className={`p-3 rounded-2xl max-w-[80%] whitespace-pre-wrap leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-2xs rounded-tl-xs'
                }`}
              >
                {m.text}
                {m.model && (
                  <div className="text-[9px] text-slate-400 text-right mt-1 font-mono">
                    via {m.model}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs italic">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
              <span>正在推演分析 ({aiConfig.model})...</span>
            </div>
          )}
        </div>

        {/* Quick Questions */}
        <div className="p-2 border-t border-slate-100 bg-white flex space-x-1 overflow-x-auto scrollbar-none text-[10px]">
          <button
            onClick={() => handleSend('诊断RPN评分主观偏差')}
            className="shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-1 rounded text-slate-600 border border-slate-200 transition"
          >
            RPN主观偏差
          </button>
          <button
            onClick={() => handleSend('分析联动多米诺传染效应')}
            className="shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-1 rounded text-slate-600 border border-slate-200 transition"
          >
            多米诺传染
          </button>
          <button
            onClick={() => handleSend('评估缓解对策成本效益')}
            className="shrink-0 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 px-2 py-1 rounded text-slate-600 border border-slate-200 transition"
          >
            成本效益
          </button>
        </div>

        {/* Input */}
        <div className="p-2.5 bg-white border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2"
          >
            <input
              type="text"
              placeholder={
                aiConfig.apiKey.trim()
                  ? `向 ${aiConfig.model} 提问...`
                  : '请先点击右上角 ⚙️ 输入 API-Key...'
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition disabled:opacity-40 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      <AiModelSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSaved={(newConfig) => {
          setAiConfig(newConfig);
          setWarning(null);
        }}
      />
    </>
  );
};
