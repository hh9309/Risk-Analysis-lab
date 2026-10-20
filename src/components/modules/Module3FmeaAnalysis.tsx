import React, { useState } from 'react';
import { 
  Settings, 
  Plus, 
  Trash2, 
  Edit2, 
  HelpCircle, 
  AlertOctagon, 
  CheckCircle, 
  Sparkles,
  ArrowDownRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { FmeaItem, ActionPriority } from '../../types/risk';
import { calculateActionPriority } from '../../utils/mathUtils';

interface Module3Props {
  fmeaItems: FmeaItem[];
  onAddFmea: (item: FmeaItem) => void;
  onUpdateFmea: (item: FmeaItem) => void;
  onDeleteFmea: (id: string) => void;
}

export const AP_BADGES: Record<ActionPriority, { label: string; bg: string; text: string; border: string }> = {
  High: { label: '高优先 (H)', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-300' },
  Medium: { label: '中优先 (M)', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
  Low: { label: '低优先 (L)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' },
};

export const Module3FmeaAnalysis: React.FC<Module3Props> = ({
  fmeaItems,
  onAddFmea,
  onUpdateFmea,
  onDeleteFmea,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FmeaItem | null>(null);

  // Form states
  const [subsystem, setSubsystem] = useState('');
  const [failureMode, setFailureMode] = useState('');
  const [failureCause, setFailureCause] = useState('');
  const [localEffect, setLocalEffect] = useState('');
  const [systemEffect, setSystemEffect] = useState('');
  const [severity, setSeverity] = useState<number>(8);
  const [occurrence, setOccurrence] = useState<number>(5);
  const [detection, setDetection] = useState<number>(5);
  const [mitigation, setMitigation] = useState('');
  const [postSeverity, setPostSeverity] = useState<number>(8);
  const [postOccurrence, setPostOccurrence] = useState<number>(2);
  const [postDetection, setPostDetection] = useState<number>(2);

  const openAddModal = () => {
    setEditingItem(null);
    setSubsystem('动力控制单元');
    setFailureMode('');
    setFailureCause('');
    setLocalEffect('');
    setSystemEffect('');
    setSeverity(8);
    setOccurrence(5);
    setDetection(5);
    setMitigation('');
    setPostSeverity(8);
    setPostOccurrence(2);
    setPostDetection(2);
    setIsModalOpen(true);
  };

  const openEditModal = (item: FmeaItem) => {
    setEditingItem(item);
    setSubsystem(item.subsystem);
    setFailureMode(item.failureMode);
    setFailureCause(item.failureCause);
    setLocalEffect(item.localEffect);
    setSystemEffect(item.systemEffect);
    setSeverity(item.severity);
    setOccurrence(item.occurrence);
    setDetection(item.detection);
    setMitigation(item.mitigation);
    setPostSeverity(item.postSeverity || item.severity);
    setPostOccurrence(item.postOccurrence || Math.max(1, item.occurrence - 3));
    setPostDetection(item.postDetection || Math.max(1, item.detection - 3));
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const rpn = severity * occurrence * detection;
    const ap = calculateActionPriority(severity, occurrence, detection);
    const postRpn = postSeverity * postOccurrence * postDetection;
    const postAp = calculateActionPriority(postSeverity, postOccurrence, postDetection);

    const newItem: FmeaItem = {
      id: editingItem ? editingItem.id : `fmea-${Date.now()}`,
      code: editingItem ? editingItem.code : `FM-${Date.now().toString().slice(-4)}`,
      subsystem,
      failureMode,
      failureCause,
      localEffect,
      systemEffect,
      severity,
      occurrence,
      detection,
      rpn,
      criticalityIndex: severity * occurrence,
      actionPriority: ap,
      mitigation,
      postSeverity,
      postOccurrence,
      postDetection,
      postRpn,
      postActionPriority: postAp,
    };

    if (editingItem) {
      onUpdateFmea(newItem);
    } else {
      onAddFmea(newItem);
    }
    setIsModalOpen(false);
  };

  // High Severity Items warning
  const highSeverityCount = fmeaItems.filter(f => f.severity >= 9).length;
  const highRpnCount = fmeaItems.filter(f => f.rpn >= 150).length;

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100 mb-2">
              <Settings className="w-3.5 h-3.5" />
              <span>模块 3 · 工业工程可靠性核心</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              FMEA 故障模式与影响分析
            </h2>
            <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              严酷度 ($S$)、频度 ($O$) 与探测度 ($D$) 三维动态评分矩阵，集成传统 $RPN = S \times O \times D$ 与新版 AIAG-VDA 动作优先级 (AP) 判决。
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="inline-flex items-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-medium transition"
            >
              <HelpCircle className="w-4 h-4 text-slate-500" />
              <span>S-O-D评分量规表</span>
            </button>
            <button
              onClick={openAddModal}
              className="inline-flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>新增故障模式</span>
            </button>
          </div>
        </div>
      </div>

      {/* Critical Severity Advisory Banner if S >= 9 */}
      {highSeverityCount > 0 && (
        <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-bold text-rose-900 block">
              检测到 {highSeverityCount} 项严酷度 S ≥ 9 的极端致命隐患！
            </span>
            <p className="text-rose-700 mt-0.5 leading-relaxed">
              根据系统安全工程与 AIAG-VDA 最新准则：凡严酷度 $S \ge 9$（涉及人身生命安全或国家级基础设施彻底崩溃），
              <strong>无论频度 O 与探测度 D 评分为何，均强制执行最高动作优先级 (AP: High)</strong>，严禁通过调低频度掩盖单点致命风险！
            </p>
          </div>
        </div>
      )}

      {/* S-O-D Reference Guide Popover Drawer */}
      {showGuide && (
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 text-xs space-y-4 border border-slate-800">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-indigo-300 flex items-center space-x-2">
              <Info className="w-4 h-4" />
              <span>标准 S-O-D (1~10) 工业评分参考量规体系</span>
            </h4>
            <button
              onClick={() => setShowGuide(false)}
              className="text-slate-400 hover:text-white"
            >
              关闭
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="font-semibold text-rose-400 block">严酷度 S (Severity)</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-rose-300">9-10</strong>: 致命危险（涉及人员伤亡或法规强制违规）</li>
                <li><strong className="text-amber-300">7-8</strong>: 主功能丧失（系统完全停止运行，无法自愈）</li>
                <li><strong className="text-yellow-300">4-6</strong>: 次功能降级（系统性能下降，客户强烈抱怨）</li>
                <li><strong className="text-emerald-300">1-3</strong>: 轻微外观或极小扰动（几乎不影响正常使用）</li>
              </ul>
            </div>

            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="font-semibold text-amber-400 block">发生频度 O (Occurrence)</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-rose-300">9-10</strong>: 极高频（&gt;10%失效率，几乎确定会发生）</li>
                <li><strong className="text-amber-300">7-8</strong>: 高频（约2%~5%失效率，反复重现）</li>
                <li><strong className="text-yellow-300">4-6</strong>: 中等概率（偶尔发生，有类似前科）</li>
                <li><strong className="text-emerald-300">1-3</strong>: 极低（&lt;0.01%，历史极少或无故障记录）</li>
              </ul>
            </div>

            <div className="space-y-1.5 bg-slate-800/60 p-3 rounded-lg border border-slate-700">
              <span className="font-semibold text-teal-400 block">探测难度 D (Detection)</span>
              <ul className="space-y-1 text-slate-300 text-[11px]">
                <li><strong className="text-rose-300">9-10</strong>: 几乎不可探测（暗病无前兆，潜伏破坏）</li>
                <li><strong className="text-amber-300">7-8</strong>: 极低几率检测（需拆机破坏性分析才发现）</li>
                <li><strong className="text-yellow-300">4-6</strong>: 中度可检（通过定期巡检或人工测试发现）</li>
                <li><strong className="text-emerald-300">1-3</strong>: 极易自动探测（在线双传感器实时告警）</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Main FMEA Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-700 font-semibold">
                <th className="py-3 px-3">子系统 / 编号</th>
                <th className="py-3 px-3">潜在故障模式与根本诱因</th>
                <th className="py-3 px-3">局部与系统级影响</th>
                <th className="py-3 px-2 text-center">S</th>
                <th className="py-3 px-2 text-center">O</th>
                <th className="py-3 px-2 text-center">D</th>
                <th className="py-3 px-2 text-center font-mono">RPN</th>
                <th className="py-3 px-2 text-center">优先 AP</th>
                <th className="py-3 px-3">改进对策与优化后 RPN</th>
                <th className="py-3 px-3 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {fmeaItems.map((item) => {
                const apBadge = AP_BADGES[item.actionPriority] || AP_BADGES.Medium;
                const rpnColor = item.rpn >= 200 ? 'text-rose-600 bg-rose-50' : item.rpn >= 100 ? 'text-amber-600 bg-amber-50' : 'text-slate-800 bg-slate-50';
                const rpnDelta = item.rpn - item.postRpn;
                const rpnReductionPct = item.rpn > 0 ? Math.round((rpnDelta / item.rpn) * 100) : 0;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.subsystem}</div>
                      <span className="font-mono text-[10px] text-slate-400">{item.code}</span>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-800 mb-0.5">{item.failureMode}</div>
                      <p className="text-[11px] text-slate-500">
                        <span className="text-slate-400">诱因:</span> {item.failureCause}
                      </p>
                    </td>

                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-[11px] text-slate-700">
                        <span className="text-slate-400">局部:</span> {item.localEffect}
                      </div>
                      <div className="text-[11px] text-rose-700 mt-0.5 font-medium">
                        <span className="text-slate-400">系统:</span> {item.systemEffect}
                      </div>
                    </td>

                    {/* S, O, D scores */}
                    <td className="py-3 px-2 text-center font-mono">
                      <span className={`inline-block px-1.5 py-0.5 rounded font-bold ${item.severity >= 9 ? 'bg-rose-100 text-rose-800' : 'text-slate-700'}`}>
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-700">
                      {item.occurrence}
                    </td>
                    <td className="py-3 px-2 text-center font-mono text-slate-700">
                      {item.detection}
                    </td>

                    {/* Initial RPN */}
                    <td className="py-3 px-2 text-center font-mono whitespace-nowrap">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${rpnColor}`}>
                        {item.rpn}
                      </span>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        Cr={item.criticalityIndex || item.severity * item.occurrence}
                      </div>
                    </td>

                    {/* AIAG-VDA Action Priority */}
                    <td className="py-3 px-2 text-center whitespace-nowrap">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-semibold ${apBadge.bg} ${apBadge.text} ${apBadge.border}`}>
                        {apBadge.label}
                      </span>
                    </td>

                    {/* Mitigation & Residual RPN */}
                    <td className="py-3 px-3 max-w-xs">
                      <div className="text-[11px] text-slate-800 mb-1 leading-relaxed">
                        {item.mitigation || '待制定纠正与预防措施'}
                      </div>
                      {item.postRpn ? (
                        <div className="flex items-center space-x-2 text-[10px] bg-slate-50 p-1.5 rounded border border-slate-200">
                          <span className="text-slate-500 font-mono">
                            优化后: S{item.postSeverity}-O{item.postOccurrence}-D{item.postDetection}
                          </span>
                          <span className="font-bold text-emerald-700 font-mono">
                            RPN={item.postRpn}
                          </span>
                          <span className="text-emerald-600 font-semibold">
                            (↓{rpnReductionPct}%)
                          </span>
                        </div>
                      ) : null}
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded transition"
                          title="编辑评分与对策"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFmea(item.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                          title="删除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit FMEA Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl border border-slate-200 overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>{editingItem ? '编辑 FMEA 故障模式' : '新增 FMEA 故障模式分析项'}</span>
              <span className="text-xs text-indigo-600 font-mono">
                当前RPN: {severity * occurrence * detection}
              </span>
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">所属子系统 / 模块</label>
                  <input
                    type="text"
                    required
                    value={subsystem}
                    onChange={(e) => setSubsystem(e.target.value)}
                    placeholder="例如: 推进系统、激光雷达感知层"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">故障模式 (Failure Mode)</label>
                  <input
                    type="text"
                    required
                    value={failureMode}
                    onChange={(e) => setFailureMode(e.target.value)}
                    placeholder="例如: 轴承过热抱死、电芯隔膜穿孔"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">故障根因机理 (Failure Cause)</label>
                <input
                  type="text"
                  required
                  value={failureCause}
                  onChange={(e) => setFailureCause(e.target.value)}
                  placeholder="例如: 润滑油脂高温碳化、超高温应力集中"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-medium mb-1">局部影响 (Local Effect)</label>
                  <input
                    type="text"
                    value={localEffect}
                    onChange={(e) => setLocalEffect(e.target.value)}
                    placeholder="对本部件的直接损坏"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-medium mb-1">系统级影响 (System Effect)</label>
                  <input
                    type="text"
                    value={systemEffect}
                    onChange={(e) => setSystemEffect(e.target.value)}
                    placeholder="对整个装备或交付任务的波及"
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* S, O, D Sliders */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3">
                <span className="font-semibold text-slate-800 block text-xs">
                  初始三维评分 (S × O × D)
                </span>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>严酷度 S:</span>
                      <span className="font-bold font-mono text-rose-600">{severity}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={severity}
                      onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                      className="w-full accent-rose-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>发生频度 O:</span>
                      <span className="font-bold font-mono text-amber-600">{occurrence}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={occurrence}
                      onChange={(e) => setOccurrence(parseInt(e.target.value, 10))}
                      className="w-full accent-amber-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>探测难度 D:</span>
                      <span className="font-bold font-mono text-teal-600">{detection}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={detection}
                      onChange={(e) => setDetection(parseInt(e.target.value, 10))}
                      className="w-full accent-teal-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">纠正与预防措施</label>
                <textarea
                  rows={2}
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  placeholder="物理硬件双冗余、防呆设计(Poka-Yoke)、在线状态传感器..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Post Mitigation S-O-D */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-emerald-900 block text-xs">
                    措施落地后预期残余评分 (Residual S-O-D)
                  </span>
                  <span className="font-mono text-xs font-bold text-emerald-800">
                    预期残余 RPN: {postSeverity * postOccurrence * postDetection}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="flex justify-between text-emerald-800 mb-1">
                      <span>后严酷度 S:</span>
                      <span className="font-bold font-mono">{postSeverity}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postSeverity}
                      onChange={(e) => setPostSeverity(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-emerald-800 mb-1">
                      <span>后发生频度 O:</span>
                      <span className="font-bold font-mono">{postOccurrence}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postOccurrence}
                      onChange={(e) => setPostOccurrence(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-emerald-800 mb-1">
                      <span>后探测难度 D:</span>
                      <span className="font-bold font-mono">{postDetection}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={postDetection}
                      onChange={(e) => setPostDetection(parseInt(e.target.value, 10))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>
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
                  保存分析项
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
