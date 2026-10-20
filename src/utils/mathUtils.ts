import { ActionPriority, DistributionType, SimulationParams, SimulationResult } from '../types/risk';

/**
 * Determine AIAG-VDA Action Priority (AP: High, Medium, Low)
 * based on Severity (S), Occurrence (O), Detection (D)
 */
export function calculateActionPriority(s: number, o: number, d: number): ActionPriority {
  // AIAG-VDA Standard rules
  if (s >= 9) {
    if (o >= 4) return 'High';
    if (o >= 2) return d >= 5 ? 'High' : 'Medium';
    return d >= 7 ? 'Medium' : 'Low';
  }
  if (s >= 7) {
    if (o >= 6) return 'High';
    if (o >= 4) return d >= 5 ? 'High' : 'Medium';
    if (o >= 2) return d >= 7 ? 'Medium' : 'Low';
    return 'Low';
  }
  if (s >= 4) {
    if (o >= 8) return 'High';
    if (o >= 6) return d >= 5 ? 'High' : 'Medium';
    if (o >= 4) return d >= 7 ? 'Medium' : 'Low';
    return 'Low';
  }
  // s <= 3
  if (o >= 8 && d >= 5) return 'Medium';
  return 'Low';
}

/**
 * Box-Muller transform for standard Normal distribution N(0,1)
 */
function sampleStandardNormal(): number {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Sample Beta-PERT distribution with min (a), mode (b), max (c)
 * Using standard 4-weight approximation for Beta distribution
 */
function samplePert(a: number, b: number, c: number): number {
  if (a >= c) return b;
  const alpha = 1 + 4 * ((b - a) / (c - a));
  const beta = 1 + 4 * ((c - b) / (c - a));
  
  // Approximate beta sample using Jöhnk's or Ahrens-Dieter method
  // For lightweight simulation in browser, we can use gamma ratio:
  const gamma1 = sampleGamma(alpha, 1);
  const gamma2 = sampleGamma(beta, 1);
  const betaSample = gamma1 / (gamma1 + gamma2 || 1);
  return a + betaSample * (c - a);
}

/**
 * Marsaglia & Tsang method for Gamma distribution sampling
 */
function sampleGamma(alpha: number, beta: number): number {
  if (alpha < 1) {
    return sampleGamma(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
  }
  const d = alpha - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  while (true) {
    const z = sampleStandardNormal();
    const v = 1 + c * z;
    if (v <= 0) continue;
    const v3 = v * v * v;
    const u = Math.random();
    if (u < 1 - 0.0331 * z * z * z * z) {
      return (d * v3) / beta;
    }
    if (Math.log(u) < 0.5 * z * z + d * (1 - v3 + Math.log(v3))) {
      return (d * v3) / beta;
    }
  }
}

/**
 * Sample Triangular distribution with min (a), mode (c), max (b)
 */
function sampleTriangular(a: number, c: number, b: number): number {
  if (a >= b) return c;
  const u = Math.random();
  const fc = (c - a) / (b - a);
  if (u < fc) {
    return a + Math.sqrt(u * (b - a) * (c - a));
  } else {
    return b - Math.sqrt((1 - u) * (b - a) * (b - c));
  }
}

/**
 * Core Monte Carlo Simulation Runner
 */
export function runMonteCarloSimulation(params: SimulationParams): SimulationResult {
  const { iterations, distributionType, minLoss, modeLoss, maxLoss, targetConfidence, budgetBaseline } = params;
  const samples: number[] = new Array(iterations);

  const meanNorm = modeLoss;
  const stdNorm = Math.max(1, (maxLoss - minLoss) / 6);

  for (let i = 0; i < iterations; i++) {
    let val = 0;
    switch (distributionType) {
      case 'triangular':
        val = sampleTriangular(minLoss, modeLoss, maxLoss);
        break;
      case 'normal':
        val = meanNorm + sampleStandardNormal() * stdNorm;
        val = Math.max(0, val);
        break;
      case 'pert':
        val = samplePert(minLoss, modeLoss, maxLoss);
        break;
      case 'lognormal': {
        const m = Math.max(1, modeLoss);
        const s = Math.max(0.1, (maxLoss - minLoss) / (4 * m));
        const mu = Math.log(m);
        val = Math.exp(mu + sampleStandardNormal() * s);
        break;
      }
      case 'uniform':
        val = minLoss + Math.random() * (maxLoss - minLoss);
        break;
      default:
        val = samplePert(minLoss, modeLoss, maxLoss);
    }
    samples[i] = val;
  }

  // Sort samples ascending for quantile analysis
  samples.sort((a, b) => a - b);

  // Mean & Variance
  let sum = 0;
  for (let i = 0; i < iterations; i++) sum += samples[i];
  const mean = sum / iterations;

  let varSum = 0;
  for (let i = 0; i < iterations; i++) {
    const diff = samples[i] - mean;
    varSum += diff * diff;
  }
  const variance = varSum / iterations;
  const stdDev = Math.sqrt(variance);

  // Percentiles
  const getQuantile = (q: number) => {
    const idx = Math.min(iterations - 1, Math.max(0, Math.floor(q * iterations)));
    return samples[idx];
  };

  const p10 = getQuantile(0.10);
  const p50 = getQuantile(0.50);
  const p80 = getQuantile(0.80);
  const p90 = getQuantile(0.90);
  const p95 = getQuantile(0.95);
  const p99 = getQuantile(0.99);

  // VaR 95% (95th percentile of loss)
  const var95 = p95;

  // CVaR 95% (Expected Shortfall: average of top 5% worst outcomes)
  const tailStartIndex = Math.floor(0.95 * iterations);
  let tailSum = 0;
  let tailCount = 0;
  for (let i = tailStartIndex; i < iterations; i++) {
    tailSum += samples[i];
    tailCount++;
  }
  const cvar95 = tailCount > 0 ? tailSum / tailCount : var95;

  // Histogram Bins (35 bins)
  const binCount = 35;
  const minVal = samples[0];
  const maxVal = samples[iterations - 1];
  const binWidth = (maxVal - minVal) / binCount || 1;

  const histogramBins = [];
  for (let b = 0; b < binCount; b++) {
    const x0 = minVal + b * binWidth;
    const x1 = x0 + binWidth;
    histogramBins.push({ x0, x1, count: 0, freq: 0 });
  }

  for (let i = 0; i < iterations; i++) {
    const v = samples[i];
    const bIdx = Math.min(binCount - 1, Math.floor((v - minVal) / binWidth));
    if (bIdx >= 0 && bIdx < binCount) {
      histogramBins[bIdx].count++;
    }
  }

  for (let b = 0; b < binCount; b++) {
    histogramBins[b].freq = histogramBins[b].count / iterations;
  }

  // CDF S-Curve (50 downsampled points)
  const cdfPoints = [];
  const step = Math.max(1, Math.floor(iterations / 60));
  for (let i = 0; i < iterations; i += step) {
    cdfPoints.push({
      x: samples[i],
      y: (i + 1) / iterations,
    });
  }
  // Ensure last point is 1.0
  cdfPoints.push({
    x: samples[iterations - 1],
    y: 1.0,
  });

  const targetP = targetConfidence >= 0.9 ? p90 : p80;
  const contingencyReserveGap = Math.max(0, targetP - budgetBaseline);

  return {
    mean,
    variance,
    stdDev,
    p10,
    p50,
    p80,
    p90,
    p95,
    p99,
    var95,
    cvar95,
    histogramBins,
    cdfPoints,
    contingencyReserveGap,
  };
}

/**
 * Generate production-grade Python/NumPy simulation code
 * Designed to run 100% independently outside the project (terminal, VSCode, PyCharm, Jupyter, etc.)
 */
export function generatePythonScript(params: SimulationParams, title: string = '系统风险蒙特卡洛仿真'): string {
  return `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
=============================================================================
  ${title}
  Python / NumPy / SciPy 蒙特卡洛仿真与风险置信区间独立评估脚本
  评估标准: ISO 31000 / PMBOK / IEC 60812
=============================================================================
【独立运行指南】
1. 安装依赖:
   pip install numpy scipy matplotlib

2. 运行脚本:
   python monte_carlo_risk_simulation.py
   (或直接在 Jupyter Notebook / VSCode / PyCharm 中执行)
=============================================================================
"""

import sys
import os

# 1. 针对无图形界面的服务器/容器环境（Linux 无 DISPLAY）配置 Agg 后端避免崩溃
if sys.platform.startswith('linux') and not os.environ.get('DISPLAY'):
    try:
        import matplotlib
        matplotlib.use('Agg')
    except Exception:
        pass

# 2. 依赖完整性自检与友好提示
try:
    import numpy as np
    import scipy.stats as stats
    import matplotlib.pyplot as plt
except ImportError as err:
    print("\\n" + "=" * 68)
    print("【环境提示】运行此独立脚本需预先安装科学计算与可视化依赖库。")
    print("请在您的操作系统终端 (Terminal / CMD / PowerShell) 中运行以下命令：")
    print("    pip install numpy scipy matplotlib")
    print("=" * 68 + "\\n")
    sys.exit(1)

# 2. 跨平台中文字体自适应配置 (彻底解决 macOS / Windows / Linux 图表方块乱码 □□□ 问题)
plt.rcParams['font.sans-serif'] = [
    'SimHei',            # Windows 经典黑体
    'Microsoft YaHei',    # Windows 微软雅黑
    'PingFang SC',       # macOS 苹方
    'Heiti SC',          # macOS 黑体
    'WenQuanYi Zen Hei', # Linux 文泉驿正黑
    'Noto Sans CJK SC',  # Linux/Android 思源黑体
    'DejaVu Sans',       # 兜底英文字体
    'sans-serif'
]
plt.rcParams['axes.unicode_minus'] = False  # 确保负号 '-' 正常显示而非变方块

def run_monte_carlo_risk_simulation(
    iterations: int = ${params.iterations},
    dist_type: str = '${params.distributionType}',
    min_loss: float = ${params.minLoss},
    mode_loss: float = ${params.modeLoss},
    max_loss: float = ${params.maxLoss},
    budget_baseline: float = ${params.budgetBaseline},
    seed: int = 42,
    save_chart_path: str = 'monte_carlo_risk_simulation_chart.png'
):
    """
    运行基于 NumPy/SciPy 的数万次风险蒙特卡洛抽样与置信区间分析
    
    参数:
        iterations: 抽样迭代次数 (推荐 10,000 ~ 50,000)
        dist_type: 先验概率分布 ('pert' | 'triangular' | 'normal' | 'lognormal' | 'uniform')
        min_loss: 乐观最小损失 (万元)
        mode_loss: 最可能损失 (万元)
        max_loss: 悲观极端损失 (万元)
        budget_baseline: 当前预算/备用金基准线 (万元)
        seed: 随机数发生器种子 (确保结果可复现)
        save_chart_path: 输出高清图表本地路径
        
    返回:
        包含全部核心指标字典以及原始抽样数组
    """
    np.random.seed(seed)
    
    # 1. 严格概率分布随机数生成
    if dist_type == 'triangular':
        # 三角分布三点估算
        c = (mode_loss - min_loss) / (max_loss - min_loss) if max_loss > min_loss else 0.5
        samples = stats.triang.rvs(c, loc=min_loss, scale=max_loss - min_loss, size=iterations)
    elif dist_type == 'pert':
        # Beta-PERT 分布: shape1 = alpha, shape2 = beta (工程界经典 4 加权模式)
        if max_loss > min_loss:
            alpha = 1.0 + 4.0 * (mode_loss - min_loss) / (max_loss - min_loss)
            beta = 1.0 + 4.0 * (max_loss - mode_loss) / (max_loss - min_loss)
            samples = min_loss + stats.beta.rvs(alpha, beta, size=iterations) * (max_loss - min_loss)
        else:
            samples = np.full(iterations, mode_loss)
    elif dist_type == 'normal':
        mean = mode_loss
        std = (max_loss - min_loss) / 6.0 if max_loss > min_loss else 1.0
        samples = np.random.normal(mean, std, size=iterations)
        samples = np.clip(samples, a_min=0, a_max=None)
    elif dist_type == 'lognormal':
        m = max(1.0, mode_loss)
        sigma = max(0.1, (max_loss - min_loss) / (4.0 * m))
        mu = np.log(m)
        samples = np.random.lognormal(mu, sigma, size=iterations)
    else: # uniform
        samples = np.random.uniform(min_loss, max_loss, size=iterations)

    # 2. 统计指标与关键分位数计算
    mean_val = float(np.mean(samples))
    std_val = float(np.std(samples, ddof=1))
    variance_val = float(np.var(samples, ddof=1))
    
    p10 = float(np.percentile(samples, 10))
    p50 = float(np.percentile(samples, 50))
    p80 = float(np.percentile(samples, 80))
    p90 = float(np.percentile(samples, 90))
    p95 = float(np.percentile(samples, 95))
    p99 = float(np.percentile(samples, 99))

    # 3. 极端尾部风险测度: VaR (95%) 与 CVaR (95% 条件期望损失 / Expected Shortfall)
    var95 = p95
    tail_losses = samples[samples >= var95]
    cvar95 = float(np.mean(tail_losses)) if len(tail_losses) > 0 else var95
    
    # 4. 科学备用金缺口 (Contingency Reserve Gap)
    p80_gap = max(0.0, p80 - budget_baseline)
    p90_gap = max(0.0, p90 - budget_baseline)

    # 5. 格式化控制台输出
    print("=" * 68)
    print(f" 🎯 蒙特卡洛仿真量化评估结果 [样本量 N = {iterations:,} | 分布: {dist_type.upper()}]")
    print("=" * 68)
    print(f" ▶ 期望损失均值 E(Loss)       : {mean_val:,.2f} 万元")
    print(f" ▶ 损失标准差 Std Dev         : {std_val:,.2f} 万元")
    print(f" ▶ P10 乐观边界损失           : {p10:,.2f} 万元")
    print(f" ▶ P50 中位数损失 (50%置信)   : {p50:,.2f} 万元")
    print(f" ▶ P80 科学安全线 (80%置信)   : {p80:,.2f} 万元  (备用金缺口: {p80_gap:,.2f} 万元)")
    print(f" ▶ P90 极端容灾线 (90%置信)   : {p90:,.2f} 万元  (备用金缺口: {p90_gap:,.2f} 万元)")
    print(f" ▶ 风险价值 VaR (95%置信)     : {var95:,.2f} 万元")
    print(f" ▶ 条件期望损失 CVaR (95%ES)  : {cvar95:,.2f} 万元")
    print("=" * 68)

    # 6. 高清双联图表绘制: PDF直方图 与 CDF累积S曲线
    fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5.5), dpi=100)
    
    # 子图1: 概率密度直方图 (PDF)
    n, bins, patches = ax1.hist(
        samples, bins=50, density=True, alpha=0.68, color='#4338ca', edgecolor='white', linewidth=0.8
    )
    ax1.axvline(p50, color='#10b981', linestyle='--', linewidth=2, label=f'P50 (中位数): {p50:,.1f}万')
    ax1.axvline(p80, color='#f59e0b', linestyle='--', linewidth=2.2, label=f'P80 (安全线): {p80:,.1f}万')
    ax1.axvline(p90, color='#ef4444', linestyle='-', linewidth=2.5, label=f'P90 (容灾红线): {p90:,.1f}万')
    
    if budget_baseline >= np.min(samples) and budget_baseline <= np.max(samples):
        ax1.axvline(budget_baseline, color='#0284c7', linestyle=':', linewidth=2, label=f'现有预算: {budget_baseline:,.1f}万')
        
    ax1.set_title('损失概率密度函数 (PDF) 与区间分布', fontsize=12, fontweight='bold', pad=12)
    ax1.set_xlabel('潜在损失规模 (万元)', fontsize=10)
    ax1.set_ylabel('概率密度 (Probability Density)', fontsize=10)
    ax1.legend(loc='upper right', frameon=True, fontsize=9)
    ax1.grid(True, linestyle='--', alpha=0.3)

    # 子图2: 累积概率分布 S-Curve (CDF)
    sorted_data = np.sort(samples)
    yvals = np.arange(len(sorted_data)) / float(len(sorted_data) - 1)
    
    ax2.plot(sorted_data, yvals, color='#312e81', linewidth=2.5, label='CDF S-Curve (累积概率曲线)')
    ax2.axhline(0.80, color='#f59e0b', linestyle=':', linewidth=1.5, label='80% 置信界限')
    ax2.axhline(0.90, color='#ef4444', linestyle=':', linewidth=1.5, label='90% 置信界限')
    ax2.axvline(p80, color='#f59e0b', linestyle='--', linewidth=1.5)
    ax2.axvline(p90, color='#ef4444', linestyle='--', linewidth=1.5)
    
    # 标记 P80 与 P90 点位
    ax2.scatter([p80, p90], [0.80, 0.90], color=['#f59e0b', '#ef4444'], s=50, zorder=5)
    
    ax2.set_title('累积概率分布 S-Curve (用于科学决策备用金)', fontsize=12, fontweight='bold', pad=12)
    ax2.set_xlabel('项目总成本 / 损失 (万元)', fontsize=10)
    ax2.set_ylabel('项目不超支概率 P(X <= x)', fontsize=10)
    ax2.set_ylim(-0.02, 1.05)
    ax2.legend(loc='lower right', frameon=True, fontsize=9)
    ax2.grid(True, linestyle='--', alpha=0.3)

    plt.tight_layout()
    
    # 保存高清本地图片 (无GUI服务器/Docker环境下依然能产出结果)
    try:
        plt.savefig(save_chart_path, dpi=300, bbox_inches='tight')
        print(f"📊 分析图表已成功保存至本地: {save_chart_path}")
    except Exception as e:
        print(f"⚠️ 保存图表时发生异常: {e}")

    # 尝试在支持图形交互的环境中弹窗显示
    try:
        plt.show()
    except Exception:
        pass

    return {
        'iterations': iterations,
        'mean': mean_val,
        'std': std_val,
        'variance': variance_val,
        'p10': p10,
        'p50': p50,
        'p80': p80,
        'p90': p90,
        'p95': p95,
        'p99': p99,
        'var95': var95,
        'cvar95': cvar95,
        'p80_gap': p80_gap,
        'p90_gap': p90_gap,
        'samples': samples
    }

if __name__ == '__main__':
    # 执行主仿真例程
    results = run_monte_carlo_risk_simulation()
`;
}
