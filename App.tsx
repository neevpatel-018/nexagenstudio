import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CodeWorkspace from './components/CodeWorkspace';
import NotesWorkspace from './components/NotesWorkspace';
import PlannerWorkspace from './components/PlannerWorkspace';
import { PageMetadata, PageType } from './types';
import { Moon, Sun, User } from 'lucide-react';

const MOCK_RECENTS: PageMetadata[] = [
  { id: '1', title: 'Algorithm Practice', type: PageType.CODE, lastModified: new Date('2023-10-14'), isFavorite: true, tags: ['study'] },
  { id: '2', title: 'Design System Notes', type: PageType.NOTES, lastModified: new Date('2023-10-13'), isFavorite: false, tags: ['work'] },
  { id: '3', title: 'Q4 Goals', type: PageType.PLANNER, lastModified: new Date('2023-10-12'), isFavorite: true, tags: ['personal'] },
];

const App: React.FC = () => {
  // State
  const [isDark, setIsDark] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageMetadata | null>(null);
  const [recents, setRecents] = useState<PageMetadata[]>(MOCK_RECENTS);

  // Theme Toggle Effect
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Handlers
  const handleCreateNew = (type: PageType = PageType.NOTES) => {
    const newPage: PageMetadata = {
      id: Date.now().toString(),
      title: 'Untitled ' + type.toLowerCase(),
      type: type,
      lastModified: new Date(),
      isFavorite: false,
      tags: []
    };
    setRecents([newPage, ...recents]);
    setCurrentPage(newPage);
  };

  const renderContent = () => {
    if (!currentPage) {
      return (
        <Dashboard 
          recents={recents} 
          onNavigate={setCurrentPage} 
          onCreate={handleCreateNew} 
        />
      );
    }

    switch (currentPage.type) {
      case PageType.CODE:
        return <CodeWorkspace />;
      case PageType.NOTES:
        return <NotesWorkspace />;
      case PageType.PLANNER:
        return <PlannerWorkspace />;
      default:
        return <div>Unknown Page Type</div>;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-gray-50 dark:bg-black">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage}
        onCreateNew={(type) => handleCreateNew(type)}
        favorites={recents.filter(r => r.isFavorite)}
        recents={recents.slice(0, 5)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 flex-shrink-0">
          
          {/* Breadcrumbs or Title */}
          <div className="flex items-center gap-2">
             <span className="text-sm font-medium text-slate-400">Nexagen Studio</span>
             {currentPage && (
                <>
                  <span className="text-slate-300">/</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white">{currentPage.title}</span>
                </>
             )}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
             <button 
               onClick={() => setIsDark(!isDark)}
               className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
             >
               {isDark ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600">
                <User size={16} />
             </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-hidden relative">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;