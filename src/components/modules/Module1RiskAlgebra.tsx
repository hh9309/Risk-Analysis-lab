import React, { useState } from 'react';
import { Calculator, ArrowRight, ShieldCheck, AlertTriangle, Layers, TrendingUp } from 'lucide-react';

export const Module1RiskAlgebra: React.FC = () => {
  // Interactive inputs for Single Risk Algebra
  const [prob, setProb] = useState<number>(0.25);
  const [impact, setImpact] = useState<number>(2000); // 万元
  const [riskAversionAlpha, setRiskAversionAlpha] = useState<number>(0.0008); // Utility curvature
  
  // Interactive inputs for Cascade / Multistage Risk
  const [numStages, setNumStages] = useState<number>(3);
  const [stageProb, setStageProb] = useState<number>(0.3);
  const [couplingFactor, setCouplingFactor] = useState<number>(0.2); // positive contagion

  // Calculated values
  const expectedLoss = prob * impact;
  const variance = prob * Math.pow(impact, 2) - Math.pow(expectedLoss, 2);
  const stdDev = Math.sqrt(Math.max(0, variance));

  // Certainty Equivalent (CE) under CARA utility: U(w) = -exp(-alpha * w)
  // For small alpha: CE ≈ E(L) + 0.5 * alpha * Var(L)
  const riskPremium = 0.5 * riskAversionAlpha * variance;
  const certaintyEquivalent = expectedLoss + riskPremium;

  // Cascade parallel failure: P_sys = 1 - (1 - p)^n (with coupling)
  const adjustedProb = Math.min(0.99, stageProb + couplingFactor * 0.5);
  const parallelFailureProb = 1 - Math.pow(1 - adjustedProb, numStages);
  // Serial defense (all barriers must fail): P_pass = p^n
  const serialPenetrationProb = Math.pow(adjustedProb, numStages);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>模块 1 · 形式化理论基石</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              风险系统代数与概率量化建模
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              形式化构建风险发生概率 $P$、影响后果 $I$ 与风险期望值 $E(R) = P \times I$ 的代数定量评估原理。
              结合风险效用函数、方差张量及多节点级联传导代数，揭示复杂系统的本质不确定性。
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Parametric Workbench */}
        <div className="lg:col-span-5 space-y-6">
          {/* Section 1: Single Node Risk Algebra */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>单项风险代数三元组</span>
              </h3>
              <span className="text-xs text-slate-400 font-mono">E(R) = P × I</span>
            </div>

            {/* Slider P */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">发生概率 $P$</span>
                <span className="font-mono text-indigo-600 font-bold">{(prob * 100).toFixed(1)}%</span>
              </div>
              <input
                type="range"
                min="0.01"
                max="0.99"
                step="0.01"
                value={prob}
                onChange={(e) => setProb(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0.01 (罕见)</span>
                <span>0.50 (中频)</span>
                <span>0.99 (近乎必然)</span>
              </div>
            </div>

            {/* Slider Impact */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">危害后果 $I$ (损失规模)</span>
                <span className="font-mono text-slate-900 font-bold">{impact.toLocaleString()} 万元</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={impact}
                onChange={(e) => setImpact(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>100万</span>
                <span>5,000万</span>
                <span>10,000万 (1亿元)</span>
              </div>
            </div>

            {/* Risk Aversion */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-slate-600 font-medium">决策者风险厌恶系数 $\alpha$</span>
                <span className="font-mono text-slate-700 font-medium">{(riskAversionAlpha * 1000).toFixed(2)}‰</span>
              </div>
              <input
                type="range"
                min="0.0001"
                max="0.002"
                step="0.0001"
                value={riskAversionAlpha}
                onChange={(e) => setRiskAversionAlpha(parseFloat(e.target.value))}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>风险中性</span>
                <span>中度厌恶</span>
                <span>高度厌恶</span>
              </div>
            </div>

            {/* Algebraic Output Metrics Cards */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">期望损失 $E(R)$</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {Math.round(expectedLoss).toLocaleString()} <span className="text-xs font-normal text-slate-500">万元</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">数学期望均值</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[11px] text-slate-500 block">不确定性标准差 $\sigma$</span>
                <span className="text-lg font-bold text-slate-900 font-mono">
                  {Math.round(stdDev).toLocaleString()} <span className="text-xs font-normal text-slate-500">万元</span>
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">波动烈度</span>
              </div>

              <div className="bg-indigo-50/60 p-3 rounded-lg border border-indigo-100 col-span-2">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-[11px] text-indigo-700 block font-medium">确定性等价值 (CE)</span>
                    <span className="text-xs text-indigo-900 font-semibold font-mono">
                      {Math.round(certaintyEquivalent).toLocaleString()} 万元
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-600 block">风险溢价 (Premium)</span>
                    <span className="text-xs font-mono font-medium text-indigo-800">
                      +{Math.round(riskPremium).toLocaleString()} 万元
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Cascade & Chain Risk */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span>多节点系统级联传导代数</span>
              </h3>
              <span className="text-xs text-slate-400">并联失效 vs 串联防御</span>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">级联节点数量 $n$</span>
                  <span className="font-mono font-bold text-slate-900">{numStages} 级</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="6"
                  step="1"
                  value={numStages}
                  onChange={(e) => setNumStages(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">单节点脆弱概率 $p_i$</span>
                  <span className="font-mono font-bold text-slate-900">{(stageProb * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.8"
                  step="0.05"
                  value={stageProb}
                  onChange={(e) => setStageProb(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-600">联动传染正反馈系数 $\rho$</span>
                  <span className="font-mono font-bold text-slate-900">{couplingFactor.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.8"
                  step="0.05"
                  value={couplingFactor}
                  onChange={(e) => setCouplingFactor(parseFloat(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Cascade Comparison */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-100">
                <span className="text-rose-700 font-medium block">并联系统崩塌概率</span>
                <span className="text-base font-bold text-rose-900 font-mono">
                  {(parallelFailureProb * 100).toFixed(1)}%
                </span>
                <span className="text-[10px] text-rose-600 block mt-0.5">
                  任一节点失效即整体瘫痪
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-700 font-medium block">纵深防御穿透概率</span>
                <span className="text-base font-bold text-emerald-900 font-mono">
                  {(serialPenetrationProb * 100).toFixed(2)}%
                </span>
                <span className="text-[10px] text-emerald-600 block mt-0.5">
                  必须穿透全部 n 道防线
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Mathematical Visualizations & Deep Principles */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual SVG Chart: Probability-Loss Hyperbola Contours */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span>等期望风险双曲线与脆弱域投影</span>
                </h3>
                <p className="text-xs text-slate-500">
                  当前工作点：$P = {(prob * 100).toFixed(1)}\%$, $I = {impact}$ 万元 $\implies E(R) = {Math.round(expectedLoss)}$ 万元
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                P × I = const
              </span>
            </div>

            {/* High-accuracy SVG Graph */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/70">
              <svg viewBox="0 0 500 240" className="w-full h-56 select-none">
                {/* Background grid */}
                {[50, 100, 150, 200].map((y) => (
                  <line key={`gy-${y}`} x1="45" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                ))}
                {[130, 220, 310, 400].map((x) => (
                  <line key={`gx-${x}`} x1={x} y1="20" x2={x} y2="210" stroke="#e2e8f0" strokeDasharray="3 3" />
                ))}

                {/* Axes */}
                <line x1="45" y1="210" x2="480" y2="210" stroke="#64748b" strokeWidth="1.5" />
                <line x1="45" y1="20" x2="45" y2="210" stroke="#64748b" strokeWidth="1.5" />

                {/* Axis Labels */}
                <text x="45" y="15" fill="#475569" fontSize="10" textAnchor="start">发生概率 P (%)</text>
                <text x="480" y="225" fill="#475569" fontSize="10" textAnchor="end">损失后果 I (万元)</text>

                {/* Y-axis Ticks */}
                <text x="38" y="213" fill="#94a3b8" fontSize="9" textAnchor="end">0</text>
                <text x="38" y="153" fill="#94a3b8" fontSize="9" textAnchor="end">30%</text>
                <text x="38" y="93" fill="#94a3b8" fontSize="9" textAnchor="end">60%</text>
                <text x="38" y="33" fill="#94a3b8" fontSize="9" textAnchor="end">100%</text>

                {/* X-axis Ticks */}
                <text x="45" y="225" fill="#94a3b8" fontSize="9" textAnchor="middle">0</text>
                <text x="220" y="225" fill="#94a3b8" fontSize="9" textAnchor="middle">4,000</text>
                <text x="400" y="225" fill="#94a3b8" fontSize="9" textAnchor="middle">8,000</text>

                {/* Iso-Risk Hyperbolic Curves: E=500, E=1500, E=3000 */}
                {/* E=500 (Low green) */}
                <path
                  d="M 60 40 Q 120 180 460 200"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.7"
                />
                <text x="430" y="195" fill="#10b981" fontSize="9">E=500万</text>

                {/* E=2000 (Medium amber) */}
                <path
                  d="M 120 30 Q 220 120 460 160"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                <text x="430" y="152" fill="#f59e0b" fontSize="9">E=2,000万</text>

                {/* E=5000 (High red) */}
                <path
                  d="M 220 30 Q 340 80 470 120"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  opacity="0.8"
                />
                <text x="420" y="112" fill="#ef4444" fontSize="9">E=5,000万</text>

                {/* Active Operating Point */}
                {(() => {
                  const xPos = 45 + (impact / 10000) * (480 - 45);
                  const yPos = 210 - prob * (210 - 20);
                  return (
                    <g>
                      {/* Projection lines */}
                      <line x1="45" y1={yPos} x2={xPos} y2={yPos} stroke="#6366f1" strokeDasharray="3 3" opacity="0.6" />
                      <line x1={xPos} y1={yPos} x2={xPos} y2={210} stroke="#6366f1" strokeDasharray="3 3" opacity="0.6" />

                      {/* Pulse Circle */}
                      <circle cx={xPos} cy={yPos} r="9" fill="#6366f1" fillOpacity="0.2" className="animate-ping" />
                      <circle cx={xPos} cy={yPos} r="5" fill="#4338ca" stroke="#ffffff" strokeWidth="2" />
                      
                      {/* Tooltip callout */}
                      <rect
                        x={Math.min(370, Math.max(50, xPos - 55))}
                        y={Math.max(25, yPos - 32)}
                        width="110"
                        height="24"
                        rx="4"
                        fill="#1e1b4b"
                      />
                      <text
                        x={Math.min(370, Math.max(50, xPos - 55)) + 55}
                        y={Math.max(25, yPos - 32) + 16}
                        fill="#ffffff"
                        fontSize="10"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        E(R): {Math.round(expectedLoss)} 万元
                      </text>
                    </g>
                  );
                })()}
              </svg>
            </div>
          </div>

          {/* Theoretical Foundations & Knowledge Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>风险代数的非线性本质</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                在纯数学期望中，低概率大损失（$P=0.01, I=1000$万）与高概率小损失（$P=1.0, I=10$万）的数学乘积完全相同（均为10万元）。
                但在工程与企业存续中，前者具有<strong>破产级吸收障碍（Absorbing Barrier）</strong>，因此必须引入高阶矩（方差、偏度）与效用凸凹度予以惩罚。
              </p>
            </div>

            <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs space-y-2">
              <div className="flex items-center space-x-2 text-slate-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>级联传染与正反馈共因失效</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                复杂工程系统（如芯片供应链或电网SCADA）的失效绝非单纯独立泊松过程。当关键节点$A$失效后，其他节点的负载将瞬时激增，
                使原本独立的失效概率产生耦合突跃（$\rho &gt; 0$），形成多米诺骨牌级雪崩。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
