import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FloatingAiChat } from './components/FloatingAiChat';
import { INITIAL_CASES } from './data/initialCases';
import { CaseStudy, RiskItem, FmeaItem, SimulationParams, SimulationResult } from './types/risk';
import { runMonteCarloSimulation } from './utils/mathUtils';

// 10 Core Modules
import { Module1RiskAlgebra } from './components/modules/Module1RiskAlgebra';
import { Module2RiskRegister } from './components/modules/Module2RiskRegister';
import { Module3FmeaAnalysis } from './components/modules/Module3FmeaAnalysis';
import { Module4RiskMatrix } from './components/modules/Module4RiskMatrix';
import { Module5CaseLibrary } from './components/modules/Module5CaseLibrary';
import { Module6MonteCarloEngine } from './components/modules/Module6MonteCarloEngine';
import { Module7AiAdvisor } from './components/modules/Module7AiAdvisor';
import { Module8GuidedWorkflow } from './components/modules/Module8GuidedWorkflow';
import { Module9ReportExport } from './components/modules/Module9ReportExport';
import { Module10KnowledgeSlices } from './components/modules/Module10KnowledgeSlices';
import { Sparkles } from 'lucide-react';

export default function App() {
  const [activeModule, setActiveModule] = useState<number>(1);
  const [activeCaseId, setActiveCaseId] = useState<string>('case-epc-overseas');
  const [isAiChatOpen, setIsAiChatOpen] = useState<boolean>(false);

  // Active Case Data in Workspace
  const currentCase = useMemo(() => {
    return INITIAL_CASES.find(c => c.id === activeCaseId) || INITIAL_CASES[0];
  }, [activeCaseId]);

  const [risks, setRisks] = useState<RiskItem[]>(currentCase.defaultRisks);
  const [fmeaItems, setFmeaItems] = useState<FmeaItem[]>(currentCase.defaultFmea);
  const [simParams, setSimParams] = useState<SimulationParams>(currentCase.defaultSimParams);

  // Simulation Result
  const simResult: SimulationResult = useMemo(() => {
    return runMonteCarloSimulation(simParams);
  }, [simParams]);

  // Handle Case Switching
  const handleSelectCase = (caseId: string) => {
    const targetCase = INITIAL_CASES.find(c => c.id === caseId);
    if (targetCase) {
      setActiveCaseId(caseId);
      setRisks(targetCase.defaultRisks);
      setFmeaItems(targetCase.defaultFmea);
      setSimParams(targetCase.defaultSimParams);
    }
  };

  // Reset current case to defaults
  const handleResetCase = () => {
    setRisks(currentCase.defaultRisks);
    setFmeaItems(currentCase.defaultFmea);
    setSimParams(currentCase.defaultSimParams);
  };

  // Risk Item CRUD
  const handleAddRisk = (item: RiskItem) => {
    setRisks(prev => [item, ...prev]);
  };

  const handleUpdateRisk = (item: RiskItem) => {
    setRisks(prev => prev.map(r => r.id === item.id ? item : r));
  };

  const handleDeleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  // FMEA Item CRUD
  const handleAddFmea = (item: FmeaItem) => {
    setFmeaItems(prev => [item, ...prev]);
  };

  const handleUpdateFmea = (item: FmeaItem) => {
    setFmeaItems(prev => prev.map(f => f.id === item.id ? item : f));
  };

  const handleDeleteFmea = (id: string) => {
    setFmeaItems(prev => prev.filter(f => f.id !== id));
  };

  const highRpnCount = fmeaItems.filter(f => (f.rpn || f.severity * f.occurrence * f.detection) > 150).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Header Navigation */}
      <Header
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        cases={INITIAL_CASES}
        activeCaseId={activeCaseId}
        onSelectCase={handleSelectCase}
        onResetCase={handleResetCase}
        totalRisks={risks.length}
        highRpnCount={highRpnCount}
        p80Value={simResult.p80}
        onOpenAiChat={() => setIsAiChatOpen(true)}
        onOpenExport={() => setActiveModule(9)}
      />

      {/* Main Module Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeModule === 1 && <Module1RiskAlgebra />}
        {activeModule === 2 && (
          <Module2RiskRegister
            risks={risks}
            onAddRisk={handleAddRisk}
            onUpdateRisk={handleUpdateRisk}
            onDeleteRisk={handleDeleteRisk}
          />
        )}
        {activeModule === 3 && (
          <Module3FmeaAnalysis
            fmeaItems={fmeaItems}
            onAddFmea={handleAddFmea}
            onUpdateFmea={handleUpdateFmea}
            onDeleteFmea={handleDeleteFmea}
          />
        )}
        {activeModule === 4 && <Module4RiskMatrix risks={risks} />}
        {activeModule === 5 && (
          <Module5CaseLibrary
            cases={INITIAL_CASES}
            activeCaseId={activeCaseId}
            onSelectCase={handleSelectCase}
            onNavigateToModule={setActiveModule}
          />
        )}
        {activeModule === 6 && (
          <Module6MonteCarloEngine
            initialParams={simParams}
            caseTitle={currentCase.title}
          />
        )}
        {activeModule === 7 && (
          <Module7AiAdvisor
            risks={risks}
            fmeaItems={fmeaItems}
            simResult={simResult}
            caseTitle={currentCase.title}
          />
        )}
        {activeModule === 8 && (
          <Module8GuidedWorkflow
            risks={risks}
            fmeaItems={fmeaItems}
            simResult={simResult}
            onNavigateToModule={setActiveModule}
            onOpenExport={() => setActiveModule(9)}
          />
        )}
        {activeModule === 9 && (
          <Module9ReportExport
            currentCase={currentCase}
            risks={risks}
            fmeaItems={fmeaItems}
            simResult={simResult}
          />
        )}
        {activeModule === 10 && <Module10KnowledgeSlices />}
      </main>

      {/* Floating AI Chat Assistant Toggle Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        {!isAiChatOpen && (
          <button
            onClick={() => setIsAiChatOpen(true)}
            className="group flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white pl-3.5 pr-4 py-3 rounded-full shadow-lg border border-slate-700/50 hover:shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-white animate-pulse" />
            </div>
            <span className="text-xs font-semibold">AI专家随诊</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>
        )}
      </div>

      {/* Floating AI Chat Drawer Modal */}
      <FloatingAiChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        caseTitle={currentCase.title}
        risks={risks}
        fmeaItems={fmeaItems}
      />

      {/* Elegant Footer */}
      <footer className="border-t border-slate-200 bg-white/60 py-6 text-xs text-slate-500 print:hidden mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">系统风险分析 WebApp 实验室</span>
            <span>·</span>
            <span>故障模式、风险矩阵与不确定性量化评估科研平台</span>
          </div>
          <div className="flex items-center space-x-4 text-[11px] text-slate-400">
            <span>遵循 ISO 31000 / AIAG-VDA / IEC 60812 工业标准</span>
            <span>·</span>
            <button
              onClick={() => setActiveModule(10)}
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              认知切片导引
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
