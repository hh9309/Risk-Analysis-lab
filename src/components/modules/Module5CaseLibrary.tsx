import React from 'react';
import { 
  Building2, 
  Cpu, 
  ShieldAlert, 
  Rocket, 
  SunMedium, 
  Car, 
  CheckCircle2, 
  ArrowRight, 
  FolderDown, 
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { CaseStudy } from '../../types/risk';

interface Module5Props {
  cases: CaseStudy[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
  onNavigateToModule: (moduleId: number) => void;
}

const CASE_ICONS: Record<number, React.ReactNode> = {
  1: <Building2 className="w-5 h-5 text-amber-600" />,
  2: <Cpu className="w-5 h-5 text-indigo-600" />,
  3: <ShieldAlert className="w-5 h-5 text-rose-600" />,
  4: <Rocket className="w-5 h-5 text-purple-600" />,
  5: <SunMedium className="w-5 h-5 text-teal-600" />,
  6: <Car className="w-5 h-5 text-blue-600" />,
};

export const Module5CaseLibrary: React.FC<Module5Props> = ({
  cases,
  activeCaseId,
  onSelectCase,
  onNavigateToModule,
}) => {
  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>模块 5 · 工业级实战案例库</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              六大系统风险实战案例库
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              涵盖海外EPC、半导体供应链、工控网安、载人航天、新能源PPP与智能汽车六大极具代表性的高风险工业场景，一键载入即可联动全站分析工具。
            </p>
          </div>
        </div>
      </div>

      {/* Case Studies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((c) => {
          const isActive = c.id === activeCaseId;
          return (
            <div
              key={c.id}
              className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between relative shadow-2xs ${
                isActive
                  ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-md bg-gradient-to-b from-indigo-50/20 to-white'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div>
                {/* Top Badge & Number */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-slate-200">
                      {CASE_ICONS[c.number]}
                    </div>
                    <span className="text-xs font-bold text-slate-400">案例 0{c.number}</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    {c.badge}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-base font-bold text-slate-900 mb-1 leading-snug">
                  {c.title}
                </h3>
                <p className="text-xs text-indigo-600 font-medium mb-3">
                  {c.subtitle}
                </p>

                {/* Background & Mechanism */}
                <p className="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">
                  {c.background}
                </p>

                {/* Key Pillars */}
                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs mb-4">
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-800">FMEA 故障模式核心:</span>
                    <p className="text-slate-500 line-clamp-1 mt-0.5">{c.fmeaFocus}</p>
                  </div>
                  <div className="w-full h-px bg-slate-200" />
                  <div className="text-[11px]">
                    <span className="font-semibold text-slate-800">蒙特卡洛仿真核心:</span>
                    <p className="text-slate-500 line-clamp-1 mt-0.5">{c.monteCarloFocus}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                {isActive ? (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-700">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    <span>当前工作台已激活</span>
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectCase(c.id)}
                    className="inline-flex items-center space-x-1.5 text-xs font-medium text-slate-700 hover:text-indigo-600 transition"
                  >
                    <FolderDown className="w-3.5 h-3.5" />
                    <span>载入至分析工作台</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onSelectCase(c.id);
                    onNavigateToModule(3); // Navigate to FMEA
                  }}
                  className="inline-flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  <span>查看 FMEA</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
