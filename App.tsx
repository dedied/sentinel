import React, { useState, useMemo } from 'react';
import { ProjectSidebar } from './components/ProjectSidebar';
import { StatsCard } from './components/StatsCard';
import { TestRunnerModal } from './components/TestRunnerModal';
import { INITIAL_PROJECTS } from './constants';
import { Project, TestStatus, ViewMode, TestType } from './types';
import { 
  Play, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Code,
  Database, 
  Monitor, 
  Trash2
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Main App Component
const App = () => {
  // --- State ---
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>('proj_1');
  const [activeView, setActiveView] = useState<ViewMode>('DASHBOARD');
  
  // Runner state
  const [runningTestId, setRunningTestId] = useState<string | null>(null);

  // --- Derived State ---
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId) || null
  , [projects, activeProjectId]);

  const stats = useMemo(() => {
    if (!activeProject) return { total: 0, passed: 0, failed: 0, pending: 0 };
    return activeProject.tests.reduce((acc, test) => {
      acc.total++;
      if (test.status === TestStatus.PASSED) acc.passed++;
      else if (test.status === TestStatus.FAILED) acc.failed++;
      else acc.pending++;
      return acc;
    }, { total: 0, passed: 0, failed: 0, pending: 0 });
  }, [activeProject]);

  const pieData = [
    { name: 'Passed', value: stats.passed, color: '#10b981' }, // Emerald 500
    { name: 'Failed', value: stats.failed, color: '#ef4444' }, // Red 500
    { name: 'Pending', value: stats.pending, color: '#64748b' }, // Slate 500
  ].filter(d => d.value > 0);

  // --- Handlers ---

  const handleDeleteTest = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this test?')) {
      setProjects(prev => prev.map(p => {
        if (p.id !== activeProjectId) return p;
        return { ...p, tests: p.tests.filter(t => t.id !== id) };
      }));
    }
  };

  const handleTestComplete = (testId: string, status: TestStatus, logs: string[]) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== activeProjectId) return p;
      return {
        ...p,
        tests: p.tests.map(t => t.id === testId ? { ...t, status, logs, lastRun: new Date().toISOString() } : t)
      };
    }));
    setRunningTestId(null);
  };

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case TestStatus.PASSED: return 'text-green-400 bg-green-400/10 border-green-400/20';
      case TestStatus.FAILED: return 'text-red-400 bg-red-400/10 border-red-400/20';
      case TestStatus.RUNNING: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-slate-400 bg-slate-400/10 border-slate-400/20';
    }
  };

  // --- Render Functions ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Tests" 
          value={stats.total} 
          icon={<Activity className="w-5 h-5" />} 
          color="indigo" 
        />
        <StatsCard 
          title="Passing" 
          value={stats.passed} 
          icon={<CheckCircle2 className="w-5 h-5" />} 
          color="emerald" 
          trend={`${stats.total > 0 ? Math.round((stats.passed / stats.total) * 100) : 0}% success`}
        />
        <StatsCard 
          title="Failing" 
          value={stats.failed} 
          icon={<AlertCircle className="w-5 h-5" />} 
          color="red" 
        />
        <StatsCard 
          title="Backlog" 
          value={stats.pending} 
          icon={<Code className="w-5 h-5" />} 
          color="slate" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {activeProject?.tests.slice(0, 5).map(test => (
              <div key={test.id} className="flex items-center justify-between p-3 bg-slate-800/80 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${test.type === TestType.FRONTEND ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                    {test.type === TestType.FRONTEND ? <Monitor className="w-4 h-4" /> : <Database className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-200">{test.title}</div>
                    <div className="text-xs text-slate-500">{test.lastRun ? `Ran ${new Date(test.lastRun).toLocaleTimeString()}` : 'Never ran'}</div>
                  </div>
                </div>
                <div className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(test.status)}`}>
                  {test.status}
                </div>
              </div>
            ))}
            {activeProject?.tests.length === 0 && (
              <div className="text-center py-8 text-slate-500">No recent activity.</div>
            )}
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold text-white mb-4 w-full">Test Health</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-2 text-xs text-slate-400">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                {d.name} ({d.value})
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTests = () => (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-700 rounded-lg p-1">
           <button className="px-3 py-1.5 text-sm font-medium text-white bg-slate-700 rounded shadow-sm">All</button>
           <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Frontend</button>
           <button className="px-3 py-1.5 text-sm font-medium text-slate-400 hover:text-white transition-colors">Backend</button>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search tests..." 
              className="pl-9 pr-4 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        {activeProject?.tests.map(test => (
          <div 
            key={test.id}
            className="group bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl p-4 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
             <div className="flex items-start gap-4">
                <div className={`mt-1 p-2 rounded-lg ${test.type === TestType.FRONTEND ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  {test.type === TestType.FRONTEND ? <Monitor className="w-5 h-5" /> : <Database className="w-5 h-5" />}
                </div>
                <div>
                   <h4 className="text-white font-medium">{test.title}</h4>
                   <p className="text-sm text-slate-500 line-clamp-1">{test.description}</p>
                   <div className="flex items-center gap-2 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${getStatusColor(test.status)}`}>
                        {test.status}
                      </span>
                      {test.lastRun && <span className="text-[10px] text-slate-600">Last run: {new Date(test.lastRun).toLocaleString()}</span>}
                   </div>
                </div>
             </div>

             <div className="flex items-center gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setRunningTestId(test.id); }}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Run Test"
                >
                  <Play className="w-5 h-5" />
                </button>
                <button 
                  onClick={(e) => handleDeleteTest(test.id, e)}
                  className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  title="Delete Test"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 font-sans overflow-hidden">
      <ProjectSidebar 
        projects={projects}
        activeProject={activeProject}
        onSelectProject={(p) => setActiveProjectId(p.id)}
        activeView={activeView}
        onSelectView={setActiveView}
      />
      
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/50 backdrop-blur-md z-10">
          <div>
            <h2 className="text-lg font-semibold text-white tracking-tight">
              {activeView === 'DASHBOARD' && 'Dashboard Overview'}
              {activeView === 'TESTS' && 'Test Suite Manager'}
            </h2>
            <p className="text-xs text-slate-500">
               {activeProject?.name} <span className="mx-1">•</span> {activeProject?.tests.length} Tests Defined
            </p>
          </div>
          <div className="flex items-center gap-4">
            <img 
               src="https://picsum.photos/40/40" 
               alt="User" 
               className="w-8 h-8 rounded-full ring-2 ring-slate-800 cursor-pointer" 
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-8 relative">
          {activeView === 'DASHBOARD' && renderDashboard()}
          {activeView === 'TESTS' && renderTests()}
        </div>
      </main>
      
      {/* Test Runner Modal Overlay */}
      {runningTestId && (
        <TestRunnerModal 
          test={activeProject?.tests.find(t => t.id === runningTestId) || null}
          onClose={() => setRunningTestId(null)}
          onComplete={handleTestComplete}
        />
      )}
    </div>
  );
};

export default App;