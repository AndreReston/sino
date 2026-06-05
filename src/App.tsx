import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useStore, SavedDesign } from './store/useStore';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import RightPanel from './components/RightPanel';
import ContextualToolbar from './components/ContextualToolbar';
import CanvasWorkspace from './components/CanvasWorkspace';
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

type AppView = 'landing' | 'auth' | 'dashboard' | 'workspace';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState<string>('Guest');
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeDesign, setActiveDesign] = useState<SavedDesign | null>(null);
  const store = useStore();

  const fetchDesigns = async (userId: string) => {
    const result = await getUserDesigns(userId);
    setDesigns(result);
  };

  const fetchUsername = async (userId: string) => {
    const profile = await getUserProfile(userId);
    setUsername(profile?.username ?? 'User');
  };

  useEffect(() => {
    // Check for existing session
    (async () => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        await fetchUsername(currentUser.id);
        await fetchDesigns(currentUser.id);
        setView('dashboard');
      }
    })();

    // Listen for auth state changes (login/logout from other tabs, etc.)
    const { data: { subscription } } = onAuthStateChange((newUser) => {
      if (newUser) {
        setUser(newUser);
        fetchUsername(newUser.id);
        fetchDesigns(newUser.id);
        setView('dashboard');
      } else {
        setUser(null);
        setUsername('Guest');
        setDesigns([]);
        setActiveDesign(null);
        setView('landing');
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
    setActiveDesign(null);
    setView('dashboard');
  };

  const handleLogin = async (email: string, password: string) => {
    const result = await loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      await fetchUsername(result.user.id);
      await fetchDesigns(result.user.id);
      setView('dashboard');
    }
    return { success: result.success, message: result.message };
  };

  const handleRegister = async (email: string, password: string, displayName: string) => {
    const result = await registerUser(email, password, displayName);
    if (result.success && result.user) {
      setUser(result.user);
      await fetchUsername(result.user.id);
      await fetchDesigns(result.user.id);
      setView('dashboard');
    }
    return { success: result.success, message: result.message };
  };

  const handleLogout = async () => {
    await logoutUser();
    setUser(null);
    setUsername('Guest');
    setDesigns([]);
    setActiveDesign(null);
    setView('landing');
    store.resetWorkspace();
  };

  const handleCreateDesign = () => {
    store.resetWorkspace();
    setActiveDesign(null);
    setView('workspace');
  };

  const handleOpenDesign = (design: SavedDesign) => {
    setActiveDesign(design);
    store.loadDesign(design);
    setView('workspace');
  };

  const handleSaveDesign = async () => {
    if (!user) return;
    const design = store.exportDesign();
    const now = new Date().toISOString();
    const savedDesign: SavedDesign = {
      ...design,
      id: activeDesign?.id ?? design.id,
      title: design.title || 'Untitled Design',
      createdAt: activeDesign?.createdAt ?? now,
      updatedAt: now,
    };
    const actualId = await saveUserDesign(user.id, savedDesign);
    savedDesign.id = actualId;
    setActiveDesign(savedDesign);
    await fetchDesigns(user.id);
  };

  if (view === 'landing') {
    return <LandingPage onLogin={() => { setAuthMode('login'); setView('auth'); }} onRegister={() => { setAuthMode('register'); setView('auth'); }} />;
  }

  if (view === 'auth') {
    return (
      <AuthPage
        mode={authMode}
        onModeChange={(next) => setAuthMode(next)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onBack={() => setView('landing')}
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
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="flex h-screen bg-canvas-bg overflow-hidden select-none">
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
