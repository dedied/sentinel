import React from 'react';
import { Project } from '../types';
import { LayoutDashboard, Beaker, Box } from 'lucide-react';

interface ProjectSidebarProps {
  projects: Project[];
  activeProject: Project | null;
  onSelectProject: (p: Project) => void;
  activeView: string;
  onSelectView: (view: 'DASHBOARD' | 'TESTS') => void;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projects,
  activeProject,
  onSelectProject,
  activeView,
  onSelectView,
}) => {
  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-300">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <Box className="text-white w-5 h-5" />
        </div>
        <h1 className="font-bold text-xl text-white tracking-tight">Sentinel</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        <div className="px-4 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
          Projects
        </div>
        <ul className="space-y-1 px-2 mb-8">
          {projects.map((project) => (
            <li key={project.id}>
              <button
                onClick={() => onSelectProject(project)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-all duration-200 text-sm ${
                  activeProject?.id === project.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/20'
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className={`w-2 h-2 rounded-full ${activeProject?.id === project.id ? 'bg-white' : 'bg-slate-600'}`} />
                {project.name}
              </button>
            </li>
          ))}
        </ul>

        {activeProject && (
          <>
            <div className="px-4 mb-2 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              Workspace
            </div>
            <ul className="space-y-1 px-2">
              <li>
                <button
                  onClick={() => onSelectView('DASHBOARD')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                    activeView === 'DASHBOARD'
                      ? 'bg-slate-800 text-indigo-400 font-medium'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectView('TESTS')}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
                    activeView === 'TESTS'
                      ? 'bg-slate-800 text-indigo-400 font-medium'
                      : 'hover:bg-slate-800 text-slate-400'
                  }`}
                >
                  <Beaker className="w-4 h-4" />
                  Test Suite
                </button>
              </li>
            </ul>
          </>
        )}
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500" />
          <div className="flex flex-col">
            <span className="text-xs font-medium text-white">Admin User</span>
            <span className="text-[10px] text-slate-500">PRO Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};