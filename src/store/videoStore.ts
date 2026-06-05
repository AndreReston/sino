import { create } from 'zustand';

export type VideoStyle =
  | 'cinematic' | 'anime' | 'documentary' | 'tiktok' | 'cyberpunk'
  | 'corporate' | 'retro-vhs' | 'minimal-clean' | 'dramatic' | 'vaporwave';

export type VoiceGender = 'male' | 'female' | 'neutral';
export type VoiceAge = 'young' | 'middle' | 'senior';
export type VoiceTone = 'professional' | 'casual' | 'energetic' | 'calm' | 'dramatic';

export type MusicMood = 'hype' | 'sad' | 'cinematic' | 'chill' | 'upbeat' | 'mysterious' | 'epic' | 'lofi';

export type CaptionStyle = 'karaoke' | 'pop-up' | 'tiktok-subtitles' | 'minimal' | 'bold-highlight' | 'retro';

export type Platform = 'tiktok' | 'instagram-reels' | 'youtube-shorts' | 'youtube-landscape' | 'ads-15s' | 'ads-30s';

export type VibePreset =
  | 'cinematic' | 'warmer' | 'dreamy' | 'gritty' | 'neon' | 'vintage'
  | 'moody' | 'bright' | 'clean' | 'dramatic' | 'faded' | 'cyberpunk';

export type EffectPreset =
  | 'glitch' | 'motion-blur' | 'film-grain' | 'cinematic-zoom'
  | 'slow-motion-impact' | 'zoom-punch' | 'vhs-distortion' | 'bokeh';

export type SceneStatus = 'draft' | 'generating' | 'ready' | 'error';

export interface SceneCard {
  id: string;
  order: number;
  visualDescription: string;
  scriptLine: string;
  durationSeconds: number;
  stylePreset: VideoStyle;
  transitionIn: string;
  transitionOut: string;
  status: SceneStatus;
  thumbnailUrl: string;
  generatedVideoUrl: string;
  voiceoverId: string | null;
  captionText: string;
  captionStyle: CaptionStyle;
  vibePreset: VibePreset;
  effects: EffectPreset[];
}

export interface VoiceConfig {
  gender: VoiceGender;
  age: VoiceAge;
  tone: VoiceTone;
  language: string;
  speed: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface VideoProject {
  id: string;
  title: string;
  goal: string;
  niche: string;
  tone: string;
  platform: Platform;
  style: VideoStyle;
  voice: VoiceConfig;
  musicMood: MusicMood;
  scenes: SceneCard[];
  chatHistory: ChatMessage[];
  viralityScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface VideoStoreState {
  project: VideoProject | null;
  activeSceneId: string | null;
  isGenerating: boolean;
  rightPanelTab: 'ai-chat' | 'script' | 'vibes' | 'audio' | 'captions' | 'export' | 'templates' | 'engagement';
  generationProgress: number;
  promptHistory: string[];
  versionStack: VideoProject[];
  versionIndex: number;
}

export interface VideoStoreActions {
  createProject: (title: string, prompt: string) => void;
  updateProject: (updates: Partial<VideoProject>) => void;
  setActiveSceneId: (id: string | null) => void;
  setRightPanelTab: (tab: VideoStoreState['rightPanelTab']) => void;
  addScene: (afterSceneId?: string | null) => void;
  updateScene: (sceneId: string, updates: Partial<SceneCard>) => void;
  removeScene: (sceneId: string) => void;
  reorderScenes: (sceneId: string, newIndex: number) => void;
  regenerateScene: (sceneId: string, type: 'all' | 'visual' | 'audio' | 'style') => void;
  generateFullVideo: () => void;
  setIsGenerating: (v: boolean) => void;
  addChatMessage: (role: 'user' | 'assistant', content: string) => void;
  processAICommand: (command: string) => void;
  applyVibePreset: (preset: VibePreset, sceneId?: string) => void;
  addEffect: (effect: EffectPreset, sceneId?: string) => void;
  removeEffect: (effect: EffectPreset, sceneId?: string) => void;
  updateVoice: (updates: Partial<VoiceConfig>) => void;
  setMusicMood: (mood: MusicMood) => void;
  setPlatform: (platform: Platform) => void;
  calculateViralityScore: () => number;
  pushVersion: () => void;
  undoVersion: () => void;
  redoVersion: () => void;
  resetStore: () => void;
}

type VStore = VideoStoreState & VideoStoreActions;

const DEFAULT_VOICE: VoiceConfig = {
  gender: 'male',
  age: 'young',
  tone: 'energetic',
  language: 'en',
  speed: 1.0,
};

const createBlankScene = (order: number): SceneCard => ({
  id: `scene_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  order,
  visualDescription: '',
  scriptLine: '',
  durationSeconds: 3,
  stylePreset: 'cinematic',
  transitionIn: 'fade',
  transitionOut: 'fade',
  status: 'draft',
  thumbnailUrl: '',
  generatedVideoUrl: '',
  voiceoverId: null,
  captionText: '',
  captionStyle: 'tiktok-subtitles',
  vibePreset: 'cinematic',
  effects: [],
});

export const useVideoStore = create<VStore>((set, get) => ({
  project: null,
  activeSceneId: null,
  isGenerating: false,
  rightPanelTab: 'ai-chat',
  generationProgress: 0,
  promptHistory: [],
  versionStack: [],
  versionIndex: -1,

  createProject: (title, prompt) => {
    const project: VideoProject = {
      id: `proj_${Date.now()}`,
      title,
      goal: '',
      niche: '',
      tone: '',
      platform: 'tiktok',
      style: 'cinematic',
      voice: { ...DEFAULT_VOICE },
      musicMood: 'hype',
      scenes: [createBlankScene(0)],
      chatHistory: [],
      viralityScore: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set({ project, activeSceneId: project.scenes[0].id, versionStack: [project], versionIndex: 0 });
    get().processAICommand(prompt);
  },

  updateProject: (updates) => {
    set((s) => ({
      project: s.project ? { ...s.project, ...updates, updatedAt: new Date().toISOString() } : null,
    }));
  },

  setActiveSceneId: (id) => set({ activeSceneId: id }),
  setRightPanelTab: (tab) => set({ rightPanelTab: tab }),

  addScene: (afterSceneId) => {
    const { project } = get();
    if (!project) return;
    const scenes = [...project.scenes];
    let insertAt = scenes.length;
    if (afterSceneId) {
      const idx = scenes.findIndex((s) => s.id === afterSceneId);
      if (idx >= 0) insertAt = idx + 1;
    }
    const newScene = createBlankScene(insertAt);
    scenes.splice(insertAt, 0, newScene);
    scenes.forEach((s, i) => { s.order = i; });
    set({ project: { ...project, scenes }, activeSceneId: newScene.id });
    get().pushVersion();
  },

  updateScene: (sceneId, updates) => {
    const { project } = get();
    if (!project) return;
    const scenes = project.scenes.map((s) => s.id === sceneId ? { ...s, ...updates } : s);
    set({ project: { ...project, scenes } });
  },

  removeScene: (sceneId) => {
    const { project, activeSceneId } = get();
    if (!project || project.scenes.length <= 1) return;
    const scenes = project.scenes.filter((s) => s.id !== sceneId);
    scenes.forEach((s, i) => { s.order = i; });
    const newActive = activeSceneId === sceneId ? scenes[0]?.id ?? null : activeSceneId;
    set({ project: { ...project, scenes }, activeSceneId: newActive });
    get().pushVersion();
  },

  reorderScenes: (sceneId, newIndex) => {
    const { project } = get();
    if (!project) return;
    const scenes = [...project.scenes];
    const oldIndex = scenes.findIndex((s) => s.id === sceneId);
    if (oldIndex < 0) return;
    const [moved] = scenes.splice(oldIndex, 1);
    scenes.splice(newIndex, 0, moved);
    scenes.forEach((s, i) => { s.order = i; });
    set({ project: { ...project, scenes } });
    get().pushVersion();
  },

  regenerateScene: (sceneId, _type) => {
    set({ isGenerating: true, generationProgress: 0 });
    const { project } = get();
    if (!project) return;

    // Simulate generation
    const interval = setInterval(() => {
      const prog = get().generationProgress;
      if (prog >= 100) {
        clearInterval(interval);
        const scene = project.scenes.find((s) => s.id === sceneId);
        if (scene) {
          const stockImages = [
            'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400',
            'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=400',
            'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400',
            'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=400',
            'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=400',
          ];
          get().updateScene(sceneId, {
            status: 'ready',
            thumbnailUrl: stockImages[Math.floor(Math.random() * stockImages.length)],
          });
        }
        set({ isGenerating: false, generationProgress: 0 });
        get().pushVersion();
      } else {
        set({ generationProgress: prog + 8 });
      }
    }, 120);
  },

  generateFullVideo: () => {
    set({ isGenerating: true, generationProgress: 0 });
    const { project } = get();
    if (!project) return;

    const stockImages = [
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=400',
      'https://images.pexels.com/photos/1629212/pexels-photo-1629212.jpeg?w=400',
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?w=400',
      'https://images.pexels.com/photos/924824/pexels-photo-924824.jpeg?w=400',
      'https://images.pexels.com/photos/1261728/pexels-photo-1261728.jpeg?w=400',
      'https://images.pexels.com/photos/3617500/pexels-photo-3617500.jpeg?w=400',
    ];

    const totalScenes = project.scenes.length;
    let currentScene = 0;
    const interval = setInterval(() => {
      const prog = get().generationProgress;
      if (currentScene >= totalScenes || prog >= 100) {
        clearInterval(interval);
        set({ isGenerating: false, generationProgress: 100 });
        setTimeout(() => set({ generationProgress: 0 }), 1000);
        get().pushVersion();
        return;
      }
      const scene = project.scenes[currentScene];
      if (scene) {
        get().updateScene(scene.id, {
          status: 'ready',
          thumbnailUrl: stockImages[currentScene % stockImages.length],
        });
      }
      currentScene++;
      set({ generationProgress: Math.round((currentScene / totalScenes) * 100) });
    }, 600);
  },

  setIsGenerating: (v) => set({ isGenerating: v }),

  addChatMessage: (role, content) => {
    const { project } = get();
    if (!project) return;
    const msg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role,
      content,
      timestamp: Date.now(),
    };
    set({ project: { ...project, chatHistory: [...project.chatHistory, msg] } });
  },

  processAICommand: (command) => {
    const { project } = get();
    if (!project) return;

    get().addChatMessage('user', command);
    set({ promptHistory: [...get().promptHistory, command] });

    // Intent interpretation
    const lowerCmd = command.toLowerCase();
    let response = '';
    let projectUpdates: Partial<VideoProject> = {};

    // Detect platform
    if (lowerCmd.includes('tiktok') || lowerCmd.includes('reel')) {
      projectUpdates.platform = 'tiktok';
      projectUpdates.tone = 'high energy';
    } else if (lowerCmd.includes('youtube') && lowerCmd.includes('short')) {
      projectUpdates.platform = 'youtube-shorts';
    } else if (lowerCmd.includes('youtube')) {
      projectUpdates.platform = 'youtube-landscape';
    }

    // Detect niche / style
    if (lowerCmd.includes('gym') || lowerCmd.includes('fitness') || lowerCmd.includes('workout')) {
      projectUpdates.niche = 'fitness';
      projectUpdates.musicMood = 'hype';
    } else if (lowerCmd.includes('product') || lowerCmd.includes('ad')) {
      projectUpdates.niche = 'product';
      projectUpdates.musicMood = 'upbeat';
    } else if (lowerCmd.includes('study') || lowerCmd.includes('aesthetic')) {
      projectUpdates.niche = 'study-aesthetic';
      projectUpdates.musicMood = 'lofi';
    } else if (lowerCmd.includes('documentary') || lowerCmd.includes('story')) {
      projectUpdates.niche = 'documentary';
      projectUpdates.musicMood = 'cinematic';
    }

    // Detect style
    if (lowerCmd.includes('cinematic')) projectUpdates.style = 'cinematic';
    else if (lowerCmd.includes('anime')) projectUpdates.style = 'anime';
    else if (lowerCmd.includes('cyberpunk') || lowerCmd.includes('neon')) projectUpdates.style = 'cyberpunk';
    else if (lowerCmd.includes('retro') || lowerCmd.includes('vhs')) projectUpdates.style = 'retro-vhs';
    else if (lowerCmd.includes('corporate') || lowerCmd.includes('professional')) projectUpdates.style = 'corporate';
    else if (lowerCmd.includes('minimal') || lowerCmd.includes('clean')) projectUpdates.style = 'minimal-clean';
    else if (lowerCmd.includes('dramatic')) projectUpdates.style = 'dramatic';

    // Detect tone
    if (lowerCmd.includes('funny') || lowerCmd.includes('gen z')) projectUpdates.tone = 'casual';
    else if (lowerCmd.includes('serious') || lowerCmd.includes('professional')) projectUpdates.tone = 'professional';
    else if (lowerCmd.includes('emotional') || lowerCmd.includes('emotional')) projectUpdates.tone = 'dramatic';
    else if (lowerCmd.includes('energetic') || lowerCmd.includes('hype')) projectUpdates.tone = 'energetic';

    // Script refinement commands
    const scenes = [...project.scenes];
    if (lowerCmd.includes('make it shorter')) {
      scenes.forEach((s) => { s.durationSeconds = Math.max(2, s.durationSeconds - 1); });
      response = 'Shortened each scene duration for a faster pace. The video now moves quicker to maintain viewer attention.';
    } else if (lowerCmd.includes('make it longer') || lowerCmd.includes('extend')) {
      scenes.forEach((s) => { s.durationSeconds = Math.min(15, s.durationSeconds + 1); });
      response = 'Extended each scene for more breathing room. The video now has a more relaxed pace.';
    } else if (lowerCmd.includes('add suspense')) {
      if (scenes.length >= 2) {
        scenes[scenes.length - 1].vibePreset = 'dramatic';
        scenes[scenes.length - 1].effects = ['slow-motion-impact'];
      }
      response = 'Added suspense to the final scene with a dramatic vibe and slow-motion impact effect. The buildup creates tension before the payoff.';
    } else if (lowerCmd.includes('more energy') || lowerCmd.includes('hype')) {
      scenes.forEach((s) => { s.vibePreset = 'neon'; s.effects = ['zoom-punch']; });
      projectUpdates.musicMood = 'hype';
      response = 'Boosted the energy across all scenes with neon vibes and zoom-punch effects. Music switched to hype mode for maximum impact.';
    } else if (lowerCmd.includes('darker') || lowerCmd.includes('moody')) {
      scenes.forEach((s) => { s.vibePreset = 'moody'; });
      projectUpdates.musicMood = 'mysterious';
      response = 'Applied a moody, darker tone across all scenes. Music switched to mysterious for a brooding atmosphere.';
    } else if (lowerCmd.includes('warmer')) {
      scenes.forEach((s) => { s.vibePreset = 'warmer'; });
      response = 'Warmed up the color palette across all scenes for a cozy, inviting feel.';
    } else if (lowerCmd.includes('dreamy')) {
      scenes.forEach((s) => { s.vibePreset = 'dreamy'; s.effects = ['bokeh']; });
      response = 'Applied a dreamy vibe with soft bokeh effects across all scenes. Perfect for emotional or aesthetic content.';
    } else if (lowerCmd.includes('glitch')) {
      scenes.forEach((s) => { s.effects = ['glitch']; });
      response = 'Added glitch effects to all scenes for a techy, edgy look.';
    } else if (lowerCmd.includes('grain') || lowerCmd.includes('film')) {
      scenes.forEach((s) => { s.effects = ['film-grain']; s.vibePreset = 'vintage'; });
      response = 'Applied film grain and a vintage vibe for that classic cinema look.';
    } else if (lowerCmd.includes('stronger hook')) {
      if (scenes.length > 0) {
        scenes[0].durationSeconds = Math.max(scenes[0].durationSeconds, 4);
        scenes[0].scriptLine = scenes[0].scriptLine || 'You won\'t believe what happens next...';
        scenes[0].effects = ['cinematic-zoom'];
      }
      response = 'Strengthened the opening hook with a longer duration and cinematic zoom. The first scene now grabs attention immediately.';
    } else if (lowerCmd.includes('fix pacing')) {
      // Auto-balance durations
      const avgDuration = Math.round(scenes.reduce((a, s) => a + s.durationSeconds, 0) / scenes.length);
      scenes.forEach((s, i) => {
        if (i === 0) s.durationSeconds = Math.max(avgDuration - 1, 2);
        else if (i === scenes.length - 1) s.durationSeconds = Math.max(avgDuration + 1, 3);
        else s.durationSeconds = avgDuration;
      });
      response = 'Rebalanced scene durations for better pacing: shorter hook, steady middle, extended payoff.';
    } else if (lowerCmd.includes('apple ad') || lowerCmd.includes('apple')) {
      scenes.forEach((s) => { s.vibePreset = 'clean'; s.stylePreset = 'minimal-clean'; s.effects = ['cinematic-zoom']; });
      projectUpdates.style = 'minimal-clean';
      projectUpdates.musicMood = 'chill';
      response = 'Applied an Apple-ad inspired aesthetic: minimal clean style, cinematic zoom transitions, and chill background music. Pure and elegant.';
    } else if (lowerCmd.includes('regenerate all')) {
      response = 'Regenerating all scenes from scratch with the current settings...';
      setTimeout(() => get().generateFullVideo(), 500);
    } else {
      // Auto-generate scenes based on the prompt
      const sceneCount = lowerCmd.includes('short') ? 3 : lowerCmd.includes('long') ? 6 : 4;
      const newScenes: SceneCard[] = [];

      const structureTemplates: Record<string, string[]> = {
        fitness: ['Opening shot: intense gym environment', 'Close-up: determination in the eyes', 'Action: the workout montage', 'Payoff: transformation reveal'],
        product: ['Hook: problem statement', 'Solution: product reveal', 'Features: close-up demonstration', 'CTA: where to get it'],
        'study-aesthetic': ['Cozy setup: desk and coffee', 'Focus mode: deep work', 'Aesthetic break: lo-fi moment', 'Accomplishment: closing the book'],
        documentary: ['Context: establishing the scene', 'Subject: introducing the story', 'Detail: close-up evidence', 'Revelation: the key insight'],
        default: ['Hook: grab attention', 'Context: set the scene', 'Development: build the message', 'Payoff: deliver the impact'],
      };

      const template = structureTemplates[projectUpdates.niche || project.niche || 'default'] || structureTemplates.default;
      const usedCount = Math.min(sceneCount, template.length);

      for (let i = 0; i < usedCount; i++) {
        const scene = createBlankScene(i);
        scene.visualDescription = template[i];
        scene.scriptLine = '';
        scene.durationSeconds = i === 0 ? 3 : i === usedCount - 1 ? 4 : 3;
        scene.stylePreset = (projectUpdates.style || project.style) as VideoStyle;
        scene.vibePreset = 'cinematic';
        newScenes.push(scene);
      }

      // If existing scenes are just drafts, replace them
      if (project.scenes.every((s) => s.status === 'draft' && !s.visualDescription)) {
        set({ project: { ...project, scenes: newScenes, ...projectUpdates }, activeSceneId: newScenes[0].id });
      } else {
        // Otherwise, update existing scene descriptions
        newScenes.forEach((ns, i) => {
          if (scenes[i]) {
            scenes[i].visualDescription = ns.visualDescription;
          }
        });
        set({ project: { ...project, scenes, ...projectUpdates } });
      }

      const detectedItems: string[] = [];
      if (projectUpdates.platform) detectedItems.push(`Platform: ${projectUpdates.platform}`);
      if (projectUpdates.niche) detectedItems.push(`Niche: ${projectUpdates.niche}`);
      if (projectUpdates.style) detectedItems.push(`Style: ${projectUpdates.style}`);
      if (projectUpdates.tone) detectedItems.push(`Tone: ${projectUpdates.tone}`);
      if (projectUpdates.musicMood) detectedItems.push(`Music: ${projectUpdates.musicMood}`);

      response = `I've created a ${sceneCount}-scene storyboard based on your prompt.${detectedItems.length > 0 ? '\n\nDetected: ' + detectedItems.join(', ') : ''}\n\nYour scenes follow a ${projectUpdates.niche || project.niche || 'general'} structure: hook, context, development, payoff. Click "Generate Video" to bring it to life, or refine individual scenes.`;
    }

    if (Object.keys(projectUpdates).length > 0) {
      const currentProject = get().project;
      if (currentProject) {
        set({ project: { ...currentProject, ...projectUpdates } });
      }
    }

    setTimeout(() => {
      get().addChatMessage('assistant', response);
      get().calculateViralityScore();
    }, 400);
  },

  applyVibePreset: (preset, sceneId) => {
    const { project } = get();
    if (!project) return;
    if (sceneId) {
      get().updateScene(sceneId, { vibePreset: preset });
    } else {
      const scenes = project.scenes.map((s) => ({ ...s, vibePreset: preset }));
      set({ project: { ...project, scenes } });
    }
    get().pushVersion();
  },

  addEffect: (effect, sceneId) => {
    const { project } = get();
    if (!project) return;
    if (sceneId) {
      const scene = project.scenes.find((s) => s.id === sceneId);
      if (scene && !scene.effects.includes(effect)) {
        get().updateScene(sceneId, { effects: [...scene.effects, effect] });
      }
    } else {
      const scenes = project.scenes.map((s) => ({
        ...s,
        effects: s.effects.includes(effect) ? s.effects : [...s.effects, effect],
      }));
      set({ project: { ...project, scenes } });
    }
    get().pushVersion();
  },

  removeEffect: (effect, sceneId) => {
    const { project } = get();
    if (!project) return;
    if (sceneId) {
      const scene = project.scenes.find((s) => s.id === sceneId);
      if (scene) {
        get().updateScene(sceneId, { effects: scene.effects.filter((e) => e !== effect) });
      }
    } else {
      const scenes = project.scenes.map((s) => ({ ...s, effects: s.effects.filter((e) => e !== effect) }));
      set({ project: { ...project, scenes } });
    }
    get().pushVersion();
  },

  updateVoice: (updates) => {
    const { project } = get();
    if (!project) return;
    set({ project: { ...project, voice: { ...project.voice, ...updates } } });
  },

  setMusicMood: (mood) => {
    get().updateProject({ musicMood: mood });
  },

  setPlatform: (platform) => {
    get().updateProject({ platform });
  },

  calculateViralityScore: () => {
    const { project } = get();
    if (!project) return 0;

    let score = 50; // base

    // Strong hook (first scene)
    if (project.scenes[0]?.visualDescription?.toLowerCase().includes('hook')) score += 10;
    if (project.scenes[0]?.durationSeconds <= 3) score += 5;

    // Scene count
    if (project.scenes.length >= 4 && project.scenes.length <= 7) score += 10;

    // Platform fit
    if (project.platform === 'tiktok') score += 8;

    // Style alignment
    if (project.style === 'tiktok' || project.style === 'cyberpunk') score += 5;

    // Effects
    const totalEffects = project.scenes.reduce((a, s) => a + s.effects.length, 0);
    if (totalEffects >= 2) score += 8;

    // Music mood match
    if (project.musicMood === 'hype' || project.musicMood === 'epic') score += 5;

    // Captions
    if (project.scenes.some((s) => s.captionStyle !== 'minimal')) score += 4;

    score = Math.min(99, Math.max(10, score));
    set({ project: { ...project, viralityScore: score } });
    return score;
  },

  pushVersion: () => {
    const { project, versionStack, versionIndex } = get();
    if (!project) return;
    const newStack = versionStack.slice(0, versionIndex + 1);
    newStack.push(JSON.parse(JSON.stringify(project)));
    set({ versionStack: newStack, versionIndex: newStack.length - 1 });
  },

  undoVersion: () => {
    const { versionIndex, versionStack } = get();
    if (versionIndex <= 0) return;
    const newIndex = versionIndex - 1;
    set({ project: JSON.parse(JSON.stringify(versionStack[newIndex])), versionIndex: newIndex });
  },

  redoVersion: () => {
    const { versionIndex, versionStack } = get();
    if (versionIndex >= versionStack.length - 1) return;
    const newIndex = versionIndex + 1;
    set({ project: JSON.parse(JSON.stringify(versionStack[newIndex])), versionIndex: newIndex });
  },

  resetStore: () => {
    set({
      project: null,
      activeSceneId: null,
      isGenerating: false,
      rightPanelTab: 'ai-chat',
      generationProgress: 0,
      promptHistory: [],
      versionStack: [],
      versionIndex: -1,
    });
  },
}));
