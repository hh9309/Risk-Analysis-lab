import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Download, 
  Code2, 
  BarChart3, 
  ShieldCheck, 
  AlertTriangle,
  FileCode,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { SimulationParams, SimulationResult, DistributionType } from '../../types/risk';
import { runMonteCarloSimulation, generatePythonScript } from '../../utils/mathUtils';

interface Module6Props {
  initialParams: SimulationParams;
  caseTitle: string;
}

export const Module6MonteCarloEngine: React.FC<Module6Props> = ({
  initialParams,
  caseTitle,
}) => {
  const [params, setParams] = useState<SimulationParams>(initialParams);
  const [result, setResult] = useState<SimulationResult>(() => runMonteCarloSimulation(initialParams));
  const [activeTab, setActiveTab] = useState<'visual' | 'code'>('visual');
  const [copied, setCopied] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  // Sync params when case changes
  useEffect(() => {
    setParams(initialParams);
    setResult(runMonteCarloSimulation(initialParams));
  }, [initialParams]);

  const handleRunSimulation = () => {
    setIsRunning(true);
    // Slight timeout to give immediate UI tactile feedback
    setTimeout(() => {
      const res = runMonteCarloSimulation(params);
      setResult(res);
      setIsRunning(false);
    }, 150);
  };

  const [copiedPip, setCopiedPip] = useState(false);

  const copyToClipboard = async (text: string): Promise<boolean> => {
    try {
      if (navigator?.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (_) {}
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      textArea.setAttribute('readonly', '');
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return false;
    }
  };

  const handleCopyCode = async () => {
    const code = generatePythonScript(params, `${caseTitle} - 蒙特卡洛仿真`);
    const success = await copyToClipboard(code);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyPip = async () => {
    const pipCmd = 'pip install numpy scipy matplotlib';
    const success = await copyToClipboard(pipCmd);
    if (success) {
      setCopiedPip(true);
      setTimeout(() => setCopiedPip(false), 2000);
    }
  };

  const handleDownloadCode = () => {
    const code = generatePythonScript(params, `${caseTitle} - 蒙特卡洛仿真`);
    const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monte_carlo_risk_simulation.py`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Cpu className="w-3.5 h-3.5" />
              <span>模块 6 · 随机仿真计算内核</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Python / NumPy 蒙特卡洛仿真代码引擎
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-3xl leading-relaxed">
              基于 NumPy / SciPy 理论内核进行数万次随机抽样与概率分布拟合，精准输出 P80 / P90 置信区间与 VaR / CVaR 风险测度。
            </p>
          </div>

          {/* Top Actions: Copy standalone Python script & Tab switcher */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={handleCopyCode}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold shadow-2xs transition active:scale-95"
              title="复制可脱离本项目在外部独立运行的 Python / NumPy 仿真完整脚本"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-indigo-600" />}
              <span>{copied ? '已复制独立脚本！' : '复制独立 Python 代码'}</span>
            </button>

            {/* Tab switcher: Visual charts vs Python Code */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveTab('visual')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'visual' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>S曲线与直方图</span>
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition ${
                  activeTab === 'code' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Python/NumPy源码</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Parameters Workbench (Left) vs Output Visualizations / Code (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Parameters Workbench */}
        <div className="lg:col-span-4 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <span>仿真抽样超参数</span>
            </h3>
            <span className="text-xs font-mono text-indigo-600 font-semibold">
              N = {params.iterations.toLocaleString()}
            </span>
          </div>

          {/* Sample Size Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">抽样迭代次数 (Iterations)</span>
              <span className="font-mono font-bold text-slate-900">{params.iterations.toLocaleString()} 次</span>
            </div>
            <input
              type="range"
              min="1000"
              max="50000"
              step="1000"
              value={params.iterations}
              onChange={(e) => setParams({ ...params, iterations: parseInt(e.target.value, 10) })}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1,000 (极速)</span>
              <span>10,000 (推荐)</span>
              <span>50,000 (高精度)</span>
            </div>
          </div>

          {/* Distribution Selector */}
          <div className="space-y-1">
            <label className="text-xs text-slate-600 font-medium block">先验概率分布类型</label>
            <select
              aria-label="先验概率分布类型"
              value={params.distributionType}
              onChange={(e) => setParams({ ...params, distributionType: e.target.value as DistributionType })}
              className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 font-medium bg-white"
            >
              <option value="pert">Beta-PERT 分布 (工程工期/成本经典推荐)</option>
              <option value="triangular">三角分布 (Triangular 三点估算法)</option>
              <option value="normal">正态分布 (Gaussian Normal)</option>
              <option value="lognormal">对数正态分布 (Lognormal 长尾右偏极值)</option>
              <option value="uniform">均匀分布 (Uniform 最大无知先验)</option>
            </select>
          </div>

          {/* Three-point estimates: Min, Mode, Max */}
          <div className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-800 block">
              三点估算输入 (Three-Point Estimates)
            </span>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>乐观最小损失 (Min a):</span>
                <span className="font-mono font-bold">{params.minLoss.toLocaleString()} 万元</span>
              </div>
              <input
                type="range"
                min="500"
                max="10000"
                step="200"
                value={params.minLoss}
                onChange={(e) => {
                  const newMin = parseInt(e.target.value, 10);
                  setParams({
                    ...params,
                    minLoss: newMin,
                    modeLoss: Math.max(newMin + 500, params.modeLoss),
                    maxLoss: Math.max(newMin + 1500, params.maxLoss),
                  });
                }}
                className="w-full accent-slate-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>最可能损失 (Mode c):</span>
                <span className="font-mono font-bold text-indigo-700">{params.modeLoss.toLocaleString()} 万元</span>
              </div>
              <input
                type="range"
                min={params.minLoss + 200}
                max="25000"
                step="200"
                value={params.modeLoss}
                onChange={(e) => {
                  const newMode = parseInt(e.target.value, 10);
                  setParams({
                    ...params,
                    modeLoss: newMode,
                    maxLoss: Math.max(newMode + 500, params.maxLoss),
                  });
                }}
                className="w-full accent-indigo-600"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-600 mb-1">
                <span>最悲观极端损失 (Max b):</span>
                <span className="font-mono font-bold text-rose-700">{params.maxLoss.toLocaleString()} 万元</span>
              </div>
              <input
                type="range"
                min={params.modeLoss + 500}
                max="50000"
                step="500"
                value={params.maxLoss}
                onChange={(e) => setParams({ ...params, maxLoss: parseInt(e.target.value, 10) })}
                className="w-full accent-rose-600"
              />
            </div>
          </div>

          {/* Budget baseline for reserve gap */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600">当前基准投资 / 预算 (Baseline)</span>
              <span className="font-mono font-bold text-slate-900">{params.budgetBaseline.toLocaleString()} 万元</span>
            </div>
            <input
              type="range"
              min="1000"
              max="30000"
              step="500"
              value={params.budgetBaseline}
              onChange={(e) => setParams({ ...params, budgetBaseline: parseInt(e.target.value, 10) })}
              className="w-full accent-slate-700"
            />
          </div>

          {/* Run Button */}
          <button
            onClick={handleRunSimulation}
            disabled={isRunning}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center space-x-2 transition shadow-xs"
          >
            <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? '正在重新抽样统计中...' : '运行蒙特卡洛仿真'}</span>
          </button>
        </div>

        {/* Output Tabs Content */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'visual' ? (
            <>
              {/* Statistical KPI Metrics Ribbon */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-slate-400 block">期望均值 E(X)</span>
                  <span className="text-base font-bold text-slate-900 font-mono">
                    {Math.round(result.mean).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">标准差: ±{Math.round(result.stdDev)}万</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-[11px] text-emerald-600 font-medium block">P50 中位数损失</span>
                  <span className="text-base font-bold text-emerald-800 font-mono">
                    {Math.round(result.p50).toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">万</span>
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">50% 破线概率</span>
                </div>

                <div className="bg-indigo-50/70 p-3.5 rounded-xl border border-indigo-200 shadow-2xs">
                  <span className="text-[11px] text-indigo-700 font-bold block">P80 科学安全线</span>
                  <span className="text-base font-bold text-indigo-950 font-mono">
                    {Math.round(result.p80).toLocaleString()} <span className="text-[10px] text-indigo-700 font-normal">万</span>
                  </span>
                  <span className="text-[10px] text-indigo-700 block mt-0.5">
                    备用金缺口: {Math.max(0, Math.round(result.p80 - params.budgetBaseline))}万
                  </span>
                </div>

                <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-2xs">
                  <span className="text-[11px] text-rose-700 font-bold block">P90 极端容灾红线</span>
                  <span className="text-base font-bold text-rose-950 font-mono">
                    {Math.round(result.p90).toLocaleString()} <span className="text-[10px] text-rose-700 font-normal">万</span>
                  </span>
                  <span className="text-[10px] text-rose-600 block mt-0.5">
                    CVaR: {Math.round(result.cvar95)}万
                  </span>
                </div>
              </div>

              {/* Chart 1: PDF Probability Density Histogram */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>损失概率密度分布 (PDF Histogram) 与分位数标记</span>
                  </h4>
                  <div className="flex items-center space-x-3 text-[10px]">
                    <span className="flex items-center space-x-1 text-emerald-700 font-medium">
                      <span className="w-2.5 h-0.5 bg-emerald-500"></span>
                      <span>P50: {Math.round(result.p50)}万</span>
                    </span>
                    <span className="flex items-center space-x-1 text-indigo-700 font-bold">
                      <span className="w-2.5 h-0.5 bg-indigo-600"></span>
                      <span>P80: {Math.round(result.p80)}万</span>
                    </span>
                    <span className="flex items-center space-x-1 text-rose-700 font-bold">
                      <span className="w-2.5 h-0.5 bg-rose-500"></span>
                      <span>P90: {Math.round(result.p90)}万</span>
                    </span>
                  </div>
                </div>

                {/* SVG Histogram */}
                <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
                  <svg viewBox="0 0 520 180" className="w-full h-44 select-none">
                    {/* Max frequency for scaling */}
                    {(() => {
                      const maxFreq = Math.max(...result.histogramBins.map(b => b.freq), 0.01);
                      const minX = result.histogramBins[0]?.x0 || 0;
                      const maxX = result.histogramBins[result.histogramBins.length - 1]?.x1 || 1;
                      const rangeX = maxX - minX || 1;

                      // Helper scale
                      const scaleX = (val: number) => 40 + ((val - minX) / rangeX) * (500 - 40);
                      const scaleY = (freq: number) => 150 - (freq / maxFreq) * (150 - 20);

                      return (
                        <g>
                          {/* Grid horizontal lines */}
                          {[150, 110, 70, 30].map(y => (
                            <line key={`hgy-${y}`} x1="40" y1={y} x2="500" y2={y} stroke="#e2e8f0" strokeDasharray="3 3" />
                          ))}

                          {/* Histogram Bars */}
                          {result.histogramBins.map((bin, idx) => {
                            const x = scaleX(bin.x0);
                            const width = Math.max(1, scaleX(bin.x1) - x - 1);
                            const y = scaleY(bin.freq);
                            const height = Math.max(0, 150 - y);
                            const isAboveP80 = bin.x0 >= result.p80;
                            const isAboveP90 = bin.x0 >= result.p90;

                            const fill = isAboveP90 ? '#fecdd3' : isAboveP80 ? '#e0e7ff' : '#cbd5e1';
                            const stroke = isAboveP90 ? '#f43f5e' : isAboveP80 ? '#6366f1' : '#94a3b8';

                            return (
                              <rect
                                key={`bar-${idx}`}
                                x={x}
                                y={y}
                                width={width}
                                height={height}
                                fill={fill}
                                stroke={stroke}
                                strokeWidth="0.8"
                                rx="1"
                              />
                            );
                          })}

                          {/* Axes */}
                          <line x1="40" y1="150" x2="500" y2="150" stroke="#64748b" strokeWidth="1.2" />

                          {/* P50 Marker Line */}
                          <line
                            x1={scaleX(result.p50)}
                            y1="15"
                            x2={scaleX(result.p50)}
                            y2="150"
                            stroke="#10b981"
                            strokeWidth="1.8"
                            strokeDasharray="4 2"
                          />
                          <text x={scaleX(result.p50)} y="12" fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">
                            P50
                          </text>

                          {/* P80 Marker Line */}
                          <line
                            x1={scaleX(result.p80)}
                            y1="15"
                            x2={scaleX(result.p80)}
                            y2="150"
                            stroke="#4338ca"
                            strokeWidth="2"
                          />
                          <text x={scaleX(result.p80)} y="12" fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="middle">
                            P80
                          </text>

                          {/* P90 Marker Line */}
                          <line
                            x1={scaleX(result.p90)}
                            y1="15"
                            x2={scaleX(result.p90)}
                            y2="150"
                            stroke="#ef4444"
                            strokeWidth="2"
                          />
                          <text x={scaleX(result.p90)} y="12" fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="middle">
                            P90
                          </text>

                          {/* X-axis labels */}
                          <text x="40" y="165" fill="#64748b" fontSize="9" textAnchor="middle">
                            {Math.round(minX).toLocaleString()}
                          </text>
                          <text x="270" y="165" fill="#64748b" fontSize="9" textAnchor="middle">
                            {Math.round((minX + maxX) / 2).toLocaleString()} 万元
                          </text>
                          <text x="500" y="165" fill="#64748b" fontSize="9" textAnchor="middle">
                            {Math.round(maxX).toLocaleString()}
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Chart 2: CDF S-Curve (Cumulative Distribution Function) */}
              <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
                      <span>累积概率分布 S-Curve (用于科学决策备用金)</span>
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      横轴为预算/损失规模，纵轴为“在此金额内项目成功不超支的置信概率”
                    </p>
                  </div>
                  <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-mono font-medium">
                    P(X ≤ x)
                  </span>
                </div>

                <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-200/70">
                  <svg viewBox="0 0 520 180" className="w-full h-44 select-none">
                    {(() => {
                      const minX = result.cdfPoints[0]?.x || 0;
                      const maxX = result.cdfPoints[result.cdfPoints.length - 1]?.x || 1;
                      const rangeX = maxX - minX || 1;

                      const scaleX = (val: number) => 40 + ((val - minX) / rangeX) * (500 - 40);
                      const scaleY = (prob: number) => 150 - prob * (150 - 25);

                      // Build SVG path
                      const pathData = result.cdfPoints
                        .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${scaleX(pt.x).toFixed(1)} ${scaleY(pt.y).toFixed(1)}`)
                        .join(' ');

                      return (
                        <g>
                          {/* Horizontal grid lines for 50%, 80%, 90% */}
                          <line x1="40" y1={scaleY(0.5)} x2="500" y2={scaleY(0.5)} stroke="#10b981" strokeDasharray="3 3" opacity="0.6" />
                          <line x1="40" y1={scaleY(0.8)} x2="500" y2={scaleY(0.8)} stroke="#4338ca" strokeDasharray="4 2" opacity="0.8" />
                          <line x1="40" y1={scaleY(0.9)} x2="500" y2={scaleY(0.9)} stroke="#ef4444" strokeDasharray="4 2" opacity="0.8" />

                          <text x="35" y={scaleY(0.5) + 3} fill="#10b981" fontSize="9" textAnchor="end">50%</text>
                          <text x="35" y={scaleY(0.8) + 3} fill="#4338ca" fontSize="9" fontWeight="bold" textAnchor="end">80%</text>
                          <text x="35" y={scaleY(0.9) + 3} fill="#ef4444" fontSize="9" fontWeight="bold" textAnchor="end">90%</text>

                          {/* S-Curve Path */}
                          <path
                            d={pathData}
                            fill="none"
                            stroke="#312e81"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />

                          {/* Drop lines for P80 & P90 */}
                          <line
                            x1={scaleX(result.p80)}
                            y1={scaleY(0.8)}
                            x2={scaleX(result.p80)}
                            y2="150"
                            stroke="#4338ca"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <circle cx={scaleX(result.p80)} cy={scaleY(0.8)} r="4" fill="#4338ca" />

                          <line
                            x1={scaleX(result.p90)}
                            y1={scaleY(0.9)}
                            x2={scaleX(result.p90)}
                            y2="150"
                            stroke="#ef4444"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <circle cx={scaleX(result.p90)} cy={scaleY(0.9)} r="4" fill="#ef4444" />

                          {/* Baseline Budget line if within range */}
                          {params.budgetBaseline >= minX && params.budgetBaseline <= maxX && (
                            <g>
                              <line
                                x1={scaleX(params.budgetBaseline)}
                                y1="20"
                                x2={scaleX(params.budgetBaseline)}
                                y2="150"
                                stroke="#f59e0b"
                                strokeWidth="1.5"
                              />
                              <text x={scaleX(params.budgetBaseline)} y="15" fill="#f59e0b" fontSize="8" fontWeight="bold" textAnchor="middle">
                                现有预算
                              </text>
                            </g>
                          )}

                          {/* Axes */}
                          <line x1="40" y1="150" x2="500" y2="150" stroke="#64748b" strokeWidth="1.2" />
                          <line x1="40" y1="20" x2="40" y2="150" stroke="#64748b" strokeWidth="1.2" />

                          <text x="500" y="165" fill="#64748b" fontSize="9" textAnchor="end">
                            投资金额 (万元)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </>
          ) : (
            /* Python / NumPy Code Viewer Tab */
            <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-slate-100 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-indigo-300 flex items-center space-x-2">
                      <FileCode className="w-4 h-4 text-indigo-400" />
                      <span>独立 Python / NumPy 蒙特卡洛仿真脚本</span>
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-medium">
                      项目外100%独立运行
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    标准 Python 脚本，已内置中文字体自适应与图表自动留存，支持在本地终端、VSCode、PyCharm 或 Jupyter 中直接执行。
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={handleCopyCode}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? '已复制完整脚本！' : '复制 Python 代码'}</span>
                  </button>
                  <button
                    onClick={handleDownloadCode}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>下载 .py 文件</span>
                  </button>
                </div>
              </div>

              {/* Standalone Quick Execution Guide Banner */}
              <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center space-x-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>本地独立运行 2 步极速指南:</span>
                  </span>
                  <button
                    onClick={handleCopyPip}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                  >
                    {copiedPip ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedPip ? '已复制命令' : '复制安装命令'}</span>
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-slate-300 flex items-center justify-between">
                    <span>1. pip install numpy scipy matplotlib</span>
                  </div>
                  <div className="bg-slate-900 px-2.5 py-1.5 rounded border border-slate-800 text-indigo-300 flex items-center justify-between">
                    <span>2. python monte_carlo_risk_simulation.py</span>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 flex flex-wrap gap-x-4 gap-y-1 pt-0.5">
                  <span>✔ 自动解决 Matplotlib 中文方块乱码 (SimHei / 微软雅黑 / 苹方)</span>
                  <span>✔ 自动在当前工作目录生成 300DPI 高清图片 (chart.png)</span>
                  <span>✔ 支持在无显示屏服务器 (Linux/SSH) 与交互式 Jupyter 中无报错运行</span>
                </div>
              </div>

              {/* Success Notification Bar */}
              {copied && (
                <div className="bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 px-3.5 py-2 rounded-lg text-xs flex items-center justify-between transition animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Python 脚本已完整复制到剪贴板！可直接粘贴至本地任何 Python 文件或 Notebook 中执行。</span>
                  </div>
                </div>
              )}

              {/* Code block with syntax highlights */}
              <div className="max-h-[460px] overflow-y-auto rounded-lg bg-slate-950 p-4 border border-slate-800/80 font-mono text-xs text-slate-300 leading-relaxed select-all">
                <pre>{generatePythonScript(params, `${caseTitle} - 蒙特卡洛仿真`)}</pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
