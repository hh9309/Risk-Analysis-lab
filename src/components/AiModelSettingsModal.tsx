import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Key, 
  Cpu, 
  Check, 
  X, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  AlertCircle,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { AiConfig, SupportedModel, getStoredAiConfig, saveStoredAiConfig } from '../services/aiService';

interface AiModelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (config: AiConfig) => void;
}

export const AiModelSettingsModal: React.FC<AiModelSettingsModalProps> = ({
  isOpen,
  onClose,
  onSaved,
}) => {
  const [config, setConfig] = useState<AiConfig>(getStoredAiConfig());
  const [showKey, setShowKey] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setConfig(getStoredAiConfig());
      setToastMessage(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.apiKey.trim()) {
      setToastMessage('⚠️ 请先输入 API-Key，所有大模型调用必须输入 API-Key 后方可调用！');
      return;
    }

    saveStoredAiConfig(config);
    setToastMessage('✅ 大模型设置已成功保存！');
    if (onSaved) onSaved(config);
    setTimeout(() => {
      onClose();
    }, 700);
  };

  const handleClearKey = () => {
    const updated = { ...config, apiKey: '' };
    setConfig(updated);
    saveStoredAiConfig(updated);
    setToastMessage('API-Key 已清除');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-900 relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">大模型连接与 API-Key 设置</h3>
              <p className="text-[11px] text-slate-500">
                支持 GitHub Pages 浏览器端直连与服务端代理模式
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="space-y-4 pt-4 text-xs">
          {/* Rule Notification */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start space-x-2 text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-relaxed">
              <strong>调用权限守则：</strong>项目部署到 GitHub 等平台后，由前端浏览器直接调取模型接口。
              <span className="text-rose-700 font-semibold">所有大模型调用必须手工输入有效 API-Key 后方能调用</span>。Key 仅保存在您本地浏览器的 localStorage 中，安全保密。
            </div>
          </div>

          {/* Model Selection (gemini 3 flash vs deepseek-v4-pro) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-800">
              选择推理大模型 (Select Model)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Option 1: gemini 3 flash */}
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  config.model === 'gemini 3 flash'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">gemini 3 flash</span>
                  <input
                    type="radio"
                    name="modelSelect"
                    value="gemini 3 flash"
                    checked={config.model === 'gemini 3 flash'}
                    onChange={() => setConfig({ ...config, model: 'gemini 3 flash' })}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Google Gemini 系列旗舰高响应速度模型，擅长工程故障模式推理与概率计算。
                </p>
                <span className="text-[9px] text-indigo-700 font-medium mt-2 block">
                  适用: Google AI API Key
                </span>
              </label>

              {/* Option 2: deepseek-v4-pro */}
              <label
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  config.model === 'deepseek-v4-pro'
                    ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-2xs'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-slate-900">deepseek-v4-pro</span>
                  <input
                    type="radio"
                    name="modelSelect"
                    value="deepseek-v4-pro"
                    checked={config.model === 'deepseek-v4-pro'}
                    onChange={() => setConfig({ ...config, model: 'deepseek-v4-pro' })}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  DeepSeek 深度思考大模型，擅长长链路故障树 (FTA) 与严密逻辑归因推演。
                </p>
                <span className="text-[9px] text-indigo-700 font-medium mt-2 block">
                  适用: DeepSeek API Key
                </span>
              </label>
            </div>
          </div>

          {/* API Key Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-800 flex items-center space-x-1">
                <Key className="w-3.5 h-3.5 text-indigo-600" />
                <span>手工输入 API-Key</span>
              </label>
              {config.apiKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[10px] text-slate-400 hover:text-rose-600"
                >
                  清空已存 Key
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                required
                value={config.apiKey}
                onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                placeholder={
                  config.model === 'deepseek-v4-pro'
                    ? '请输入您的 DeepSeek API Key (例如 sk-...)'
                    : '请输入您的 Google Gemini API Key (例如 AIzaSy...)'
                }
                className="w-full pl-3 pr-10 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-indigo-600 font-mono text-xs text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                title={showKey ? '隐藏 API Key' : '显示 API Key'}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
              <span>状态: {config.apiKey.trim() ? <strong className="text-emerald-600">已填写 ({config.apiKey.slice(0, 4)}••••)</strong> : <strong className="text-rose-500">未配置 (不可调用)</strong>}</span>
              <span className="italic">保存在当前浏览器本地 (localStorage)</span>
            </div>
          </div>

          {/* Toast feedback */}
          {toastMessage && (
            <div className={`p-2.5 rounded-lg text-xs font-medium text-center ${
              toastMessage.includes('⚠️') ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
            }`}>
              {toastMessage}
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition shadow-xs flex items-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>确认大模型与保存设置</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
