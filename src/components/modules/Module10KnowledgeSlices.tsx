import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Network, 
  Sliders, 
  HelpCircle,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { KNOWLEDGE_SLICES } from '../../data/knowledgeSlices';
import { KnowledgeSlice } from '../../types/risk';

export const Module10KnowledgeSlices: React.FC = () => {
  const [activeSliceIndex, setActiveSliceIndex] = useState(0);
  const activeSlice: KnowledgeSlice = KNOWLEDGE_SLICES[activeSliceIndex];

  // FTA Logic Gate Interactive Playground
  const [gateType, setGateType] = useState<'or' | 'and'>('or');
  const [probA, setProbA] = useState<number>(0.2);
  const [probB, setProbB] = useState<number>(0.15);

  // Calculated FTA top probability
  const topProb = gateType === 'or' 
    ? 1 - (1 - probA) * (1 - probB) 
    : probA * probB;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <BookOpen className="w-3.5 h-3.5" />
              <span>模块 10 · 深度理论与多维认知切片</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              系统风险基本要素与多维切片知识导引
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              涵盖概率影响解构、蒙特卡洛 P80/P90 决策红线、三大致命管理陷阱与动态监测闭环四大核心认知切片，附带故障树 (FTA) 逻辑门互动沙盘。
            </p>
          </div>
        </div>
      </div>

      {/* 4 Core Slices Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KNOWLEDGE_SLICES.map((slice, idx) => {
          const isActive = idx === activeSliceIndex;
          return (
            <button
              key={slice.id}
              onClick={() => setActiveSliceIndex(idx)}
              className={`p-4 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isActive
                  ? 'bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white/70 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div>
                <span className="text-[11px] font-bold text-indigo-600 uppercase font-mono block mb-1">
                  {slice.number}
                </span>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{slice.title}</h3>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {slice.subtitle}
                </p>
              </div>
              {isActive && (
                <div className="w-full h-1 bg-indigo-600 rounded-full mt-3" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active Slice Detailed Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Deep Narrative & Theoretical Breakdown */}
        <div className="lg:col-span-7 bg-white rounded-xl p-6 border border-slate-200 shadow-2xs space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-bold text-indigo-700 mb-1">
              <span>{activeSlice.number} 深度解析</span>
            </div>
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
              {activeSlice.title}
            </h3>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">
              {activeSlice.subtitle}
            </p>
          </div>

          {/* Abstract callout */}
          <div className="bg-slate-50 p-4 rounded-xl border-l-4 border-indigo-600 text-xs text-slate-700 leading-relaxed italic">
            “{activeSlice.summary}”
          </div>

          {/* Core Deep-Dive Markdown-style text */}
          <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap space-y-4">
            {activeSlice.deepDive}
          </div>

          {/* Mathematical Formulas Card */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
              <span>核心定量公式与代数形式化</span>
            </h4>
            <div className="space-y-2">
              {activeSlice.keyFormulas.map((f, i) => (
                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200/80">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-semibold text-slate-800 text-[11px]">{f.name}</span>
                    <span className="font-mono text-indigo-700 font-bold text-xs">{f.latex}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">{f.explanation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Diagram, Traps & Action Checklist */}
        <div className="lg:col-span-5 space-y-6">
          {/* Interactive Fault Tree (FTA) Visual Logic Gate Simulator */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                <Network className="w-4 h-4 text-indigo-600" />
                <span>故障树 (FTA) 逻辑门微仿真沙盘</span>
              </h4>
              <span className="text-[10px] text-slate-400 font-mono">IEC 61025 FTA</span>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              切换逻辑门（与门 AND vs 或门 OR），观察底层基础事件发生概率向顶事件（Top Event）的传播突跃：
            </p>

            {/* Gate selector */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setGateType('or')}
                className={`py-1.5 px-3 rounded-lg font-semibold border transition ${
                  gateType === 'or'
                    ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                或门 (OR Gate 并联失效)
              </button>
              <button
                onClick={() => setGateType('and')}
                className={`py-1.5 px-3 rounded-lg font-semibold border transition ${
                  gateType === 'and'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                与门 (AND Gate 纵深冗余)
              </button>
            </div>

            {/* Inputs for Prob A and Prob B */}
            <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>基础事件 A 失效率 P(A):</span>
                  <span className="font-mono font-bold text-slate-800">{(probA * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={probA}
                  onChange={(e) => setProbA(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-600 mb-1">
                  <span>基础事件 B 失效率 P(B):</span>
                  <span className="font-mono font-bold text-slate-800">{(probB * 100).toFixed(1)}%</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.8"
                  step="0.01"
                  value={probB}
                  onChange={(e) => setProbB(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Top Event Result Output */}
            <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
              gateType === 'or' ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'
            }`}>
              <div>
                <span className="text-[11px] block font-medium text-slate-600">
                  {gateType === 'or' ? '顶事件系统失效概率 P_sys' : '冗余穿透系统失效概率 P_sys'}
                </span>
                <span className={`text-lg font-bold font-mono ${
                  gateType === 'or' ? 'text-rose-900' : 'text-emerald-900'
                }`}>
                  {(topProb * 100).toFixed(2)}%
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-mono">
                {gateType === 'or' ? '1 - (1-pA)(1-pB)' : 'pA × pB'}
              </div>
            </div>
          </div>

          {/* Pitfalls Card */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-rose-800 flex items-center space-x-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>本切片关键避坑警示 (Deadly Pitfalls)</span>
            </h4>
            <div className="space-y-2">
              {activeSlice.pitfalls.map((pitfall, i) => (
                <div key={i} className="bg-rose-50/50 p-2.5 rounded-lg border border-rose-100 text-[11px] text-rose-900 leading-relaxed flex items-start space-x-2">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>{pitfall}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Checklist */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-emerald-800 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>工程落地实操核对清单 (Checklist)</span>
            </h4>
            <div className="space-y-2">
              {activeSlice.actionChecklist.map((item, i) => (
                <div key={i} className="bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100 text-[11px] text-emerald-900 leading-relaxed flex items-start space-x-2">
                  <span className="text-emerald-600 font-bold shrink-0">✔</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
