import {
  AlertCircle, CheckCircle2,
  Lightbulb, Users, Zap,
} from 'lucide-react';
import { useVideoStore } from '../../store/videoStore';

export default function EngagementScore() {
  const { project, calculateViralityScore } = useVideoStore();

  if (!project) return null;

  const score = project.viralityScore || calculateViralityScore();

  const getScoreColor = (s: number) => {
    if (s >= 80) return 'text-emerald-400';
    if (s >= 60) return 'text-sky-400';
    if (s >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreLabel = (s: number) => {
    if (s >= 80) return 'High Viral Potential';
    if (s >= 60) return 'Good Potential';
    if (s >= 40) return 'Average';
    return 'Needs Improvement';
  };

  const getScoreRingColor = (s: number) => {
    if (s >= 80) return '#34d399';
    if (s >= 60) return '#38bdf8';
    if (s >= 40) return '#fbbf24';
    return '#f87171';
  };

  // Suggestions based on current state
  const suggestions: { text: string; type: 'improve' | 'good' }[] = [];

  if (project.scenes[0]?.durationSeconds > 4) {
    suggestions.push({ text: 'Shorten the opening hook to under 3 seconds for better retention', type: 'improve' });
  } else {
    suggestions.push({ text: 'Hook duration is optimal for fast attention grab', type: 'good' });
  }

  if (project.scenes.length < 4) {
    suggestions.push({ text: 'Add more scenes (4-7 is optimal for short-form)', type: 'improve' });
  } else {
    suggestions.push({ text: 'Scene count is in the optimal range', type: 'good' });
  }

  if (project.musicMood === 'hype' || project.musicMood === 'epic') {
    suggestions.push({ text: 'Music mood drives engagement for this format', type: 'good' });
  } else {
    suggestions.push({ text: 'Consider hype or epic music for better engagement', type: 'improve' });
  }

  if (!project.scenes.some((s) => s.effects.length > 0)) {
    suggestions.push({ text: 'Add visual effects to increase visual interest', type: 'improve' });
  } else {
    suggestions.push({ text: 'Visual effects add engagement value', type: 'good' });
  }

  if (!project.scenes.some((s) => s.captionStyle !== 'minimal')) {
    suggestions.push({ text: 'Add bold captions to boost mobile watch time', type: 'improve' });
  }

  // Audience targeting
  const audienceMap: Record<string, string[]> = {
    fitness: ['Gen Z fitness enthusiasts', 'Gym content consumers', 'Self-improvement audience'],
    product: ['Shopping enthusiasts', 'Tech early adopters', 'Deal seekers'],
    'study-aesthetic': ['Students', 'Gen Z aesthetic community', 'Productivity enthusiasts'],
    documentary: ['Curious learners', 'True crime fans', 'Educational content consumers'],
    entertainment: ['Gen Z social media users', 'TikTok daily users', 'Meme culture consumers'],
  };

  const audiences = audienceMap[project.niche || 'entertainment'] || audienceMap.entertainment;

  return (
    <div className="p-4 space-y-5">
      {/* Virality score */}
      <div className="flex flex-col items-center py-4">
        <div className="relative w-32 h-32 mb-4">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke={getScoreRingColor(score)}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 327} 327`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}</span>
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Score</span>
          </div>
        </div>
        <p className={`text-sm font-semibold ${getScoreColor(score)}`}>{getScoreLabel(score)}</p>
        <p className="text-[11px] text-zinc-500 mt-1">Engagement prediction based on structure, style, and timing</p>
      </div>

      {/* Score breakdown */}
      <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Score Breakdown</h4>
        <div className="space-y-2">
          {[
            { label: 'Hook Strength', value: project.scenes[0]?.durationSeconds <= 3 ? 85 : 60 },
            { label: 'Pacing', value: project.scenes.length >= 4 ? 80 : 55 },
            { label: 'Visual Interest', value: project.scenes.some((s) => s.effects.length > 0) ? 75 : 45 },
            { label: 'Music Match', value: ['hype', 'epic', 'upbeat'].includes(project.musicMood) ? 80 : 55 },
            { label: 'Caption Impact', value: project.scenes.some((s) => s.captionStyle !== 'minimal') ? 70 : 40 },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-zinc-400">{item.label}</span>
                <span className={getScoreColor(item.value)}>{item.value}</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-zinc-800">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${item.value}%`, backgroundColor: getScoreRingColor(item.value) }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Improvement suggestions */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-amber-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Suggestions</h4>
        </div>

        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 rounded-xl border p-3 ${
                s.type === 'good'
                  ? 'border-emerald-500/20 bg-emerald-500/[0.04]'
                  : 'border-amber-500/20 bg-amber-500/[0.04]'
              }`}
            >
              {s.type === 'good' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <p className="text-xs text-zinc-300">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Audience targeting */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Target Audience</h4>
        </div>

        <div className="flex flex-wrap gap-2">
          {audiences.map((audience) => (
            <span key={audience} className="px-3 py-1.5 rounded-lg text-xs text-zinc-300 bg-white/[0.03] border border-white/[0.06]">
              {audience}
            </span>
          ))}
        </div>
      </div>

      {/* Content optimization */}
      <div className="rounded-xl border border-sky-500/20 bg-sky-500/[0.04] p-4">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="w-4 h-4 text-sky-400" />
          <h4 className="text-xs font-semibold text-zinc-200">Content Optimization Engine</h4>
        </div>
        <div className="space-y-1 text-[11px] text-zinc-400">
          <p>Improves hook retention automatically</p>
          <p>Suggests cuts at attention drop points</p>
          <p>Optimizes scene pacing for platform</p>
        </div>
      </div>
    </div>
  );
}
