import {
  LayoutGrid, Film, Dumbbell, ShoppingBag, BookOpen,
  ArrowRight, Sparkles, Flame,
} from 'lucide-react';
import { useVideoStore, VideoStyle } from '../../store/videoStore';

const VIRAL_TEMPLATES = [
  {
    id: 'motivation-reel',
    label: 'Motivation Reel',
    icon: <Dumbbell className="w-5 h-5" />,
    style: 'cinematic' as VideoStyle,
    niche: 'fitness',
    description: 'Hook → struggle → montage → transformation payoff',
    sceneCount: 4,
    music: 'hype',
    accent: 'from-amber-500/20 to-amber-500/5',
    border: 'border-amber-500/20 hover:border-amber-500/40',
  },
  {
    id: 'product-ad',
    label: 'Product Ad',
    icon: <ShoppingBag className="w-5 h-5" />,
    style: 'minimal-clean' as VideoStyle,
    niche: 'product',
    description: 'Problem → reveal → features → CTA',
    sceneCount: 4,
    music: 'upbeat',
    accent: 'from-sky-500/20 to-sky-500/5',
    border: 'border-sky-500/20 hover:border-sky-500/40',
  },
  {
    id: 'study-aesthetic',
    label: 'Study Aesthetic',
    icon: <BookOpen className="w-5 h-5" />,
    style: 'minimal-clean' as VideoStyle,
    niche: 'study-aesthetic',
    description: 'Setup → focus → aesthetic break → accomplishment',
    sceneCount: 4,
    music: 'lofi',
    accent: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20 hover:border-emerald-500/40',
  },
  {
    id: 'before-after',
    label: 'Before / After',
    icon: <ArrowRight className="w-5 h-5" />,
    style: 'dramatic' as VideoStyle,
    niche: 'transformation',
    description: 'Before state → transformation process → reveal',
    sceneCount: 3,
    music: 'epic',
    accent: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20 hover:border-violet-500/40',
  },
  {
    id: 'documentary',
    label: 'Story Documentary',
    icon: <Film className="w-5 h-5" />,
    style: 'documentary' as VideoStyle,
    niche: 'documentary',
    description: 'Context → subject → evidence → revelation',
    sceneCount: 4,
    music: 'cinematic',
    accent: 'from-rose-500/20 to-rose-500/5',
    border: 'border-rose-500/20 hover:border-rose-500/40',
  },
  {
    id: 'tiktok-viral',
    label: 'TikTok Viral',
    icon: <Flame className="w-5 h-5" />,
    style: 'tiktok' as VideoStyle,
    niche: 'entertainment',
    description: 'Hook → escalation → twist → payoff',
    sceneCount: 4,
    music: 'hype',
    accent: 'from-pink-500/20 to-pink-500/5',
    border: 'border-pink-500/20 hover:border-pink-500/40',
  },
];

export default function VideoTemplates() {
  const { createProject } = useVideoStore();

  const handleTemplateClick = (template: typeof VIRAL_TEMPLATES[0]) => {
    createProject(template.label, `Make a ${template.label} video in ${template.style} style for ${template.niche}`);
  };

  const handleRemix = (template: typeof VIRAL_TEMPLATES[0], newTopic: string) => {
    createProject(`Remix: ${newTopic}`, `Use the same structure as ${template.label} but about ${newTopic}`);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Viral templates */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutGrid className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Viral Templates</h4>
        </div>

        <p className="text-[11px] text-zinc-500 mb-3">
          Pre-built structures for proven viral formats. Click to start a new project.
        </p>

        <div className="space-y-3">
          {VIRAL_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => handleTemplateClick(tmpl)}
              className={`group w-full rounded-2xl border ${tmpl.border} bg-gradient-to-br ${tmpl.accent} p-4 text-left transition-all hover:translate-y-[-1px] hover:shadow-[0_12px_30px_-10px_rgba(0,0,0,0.5)]`}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0">
                  {tmpl.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white mb-1">{tmpl.label}</h3>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">{tmpl.description}</p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                    <span>{tmpl.sceneCount} scenes</span>
                    <span className="capitalize">{tmpl.style.replace('-', ' ')}</span>
                    <span className="capitalize">{tmpl.music}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-700 group-hover:text-sky-400 transition-colors shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Remix system */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Remix System</h4>
        </div>

        <p className="text-[11px] text-zinc-500 mb-3">
          Reuse proven structures with a new topic.
        </p>

        <div className="space-y-2">
          {[
            { template: 'Motivation Reel', topic: 'coding career' },
            { template: 'Product Ad', topic: 'SaaS tool' },
            { template: 'Before / After', topic: 'room renovation' },
          ].map((remix) => (
            <button
              key={`${remix.template}-${remix.topic}`}
              onClick={() => {
                const tmpl = VIRAL_TEMPLATES.find((t) => t.label === remix.template);
                if (tmpl) handleRemix(tmpl, remix.topic);
              }}
              className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 text-left hover:border-violet-500/30 hover:bg-violet-500/[0.04] transition-all"
            >
              <p className="text-xs text-zinc-300">
                <span className="font-medium">{remix.template}</span>
                <span className="text-zinc-500"> → </span>
                <span className="text-violet-300">{remix.topic}</span>
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
