import React, { useEffect, useState } from 'react';
import { useStore, SavedDesign } from './store/useStore';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import Dashboard from './components/Dashboard';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import ContextualToolbar from './components/ContextualToolbar';
import CanvasWorkspace from './components/CanvasWorkspace';
import {
  getCurrentUser,
  getUserDesigns,
  loginUser,
  logoutUser,
  registerUser,
  saveUserDesign,
} from './lib/userStorage';

type AppView = 'landing' | 'auth' | 'dashboard' | 'workspace';

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [user, setUser] = useState<string | null>(null);
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeDesign, setActiveDesign] = useState<SavedDesign | null>(null);
  const store = useStore();

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setDesigns(getUserDesigns(currentUser));
      setView('dashboard');
    }
  }, []);

  const openDashboard = () => {
    if (!user) return;
    setDesigns(getUserDesigns(user));
    setActiveDesign(null);
    setView('dashboard');
  };

  const handleLogin = (username: string, password: string) => {
    const result = loginUser(username, password);
    if (result.success) {
      setUser(username);
      setDesigns(getUserDesigns(username));
      setView('dashboard');
    }
    return result;
  };

  const handleRegister = (username: string, password: string) => {
    const result = registerUser(username, password);
    if (result.success) {
      setUser(username);
      setDesigns([]);
      setView('dashboard');
    }
    return result;
  };

  const handleLogout = () => {
    logoutUser();
    setUser(null);
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

  const handleSaveDesign = () => {
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
    saveUserDesign(user, savedDesign);
    setActiveDesign(savedDesign);
    setDesigns(getUserDesigns(user));
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
        user={user ?? 'Guest'}
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
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <TopBar onSave={handleSaveDesign} onBack={openDashboard} />
        <ContextualToolbar />
        <CanvasWorkspace />
      </div>
    </div>
  );
}
