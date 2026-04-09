"use client";

import { useState } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";

export function ClassCodeDisplay({ code }: { code: string }) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 bg-indigo-800/40 backdrop-blur-md px-4 py-2 rounded-xl w-max border border-indigo-400/20 shadow-sm">
      <div className="flex flex-col">
        <span className="text-xs text-indigo-200 font-semibold uppercase tracking-wider mb-0.5">Class Code</span>
        <span className="font-mono text-xl font-bold text-white tracking-widest flex items-center h-7">
          {isVisible ? code : "••••••••"}
        </span>
      </div>
      
      <div className="flex items-center gap-1 ml-2 border-l border-indigo-400/30 pl-3">
        <button 
          onClick={() => setIsVisible(!isVisible)}
          className="p-1.5 rounded-md hover:bg-white/10 text-indigo-100 transition-colors"
          title={isVisible ? "Hide Code" : "Show Code"}
        >
          {isVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
        
        <button 
          onClick={handleCopy}
          className="p-1.5 rounded-md hover:bg-white/10 text-indigo-100 transition-colors"
          title="Copy Code"
        >
          {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
}
