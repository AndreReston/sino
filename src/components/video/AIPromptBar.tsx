import { useState } from 'react';
import { Send, Wand2 } from 'lucide-react';
import { useStore } from '../../store/useStore';

const QUICK_PROMPTS = [
  'Make it more viral',
  'Add suspense',
  'Make it cinematic',
  'Stronger hook',
  'Faster pacing',
  'Add energy',
];

export default function AIPromptBar() {
  const [input, setInput] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const { addChatMessage, applyVibeControl } = useStore();

  const handleSubmit = () => {
    if (!input.trim()) return;
    addChatMessage('user', input.trim());
    applyVibeControl(input.trim());
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        'Applied! The video now has a stronger opening hook and more dynamic pacing.',
        'Done! I\'ve enhanced the cinematic feel with wider transitions and deeper color grading.',
        'Updated! Suspenseful pauses added between key scenes with tension-building audio cues.',
        'Changes applied! The energy level is now higher with faster cuts and impactful reveals.',
      ];
      addChatMessage('assistant', responses[Math.floor(Math.random() * responses.length)]);
    }, 1200);
    setInput('');
  };

  return (
    <div className="bg-[#0c0c10] border-t border-white/[0.04] px-4 py-2">
      <div className="flex items-center gap-2">
        <div className={`flex-1 flex items-center gap-2 rounded-xl border bg-[#151519] px-3 py-2 transition-all ${
          isFocused ? 'border-sky-500/40 shadow-[0_0_15px_rgba(56,189,248,0.1)]' : 'border-white/[0.06]'
        }`}>
          <Wand2 className="w-4 h-4 text-sky-400 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Describe what you want to change... (e.g. 'make it more dramatic')"
            className="flex-1 bg-transparent text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim()}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 text-[11px] font-semibold hover:bg-sky-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send className="w-3 h-3" />
            Apply
          </button>
        </div>
      </div>

      {/* Quick prompts */}
      {isFocused && (
        <div className="flex gap-1.5 mt-2 flex-wrap">
          {QUICK_PROMPTS.map((q) => (
            <button
              key={q}
              onClick={() => { setInput(q); }}
              className="px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-zinc-500 hover:text-zinc-300 hover:border-white/[0.12] transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
