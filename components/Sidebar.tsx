import React from 'react';
import { 
  LayoutDashboard, 
  Code2, 
  FileText, 
  Calendar, 
  Star, 
  Clock, 
  Settings,
  Plus
} from 'lucide-react';
import { PageType, PageMetadata } from '../types';

interface SidebarProps {
  currentPage: PageMetadata | null; // null means dashboard
  onNavigate: (page: PageMetadata | null) => void;
  favorites: PageMetadata[];
  recents: PageMetadata[];
  onCreateNew: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, favorites, recents, onCreateNew }) => {
  
  const NavItem = ({ icon: Icon, label, active, onClick, highlight = false }: any) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors rounded-lg mb-1
        ${active 
          ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' 
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
        }
        ${highlight ? 'text-brand-600 dark:text-brand-400' : ''}
      `}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  const SectionHeader = ({ label }: { label: string }) => (
    <div className="px-4 mt-6 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </div>
  );

  return (
    <div className="w-64 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-gray-900 flex flex-col flex-shrink-0">
      
      {/* Logo Area */}
      <div className="p-6">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight text-slate-900 dark:text-white">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-lg">N</span>
          </div>
          NEXAGEN
        </div>
      </div>

      {/* Main Nav */}
      <div className="flex-1 overflow-y-auto px-3">
        <button 
          onClick={onCreateNew}
          className="w-full mb-6 flex items-center justify-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          Create New Page
        </button>

        <NavItem 
          icon={LayoutDashboard} 
          label="Dashboard" 
          active={currentPage === null} 
          onClick={() => onNavigate(null)} 
        />

        <SectionHeader label="Workspace" />
        <NavItem icon={Code2} label="Code + Notes" onClick={() => {}} highlight={currentPage?.type === PageType.CODE} />
        <NavItem icon={FileText} label="Text + Images" onClick={() => {}} highlight={currentPage?.type === PageType.NOTES} />
        <NavItem icon={Calendar} label="Planner" onClick={() => {}} highlight={currentPage?.type === PageType.PLANNER} />

        <SectionHeader label="Favorites" />
        {favorites.length === 0 && (
            <div className="px-4 py-2 text-xs text-slate-400 italic">No favorites yet</div>
        )}
        {favorites.map(page => (
          <NavItem 
            key={page.id} 
            icon={Star} 
            label={page.title} 
            active={currentPage?.id === page.id}
            onClick={() => onNavigate(page)}
          />
        ))}

        <SectionHeader label="Recent" />
        {recents.map(page => (
          <NavItem 
            key={page.id} 
            icon={Clock} 
            label={page.title} 
            active={currentPage?.id === page.id}
            onClick={() => onNavigate(page)}
          />
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <NavItem icon={Settings} label="Settings" onClick={() => {}} />
      </div>
    </div>
  );
};

export default Sidebar;
