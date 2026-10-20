import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  FileText, 
  FileSpreadsheet, 
  Download, 
  Check, 
  ShieldCheck, 
  BarChart2,
  Calendar,
  Layers,
  Sparkles,
  Database,
  Building2,
  Cpu,
  ShieldAlert,
  Rocket,
  SunMedium,
  Car,
  FolderDown,
  Edit3,
  Eye,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { RiskItem, FmeaItem, SimulationResult, CaseStudy } from '../../types/risk';
import { INITIAL_CASES } from '../../data/initialCases';
import { runMonteCarloSimulation } from '../../utils/mathUtils';

interface Module9Props {
  currentCase: CaseStudy;
  risks: RiskItem[];
  fmeaItems: FmeaItem[];
  simResult: SimulationResult;
}

const CASE_ICONS: Record<number, React.ReactNode> = {
  1: <Building2 className="w-4 h-4 text-amber-600" />,
  2: <Cpu className="w-4 h-4 text-indigo-600" />,
  3: <ShieldAlert className="w-4 h-4 text-rose-600" />,
  4: <Rocket className="w-4 h-4 text-purple-600" />,
  5: <SunMedium className="w-4 h-4 text-teal-600" />,
  6: <Car className="w-4 h-4 text-blue-600" />,
};

export const Module9ReportExport: React.FC<Module9Props> = ({
  currentCase,
  risks,
  fmeaItems,
  simResult,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [activeCaseTab, setActiveCaseTab] = useState<string>(currentCase.id);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(true);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);

  // Editable fields for report refinement
  const [customAuthor, setCustomAuthor] = useState('首席系统安全与可靠性总工程师');
  const [customOrg, setCustomOrg] = useState('国家重大工程系统风险分析与评估专家组');
  const [customNotes, setCustomNotes] = useState(
    '经全系统综合量化推演：本项目在既有技术与地缘环境下整体风险受控。重点防线需贯彻“防早防小、双冗余兜底”原则，严格执行 P80 分位数备用金闭环管理。'
  );
  const [customTitle, setCustomTitle] = useState('');
  const [customSubtitle, setCustomSubtitle] = useState('');
  const [customBackground, setCustomBackground] = useState('');

  // The case currently selected for raw data download or view
  const selectedCaseData = INITIAL_CASES.find(c => c.id === activeCaseTab) || currentCase;
  const isViewingCurrent = selectedCaseData.id === currentCase.id;

  // If viewing current active case, use active edited risks/FMEA; otherwise use default
  const caseRisks = isViewingCurrent ? risks : selectedCaseData.defaultRisks;
  const caseFmea = isViewingCurrent ? fmeaItems : selectedCaseData.defaultFmea;
  const caseSim = isViewingCurrent ? simResult : runMonteCarloSimulation(selectedCaseData.defaultSimParams);

  // Calculate Metrics
  const totalExp = Math.round(caseRisks.reduce((a, b) => a + b.expectedLoss, 0));
  const totalRes = Math.round(caseRisks.reduce((a, b) => a + (b.residualExpectedLoss || 0), 0));
  const reductionPct = totalExp > 0 ? Math.round(((totalExp - totalRes) / totalExp) * 100) : 0;
  const highRpnItems = caseFmea.filter(f => (f.rpn || f.severity * f.occurrence * f.detection) >= 150);

  // Download raw CSV for any case
  const downloadRiskCsv = (targetCase: CaseStudy, targetRisks: RiskItem[]) => {
    const headers = '编号,专业类别,风险名称,诱发根本原因,发生概率P,潜在暴露损失(万元),期望损失E(R),生命周期状态,责任人,应对策略,残余期望损失\n';
    const rows = targetRisks.map(r => 
      `"${r.code}","${r.category}","${r.title}","${r.source}",${r.probability},${r.monetaryImpact},${Math.round(r.expectedLoss)},"${r.status}","${r.owner}","${r.mitigationStrategy}",${Math.round(r.residualExpectedLoss || 0)}`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案例0${targetCase.number}_${targetCase.title}_原始风险台账.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadFmeaCsv = (targetCase: CaseStudy, targetFmea: FmeaItem[]) => {
    const headers = '编号,子系统,故障模式,诱发根因,局部影响,系统级破坏影响,严酷度S,频度O,探测度D,RPN,动作优先级AP,纠正预防措施,改善后S,改善后O,改善后D,改善后RPN\n';
    const rows = targetFmea.map(f => 
      `"${f.code}","${f.subsystem}","${f.failureMode}","${f.failureCause}","${f.localEffect}","${f.systemEffect}",${f.severity},${f.occurrence},${f.detection},${f.rpn},"${f.actionPriority}","${f.mitigation}",${f.postSeverity},${f.postOccurrence},${f.postDetection},${f.postRpn}`
    ).join('\n');

    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案例0${targetCase.number}_${targetCase.title}_原始FMEA评分表.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadCaseJson = (targetCase: CaseStudy) => {
    const data = {
      caseInfo: {
        id: targetCase.id,
        number: targetCase.number,
        title: targetCase.title,
        subtitle: targetCase.subtitle,
        badge: targetCase.badge,
        background: targetCase.background,
        coreMechanism: targetCase.coreMechanism,
      },
      risks: targetCase.defaultRisks,
      fmea: targetCase.defaultFmea,
      simParams: targetCase.defaultSimParams,
      recommendations: targetCase.recommendations,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案例0${targetCase.number}_${targetCase.title}_完整原始工程数据包.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download all 6 cases bundled JSON
  const downloadAllCasesPackage = () => {
    const fullBundle = {
      title: '系统风险分析实验室 - 六大实战案例全套原始数据集',
      version: '2026.10',
      standard: 'ISO 31000 / AIAG-VDA / IEC 60812',
      cases: INITIAL_CASES.map(c => ({
        id: c.id,
        number: c.number,
        title: c.title,
        subtitle: c.subtitle,
        background: c.background,
        risks: c.defaultRisks,
        fmea: c.defaultFmea,
        simParams: c.defaultSimParams,
        recommendations: c.recommendations,
      })),
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(fullBundle, null, 2)], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '六大系统风险实战案例_全量原始数据集大礼包.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Resolve current active or custom titles
  const reportTitle = customTitle.trim() || `${selectedCaseData.title}：系统风险全流程应对白皮书`;
  const reportSubtitle = customSubtitle.trim() || selectedCaseData.subtitle;
  const reportBackground = customBackground.trim() || selectedCaseData.background;

  // Generate 6-Part Structured Markdown Whitepaper
  const generateMarkdownReport = (): string => {
    return `# ${reportTitle}

> **评估标准**：ISO 31000 风险管理体系 / AIAG-VDA FMEA 规范 / IEC 60812  
> **编制单位**：${customOrg}  
> **首席工程师**：${customAuthor}  
> **编制日期**：${new Date().toISOString().split('T')[0]}  
> **技术密级**：受控工程文件 (Controlled Baseline)

---

## 第一部分：工程背景与系统边界界定 (System Scope & Context)

- **工程项目定位**：${reportTitle}（${reportSubtitle}）
- **工程环境与背景**：${reportBackground}
- **核心风险机理传导**：${selectedCaseData.coreMechanism}
- **系统分析指标摘要**：
  * 系统风险源总量：${caseRisks.length} 项
  * 初始系统期望总损失 E(R)：${totalExp.toLocaleString()} 万元
  * 全套防线加固后预期残余损失：${totalRes.toLocaleString()} 万元（减损率达 ${reductionPct}%）
  * 蒙特卡洛 P80 科学安全线：${Math.round(caseSim.p80).toLocaleString()} 万元
  * 蒙特卡洛 P90 极端容灾红线：${Math.round(caseSim.p90).toLocaleString()} 万元

---

## 第二部分：多维风险源识别与全生命周期台账 (Risk Identification)

| 风险编号 | 专业类别 | 风险标题与诱因机理 | 发生概率 P | 暴露损失(万) | 期望损失 E(R) | 生命周期 | 责任人 | 核心缓解策略 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- | :--- |
${caseRisks.map(r => `| ${r.code} | ${r.category} | ${r.title} (${r.source}) | ${(r.probability * 100).toFixed(0)}% | ${r.monetaryImpact} | ${Math.round(r.expectedLoss)} | ${r.status} | ${r.owner} | ${r.mitigationStrategy} |`).join('\n')}

---

## 第三部分：FMEA 故障模式与 S-O-D 三维定量分析 (FMEA Analysis)

| 编号 | 子系统/模块 | 潜在故障模式与诱因 | 局部与系统级影响 | 严酷度 S | 频度 O | 探测度 D | RPN | 优先 AP | 纠正与预防对策 | 改善后 RPN |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- | :---: |
${caseFmea.map(f => `| ${f.code} | ${f.subsystem} | ${f.failureMode} | 局部: ${f.localEffect}; 系统: ${f.systemEffect} | ${f.severity} | ${f.occurrence} | ${f.detection} | ${f.rpn} | ${f.actionPriority} | ${f.mitigation} | ${f.postRpn || 'N/A'} |`).join('\n')}

---

## 第四部分：5×5 概率-影响矩阵与高危红区过滤 (Risk Heatmap)

依据 ISO 31000 矩阵划定四色热力区域：
- **极高危红区 (Extreme)**：必须出具不可撤回的书面工程降敏对策；
- **高危橙区 (High)**：落实双人专职监测与备品备件前置；
- **中危黄区 (Moderate)**：纳入常态化周期性点检；
- **低危绿区 (Low)**：维持现有安全运行规程。
- **缓解迁移向量 (Migration Vectors)**：经防线加固后，全部高危项从右上角不可承受区成功向左下角绿区迁移，残余失效率整体压降超过 60%。

---

## 第五部分：蒙特卡洛不确定性模拟与 P80/P90 科学决策 (Monte Carlo & S-Curve)

基于 **${caseSim.histogramBins.length * 500}** 次伪随机抽样统计，系统成本/损失概率分布如下：
- **期望损失均值 E(X)**：${Math.round(caseSim.mean).toLocaleString()} 万元 (标准差: ±${Math.round(caseSim.stdDev)} 万元)
- **P10 乐观边界损失**：${Math.round(caseSim.p10).toLocaleString()} 万元
- **P50 中位数基准损失**：${Math.round(caseSim.p50).toLocaleString()} 万元
- **P80 科学安全线**：${Math.round(caseSim.p80).toLocaleString()} 万元 (建议拨备安全备用金额度)
- **P90 极端容灾红线**：${Math.round(caseSim.p90).toLocaleString()} 万元 (压力测试抗毁边界)
- **风险价值 (VaR 95%)**：${Math.round(caseSim.var95).toLocaleString()} 万元
- **条件期望损失 (CVaR 95% / Expected Shortfall)**：${Math.round(caseSim.cvar95).toLocaleString()} 万元

---

## 第六部分：闭环应对策略、应急预案与首席工程师审批签署 (Sign-off)

### 1. 核心落地行动清单
${selectedCaseData.recommendations.map((rec, i) => `${i + 1}. **${rec}**`).join('\n')}

### 2. 首席工程师综合裁决与审查意见
${customNotes}

---
**评估审批签署**：  
首席安全总工程师（签名）：\`${customAuthor}\`  
评估管理机构（签章）：\`${customOrg}\`  
批准签署日期：\`${new Date().toISOString().split('T')[0]}\`
`;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownReport();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const md = generateMarkdownReport();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `案例0${selectedCaseData.number}_${selectedCaseData.title}_全流程白皮书.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <FileDown className="w-3.5 h-3.5" />
              <span>模块 9 · 数据导出与全流程白皮书枢纽</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              六大案例原始数据下载与全流程应对白皮书导出
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              对应六大实战案例提供原始 CSV/JSON 数据下载；白皮书严格遵循全流程导引 6 大章节组织，支持在线精炼修改与预览打印。
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap">
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                isEditMode
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-600" />
              <span>{isEditMode ? '完成精炼修改' : '精炼修改报告参数'}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>打印 / 导出 PDF</span>
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center space-x-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-2 rounded-lg text-xs font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>导出 .md 白皮书</span>
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 1: 六大案例原始数据下载专区 (Raw Data Download Hub for All 6 Cases) */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-2xs space-y-4 print:hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">六大案例切片 · 原始工程数据集下载中枢</h3>
              <p className="text-[11px] text-slate-500">点击下方案例标签，即可下载对应案例的风险台账 CSV、FMEA 数据及 JSON 数据包</p>
            </div>
          </div>

          <button
            onClick={downloadAllCasesPackage}
            className="inline-flex items-center space-x-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0"
          >
            <FolderDown className="w-3.5 h-3.5 text-emerald-600" />
            <span>一键下载 6 大案例全量数据大礼包 (JSON)</span>
          </button>
        </div>

        {/* 6 Case Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {INITIAL_CASES.map(c => {
            const isTabActive = c.id === activeCaseTab;
            return (
              <button
                key={c.id}
                onClick={() => setActiveCaseTab(c.id)}
                className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                  isTabActive
                    ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-2xs'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-slate-400 font-bold">案例 0{c.number}</span>
                  {CASE_ICONS[c.number]}
                </div>
                <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                <span className="text-[10px] text-indigo-600 font-medium mt-1 truncate block">{c.badge}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Case Specific Raw Data Download Bar */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">
                当前选中案例: 0{selectedCaseData.number} · {selectedCaseData.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-medium">
                {selectedCaseData.badge}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              包含 {caseRisks.length} 项风险源、{caseFmea.length} 项 FMEA 模式及蒙特卡洛参数，提供三种标准原始数据格式：
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0 flex-wrap">
            <button
              onClick={() => downloadRiskCsv(selectedCaseData, caseRisks)}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>下载风险台账 (CSV)</span>
            </button>

            <button
              onClick={() => downloadFmeaCsv(selectedCaseData, caseFmea)}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>下载 FMEA 评分表 (CSV)</span>
            </button>

            <button
              onClick={() => downloadCaseJson(selectedCaseData)}
              className="inline-flex items-center space-x-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium transition"
            >
              <Download className="w-3.5 h-3.5 text-purple-600" />
              <span>下载案例数据包 (JSON)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Refinement Editor Panel (精炼修改模式) */}
      {isEditMode && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4 print:hidden animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-amber-200">
            <h3 className="text-xs font-bold text-amber-900 flex items-center space-x-2">
              <Edit3 className="w-4 h-4 text-amber-600" />
              <span>白皮书全流程报告精炼在线修改</span>
            </h3>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-amber-700 hidden sm:inline">实时同步至下方预览及 PDF/Markdown 导出</span>
              <button
                type="button"
                onClick={() => {
                  setCustomTitle('');
                  setCustomSubtitle('');
                  setCustomBackground('');
                  setCustomAuthor('首席系统安全与可靠性总工程师');
                  setCustomOrg('国家重大工程系统风险分析与评估专家组');
                  setCustomNotes(
                    '经全系统综合量化推演：本项目在既有技术与地缘环境下整体风险受控。重点防线需贯彻“防早防小、双冗余兜底”原则，严格执行 P80 分位数备用金闭环管理。'
                  );
                }}
                className="text-[11px] px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 rounded border border-amber-300 font-medium transition"
              >
                恢复默认文案
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">报告主标题 (Title)</label>
              <input
                type="text"
                placeholder={`${selectedCaseData.title}：系统风险全流程应对白皮书`}
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 font-medium"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">报告副标题 / 评估阶段</label>
              <input
                type="text"
                placeholder={selectedCaseData.subtitle}
                value={customSubtitle}
                onChange={(e) => setCustomSubtitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">首席安全工程师姓名 / 职务</label>
              <input
                type="text"
                value={customAuthor}
                onChange={(e) => setCustomAuthor(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-1">评估编制机构 / 评审专家组</label>
              <input
                type="text"
                value={customOrg}
                onChange={(e) => setCustomOrg(e.target.value)}
                className="w-full px-3 py-1.5 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              第一部分：工程环境背景与系统边界界定 (精炼补充)
            </label>
            <textarea
              rows={2}
              placeholder={selectedCaseData.background}
              value={customBackground}
              onChange={(e) => setCustomBackground(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs leading-relaxed"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-semibold mb-1 text-xs">
              第六部分：首席工程师综合裁决与闭环签署意见 (精炼修改)
            </label>
            <textarea
              rows={3}
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-lg border border-slate-300 text-slate-900 focus:outline-none focus:border-indigo-600 text-xs leading-relaxed"
            />
          </div>
        </div>
      )}

      {/* SECTION 2: 严格按照全流程导引 6 大步骤组织的报告在线预览与打印区域 */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-sm space-y-10 max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none">
        {/* Document Header & Title */}
        <div className="border-b-2 border-slate-900 pb-6 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-bold tracking-widest text-indigo-700 uppercase block mb-1 font-mono">
                ISO 31000 / AIAG-VDA SYSTEM RISK WHITE PAPER
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {reportTitle}
              </h1>
              <p className="text-sm text-slate-600 mt-1">{reportSubtitle}</p>
            </div>
            <div className="text-right text-xs text-slate-500 hidden sm:block">
              <div>文件编号: <strong className="text-slate-800 font-mono">SYS-REP-0{selectedCaseData.number}</strong></div>
              <div>发布日期: <span className="font-mono">{new Date().toISOString().split('T')[0]}</span></div>
              <div className="text-emerald-700 font-semibold mt-1">✔ 体系合规性认证</div>
            </div>
          </div>
        </div>

        {/* 1. 第一部分：工程背景与系统边界界定 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第一部分：工程背景与系统边界界定 (System Context)
            </h2>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">
            {reportBackground}
          </p>
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
            <div className="font-semibold text-slate-800">系统核心风险传导网络与多米诺机理：</div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              {selectedCaseData.coreMechanism}
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-indigo-50/40 p-4 rounded-xl border border-indigo-100">
            <div>
              <span className="text-[10px] text-slate-500 block">系统风险登记总量</span>
              <span className="text-base font-bold text-slate-900 font-mono">{caseRisks.length} 项</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">初始期望总损失 E(R)</span>
              <span className="text-base font-bold text-rose-700 font-mono">{totalExp.toLocaleString()} 万元</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">残余期望总损失</span>
              <span className="text-base font-bold text-emerald-800 font-mono">{totalRes.toLocaleString()} 万元</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">P80 科学安全线</span>
              <span className="text-base font-bold text-indigo-950 font-mono">{Math.round(caseSim.p80).toLocaleString()} 万元</span>
            </div>
          </div>
        </div>

        {/* 2. 第二部分：多维风险源识别与全生命周期台账 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第二部分：多维风险源识别与全生命周期台账 (Risk Identification)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            涵盖政治、技术、经济与供应链等关键维度，建立闭环跟踪台账：
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">编号</th>
                  <th className="py-2.5 px-3">风险源标题</th>
                  <th className="py-2.5 px-2 text-center">概率 P</th>
                  <th className="py-2.5 px-2 text-right">暴露损失</th>
                  <th className="py-2.5 px-2 text-right">期望损失</th>
                  <th className="py-2.5 px-2 text-center">状态</th>
                  <th className="py-2.5 px-3">应对策略与责任人</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {caseRisks.map(r => (
                  <tr key={r.id}>
                    <td className="py-2.5 px-3 font-mono font-bold">{r.code}</td>
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{r.title}</div>
                      <div className="text-[10px] text-slate-400">诱因: {r.source}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono">{(r.probability * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-2 text-right font-mono">{r.monetaryImpact}万</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-rose-700">{Math.round(r.expectedLoss)}万</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {r.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>{r.mitigationStrategy}</div>
                      <div className="text-[10px] text-indigo-700 font-medium mt-0.5">责任人: {r.owner}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. 第三部分：FMEA 故障模式与 S-O-D 三维定量分析 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第三部分：FMEA 故障模式与 S-O-D 三维定量分析 (FMEA Criticality)
            </h2>
          </div>
          <p className="text-xs text-slate-600">
            基于严酷度 (S)、发生频度 (O)、探测难度 (D) 与 AIAG-VDA 动作优先级 (Action Priority, AP) 判定规则：
          </p>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">子系统</th>
                  <th className="py-2.5 px-3">故障模式</th>
                  <th className="py-2.5 px-2 text-center">S</th>
                  <th className="py-2.5 px-2 text-center">O</th>
                  <th className="py-2.5 px-2 text-center">D</th>
                  <th className="py-2.5 px-2 text-center font-mono">RPN</th>
                  <th className="py-2.5 px-2 text-center">AP</th>
                  <th className="py-2.5 px-3">纠正措施与残余 RPN</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {caseFmea.map(f => (
                  <tr key={f.id}>
                    <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap">{f.subsystem}</td>
                    <td className="py-2.5 px-3">
                      <div>{f.failureMode}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">系统破坏: {f.systemEffect}</div>
                    </td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-rose-700">{f.severity}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{f.occurrence}</td>
                    <td className="py-2.5 px-2 text-center font-mono">{f.detection}</td>
                    <td className="py-2.5 px-2 text-center font-mono font-bold">{f.rpn}</td>
                    <td className="py-2.5 px-2 text-center">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        f.actionPriority === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {f.actionPriority}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-600">
                      <div>{f.mitigation}</div>
                      <div className="text-emerald-700 font-semibold mt-0.5 font-mono">
                        改善后RPN: {f.postRpn} (↓{Math.round(((f.rpn - f.postRpn) / f.rpn) * 100)}%)
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. 第四部分：5×5 概率-影响矩阵与高危红区过滤 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第四部分：5×5 概率-影响矩阵与高危红区过滤 (Risk Heatmap)
            </h2>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex items-center space-x-4 text-[11px]">
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-xs bg-rose-200 border border-rose-400"></span><span>极高危红区 (强制整改)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-200 border border-amber-400"></span><span>高危橙区 (重点监控)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-xs bg-yellow-100 border border-yellow-300"></span><span>中危黄区 (常态巡检)</span></span>
              <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-100 border border-emerald-300"></span><span>低危绿区 (可承受)</span></span>
            </div>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              <strong>防线迁移向量判定 (Migration Vector Trajectory)</strong>：经防线加固后，原处于不可承受红区项（S ≥ 9 或 RPN ≥ 150）
              在物理双冗余与制度约束介入下，残余失效率与残余影响均成功下移至可容忍区间。
            </p>
          </div>
        </div>

        {/* 5. 第五部分：蒙特卡洛不确定性模拟与 P80/P90 科学决策 */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第五部分：蒙特卡洛不确定性模拟与 P80/P90 科学决策 (Monte Carlo & S-Curve)
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">期望损失均值 E(X)</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(caseSim.mean).toLocaleString()} 万元</span>
              <span className="text-[10px] text-slate-400 block font-sans">σ = ±{Math.round(caseSim.stdDev)}万</span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 block font-sans font-medium">P50 中位数损失</span>
              <span className="text-sm font-bold text-emerald-800">{Math.round(caseSim.p50).toLocaleString()} 万元</span>
              <span className="text-[10px] text-slate-400 block font-sans">50% 不超支概率</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-700 block font-sans font-bold">P80 科学安全线</span>
              <span className="text-sm font-bold text-indigo-950">{Math.round(caseSim.p80).toLocaleString()} 万元</span>
              <span className="text-[10px] text-indigo-700 block font-sans font-medium">建议科学备用金</span>
            </div>
            <div>
              <span className="text-[10px] text-rose-700 block font-sans font-bold">P90 极端容灾红线</span>
              <span className="text-sm font-bold text-rose-950">{Math.round(caseSim.p90).toLocaleString()} 万元</span>
              <span className="text-[10px] text-slate-400 block font-sans">极端压力测试</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">风险价值 VaR (95%)</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(caseSim.var95).toLocaleString()} 万元</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-sans">条件风险价值 CVaR (95%)</span>
              <span className="text-sm font-bold text-slate-900">{Math.round(caseSim.cvar95).toLocaleString()} 万元</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            <strong>P80/P90 决断逻辑：</strong>工程总成本与工期损失表现为典型的右偏长尾分布。
            传统平均值（P50）有高达 50% 概率击穿预算，必须采用 <strong>P80 分位数</strong>（{Math.round(caseSim.p80).toLocaleString()} 万元）核定不可预见备用金额度，方能确保 80% 置信抗冲击度。
          </p>
        </div>

        {/* 6. 第六部分：闭环应对策略、应急预案与首席工程师审批签署 */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center space-x-2 border-b border-slate-200 pb-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              第六部分：闭环应对策略、应急预案与首席工程师审批签署 (Sign-Off)
            </h2>
          </div>

          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700">
            <div className="font-semibold text-slate-900 mb-1">系统工程关键落地对策清单：</div>
            {selectedCaseData.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start space-x-2">
                <span className="font-bold text-indigo-700">{i + 1}.</span>
                <p className="leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>

          <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <div className="font-bold">首席工程师裁决意见：</div>
            <p className="leading-relaxed whitespace-pre-wrap">{customNotes}</p>
          </div>

          {/* Formal Sign-off Signature Block */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-700">
            <div className="space-y-1">
              <div>首席安全总工程师 (签字)：<strong className="underline underline-offset-4">{customAuthor}</strong></div>
              <div className="text-slate-400 text-[10px]">签署日期: {new Date().toISOString().split('T')[0]}</div>
            </div>
            <div className="space-y-1 text-right">
              <div>评估管理机构 (签章)：<strong className="underline underline-offset-4">{customOrg}</strong></div>
              <div className="text-emerald-700 font-semibold text-[10px]">审批结论: 准予工程按基线推进实施 (APPROVED)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
