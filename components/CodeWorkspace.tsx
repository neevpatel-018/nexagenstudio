import React, { useState } from 'react';
import { Play, Copy, Save, Check, Download } from 'lucide-react';
import { CodeLanguage } from '../types';
import { executeCode } from '../services/geminiService';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

const CodeWorkspace: React.FC = () => {
  const [code, setCode] = useState<string>(`// Write your code here\nconsole.log("Hello Nexagen!");`);
  const [notes, setNotes] = useState<string>("# Project Notes\n\n- [ ] Initialize repository\n- [ ] Set up environment");
  const [output, setOutput] = useState<string>('Ready to run...');
  const [language, setLanguage] = useState<CodeLanguage>(CodeLanguage.JAVASCRIPT);
  const [isRunning, setIsRunning] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running code on remote container...');
    const result = await executeCode(code, language);
    setOutput(result);
    setIsRunning(false);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    
    // Download File
    const extensionMap: Record<string, string> = {
      javascript: 'js',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      go: 'go',
      rust: 'rs'
    };
    const ext = extensionMap[language] || 'txt';
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `project.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const highlightCode = (code: string) => {
    // Map internal language enum to Prism languages
    let prismLang = Prism.languages.javascript;
    if (language === CodeLanguage.PYTHON) prismLang = Prism.languages.python;
    if (language === CodeLanguage.JAVA) prismLang = Prism.languages.java;
    if (language === CodeLanguage.CPP) prismLang = Prism.languages.cpp;
    if (language === CodeLanguage.GO) prismLang = Prism.languages.go;
    if (language === CodeLanguage.RUST) prismLang = Prism.languages.rust;
    
    return Prism.highlight(code, prismLang || Prism.languages.clike, language);
  };

  return (
    <div className="flex h-full bg-slate-50 dark:bg-slate-950">
      
      {/* Editor Pane */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 dark:border-slate-800">
        {/* Toolbar */}
        <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
             <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value as CodeLanguage)}
                className="bg-slate-100 dark:bg-slate-800 border-none rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
             >
               <option value={CodeLanguage.JAVASCRIPT}>JavaScript</option>
               <option value={CodeLanguage.PYTHON}>Python</option>
               <option value={CodeLanguage.JAVA}>Java</option>
               <option value={CodeLanguage.CPP}>C++</option>
               <option value={CodeLanguage.GO}>Go</option>
               <option value={CodeLanguage.RUST}>Rust</option>
             </select>
             <span className="text-xs text-slate-400 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                Ready
             </span>
          </div>

          <div className="flex items-center gap-2">
            <button 
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors text-sm font-medium"
                title="Save & Download"
            >
                {isSaved ? <Check size={16} className="text-green-500"/> : <Download size={16} />}
                <span>{isSaved ? 'Saved' : 'Save'}</span>
            </button>
            <button 
              onClick={handleRun}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-all
                ${isRunning ? 'bg-slate-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-sm hover:shadow'}
              `}
            >
              <Play size={14} fill="currentColor" />
              {isRunning ? 'Running...' : 'Run Code'}
            </button>
          </div>
        </div>

        {/* Code Area */}
        <div className="flex-1 relative group bg-[#1d1f21] overflow-auto"> 
            {/* Using #1d1f21 to match Tomorrow Night background typically */}
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={highlightCode}
              padding={24}
              className="font-mono text-sm prism-editor"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14,
                backgroundColor: '#1d1f21',
                color: '#c5c8c6',
                minHeight: '100%',
              }}
              textareaClassName="focus:outline-none"
            />
        </div>

        {/* Output Panel */}
        <div className="h-1/3 border-t border-slate-700 flex flex-col bg-[#1d1f21]">
          <div className="h-8 border-b border-slate-700 px-4 flex items-center justify-between bg-[#25282c]">
            <span className="text-xs font-semibold text-slate-400 uppercase">Terminal Output</span>
            <button onClick={() => setOutput('')} className="text-xs text-slate-400 hover:text-slate-200">Clear</button>
          </div>
          <div className="flex-1 p-4 font-mono text-xs overflow-auto text-slate-300">
             <pre className={`whitespace-pre-wrap ${output.startsWith('Error') ? 'text-red-400' : 'text-green-400'}`}>
                {output}
             </pre>
          </div>
        </div>
      </div>

      {/* Notes Pane */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 hidden lg:flex">
         <div className="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center px-4">
            <span className="font-semibold text-sm text-slate-700 dark:text-slate-200">Notes & Docs</span>
         </div>
         <div className="flex-1">
           <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-full p-4 resize-none focus:outline-none bg-transparent text-sm leading-6 text-slate-600 dark:text-slate-400"
              placeholder="Add implementation notes here..."
           />
         </div>
      </div>

    </div>
  );
};

export default CodeWorkspace;