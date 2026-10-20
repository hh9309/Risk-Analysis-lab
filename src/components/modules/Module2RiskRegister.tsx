import React, { useState } from 'react';
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingDown,
  ArrowRight,
  Shield,
  FileSpreadsheet
} from 'lucide-react';
import { RiskItem, RiskCategory, LifecycleStatus } from '../../types/risk';

interface Module2Props {
  risks: RiskItem[];
  onAddRisk: (item: RiskItem) => void;
  onUpdateRisk: (item: RiskItem) => void;
  onDeleteRisk: (id: string) => void;
}

export const CATEGORY_LABELS: Record<RiskCategory, { label: string; color: string; border: string }> = {
  political: { label: '政治地缘', color: 'bg-rose-50 text-rose-700', border: 'border-rose-200' },
  technical: { label: '技术架构', color: 'bg-indigo-50 text-indigo-700', border: 'border-indigo-200' },
  economic: { label: '经济金融', color: 'bg-amber-50 text-amber-700', border: 'border-amber-200' },
  management: { label: '管理合规', color: 'bg-blue-50 text-blue-700', border: 'border-blue-200' },
  supply_chain: { label: '供应链运营', color: 'bg-emerald-50 text-emerald-700', border: 'border-emerald-200' },
  safety_cyber: { label: '安全网安', color: 'bg-purple-50 text-purple-700', border: 'border-purple-200' },
};

export const STATUS_LABELS: Record<LifecycleStatus, { label: string; badge: string }> = {
  identified: { label: '已识别', badge: 'bg-slate-100 text-slate-700 border-slate-300' },
  assessing: { label: '评估中', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  mitigating: { label: '缓解中', badge: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  monitoring: { label: '持续监测', badge: 'bg-teal-100 text-teal-800 border-teal-300' },
  closed: { label: '已关闭', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
};

export const Module2RiskRegister: React.FC<Module2Props> = ({
  risks,
  onAddRisk,
  onUpdateRisk,
  onDeleteRisk,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState<RiskItem | null>(null);

  // Form State for Add / Edit
  const [formCode, setFormCode] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<RiskCategory>('technical');
  const [formDescription, setFormDescription] = useState('');
  const [formSource, setFormSource] = useState('');
  const [formProbability, setFormProbability] = useState<number>(0.3);
  const [formImpact, setFormImpact] = useState<number>(5);
  const [formMonetaryImpact, setFormMonetaryImpact] = useState<number>(2000);
  const [formStatus, setFormStatus] = useState<LifecycleStatus>('identified');
  const [formOwner, setFormOwner] = useState('');
  const [formMitigation, setFormMitigation] = useState('');
  const [formResidualProb, setFormResidualProb] = useState<number>(0.1);
  const [formResidualMonetary, setFormResidualMonetary] = useState<number>(800);

  const openAddModal = () => {
    setEditingRisk(null);
    setFormCode(`RSK-${Date.now().toString().slice(-4)}`);
    setFormTitle('');
    setFormCategory('technical');
    setFormDescription('');
    setFormSource('');
    setFormProbability(0.25);
    setFormImpact(6);
    setFormMonetaryImpact(3000);
    setFormStatus('identified');
    setFormOwner('系统安全工程师');
    setFormMitigation('');
    setFormResidualProb(0.08);
    setFormResidualMonetary(1000);
    setIsModalOpen(true);
  };

  const openEditModal = (item: RiskItem) => {
    setEditingRisk(item);
    setFormCode(item.code);
    setFormTitle(item.title);
    setFormCategory(item.category);
    setFormDescription(item.description);
    setFormSource(item.source);
    setFormProbability(item.probability);
    setFormImpact(item.impact);
    setFormMonetaryImpact(item.monetaryImpact);
    setFormStatus(item.status);
    setFormOwner(item.owner);
    setFormMitigation(item.mitigationStrategy);
    setFormResidualProb(item.residualProbability);
    setFormResidualMonetary(item.residualMonetaryImpact);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const expLoss = formProbability * formMonetaryImpact;
    const resExpLoss = formResidualProb * formResidualMonetary;

    const newItem: RiskItem = {
      id: editingRisk ? editingRisk.id : `risk-${Date.now()}`,
      code: formCode,
      title: formTitle,
      category: formCategory,
      description: formDescription,
      source: formSource,
      probability: formProbability,
      impact: formImpact,
      monetaryImpact: formMonetaryImpact,
      expectedLoss: expLoss,
      variance: formProbability * Math.pow(formMonetaryImpact, 2) - Math.pow(expLoss, 2),
      status: formStatus,
      owner: formOwner,
      mitigationStrategy: formMitigation,
      residualProbability: formResidualProb,
      residualImpact: Math.max(1, Math.round(formImpact * 0.6)),
      residualMonetaryImpact: formResidualMonetary,
      residualExpectedLoss: resExpLoss,
      updatedAt: new Date().toISOString().split('T')[0],
    };

    if (editingRisk) {
      onUpdateRisk(newItem);
    } else {
      onAddRisk(newItem);
    }
    setIsModalOpen(false);
  };

  // Filtered risks
  const filteredRisks = risks.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.owner.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || r.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Aggregate Metrics
  const totalExpLoss = risks.reduce((acc, cur) => acc + cur.expectedLoss, 0);
  const totalResidualLoss = risks.reduce((acc, cur) => acc + (cur.residualExpectedLoss || 0), 0);
  const reductionAmount = Math.max(0, totalExpLoss - totalResidualLoss);
  const activeMitigatingCount = risks.filter(r => r.status === 'mitigating').length;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <ClipboardList className="w-3.5 h-3.5" />
              <span>模块 2 · 全景管理台账</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              风险源识别、分类与全生命周期登记
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              多维度构建政治、技术、经济与管理风险登记册，覆盖“识别 $\to$ 评估 $\to$ 缓解 $\to$ 监测 $\to$ 关闭”全生命周期状态追踪。
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-xs self-start sm:self-center"
          >
            <Plus className="w-4 h-4" />
            <span>登记新风险</span>
          </button>
        </div>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">系统风险总项数</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">{risks.length}</span>
            <span className="text-xs text-slate-400">项</span>
          </div>
          <span className="text-[11px] text-slate-400 block mt-1">覆盖6大专业类别</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">初始期望总损失 E(R)</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold text-slate-900 font-mono">
              {Math.round(totalExpLoss).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">万元</span>
          </div>
          <span className="text-[11px] text-rose-500 block mt-1">∑(P × 潜在暴露损失)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">预期对冲后残余损失</span>
          <div className="flex items-baseline space-x-1.5 mt-1">
            <span className="text-2xl font-bold text-emerald-700 font-mono">
              {Math.round(totalResidualLoss).toLocaleString()}
            </span>
            <span className="text-xs text-slate-500">万元</span>
          </div>
          <div className="flex items-center text-[11px] text-emerald-600 space-x-1 mt-1">
            <TrendingDown className="w-3 h-3" />
            <span>减损 {totalExpLoss > 0 ? ((reductionAmount / totalExpLoss) * 100).toFixed(0) : 0}%</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block">缓解实施中攻坚项</span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-indigo-700 font-mono">{activeMitigatingCount}</span>
            <span className="text-xs text-slate-400">项执行中</span>
          </div>
          <span className="text-[11px] text-indigo-600 block mt-1">设立责任人与对策</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center flex-1 min-w-[240px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="搜索风险编号、标题、责任人..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 flex-wrap">
          <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <Filter className="w-3.5 h-3.5 text-slate-400 mr-1.5" />
            <span className="text-slate-400 mr-1">分类:</span>
            <select
              aria-label="筛选风险分类"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">全部专业类别</option>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-xs text-slate-600 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-slate-400 mr-1">生命周期:</span>
            <select
              aria-label="筛选生命周期状态"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">全生命周期阶段</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Risk Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">编号 / 类别</th>
                <th className="py-3 px-4">风险源与描述</th>
                <th className="py-3 px-3 text-center">概率 P</th>
                <th className="py-3 px-3 text-right">暴露损失</th>
                <th className="py-3 px-3 text-right">期望损失 E(R)</th>
                <th className="py-3 px-4 text-center">生命周期</th>
                <th className="py-3 px-4">应对策略与责任人</th>
                <th className="py-3 px-4 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRisks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    暂未找到匹配的风险项，可点击右上角“登记新风险”添加。
                  </td>
                </tr>
              ) : (
                filteredRisks.map((item) => {
                  const cat = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.technical;
                  const stat = STATUS_LABELS[item.status] || STATUS_LABELS.identified;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-mono font-bold text-slate-900">{item.code}</div>
                        <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded border mt-0.5 font-medium ${cat.color} ${cat.border}`}>
                          {cat.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-semibold text-slate-800 text-xs mb-0.5">{item.title}</div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        <div className="text-[10px] text-slate-400 mt-1">
                          源头: {item.source}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center whitespace-nowrap font-mono">
                        <span className="font-semibold text-slate-800">
                          {(item.probability * 100).toFixed(0)}%
                        </span>
                        {item.residualProbability && (
                          <div className="text-[10px] text-emerald-600 flex items-center justify-center space-x-0.5">
                            <span>→ {(item.residualProbability * 100).toFixed(0)}%</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono text-slate-800">
                        {item.monetaryImpact.toLocaleString()} 万
                      </td>

                      <td className="py-3 px-3 text-right whitespace-nowrap font-mono">
                        <span className="font-bold text-rose-700">
                          {Math.round(item.expectedLoss).toLocaleString()} 万
                        </span>
                        {item.residualExpectedLoss !== undefined && (
                          <div className="text-[10px] text-emerald-600">
                            残余: {Math.round(item.residualExpectedLoss).toLocaleString()} 万
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${stat.badge}`}>
                          {stat.label}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-[11px] text-slate-700 line-clamp-2 leading-relaxed">
                          {item.mitigationStrategy || '未录入具体缓解对策'}
                        </p>
                        <div className="text-[10px] text-indigo-700 font-medium mt-0.5">
                          责任人: {item.owner || '待指派'}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1.5">
                          <button
                            onClick={() => openEditModal(item)}
                            title="编辑修改"
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteRisk(item.id)}
                            title="删除"
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{editingRisk ? '编辑风险台账' : '登记新系统风险源'}</span>
              <span className="text-xs font-mono text-slate-400">{formCode}</span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">风险编号</label>
                  <input
                    type="text"
                    required
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">专业类别</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as RiskCategory)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">风险名称 / 标题</label>
                <input
                  type="text"
                  required
                  placeholder="例如: 芯片代工厂突发断电批次报废"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">风险源与诱因机理</label>
                <input
                  type="text"
                  placeholder="例如: 区域电网过载、老旧变压器跳闸"
                  value={formSource}
                  onChange={(e) => setFormSource(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">详细描述与潜在系统影响</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="详细说明对系统工期、安全性、财务成本造成的冲击..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">发生概率 P (0~1)</label>
                  <input
                    type="number"
                    min="0.01"
                    max="1"
                    step="0.01"
                    value={formProbability}
                    onChange={(e) => setFormProbability(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">严酷度 I (1~10)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formImpact}
                    onChange={(e) => setFormImpact(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-2 py-1 rounded border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">暴露损失 (万元)</label>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={formMonetaryImpact}
                    onChange={(e) => setFormMonetaryImpact(parseFloat(e.target.value) || 0)}
                    className="w-full px-2 py-1 rounded border border-slate-300 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">应对与缓解对策</label>
                <textarea
                  rows={2}
                  value={formMitigation}
                  onChange={(e) => setFormMitigation(e.target.value)}
                  placeholder="具体的技术冗余、合同规避、金融对冲或应急预案..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">生命周期阶段</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as LifecycleStatus)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    {Object.entries(STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">指定责任人</label>
                  <input
                    type="text"
                    value={formOwner}
                    onChange={(e) => setFormOwner(e.target.value)}
                    placeholder="姓名或工程岗位"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
                >
                  保存台账
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
