import React, { useEffect, useState, useRef } from 'react';
import { TestCase, TestStatus, TestType } from '../types';
import { X, CheckCircle, XCircle, Terminal, Loader2 } from 'lucide-react';

interface TestRunnerModalProps {
  test: TestCase | null;
  onClose: () => void;
  onComplete: (testId: string, status: TestStatus, logs: string[]) => void;
}

// Helper: Parse test code to create a realistic simulation timeline
const generateSimulationPlan = (test: TestCase) => {
  const codeLines = test.code ? test.code.split('\n') : [];
  const plan: { msg: string; delay: number }[] = [];
  let currentTime = 0;

  // 1. Initialization Phase
  plan.push({ msg: `> Starting ${test.type} runner for "${test.title}"...`, delay: 100 });
  currentTime += 500;

  if (test.type === TestType.FRONTEND) {
    plan.push({ msg: '> Launching Chromium (Headless)...', delay: currentTime });
    currentTime += 1000;
    plan.push({ msg: '> Browser context created.', delay: currentTime });
    currentTime += 500;
  } else {
    plan.push({ msg: '> Initializing Backend Environment...', delay: currentTime });
    currentTime += 800;
    plan.push({ msg: '> Establishing Supabase connection...', delay: currentTime });
    currentTime += 800;
  }

  // 2. Execution Phase (derived from code)
  codeLines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('import') || trimmed === '});') return;

    let msg = '';
    let duration = 100;

    if (trimmed.includes('test(')) {
       // skip test declaration log, handled by init
       return;
    } else if (trimmed.includes('page.goto')) {
       const url = trimmed.match(/goto\(['"`](.*?)['"`]\)/)?.[1] || 'URL';
       msg = `> Navigating to ${url}`;
       duration = 1500;
    } else if (trimmed.includes('page.fill')) {
       const selector = trimmed.match(/fill\(['"`](.*?)['"`]/)?.[1] || 'input';
       msg = `> Filling input: ${selector}`;
       duration = 600;
    } else if (trimmed.includes('page.click')) {
       const selector = trimmed.match(/click\(['"`](.*?)['"`]\)/)?.[1] || 'element';
       msg = `> Clicking element: ${selector}`;
       duration = 800;
    } else if (trimmed.includes('expect')) {
       const assertion = trimmed.replace('await expect', 'expect').replace(';', '');
       msg = `> Checking assertion: ${assertion}`;
       duration = 400;
    } else if (trimmed.includes('supabase.from')) {
       const table = trimmed.match(/from\(['"`](.*?)['"`]\)/)?.[1] || 'table';
       msg = `> Querying Supabase table '${table}'...`;
       duration = 1200;
    } else if (trimmed.includes('.eq(') || trimmed.includes('.select(')) {
       msg = `> Filtering query parameters...`;
       duration = 300;
    } else {
       // Generic fallback for other lines
       if (trimmed.length > 5) {
         msg = `> ${trimmed.substring(0, 50)}${trimmed.length > 50 ? '...' : ''}`;
         duration = 200;
       }
    }

    if (msg) {
      plan.push({ msg, delay: currentTime });
      currentTime += duration;
    }
  });

  // 3. Completion Phase
  currentTime += 500;
  
  return { plan, totalDuration: currentTime };
};

export const TestRunnerModal: React.FC<TestRunnerModalProps> = ({ test, onClose, onComplete }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<TestStatus>(TestStatus.RUNNING);
  const logContainerRef = useRef<HTMLDivElement>(null);
  const logsRef = useRef<string[]>([]);

  useEffect(() => {
    if (!test) return;

    // Reset state
    setLogs([]);
    logsRef.current = [];
    setStatus(TestStatus.RUNNING);

    const { plan, totalDuration } = generateSimulationPlan(test);
    const timeouts: ReturnType<typeof setTimeout>[] = [];

    // Schedule logs
    plan.forEach(({ msg, delay }) => {
      const t = setTimeout(() => {
        setLogs((prev) => {
            const newLogs = [...prev, msg];
            logsRef.current = newLogs;
            return newLogs;
        });
      }, delay);
      timeouts.push(t);
    });

    // Schedule completion
    const completeTimeout = setTimeout(() => {
      // Simulate pass/fail (90% pass rate)
      const passed = Math.random() < 0.9;
      const finalStatus = passed ? TestStatus.PASSED : TestStatus.FAILED;
      const finalMsg = passed ? '> TEST PASSED ✨' : '> TEST FAILED ❌';
      const durationMsg = `> Total Duration: ${totalDuration}ms`;
      
      setLogs((prev) => {
        const newLogs = [...prev, '', finalMsg, durationMsg];
        logsRef.current = newLogs;
        return newLogs;
      });
      setStatus(finalStatus);
      
      // Delay closing/completing slightly so user sees the result
      setTimeout(() => {
          if (test) {
            onComplete(test.id, finalStatus, logsRef.current);
          }
      }, 1000);

    }, totalDuration);

    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(completeTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [test]);

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!test) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center gap-3">
             <div className="relative flex items-center justify-center w-6 h-6">
                {status === TestStatus.RUNNING && <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />}
                {status === TestStatus.PASSED && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                {status === TestStatus.FAILED && <XCircle className="w-5 h-5 text-red-500" />}
             </div>
             <div>
               <h3 className="font-semibold text-white text-sm">{test.title}</h3>
               <p className="text-xs text-slate-500 font-mono">{test.id}.spec.ts</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-white transition-colors p-1 hover:bg-slate-800 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Terminal/Log Area */}
        <div className="flex-1 bg-[#0c0c0c] p-6 font-mono text-sm overflow-hidden flex flex-col relative">
          <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-b from-[#0c0c0c] to-transparent z-10 pointer-events-none" />
          
          <div className="flex items-center gap-2 text-slate-600 mb-4 pb-2 border-b border-slate-800/50 uppercase tracking-widest text-[10px] font-bold">
            <Terminal className="w-3 h-3" />
            <span>Execution Logs</span>
          </div>

          <div ref={logContainerRef} className="overflow-y-auto flex-1 space-y-1.5 scroll-smooth pb-4">
            {logs.map((log, i) => (
              <div key={i} className={`break-words ${
                  log.includes('PASSED') ? 'text-emerald-400 font-bold mt-4' : 
                  log.includes('FAILED') ? 'text-red-400 font-bold mt-4' : 
                  log.startsWith('>') ? 'text-slate-300' : 
                  'text-slate-500'
              }`}>
                <span className="opacity-50 mr-2 select-none">$</span>
                {log}
              </div>
            ))}
            {status === TestStatus.RUNNING && (
              <div className="flex items-center gap-1 text-slate-500 animate-pulse mt-1">
                <span className="w-2 h-4 bg-slate-500 block"></span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
           <div className="text-xs text-slate-500">
             {status === TestStatus.RUNNING ? 'Running tests...' : 'Execution complete'}
           </div>
           <button 
             onClick={onClose} 
             disabled={status === TestStatus.RUNNING}
             className={`px-4 py-2 rounded-lg font-medium text-xs transition-all ${
               status === TestStatus.RUNNING 
                 ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' 
                 : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20'
             }`}
           >
             {status === TestStatus.RUNNING ? 'Please Wait' : 'Close Console'}
           </button>
        </div>
      </div>
    </div>
  );
};