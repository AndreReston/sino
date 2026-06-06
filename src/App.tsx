import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { fabric } from 'fabric';
import { useStore, SavedDesign, ProjectMode } from './store/useStore';
import { useVideoStore } from './store/videoStore';
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

type AppView = 'landing' | 'auth' | 'dashboard' | 'workspace' | 'video-workspace';

const LAST_VIEW_KEY = 'sino:lastView';
const LAST_DESIGN_KEY = 'sino:lastDesignId';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('Guest');
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeDesign, setActiveDesign] = useState<SavedDesign | null>(null);
  const store = useStore();

  const persistView = (nextView: AppView) => {
    setView(nextView);
    try {
      localStorage.setItem(LAST_VIEW_KEY, nextView);
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

  useEffect(() => {
    // Check for existing session
    (async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchUsername(currentUser.id);
        const savedDesigns = await fetchDesigns(currentUser.id);

        const lastView = localStorage.getItem(LAST_VIEW_KEY);
        const lastDesignId = localStorage.getItem(LAST_DESIGN_KEY);

        if (lastView === 'workspace' && lastDesignId) {
          const design = savedDesigns.find(d => d.id === lastDesignId);
          if (design) {
            setActiveDesign(design);
            await store.loadDesign(design);
            setView('workspace');
            return;
          }
        }

        if (lastView === 'dashboard') {
          setView('dashboard');
          return;
        }

        if (lastView === 'video-workspace' && lastDesignId) {
          const design = savedDesigns.find(d => d.id === lastDesignId && d.projectMode === 'video');
          if (design) {
            setActiveDesign(design);
            useVideoStore.getState().resetStore();
            const savedProject = design.pages[0]?.canvas_data as any;
            if (savedProject?.id) {
              useVideoStore.getState().loadProject(savedProject);
            } else {
              useVideoStore.getState().createProject(design.title);
            }
            setView('video-workspace');
            return;
          }
        }

        setView('dashboard');
      }
    })();

    // Listen for auth state changes (login/logout from other tabs, etc.)
    const { data: { subscription } } = onAuthStateChange((newUser) => {
      if (newUser) {
        setUser(newUser);
        fetchUsername(newUser.id);
        fetchDesigns(newUser.id);
        persistView('dashboard');
      } else {
        setUser(null);
        setUsername('Guest');
        setDesigns([]);
        persistActiveDesign(null);
        persistView('landing');
        store.resetWorkspace();
      }
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
      persistActiveDesign(null);
      persistView('video-workspace');
    } else {
      store.resetWorkspace();
      store.setProjectMode(mode);
      persistActiveDesign(null);
      persistView('workspace');
    }
  };

  const handleOpenDesign = (design: SavedDesign) => {
    if (design.projectMode === 'video') {
      useVideoStore.getState().resetStore();
      const savedProject = design.pages[0]?.canvas_data as any;
      if (savedProject?.id) {
        useVideoStore.getState().loadProject(savedProject);
      } else {
        useVideoStore.getState().createProject(design.title);
      }
      persistActiveDesign(design);
      persistView('video-workspace');
    } else {
      persistActiveDesign(design);
      store.loadDesign(design);
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
      />
    );
  }

  if (view === 'video-workspace') {
    return (
      <VideoWorkspace
        onSave={handleSaveDesign}
        onBack={openDashboard}
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
