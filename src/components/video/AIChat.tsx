import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, Wand2, Lightbulb, Zap,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

const QUICK_COMMANDS = [
  { label: 'Make it more viral', icon: <Zap className="w-3 h-3" /> },
  { label: 'Add stronger hook', icon: <Lightbulb className="w-3 h-3" /> },
  { label: 'Fix pacing', icon: <Wand2 className="w-3 h-3" /> },
  { label: 'Make it warmer', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Make it grittier', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Add suspense', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Apple ad style', icon: <Sparkles className="w-3 h-3" /> },
  { label: 'Add dream effect', icon: <Sparkles className="w-3 h-3" /> },
];

export default function AIChat() {
  const { project, processAICommand, isGenerating } = useVideoStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [project?.chatHistory.length]);

  if (!project) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;
    processAICommand(input.trim());
    setInput('');
  };

  const handleQuickCommand = (cmd: string) => {
    if (isGenerating) return;
    processAICommand(cmd);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {project.chatHistory.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-sky-400" />
            </div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">AI Creative Assistant</h3>
            <p className="text-xs text-zinc-500 max-w-[240px]">
              Describe your video idea and I&apos;ll generate a storyboard. Try &quot;Make a viral gym motivation reel&quot;
            </p>
          </div>
        )}

        {project.chatHistory.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-sky-500/15 text-sky-100 border border-sky-500/20'
                  : 'bg-white/[0.04] text-zinc-200 border border-white/[0.06]'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-2.5 text-sm text-zinc-400">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                Thinking...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick commands */}
      <div className="px-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMANDS.map((cmd) => (
            <button
              key={cmd.label}
              onClick={() => handleQuickCommand(cmd.label)}
              disabled={isGenerating}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] text-zinc-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-sky-500/30 hover:bg-sky-500/[0.06] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {cmd.icon}
              {cmd.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="px-4 pb-4 pt-2">
        <div className="flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe your video or refine it..."
            disabled={isGenerating}
            className="flex-1 rounded-xl bg-white/[0.04] border border-white/[0.06] px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/20 transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-400 flex items-center justify-center text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
