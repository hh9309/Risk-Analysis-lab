import React, { useState } from 'react';
import { 
  Grid, 
  Layers, 
  ArrowRight, 
  Sliders, 
  AlertTriangle, 
  ShieldCheck, 
  Info,
  Maximize2,
  CheckCircle2
} from 'lucide-react';
import { RiskItem } from '../../types/risk';

interface Module4Props {
  risks: RiskItem[];
}

export const Module4RiskMatrix: React.FC<Module4Props> = ({ risks }) => {
  const [matrixSize, setMatrixSize] = useState<'5x5' | '3x3'>('5x5');
  const [showVectors, setShowVectors] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<RiskItem | null>(null);

  // 5x5 Probability Levels: 1 (Very Low <10%), 2 (Low 10-30%), 3 (Medium 30-50%), 4 (High 50-70%), 5 (Very High >70%)
  const getProbLevel5 = (p: number): number => {
    if (p <= 0.15) return 1;
    if (p <= 0.35) return 2;
    if (p <= 0.55) return 3;
    if (p <= 0.75) return 4;
    return 5;
  };

  // 5x5 Impact Levels: 1 (Negligible 1-2), 2 (Minor 3-4), 3 (Moderate 5-6), 4 (Major 7-8), 5 (Catastrophic 9-10)
  const getImpactLevel5 = (imp: number): number => {
    if (imp <= 2) return 1;
    if (imp <= 4) return 2;
    if (imp <= 6) return 3;
    if (imp <= 8) return 4;
    return 5;
  };

  // 3x3 mapping
  const getProbLevel3 = (p: number): number => {
    if (p <= 0.3) return 1;
    if (p <= 0.6) return 2;
    return 3;
  };

  const getImpactLevel3 = (imp: number): number => {
    if (imp <= 3) return 1;
    if (imp <= 7) return 2;
    return 3;
  };

  // 5x5 Cell Color Scheme
  const getCellColor5 = (pLevel: number, iLevel: number): { bg: string; text: string; zone: string } => {
    const score = pLevel * iLevel;
    if (score >= 15 || (pLevel >= 3 && iLevel === 5) || (pLevel === 5 && iLevel >= 3)) {
      return { bg: 'bg-rose-100 hover:bg-rose-200 border-rose-300', text: 'text-rose-900', zone: '极高危 (红区)' };
    }
    if (score >= 8) {
      return { bg: 'bg-amber-100 hover:bg-amber-200 border-amber-300', text: 'text-amber-900', zone: '高风险 (橙区)' };
    }
    if (score >= 4) {
      return { bg: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200', text: 'text-yellow-800', zone: '中风险 (黄区)' };
    }
    return { bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', text: 'text-emerald-800', zone: '低风险 (绿区)' };
  };

  // 3x3 Cell Color Scheme
  const getCellColor3 = (pLevel: number, iLevel: number): { bg: string; text: string; zone: string } => {
    const score = pLevel * iLevel;
    if (score >= 6) {
      return { bg: 'bg-rose-100 hover:bg-rose-200 border-rose-300', text: 'text-rose-900', zone: '红区' };
    }
    if (score >= 3) {
      return { bg: 'bg-amber-100 hover:bg-amber-200 border-amber-300', text: 'text-amber-900', zone: '黄区' };
    }
    return { bg: 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200', text: 'text-emerald-800', zone: '绿区' };
  };

  const pLabels5 = ['5. 极高频 (>70%)', '4. 高频 (50-70%)', '3. 中频 (30-50%)', '2. 低频 (10-30%)', '1. 罕见 (<10%)'];
  const iLabels5 = ['1. 微不足道', '2. 较小损失', '3. 中度波及', '4. 重大危害', '5. 灾难性破产'];

  const pLabels3 = ['3. 高概率 (>60%)', '2. 中概率 (30-60%)', '1. 低概率 (<30%)'];
  const iLabels3 = ['1. 轻度影响', '2. 中度危害', '3. 严重破坏'];

  // Count risks in zones
  const redZoneRisks = risks.filter(r => {
    const pL = getProbLevel5(r.probability);
    const iL = getImpactLevel5(r.impact);
    return getCellColor5(pL, iL).zone.includes('极高危');
  });

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Grid className="w-3.5 h-3.5" />
              <span>模块 4 · 视觉决策矩阵</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              概率-影响矩阵与动态可视化热力图
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              动态映射 5×5 / 3×3 风险矩阵，直观锁定高危红区风险，支持一键对比对策前后的“风险迁移向量”。
            </p>
          </div>

          {/* Controls: 5x5 / 3x3 and Migration vector toggle */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-slate-100 rounded-lg p-1 text-xs">
              <button
                onClick={() => setMatrixSize('5x5')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  matrixSize === '5x5' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                5×5 标准矩阵
              </button>
              <button
                onClick={() => setMatrixSize('3x3')}
                className={`px-3 py-1.5 rounded-md font-medium transition ${
                  matrixSize === '3x3' ? 'bg-white text-indigo-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                3×3 简炼矩阵
              </button>
            </div>

            <label className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <input
                type="checkbox"
                checked={showVectors}
                onChange={(e) => setShowVectors(e.target.checked)}
                className="rounded accent-indigo-600"
              />
              <span>显示缓解迁移轨迹 (Vectors)</span>
            </label>
          </div>
        </div>
      </div>

      {/* Grid Layout: Left Matrix Heatmap, Right Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Matrix Grid */}
        <div className="lg:col-span-8 bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-900">
                {matrixSize === '5x5' ? 'ISO 31000 五阶四色风险热力图' : '高层敏捷三阶风险图'}
              </span>
              <span className="text-xs text-rose-600 font-medium">
                (红区警戒: {redZoneRisks.length} 项)
              </span>
            </div>
            <div className="flex items-center space-x-3 text-[10px]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-rose-200 border border-rose-400"></span>
                <span>极高危红区</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-400"></span>
                <span>高危橙区</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-yellow-100 border border-yellow-300"></span>
                <span>中危黄区</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-300"></span>
                <span>低危绿区</span>
              </span>
            </div>
          </div>

          {/* Matrix Container */}
          <div className="relative">
            {matrixSize === '5x5' ? (
              <div className="grid grid-cols-6 gap-2">
                {/* Empty top-left cell */}
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center p-2 text-center">
                  概率 P \ 影响 I
                </div>

                {/* Impact Columns Header */}
                {iLabels5.map((il, idx) => (
                  <div key={`ih-${idx}`} className="text-[10px] font-semibold text-slate-600 text-center py-1 bg-slate-50 rounded border border-slate-200/80">
                    {il}
                  </div>
                ))}

                {/* 5 Rows from Top (Level 5) to Bottom (Level 1) */}
                {[5, 4, 3, 2, 1].map((pLevel) => (
                  <React.Fragment key={`row-${pLevel}`}>
                    {/* Prob Y-axis label */}
                    <div className="text-[10px] font-semibold text-slate-600 flex items-center justify-end pr-2 text-right">
                      {pLabels5[5 - pLevel]}
                    </div>

                    {/* 5 Impact Cells */}
                    {[1, 2, 3, 4, 5].map((iLevel) => {
                      const colorInfo = getCellColor5(pLevel, iLevel);
                      // Risks residing in this cell
                      const cellRisks = risks.filter((r) => {
                        return getProbLevel5(r.probability) === pLevel && getImpactLevel5(r.impact) === iLevel;
                      });

                      return (
                        <div
                          key={`cell-${pLevel}-${iLevel}`}
                          className={`min-h-[82px] p-2 rounded-xl border flex flex-col justify-between transition-all relative ${colorInfo.bg}`}
                        >
                          <div className="text-[9px] font-mono opacity-40 font-bold">
                            {pLevel}×{iLevel}={pLevel * iLevel}
                          </div>

                          {/* Risk Badges inside Cell */}
                          <div className="flex flex-wrap gap-1 my-1">
                            {cellRisks.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedRisk(item)}
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-2xs border bg-white text-slate-900 border-slate-300 hover:border-indigo-600 transition flex items-center space-x-1 ${
                                  selectedRisk?.id === item.id ? 'ring-2 ring-indigo-600' : ''
                                }`}
                              >
                                <span>{item.code.replace('RSK-', '')}</span>
                              </button>
                            ))}
                          </div>

                          <div className="text-[9px] text-right font-medium opacity-60">
                            {cellRisks.length > 0 ? `${cellRisks.length}项` : ''}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              /* 3x3 Matrix Grid */
              <div className="grid grid-cols-4 gap-2">
                <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center p-2">
                  概率 \ 影响
                </div>
                {iLabels3.map((il, idx) => (
                  <div key={`ih3-${idx}`} className="text-xs font-semibold text-slate-600 text-center py-1.5 bg-slate-50 rounded border border-slate-200">
                    {il}
                  </div>
                ))}

                {[3, 2, 1].map((pLevel) => (
                  <React.Fragment key={`row3-${pLevel}`}>
                    <div className="text-xs font-semibold text-slate-600 flex items-center justify-end pr-2 text-right">
                      {pLabels3[3 - pLevel]}
                    </div>
                    {[1, 2, 3].map((iLevel) => {
                      const colorInfo = getCellColor3(pLevel, iLevel);
                      const cellRisks = risks.filter((r) => {
                        return getProbLevel3(r.probability) === pLevel && getImpactLevel3(r.impact) === iLevel;
                      });

                      return (
                        <div
                          key={`cell3-${pLevel}-${iLevel}`}
                          className={`min-h-[105px] p-2.5 rounded-xl border flex flex-col justify-between transition-all ${colorInfo.bg}`}
                        >
                          <div className="text-[10px] font-mono opacity-50 font-bold">
                            P{pLevel}-I{iLevel}
                          </div>
                          <div className="flex flex-wrap gap-1 my-1">
                            {cellRisks.map((item) => (
                              <button
                                key={item.id}
                                onClick={() => setSelectedRisk(item)}
                                className={`text-xs font-mono font-bold px-2 py-0.5 rounded shadow-2xs border bg-white text-slate-900 border-slate-300 hover:border-indigo-600 transition ${
                                  selectedRisk?.id === item.id ? 'ring-2 ring-indigo-600' : ''
                                }`}
                              >
                                {item.code}
                              </button>
                            ))}
                          </div>
                          <div className="text-[10px] text-right font-medium opacity-60">
                            {cellRisks.length > 0 ? `${cellRisks.length}个风险` : '无'}
                          </div>
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Detail Card & Migration Vector Details */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>风险详情透视</span>
              {selectedRisk && (
                <span className="text-xs font-mono font-semibold text-indigo-600">
                  {selectedRisk.code}
                </span>
              )}
            </h3>

            {selectedRisk ? (
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{selectedRisk.title}</h4>
                  <p className="text-slate-600 leading-relaxed">{selectedRisk.description}</p>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">诱发机理:</span>
                    <span className="font-medium text-slate-800 text-right">{selectedRisk.source}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">初始发生概率:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {(selectedRisk.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">潜在货币损失:</span>
                    <span className="font-mono font-bold text-rose-700">
                      {selectedRisk.monetaryImpact.toLocaleString()} 万元
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">初始期望损失 E(R):</span>
                    <span className="font-mono font-bold text-slate-900">
                      {Math.round(selectedRisk.expectedLoss).toLocaleString()} 万元
                    </span>
                  </div>
                </div>

                {/* Migration Vector Demonstration */}
                <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 space-y-2">
                  <div className="flex items-center space-x-1.5 text-emerald-900 font-semibold text-xs">
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                    <span>缓解对策迁移向量 (Mitigation Vector)</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    <strong>对策:</strong> {selectedRisk.mitigationStrategy || '推进落实中'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="bg-white/80 p-1.5 rounded border border-emerald-200 text-center">
                      <span className="text-slate-400 block text-[10px]">残余概率</span>
                      <span className="font-bold text-emerald-700">
                        {((selectedRisk.residualProbability || selectedRisk.probability * 0.4) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="bg-white/80 p-1.5 rounded border border-emerald-200 text-center">
                      <span className="text-slate-400 block text-[10px]">残余期望损失</span>
                      <span className="font-bold text-emerald-700">
                        {Math.round(selectedRisk.residualExpectedLoss || selectedRisk.expectedLoss * 0.25).toLocaleString()} 万
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-1 text-[11px] text-slate-500 flex justify-between">
                  <span>责任人: <strong className="text-slate-700">{selectedRisk.owner}</strong></span>
                  <span>更新日期: {selectedRisk.updatedAt}</span>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 text-xs">
                <Info className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>点击左侧矩阵网格中的风险编号</p>
                <p className="text-[11px] text-slate-400 mt-1">查看详细影响机理与迁移轨迹</p>
              </div>
            )}
          </div>

          {/* Iso-Risk Guideline Card */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs text-xs space-y-2">
            <div className="flex items-center space-x-2 text-slate-900 font-semibold">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>红区风险强制处置原则</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              处于右上角红区的风险项属于<strong>不可承受边界 (Unacceptable Region)</strong>。系统工程规范严禁在未出具书面降敏缓解方案的前提下启动下一设计节点。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
