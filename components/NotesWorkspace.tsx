import React, { useState, useRef, useEffect } from 'react';
import { 
  Image as ImageIcon, 
  MoreVertical, 
  X, 
  Bold, 
  Italic, 
  Heading1, 
  Heading2, 
  List,
  AlignLeft,
  Code2,
  Play,
  Terminal,
  Download
} from 'lucide-react';
import { NoteBlock, BlockType, CodeLanguage } from '../types';
import { executeCode } from '../services/geminiService';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';

// Helper component for ContentEditable
interface EditableBlockProps {
  id: string;
  html: string;
  tagName: string;
  className: string;
  onChange: (id: string, html: string) => void;
  onKeyDown: (e: React.KeyboardEvent, id: string) => void;
  onFocus: (id: string) => void;
  placeholder?: string;
}

const EditableBlock = React.forwardRef<HTMLElement, EditableBlockProps>(({
  id,
  html,
  tagName,
  className,
  onChange,
  onKeyDown,
  onFocus,
  placeholder
}, ref) => {
  const contentEditableRef = useRef<HTMLElement>(null);

  // Sync ref with parent
  React.useImperativeHandle(ref, () => contentEditableRef.current!);

  const handleInput = (e: React.FormEvent<HTMLElement>) => {
    onChange(id, e.currentTarget.innerHTML);
  };

  // Improved Sync: Only update innerHTML if it differs significantly.
  // This prevents the cursor from jumping to the start on every re-render while typing.
  useEffect(() => {
    if (contentEditableRef.current && contentEditableRef.current.innerHTML !== html) {
      contentEditableRef.current.innerHTML = html;
    }
  }, [html]);

  return React.createElement(tagName, {
    className: `${className} empty:before:content-[attr(placeholder)] empty:before:text-slate-300 dark:empty:before:text-slate-600 focus:outline-none cursor-text`,
    contentEditable: true,
    suppressContentEditableWarning: true,
    ref: contentEditableRef,
    onInput: handleInput,
    onKeyDown: (e: React.KeyboardEvent) => onKeyDown(e, id),
    onFocus: () => onFocus(id),
    placeholder: placeholder,
    // Do NOT use dangerouslySetInnerHTML here for updates, relying on useEffect instead for stability
  });
});

// Specialized Code Block Component
interface CodeBlockItemProps {
  block: NoteBlock;
  updateBlock: (id: string, updates: Partial<NoteBlock>) => void;
  removeBlock: (id: string) => void;
}

const CodeBlockItem: React.FC<CodeBlockItemProps> = ({ block, updateBlock, removeBlock }) => {
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = async () => {
    setIsRunning(true);
    updateBlock(block.id, { output: '' });
    
    const result = await executeCode(block.content, block.language || CodeLanguage.JAVASCRIPT);
    updateBlock(block.id, { output: result });
    setIsRunning(false);
  };

  const highlightCode = (code: string) => {
    const lang = block.language || CodeLanguage.JAVASCRIPT;
    let prismLang = Prism.languages.javascript;
    if (lang === CodeLanguage.PYTHON) prismLang = Prism.languages.python;
    if (lang === CodeLanguage.JAVA) prismLang = Prism.languages.java;
    if (lang === CodeLanguage.CPP) prismLang = Prism.languages.cpp;
    if (lang === CodeLanguage.GO) prismLang = Prism.languages.go;
    if (lang === CodeLanguage.RUST) prismLang = Prism.languages.rust;
    
    return Prism.highlight(code, prismLang || Prism.languages.clike, lang);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1d1f21] shadow-lg relative group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#25282c] border-b border-slate-700">
         <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Terminal size={12} />
              Code
            </span>
            <select
               value={block.language || CodeLanguage.JAVASCRIPT}
               onChange={(e) => updateBlock(block.id, { language: e.target.value as CodeLanguage })}
               className="bg-[#1d1f21] text-xs text-brand-400 border border-slate-700 rounded px-2 py-0.5 focus:outline-none cursor-pointer hover:border-brand-500/50 transition-colors"
            >
               {Object.values(CodeLanguage).map(lang => (
                 <option key={lang} value={lang}>{lang.charAt(0).toUpperCase() + lang.slice(1)}</option>
               ))}
            </select>
         </div>
         <div className="flex items-center gap-2 pr-6">
             <button 
                onClick={handleRun} 
                disabled={isRunning} 
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-all
                  ${isRunning ? 'text-slate-500 cursor-not-allowed' : 'text-green-400 hover:bg-green-400/10 hover:text-green-300'}
                `}
             >
                <Play size={12} fill="currentColor" />
                {isRunning ? 'Running...' : 'Run'}
             </button>
         </div>
         
         {/* Delete Action */}
         <button 
            onClick={() => removeBlock(block.id)} 
            className="absolute top-2.5 right-2 p-1 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Delete block"
         >
            <X size={14} />
         </button>
      </div>

      {/* Editor */}
      <div className="relative bg-[#1d1f21]">
        <Editor
              value={block.content}
              onValueChange={(code) => updateBlock(block.id, { content: code })}
              highlight={highlightCode}
              padding={16}
              className="font-mono text-sm prism-editor"
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 14,
                backgroundColor: '#1d1f21',
                color: '#c5c8c6',
                minHeight: '140px',
              }}
              textareaClassName="focus:outline-none"
        />
      </div>

      {/* Output Area */}
      {(block.output !== undefined) && (
        <div className="border-t border-slate-700 bg-black/40">
           <div className="flex items-center justify-between px-4 py-1.5 bg-[#25282c] border-b border-slate-700">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Console Output</span>
              <button 
                onClick={() => updateBlock(block.id, { output: undefined })}
                className="text-[10px] text-slate-500 hover:text-slate-400"
              >
                Clear
              </button>
           </div>
           <pre className={`p-4 font-mono text-xs whitespace-pre-wrap overflow-auto max-h-60 ${block.output.startsWith('Error') ? 'text-red-400' : 'text-slate-300'}`}>
             {block.output || <span className="text-slate-600 italic">No output</span>}
           </pre>
        </div>
      )}
    </div>
  );
};


const NotesWorkspace: React.FC = () => {
  const [title, setTitle] = useState("Introduction to C++");
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: '1', type: 'h1', content: "First C++ Program" },
    { id: '2', type: 'paragraph', content: "The below C++ code shows the basic structure of a program. It includes the standard input-output stream library and prints a welcome message." },
    { 
      id: '3', 
      type: 'code', 
      content: '#include <iostream>\n\nusing namespace std;\n\nint main() {\n    cout << "Hello, Nexagen World!";\n    return 0;\n}', 
      language: CodeLanguage.CPP 
    }
  ]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blockRefs = useRef<{[key: string]: HTMLElement | null}>({});

  useEffect(() => {
    // Initialization of blocks content is handled by EditableBlock useEffect
  }, []);

  const addBlock = (afterId: string, type: BlockType = 'paragraph') => {
    const newBlock: NoteBlock = { 
        id: Date.now().toString(), 
        type, 
        content: type === 'code' ? '// Write code here' : '',
        language: type === 'code' ? CodeLanguage.JAVASCRIPT : undefined
    };
    
    const index = blocks.findIndex(b => b.id === afterId);
    if (index !== -1) {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      setBlocks(newBlocks);
      
      if (type !== 'code' && type !== 'image') {
        setTimeout(() => {
            setActiveBlockId(newBlock.id);
            blockRefs.current[newBlock.id]?.focus();
        }, 0);
      }
    } else {
        setBlocks([...blocks, newBlock]);
    }
  };

  const updateBlockContent = (id: string, content: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));
  };

  const updateBlock = (id: string, updates: Partial<NoteBlock>) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const updateBlockType = (id: string, type: BlockType) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, type } : b));
    if (type !== 'code' && type !== 'image') {
        setTimeout(() => {
            blockRefs.current[id]?.focus();
        }, 0);
    }
  };

  const deleteBlock = (id: string) => {
    if (blocks.length <= 1) return;
    const index = blocks.findIndex(b => b.id === id);
    const prevBlock = blocks[index - 1];
    
    setBlocks(blocks.filter(b => b.id !== id));
    
    if (prevBlock && prevBlock.type !== 'code' && prevBlock.type !== 'image') {
      setActiveBlockId(prevBlock.id);
      setTimeout(() => {
          const el = blockRefs.current[prevBlock.id];
          if (el) {
             el.focus();
             // Move cursor to end
             const range = document.createRange();
             const sel = window.getSelection();
             range.selectNodeContents(el);
             range.collapse(false);
             sel?.removeAllRanges();
             sel?.addRange(range);
          }
      }, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addBlock(id);
    } else if (e.key === 'Backspace') {
       const block = blocks.find(b => b.id === id);
       const el = blockRefs.current[id];
       // Check if empty
       const isEmpty = !el?.innerText.trim() && block?.type !== 'image' && block?.type !== 'code';
       
       if (isEmpty && blocks.length > 1) {
         e.preventDefault();
         deleteBlock(id);
       }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBlock: NoteBlock = { 
            id: Date.now().toString(), 
            type: 'image', 
            content: reader.result as string, 
            caption: '' 
        };
        if (activeBlockId) {
            const index = blocks.findIndex(b => b.id === activeBlockId);
            const newBlocks = [...blocks];
            newBlocks.splice(index + 1, 0, newBlock);
            setBlocks(newBlocks);
        } else {
            setBlocks([...blocks, newBlock]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const insertCodeBlock = () => {
     if (activeBlockId) {
         addBlock(activeBlockId, 'code');
     } else {
         const lastId = blocks[blocks.length - 1].id;
         addBlock(lastId, 'code');
     }
  };

  const executeCommand = (command: string) => {
    document.execCommand(command, false, undefined);
  };

  const getActiveBlockType = () => {
    return blocks.find(b => b.id === activeBlockId)?.type || 'paragraph';
  };

  const handleExport = () => {
    const content = blocks.map(b => {
      if(b.type === 'code') return `\`\`\`${b.language}\n${b.content}\n\`\`\``;
      if(b.type === 'h1') return `# ${b.content}`;
      if(b.type === 'h2') return `## ${b.content}`;
      if(b.type === 'bullet') return `- ${b.content}`;
      return b.content;
    }).join('\n\n');

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      
      {/* Floating/Sticky Toolbar */}
      <div className="flex items-center justify-center py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 z-20 shadow-sm transition-all">
         <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
            <button 
                onClick={() => activeBlockId && updateBlockType(activeBlockId, 'paragraph')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all ${getActiveBlockType() === 'paragraph' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                title="Text"
            >
                <AlignLeft size={18} />
            </button>
            <button 
                onClick={() => activeBlockId && updateBlockType(activeBlockId, 'h1')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all ${getActiveBlockType() === 'h1' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button 
                onClick={() => activeBlockId && updateBlockType(activeBlockId, 'h2')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all ${getActiveBlockType() === 'h2' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>
            <button 
                onClick={() => activeBlockId && updateBlockType(activeBlockId, 'bullet')}
                className={`p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 transition-all ${getActiveBlockType() === 'bullet' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            
            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

            <button onClick={() => executeCommand('bold')} className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all" title="Bold">
                <Bold size={18} />
            </button>
            <button onClick={() => executeCommand('italic')} className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all" title="Italic">
                <Italic size={18} />
            </button>

            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

            <button 
                onClick={insertCodeBlock}
                className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-all"
                title="Insert Code Block"
            >
                <Code2 size={18} />
            </button>
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                title="Insert Image"
            >
                <ImageIcon size={18} />
            </button>

            <div className="w-px h-5 bg-slate-300 dark:bg-slate-600 mx-1"></div>

            <button 
                onClick={handleExport}
                className="p-2 rounded-md hover:bg-white dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                title="Export to Markdown"
            >
                <Download size={18} />
            </button>
         </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto w-full py-12 px-6 pb-40">
            {/* Title */}
            <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-4xl font-bold bg-transparent border-none focus:outline-none text-slate-900 dark:text-white placeholder-slate-300 dark:placeholder-slate-700 mb-8"
            placeholder="Note Title"
            />

            {/* Blocks */}
            <div className="space-y-1">
            {blocks.map((block) => {
                if (block.type === 'code') {
                    return (
                        <CodeBlockItem 
                            key={block.id} 
                            block={block} 
                            updateBlock={updateBlock} 
                            removeBlock={deleteBlock}
                        />
                    );
                }

                if (block.type === 'image') {
                    return (
                        <div key={block.id} className="relative group my-6">
                            <button 
                                onClick={() => deleteBlock(block.id)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-red-500"
                            >
                                <X size={14} />
                            </button>
                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
                                <img src={block.content} alt="User upload" className="w-full h-auto" />
                            </div>
                            <input 
                                type="text" 
                                placeholder="Write a caption..." 
                                className="w-full text-center text-sm text-slate-500 mt-2 bg-transparent border-none focus:outline-none italic"
                                value={block.caption || ''}
                                onChange={(e) => {
                                    setBlocks(blocks.map(b => b.id === block.id ? { ...b, caption: e.target.value} : b));
                                }}
                            />
                        </div>
                    );
                }

                let Tag = 'div';
                let styles = 'text-lg text-slate-700 dark:text-slate-300 leading-relaxed min-h-[1.5em]';
                let placeholder = "Type '/' for commands";

                if (block.type === 'h1') {
                    styles = 'text-3xl font-bold text-slate-900 dark:text-white mt-8 mb-4 min-h-[1.5em]';
                    placeholder = "Heading 1";
                } else if (block.type === 'h2') {
                    styles = 'text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-6 mb-3 min-h-[1.5em]';
                    placeholder = "Heading 2";
                } else if (block.type === 'bullet') {
                    styles = 'text-lg text-slate-700 dark:text-slate-300 leading-relaxed pl-2 min-h-[1.5em]';
                    placeholder = "List item";
                }

                return (
                    <div key={block.id} className="group relative flex items-start -ml-8 pl-8 py-1">
                        <div className="absolute left-0 top-2.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 text-slate-300 hover:text-slate-500">
                            <MoreVertical size={16} />
                        </div>

                        {block.type === 'bullet' && (
                            <div className="mr-3 mt-2.5 h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500 flex-shrink-0 select-none" />
                        )}

                        <div className="flex-1 min-w-0">
                            <EditableBlock
                                id={block.id}
                                ref={(el) => { blockRefs.current[block.id] = el; }}
                                html={block.content}
                                tagName={Tag}
                                className={styles}
                                onChange={updateBlockContent}
                                onKeyDown={handleKeyDown}
                                onFocus={setActiveBlockId}
                                placeholder={placeholder}
                            />
                        </div>
                    </div>
                );
            })}
            
            {blocks.length === 0 && (
                <button onClick={() => addBlock('0')} className="text-slate-400 italic hover:text-slate-600">
                    Click to start writing...
                </button>
            )}
            </div>
        </div>
      </div>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*"
        onChange={handleImageUpload}
      />

    </div>
  );
};

export default NotesWorkspace;