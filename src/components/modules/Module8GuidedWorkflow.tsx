import React from 'react';
import { 
  Compass, 
  CheckCircle2, 
  ArrowRight, 
  FileText, 
  Sliders, 
  Cpu, 
  Grid, 
  Settings, 
  Layers,
  ChevronRight
} from 'lucide-react';
import { RiskItem, FmeaItem, SimulationResult } from '../../types/risk';

interface Module8Props {
  risks: RiskItem[];
  fmeaItems: FmeaItem[];
  simResult: SimulationResult;
  onNavigateToModule: (moduleId: number) => void;
  onOpenExport: () => void;
}

export const Module8GuidedWorkflow: React.FC<Module8Props> = ({
  risks,
  fmeaItems,
  simResult,
  onNavigateToModule,
  onOpenExport,
}) => {
  const steps = [
    {
      step: 1,
      targetModule: 2,
      name: '风险源多维识别与分类登记',
      desc: '在风险台账中系统化梳理政治、技术、经济与管理维度的全部潜在风险源，明确发生机理与责任人。',
      metrics: `已登记 ${risks.length} 项风险`,
      status: risks.length > 0 ? 'completed' : 'pending',
      icon: <Layers className="w-5 h-5 text-indigo-600" />,
      actionLabel: '前往风险登记册',
    },
    {
      step: 2,
      targetModule: 3,
      name: 'FMEA 故障模式与三维评定',
      desc: '深入系统子系统，量化评定严酷度 (S)、发生频度 (O) 与探测难度 (D)，计算 RPN 与 AIAG-VDA 动作优先级。',
      metrics: `已完成 ${fmeaItems.length} 项故障模式分析 (高RPN: ${fmeaItems.filter(f => f.rpn > 150).length}项)`,
      status: fmeaItems.length > 0 ? 'completed' : 'pending',
      icon: <Settings className="w-5 h-5 text-indigo-600" />,
      actionLabel: '进入 FMEA 工作台',
    },
    {
      step: 3,
      targetModule: 4,
      name: '5×5 概率影响矩阵过滤与红区锁定',
      desc: '将风险映射到四色热力图，识别不可承受的极高危红区与高危橙区，制定防线迁移策略。',
      metrics: '四色热力分区与对策迁移向量',
      status: 'completed',
      icon: <Grid className="w-5 h-5 text-indigo-600" />,
      actionLabel: '查看矩阵热力图',
    },
    {
      step: 4,
      targetModule: 6,
      name: '蒙特卡洛不确定性模拟与 P80/P90 决断',
      desc: '摆脱单一平均值假象，运行上万次随机抽样生成 S 曲线，根据 P80 / P90 设定科学风险备用金。',
      metrics: `P80: ${Math.round(simResult.p80)}万 | P90: ${Math.round(simResult.p90)}万`,
      status: 'completed',
      icon: <Cpu className="w-5 h-5 text-indigo-600" />,
      actionLabel: '运行仿真引擎',
    },
    {
      step: 5,
      targetModule: 9,
      name: '编制并导出一键式系统风险应对白皮书',
      desc: '整合所有量化分析结果、FMEA 改善对策表与蒙特卡洛置信区间，导出 PDF、CSV 或 Markdown 白皮书。',
      metrics: '支持一键打印与多格式导出',
      status: 'action_ready',
      icon: <FileText className="w-5 h-5 text-emerald-600" />,
      actionLabel: '一键生成报告',
      customAction: onOpenExport,
    },
  ];

  const completedCount = steps.filter(s => s.status === 'completed').length;
  const progressPct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>模块 8 · 闭环工程方法论</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              风险识别 $\to$ FMEA $\to$ 矩阵过滤 $\to$ 蒙特卡洛全流程
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              遵循 ISO 31000 与系统可靠性工程五步闭环流程，标准化指引从定性经验识别至定量置信决策的全链路落地。
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs sm:w-48">
            <div className="flex justify-between font-semibold text-slate-700 mb-1">
              <span>全流程就绪进度</span>
              <span className="text-indigo-600 font-mono">{progressPct}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stepper Pipeline Cards */}
      <div className="space-y-4">
        {steps.map((s, idx) => (
          <div
            key={s.step}
            className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start space-x-4">
              <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-indigo-600 font-mono">
                    第 0{s.step} 步
                  </span>
                  <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
                  <span className="inline-flex items-center space-x-1 text-[11px] text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>已就绪</span>
                  </span>
                </div>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  {s.desc}
                </p>
                <div className="text-[11px] font-mono text-slate-500 pt-1">
                  当前状态: <strong className="text-slate-800">{s.metrics}</strong>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (s.customAction) {
                  s.customAction();
                } else {
                  onNavigateToModule(s.targetModule);
                }
              }}
              className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs border border-indigo-200 transition shrink-0 self-start sm:self-center"
            >
              <span>{s.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
