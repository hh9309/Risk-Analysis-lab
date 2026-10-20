import React from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  FileDown, 
  FolderOpen, 
  RotateCcw,
  BookOpen,
  Activity
} from 'lucide-react';
import { CaseStudy } from '../types/risk';

interface HeaderProps {
  activeModule: number;
  setActiveModule: (m: number) => void;
  cases: CaseStudy[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onResetCase: () => void;
  totalRisks: number;
  highRpnCount: number;
  p80Value: number;
  onOpenAiChat: () => void;
  onOpenExport: () => void;
}

export const MODULE_NAMES = [
  { id: 1, name: '1. 风险代数', short: '代数建模', icon: '∑' },
  { id: 2, name: '2. 风险登记', short: '登记册', icon: '📋' },
  { id: 3, name: '3. FMEA分析', short: 'FMEA', icon: '⚙️' },
  { id: 4, name: '4. 概率影响矩阵', short: '风险矩阵', icon: '▦' },
  { id: 5, name: '5. 六大案例', short: '实战案例', icon: '🏛️' },
  { id: 6, name: '6. 代码引擎', short: '蒙特卡洛', icon: '🐍' },
  { id: 7, name: '7. AI对话窗口', short: 'AI随诊', icon: '✨' },
  { id: 8, name: '8. 全流程导引', short: '全流程', icon: '🧭' },
  { id: 9, name: '9. 报告导出', short: '白皮书', icon: '📄' },
  { id: 10, name: '10. 风险要素', short: '知识切片', icon: '🔬' },
];

export const Header: React.FC<HeaderProps> = ({
  activeModule,
  setActiveModule,
  cases,
  activeCaseId,
  onSelectCase,
  onResetCase,
  totalRisks,
  highRpnCount,
  p80Value,
  onOpenAiChat,
  onOpenExport,
}) => {
  const currentCase = cases.find(c => c.id === activeCaseId) || cases[0];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 transition-all">
      {/* Top Banner with branding and live status metrics */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-indigo-900 to-indigo-700 flex items-center justify-center text-white shadow-sm border border-slate-700/30">
            <ShieldAlert className="w-5 h-5 text-indigo-200" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                系统风险分析实验室
              </h1>
              <span className="hidden sm:inline-flex text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                FMEA · 矩阵 · 蒙特卡洛
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              故障模式影响分析与不确定性量化评估科研工作台
            </p>
          </div>
        </div>

        {/* Case Selector and Quick Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Active Case Selector */}
          <div className="flex items-center bg-slate-50 rounded-lg p-1 border border-slate-200 text-xs">
            <FolderOpen className="w-3.5 h-3.5 text-slate-500 ml-1 mr-1.5" />
            <select
              aria-label="选择实战案例"
              value={activeCaseId}
              onChange={(e) => onSelectCase(e.target.value)}
              className="bg-transparent text-slate-800 font-medium focus:outline-none cursor-pointer pr-2 max-w-[150px] sm:max-w-[190px] truncate"
            >
              {cases.map((c) => (
                <option key={c.id} value={c.id}>
                  案例{c.number}: {c.title}
                </option>
              ))}
            </select>
            <button
              onClick={onResetCase}
              title="重置当前案例数据"
              className="p-1 text-slate-400 hover:text-slate-600 rounded transition"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="hidden lg:flex items-center space-x-3 bg-slate-50/80 px-3 py-1 rounded-lg border border-slate-200 text-xs">
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">风险项:</span>
              <span className="font-semibold text-slate-800">{totalRisks}</span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">高RPN项:</span>
              <span className={`font-semibold ${highRpnCount > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {highRpnCount}
              </span>
            </div>
            <div className="w-px h-3 bg-slate-300" />
            <div className="flex items-center space-x-1">
              <span className="text-slate-400">P80安全线:</span>
              <span className="font-semibold text-indigo-700">{Math.round(p80Value)}万</span>
            </div>
          </div>

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAiChat}
            className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 text-indigo-900 border border-indigo-200 text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-2xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI随诊</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={onOpenExport}
            className="inline-flex items-center space-x-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg shadow-2xs transition"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">导出白皮书</span>
            <span className="sm:hidden">报告</span>
          </button>
        </div>
      </div>

      {/* 10-Module Navigation Bar */}
      <div className="border-t border-slate-100 bg-slate-50/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 py-1.5 min-w-max">
            {MODULE_NAMES.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setActiveModule(mod.id)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-indigo-950 font-semibold shadow-xs border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                  }`}
                >
                  <span className="text-xs opacity-75">{mod.icon}</span>
                  <span className="hidden md:inline">{mod.name}</span>
                  <span className="md:hidden">{mod.short}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
