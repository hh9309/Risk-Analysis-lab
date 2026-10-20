export type RiskCategory = 
  | 'political'     // 政治地缘
  | 'technical'     // 技术与架构
  | 'economic'      // 经济与金融
  | 'management'    // 管理与合规
  | 'supply_chain'  // 供应链与运营
  | 'safety_cyber'; // 安全与工控网安

export type LifecycleStatus = 
  | 'identified'   // 已识别
  | 'assessing'    // 评估中
  | 'mitigating'   // 缓解中
  | 'monitoring'   // 持续监测
  | 'closed';      // 已关闭

export interface RiskItem {
  id: string;
  code: string;
  title: string;
  category: RiskCategory;
  description: string;
  source: string;
  probability: number; // 0.01 - 0.99
  impact: number;      // 1 - 10 (or monetary scale in k$)
  monetaryImpact: number; // in 万元 or k$
  expectedLoss: number;   // probability * monetaryImpact
  variance: number;
  status: LifecycleStatus;
  owner: string;
  mitigationStrategy: string;
  residualProbability: number;
  residualImpact: number;
  residualMonetaryImpact: number;
  residualExpectedLoss: number;
  linkedFmeaId?: string;
  updatedAt: string;
}

export type ActionPriority = 'High' | 'Medium' | 'Low';

export interface FmeaItem {
  id: string;
  code: string;
  subsystem: string;
  failureMode: string;      // 故障模式
  failureCause: string;     // 故障原因
  localEffect: string;      // 局部影响
  systemEffect: string;     // 系统级影响
  severity: number;         // S: 1 - 10 (严酷度)
  occurrence: number;       // O: 1 - 10 (发生频度)
  detection: number;        // D: 1 - 10 (探测难度)
  rpn: number;              // S * O * D (1 - 1000)
  criticalityIndex: number; // S * O
  actionPriority: ActionPriority; // AIAG-VDA AP
  mitigation: string;       // 纠正与预防措施
  postSeverity: number;     // 改进后 S
  postOccurrence: number;   // 改进后 O
  postDetection: number;    // 改进后 D
  postRpn: number;          // 改进后 RPN
  postActionPriority: ActionPriority;
}

export type DistributionType = 
  | 'triangular' 
  | 'normal' 
  | 'pert' 
  | 'lognormal' 
  | 'uniform';

export interface SimulationParams {
  iterations: number;
  distributionType: DistributionType;
  minLoss: number;
  modeLoss: number;
  maxLoss: number;
  correlationCoefficient: number; // 0 - 0.8
  targetConfidence: number;      // e.g. 0.8 (P80) or 0.9 (P90)
  budgetBaseline: number;        // 基准备用金预算
}

export interface SimulationResult {
  mean: number;
  variance: number;
  stdDev: number;
  p10: number;
  p50: number;
  p80: number;
  p90: number;
  p95: number;
  p99: number;
  var95: number;
  cvar95: number;
  histogramBins: { x0: number; x1: number; count: number; freq: number }[];
  cdfPoints: { x: number; y: number }[];
  contingencyReserveGap: number; // P80/P90 minus baseline
}

export interface FaultTreeNode {
  id: string;
  label: string;
  type: 'event' | 'and_gate' | 'or_gate' | 'basic_event';
  probability?: number;
  calculatedProbability?: number;
  children?: FaultTreeNode[];
  description?: string;
}

export interface CaseStudy {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: RiskCategory;
  badge: string;
  background: string;
  coreMechanism: string;
  fmeaFocus: string;
  monteCarloFocus: string;
  defaultRisks: RiskItem[];
  defaultFmea: FmeaItem[];
  defaultSimParams: SimulationParams;
  faultTree?: FaultTreeNode;
  recommendations: string[];
}

export interface KnowledgeSlice {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  summary: string;
  deepDive: string;
  keyFormulas: { name: string; latex: string; explanation: string }[];
  pitfalls: string[];
  actionChecklist: string[];
  svgDiagramType: 'algebra' | 'p80_p90' | 'traps' | 'misconceptions';
}
