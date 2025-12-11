import React, { useState } from 'react';
import { CheckSquare, ChevronLeft, ChevronRight, Check } from 'lucide-react';

const PlannerWorkspace: React.FC = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: "Review Pull Requests", completed: true },
    { id: 2, text: "Team Sync at 10am", completed: false },
    { id: 3, text: "Finish Documentation", completed: false },
  ]);
  const [newTodo, setNewTodo] = useState("");
  const [reflection, setReflection] = useState({
      wentWell: "",
      improve: "",
      goals: ""
  });

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const addTodo = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTodo.trim()) {
        setTodos([...todos, { id: Date.now(), text: newTodo, completed: false }]);
        setNewTodo("");
    }
  };

  // Simple mock calendar grid
  const days = Array.from({length: 31}, (_, i) => i + 1);
  const weekDays = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div className="flex flex-col lg:flex-row h-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Left Column: Calendar & Todos */}
      <div className="w-full lg:w-96 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto">
        
        {/* Calendar Widget */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">October 2023</h3>
            <div className="flex gap-2">
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronLeft size={16} /></button>
                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"><ChevronRight size={16} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-semibold text-slate-400">
             {weekDays.map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
             {days.map(d => (
                 <button 
                    key={d} 
                    className={`h-8 w-8 rounded-full text-sm flex items-center justify-center transition-colors
                        ${d === 14 ? 'bg-brand-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}
                    `}
                 >
                     {d}
                 </button>
             ))}
          </div>
        </div>

        {/* Todo List */}
        <div className="p-6 flex-1">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
             <CheckSquare size={20} className="text-brand-500" />
             Tasks
          </h3>
          
          <div className="space-y-3 mb-4">
            {todos.map(todo => (
              <div key={todo.id} className="flex items-start gap-3 group">
                <button 
                  onClick={() => toggleTodo(todo.id)}
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center transition-colors
                    ${todo.completed 
                        ? 'bg-brand-500 border-brand-500 text-white' 
                        : 'border-slate-300 dark:border-slate-600 hover:border-brand-500'}
                  `}
                >
                  {todo.completed && <Check size={12} strokeWidth={3} />}
                </button>
                <span className={`text-sm transition-all ${todo.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'}`}>
                    {todo.text}
                </span>
              </div>
            ))}
          </div>

          <input 
            type="text" 
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            onKeyDown={addTodo}
            placeholder="+ Add a new task"
            className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none text-slate-700 dark:text-slate-200"
          />
        </div>
      </div>

      {/* Right Column: Reflections */}
      <div className="flex-1 p-8 overflow-y-auto">
         <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Daily Reflection</h2>
            <p className="text-slate-500 mb-8">Take a moment to analyze your progress.</p>

            <div className="space-y-8">
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <label className="block text-sm font-semibold text-green-600 dark:text-green-400 mb-3 uppercase tracking-wide">
                        What went well?
                    </label>
                    <textarea 
                        className="w-full h-24 resize-none bg-slate-50 dark:bg-slate-950 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-green-500/50 text-slate-700 dark:text-slate-300"
                        placeholder="I finally fixed that bug..."
                        value={reflection.wentWell}
                        onChange={(e) => setReflection({...reflection, wentWell: e.target.value})}
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3 uppercase tracking-wide">
                        What to improve?
                    </label>
                    <textarea 
                        className="w-full h-24 resize-none bg-slate-50 dark:bg-slate-950 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-orange-500/50 text-slate-700 dark:text-slate-300"
                        placeholder="I got distracted by emails..."
                        value={reflection.improve}
                        onChange={(e) => setReflection({...reflection, improve: e.target.value})}
                    />
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <label className="block text-sm font-semibold text-brand-600 dark:text-brand-400 mb-3 uppercase tracking-wide">
                        Tomorrow's Main Goal
                    </label>
                    <textarea 
                        className="w-full h-24 resize-none bg-slate-50 dark:bg-slate-950 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-brand-500/50 text-slate-700 dark:text-slate-300"
                        placeholder="Deploy the MVP."
                        value={reflection.goals}
                        onChange={(e) => setReflection({...reflection, goals: e.target.value})}
                    />
                </div>

            </div>
         </div>
      </div>

    </div>
  );
};

export default PlannerWorkspace;
