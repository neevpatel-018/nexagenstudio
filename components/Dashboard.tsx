import React, { useState } from 'react';
import { Search, Filter, Plus, Code2, FileText, Calendar, MoreHorizontal } from 'lucide-react';
import { PageMetadata, PageType } from '../types';

interface DashboardProps {
  recents: PageMetadata[];
  onNavigate: (page: PageMetadata) => void;
  onCreate: (type: PageType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ recents, onNavigate, onCreate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecents = recents.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const Card = ({ title, icon: Icon, type, onClick, colorClass }: any) => (
    <button 
      onClick={onClick}
      className="group relative flex flex-col p-6 h-40 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:shadow-lg hover:border-brand-300 dark:hover:border-brand-700 transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-4 ${colorClass}`}>
        <Icon size={20} />
      </div>
      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 mt-1">Create new</p>
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <Plus size={20} className="text-slate-400" />
      </div>
    </button>
  );

  const RecentRow: React.FC<{ page: PageMetadata }> = ({ page }) => {
    let Icon = FileText;
    let color = 'text-blue-500 bg-blue-50 dark:bg-blue-900/20';
    
    if (page.type === PageType.CODE) {
      Icon = Code2;
      color = 'text-purple-500 bg-purple-50 dark:bg-purple-900/20';
    } else if (page.type === PageType.PLANNER) {
      Icon = Calendar;
      color = 'text-green-500 bg-green-50 dark:bg-green-900/20';
    }

    return (
      <div 
        onClick={() => onNavigate(page)}
        className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-brand-300 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-4">
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon size={20} />
          </div>
          <div>
            <h4 className="font-medium text-slate-900 dark:text-slate-100">{page.title}</h4>
            <p className="text-xs text-slate-500">Edited {page.lastModified.toLocaleDateString()}</p>
          </div>
        </div>
        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-8 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back, Engineer.</h1>
            <p className="text-slate-500 mt-1">Here is what's happening in your studio.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64 text-sm"
              />
            </div>
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
              <Filter size={18} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card 
            title="Code Project" 
            icon={Code2} 
            type={PageType.CODE} 
            onClick={() => onCreate(PageType.CODE)}
            colorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300" 
          />
          <Card 
            title="Rich Notes" 
            icon={FileText} 
            type={PageType.NOTES} 
            onClick={() => onCreate(PageType.NOTES)}
            colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
          />
          <Card 
            title="Daily Plan" 
            icon={Calendar} 
            type={PageType.PLANNER} 
            onClick={() => onCreate(PageType.PLANNER)}
            colorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-300"
          />
        </div>

        {/* Recents */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Work</h2>
            <button className="text-sm text-brand-600 hover:underline">View All</button>
          </div>
          <div className="space-y-3">
            {filteredRecents.length > 0 ? (
               filteredRecents.map(page => <RecentRow key={page.id} page={page} />)
            ) : (
                <div className="text-center py-10 text-slate-400 bg-slate-100 dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
                    No matching pages found.
                </div>
            )}
           
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;