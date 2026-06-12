import { useEffect, useRef, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { fabric } from 'fabric';
import { useStore, SavedDesign, ProjectMode } from './store/useStore';
import { useVideoStore } from './store/videoStore';
import { loadFromIndexedDB } from './lib/indexedDBStorage';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import RightPanel from './components/RightPanel';
import ContextualToolbar from './components/ContextualToolbar';
import CanvasWorkspace from './components/CanvasWorkspace';
import VideoWorkspace from './components/video/VideoWorkspace';
import {
  getCurrentUser,
  getUserDesigns,
  loginUser,
  logoutUser,
  registerUser,
  saveUserDesign,
  getUserProfile,
  onAuthStateChange,
} from './lib/userStorage';
import { projectHasEphemeralUrls } from './lib/mediaUpload';

type AppView = 'landing' | 'auth' | 'dashboard' | 'workspace' | 'video-workspace';

const LAST_VIEW_KEY = 'sino:lastView';
const LAST_DESIGN_KEY = 'sino:lastDesignId';
const VIDEO_PROJECT_STORAGE_KEY = 'designforge_video_project';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('Guest');
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeDesign, setActiveDesign] = useState<SavedDesign | null>(null);
  const [workspaceDirty, setWorkspaceDirty] = useState(false);
  const [videoDirty, setVideoDirty] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');
  const savedWorkspaceSnapshotRef = useRef<{
    historyIndex: number;
    canvasWidth: number;
    canvasHeight: number;
    canvasBackground: string;
    canvasName: string;
  } | null>(null);
  const store = useStore();

  // Refs for autosave — keep stable references to avoid closure issues
  const userRef = useRef<User | null>(null);
  const viewRef = useRef<AppView>('landing');
  const activeDesignRef = useRef<SavedDesign | null>(null);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasPendingChangesRef = useRef<boolean>(false);

  useEffect(() => { userRef.current = user; }, [user]);
  useEffect(() => { viewRef.current = view; }, [view]);
  useEffect(() => { activeDesignRef.current = activeDesign; }, [activeDesign]);

  const markWorkspaceClean = () => {
    const state = useStore.getState();
    savedWorkspaceSnapshotRef.current = {
      historyIndex: state.historyIndex,
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      canvasBackground: state.canvasBackground,
      canvasName: state.canvasName,
    };
    setWorkspaceDirty(false);
  };

  useEffect(() => {
    // Subscribe to a small slice of the store using the hook's subscribe API
    const unsubscribe = useStore.subscribe(
      (s) => ({
        historyIndex: s.historyIndex,
        canvasWidth: s.canvasWidth,
        canvasHeight: s.canvasHeight,
        canvasBackground: s.canvasBackground,
        canvasName: s.canvasName,
      }),
      (next) => {
        if (viewRef.current !== 'workspace') return;
        const saved = savedWorkspaceSnapshotRef.current;
        const dirty = !saved
          || next.historyIndex !== saved.historyIndex
          || next.canvasWidth !== saved.canvasWidth
          || next.canvasHeight !== saved.canvasHeight
          || next.canvasBackground !== saved.canvasBackground
          || next.canvasName !== saved.canvasName;
        setWorkspaceDirty(dirty);
      },
    );

    return () => unsubscribe();
  }, [store]);

  useEffect(() => {
    hasPendingChangesRef.current = workspaceDirty || videoDirty;
  }, [workspaceDirty, videoDirty]);

  useEffect(() => {
    document.title = `${workspaceDirty || videoDirty ? '• ' : ''}DesignForge`;
  }, [workspaceDirty, videoDirty]);

  // Video project autosave to Supabase — debounced 4 seconds after last change
  useEffect(() => {
    const unsub = useVideoStore.subscribe((state) => {
      if (!state.project || viewRef.current !== 'video-workspace' || !userRef.current) return;
      // S1: Mark that there are unsaved changes
      hasPendingChangesRef.current = true;
      setVideoDirty(true);
      if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = setTimeout(async () => {
        const u = userRef.current;
        const vp = useVideoStore.getState().project;
        if (!u || !vp || projectHasEphemeralUrls(vp)) return;
        const now = new Date().toISOString();
        const cur = activeDesignRef.current;
        const dims = vp.aspectRatio === '16:9' ? { canvasWidth: 1920, canvasHeight: 1080 }
          : vp.aspectRatio === '1:1' ? { canvasWidth: 1080, canvasHeight: 1080 }
          : { canvasWidth: 1080, canvasHeight: 1920 };
        const savedDesign: SavedDesign = {
          id: cur?.id ?? `design_${Date.now()}`,
          title: vp.title || 'Untitled Video',
          pages: [{ page_id: cur?.pages?.[0]?.page_id ?? `page_${Date.now()}`, canvas_data: vp, thumbnail: '' }],
          canvasWidth: dims.canvasWidth,
          canvasHeight: dims.canvasHeight,
          canvasBackground: '#000000',
          canvasName: vp.title || 'Untitled Video',
          projectMode: 'video',
          createdAt: cur?.createdAt ?? now,
          updatedAt: now,
        };
        try {
          const actualId = await saveUserDesign(u.id, savedDesign);
          savedDesign.id = actualId;
          activeDesignRef.current = savedDesign;
          setActiveDesign(savedDesign);
          localStorage.setItem(LAST_DESIGN_KEY, actualId);
          // S1: Clear the pending changes flag after successful save
          hasPendingChangesRef.current = false;
          setVideoDirty(false);
          setLastSyncedAt(new Date().toLocaleString());
        } catch { /* silent fail */ }
      }, 4000);
    });
    return () => { unsub(); if (autosaveTimerRef.current) clearTimeout(autosaveTimerRef.current); };
  }, []);

  // S1: Add beforeunload warning for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasPendingChangesRef.current && userRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const persistView = (nextView: AppView) => {
    setView(nextView);
    try {
      localStorage.setItem(LAST_VIEW_KEY, nextView);
      // Eagerly save the video project when entering/leaving the video workspace
      if (nextView === 'video-workspace') {
        useVideoStore.getState().saveToLocalStorage();
      }
    } catch {
      // Ignore storage errors
    }
  };

  const persistActiveDesign = (design: SavedDesign | null) => {
    setActiveDesign(design);
    try {
      if (design?.id) {
        localStorage.setItem(LAST_DESIGN_KEY, design.id);
      } else {
        localStorage.removeItem(LAST_DESIGN_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  };

  const fetchDesigns = async (userId: string) => {
    const result = await getUserDesigns(userId);
    setDesigns(result);
    setLastSyncedAt(new Date().toLocaleString());
    return result;
  };

  const fetchUsername = async (userId: string) => {
    const profile = await getUserProfile(userId);
    setUsername(profile?.username ?? 'User');
  };

  const getVideoCanvasSize = (aspectRatio: string) => {
    switch (aspectRatio) {
      case '16:9': return { canvasWidth: 1920, canvasHeight: 1080 };
      case '1:1': return { canvasWidth: 1080, canvasHeight: 1080 };
      case '9:16':
      default:
        return { canvasWidth: 1080, canvasHeight: 1920 };
    }
  };

  // S4: Helper to validate canvas_data shape before deserialization
  const isValidCanvasData = (data: any): data is Record<string, any> => {
    if (!data || typeof data !== 'object') return false;
    // Minimal check: must have expected properties for a video project or canvas design
    const hasVideoProps = typeof data.id === 'string' && (Array.isArray(data.clips) || data.aspectRatio);
    const hasCanvasProps = typeof data.version === 'string' && (Array.isArray(data.objects) || typeof data.background === 'string');
    return hasVideoProps || hasCanvasProps;
  };

  useEffect(() => {
    // S5: Track whether the startup sequence has completed using a ref
    // This ensures the auth listener can see the updated value
    let bootPromise: Promise<void> | null = null;

    // Check for existing session — runs once on mount
    bootPromise = (async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        userRef.current = currentUser;
        await fetchUsername(currentUser.id);
        const savedDesigns = await fetchDesigns(currentUser.id);

        const lastView = localStorage.getItem(LAST_VIEW_KEY);
        const lastDesignId = localStorage.getItem(LAST_DESIGN_KEY);

        if (lastView === 'workspace') {
          if (lastDesignId) {
            const design = savedDesigns.find(d => d.id === lastDesignId);
            if (design) {
              setActiveDesign(design);
              await store.loadDesign(design);
              markWorkspaceClean();
              setView('workspace');
              return;
            }
          }
          store.resetWorkspace();
          markWorkspaceClean();
          setView('workspace');
          return;
        }

        if (lastView === 'dashboard') {
          setView('dashboard');
          return;
        }

        if (lastView === 'video-workspace') {
          if (lastDesignId) {
            const design = savedDesigns.find(d => d.id === lastDesignId && d.projectMode === 'video');
            if (design) {
              setActiveDesign(design);
              useVideoStore.getState().resetStore();
              const savedProject = design.pages[0]?.canvas_data as any;
              // S4: Validate canvas_data before using it
              if (isValidCanvasData(savedProject)) {
                useVideoStore.getState().loadProject(savedProject);
              } else {
                useVideoStore.getState().createProject(design.title);
              }
              setView('video-workspace');
              return;
            }
          }
          // Fall back to the in-progress video project stored in IndexedDB / localStorage
          const idbProject = await loadFromIndexedDB(VIDEO_PROJECT_STORAGE_KEY) as any;
          const rawProject = idbProject ? JSON.stringify(idbProject) : localStorage.getItem(VIDEO_PROJECT_STORAGE_KEY);
          if (rawProject) {
            try {
              const parsed = JSON.parse(rawProject);
              // S4: Validate deserialized data
              if (isValidCanvasData(parsed)) {
                useVideoStore.getState().resetStore();
                useVideoStore.getState().loadProject(parsed);
              } else {
                useVideoStore.getState().resetStore();
                useVideoStore.getState().createProject('Untitled Video');
              }
              setView('video-workspace');
              return;
            } catch { /* fall through */ }
          }
          useVideoStore.getState().resetStore();
          useVideoStore.getState().createProject('Untitled Video');
          setView('video-workspace');
          return;
        }

        setView('dashboard');
      }
    })();

    // S5: Set up boot completion flag and auth listener synchronization
    let bootComplete = false;
    if (bootPromise) {
      bootPromise.then(() => { bootComplete = true; }).catch(() => { bootComplete = true; });
    }

    // Auth listener — ONLY handles real sign-out and brand-new logins.
    // Every other event (INITIAL_SESSION, TOKEN_REFRESHED, SIGNED_IN on session
    // rehydration) must NEVER change navigation — they only keep the user object fresh.
    const { data: { subscription } } = onAuthStateChange((newUser, event) => {
      // Always keep user ref current for autosave etc.
      if (newUser) {
        setUser(newUser);
        userRef.current = newUser;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
        userRef.current = null;
        setUsername('Guest');
        setDesigns([]);
        persistActiveDesign(null);
        persistView('landing');
        store.resetWorkspace();
        return;
      }

      // S5: SIGNED_IN fires on: fresh login, page load session restore, tab focus token refresh.
      // Only treat it as a real login when:
      //  1. Boot is complete (initial restore already ran), AND
      //  2. There was no user before this event (genuinely unauthenticated → authenticated)
      if (event === 'SIGNED_IN' && bootComplete && !userRef.current) {
        if (newUser) {
          fetchUsername(newUser.id);
          fetchDesigns(newUser.id);
          persistView('dashboard');
        }
      }
      // All other events (TOKEN_REFRESHED, INITIAL_SESSION, SIGNED_IN during active session)
      // → silently ignored for navigation
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openDashboard = async () => {
    if (!user) return;
    await fetchDesigns(user.id);
    persistActiveDesign(null);
    persistView('dashboard');
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      await fetchUsername(result.user.id);
      await fetchDesigns(result.user.id);
      persistView('dashboard');
    }
    return { success: result.success, message: result.message };
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    const result = await registerUser(email, password, displayName);
    if (result.success && result.user) {
      setUser(result.user);
      await fetchUsername(result.user.id);
      await fetchDesigns(result.user.id);
      persistView('dashboard');
    }
    return { success: result.success, message: result.message };
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUsername('Guest');
    setDesigns([]);
    persistActiveDesign(null);
    persistView('landing');
    store.resetWorkspace();
  };

  const handleCreateDesign = (mode: ProjectMode = 'photo') => {
    if (mode === 'video') {
      useVideoStore.getState().resetStore();
      useVideoStore.getState().createProject('Untitled Video');
      setVideoDirty(false);
      setLastSyncedAt('');
      persistActiveDesign(null);
      persistView('video-workspace');
    } else {
      store.resetWorkspace();
      store.setProjectMode(mode);
      markWorkspaceClean();
      persistActiveDesign(null);
      persistView('workspace');
    }
  };

  const handleOpenDesign = async (design: SavedDesign) => {
    if (design.projectMode === 'video') {
      useVideoStore.getState().resetStore();
      const savedProject = design.pages[0]?.canvas_data as any;
      if (savedProject?.id) {
        useVideoStore.getState().loadProject(savedProject);
      } else {
        useVideoStore.getState().createProject(design.title);
      }
      setVideoDirty(false);
      setLastSyncedAt('');
      persistActiveDesign(design);
      persistView('video-workspace');
    } else {
      persistActiveDesign(design);
      await store.loadDesign(design);
      markWorkspaceClean();
      persistView('workspace');
    }
  };

  const handleDownloadDesign = async (design: SavedDesign) => {
    if (design.projectMode === 'video') {
      // For video designs, just open them — actual video export happens in the workspace
      handleOpenDesign(design);
      return;
    }

    // Export the first page as PNG using a temporary off-screen canvas
    const page = design.pages[0];
    if (!page?.canvas_data) return;

    const c = document.createElement('canvas');
    c.width = design.canvasWidth;
    c.height = design.canvasHeight;
    const off = new fabric.Canvas(c, { renderOnAddRemove: false });

    await new Promise<void>((resolve) => {
      off.loadFromJSON(page.canvas_data, () => {
        off.renderAll();
        resolve();
      });
    });

    const dataURL = off.toDataURL({ format: 'png', quality: 0.95, multiplier: 1 });
    const a = document.createElement('a');
    a.href = dataURL;
    a.download = `${design.title || 'design'}.png`;
    a.click();
    off.dispose();
  };

  const handleSaveDesign = async () => {
    if (!user) return;

    let savedDesign: SavedDesign;
    const now = new Date().toISOString();

    if (view === 'video-workspace') {
      const videoProject = useVideoStore.getState().project;
      if (!videoProject) return;
      if (projectHasEphemeralUrls(videoProject)) {
        console.warn('Cannot save project: some media files were not uploaded to the cloud. Sign in and re-upload them.');
        return;
      }

      const dims = getVideoCanvasSize(videoProject.aspectRatio);
      savedDesign = {
        id: activeDesign?.id ?? `design_${Date.now()}`,
        title: videoProject.title || 'Untitled Video',
        pages: [{
          page_id: activeDesign?.pages?.[0]?.page_id ?? `page_${Date.now()}`,
          canvas_data: videoProject,
          thumbnail: '',
        }],
        canvasWidth: dims.canvasWidth,
        canvasHeight: dims.canvasHeight,
        canvasBackground: '#000000',
        canvasName: videoProject.title || 'Untitled Video',
        projectMode: 'video',
        createdAt: activeDesign?.createdAt ?? now,
        updatedAt: now,
      };
    } else {
      const design = store.exportDesign();
      savedDesign = {
        ...design,
        id: activeDesign?.id ?? design.id,
        title: design.title || 'Untitled Design',
        createdAt: activeDesign?.createdAt ?? now,
        updatedAt: now,
      };
    }

    const actualId = await saveUserDesign(user.id, savedDesign);
    savedDesign.id = actualId;
    setActiveDesign(savedDesign);
    await fetchDesigns(user.id);
    if (view === 'workspace') {
      markWorkspaceClean();
      setLastSyncedAt(new Date().toLocaleString());
    }
    if (view === 'video-workspace') {
      setVideoDirty(false);
      setLastSyncedAt(new Date().toLocaleString());
    }
  };

  if (view === 'landing') {
    return <LandingPage onLogin={() => { setAuthMode('login'); persistView('auth'); }} onRegister={() => { setAuthMode('register'); persistView('auth'); }} />;
  }

  if (view === 'auth') {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={(next) => setAuthMode(next)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onBack={() => persistView('landing')}
      />
    );
  }

  if (view === 'dashboard') {
    return (
      <Dashboard
        user={username}
        designs={designs}
        onCreate={handleCreateDesign}
        onOpen={handleOpenDesign}
        onDownload={handleDownloadDesign}
        onLogout={handleLogout}
        hasPendingChanges={workspaceDirty || videoDirty}
        syncStatus={workspaceDirty || videoDirty ? 'You have unsaved changes' : lastSyncedAt ? `Last synced ${lastSyncedAt}` : 'Not synced yet'}
      />
    );
  }

  if (view === 'video-workspace') {
    return (
      <VideoWorkspace
        onBack={openDashboard}
        onSave={handleSaveDesign}
        hasUnsavedChanges={videoDirty}
      />
    );
  }

  return (
    <div className="flex h-screen bg-canvas-bg select-none">
      <LeftSidebar />
      <div className="flex flex-1 min-w-0 min-h-0">
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <TopBar onSave={handleSaveDesign} onBack={openDashboard} />
          <ContextualToolbar />
          <CanvasWorkspace />
        </div>
        <RightPanel />
      </div>
    </div>
  );
}
