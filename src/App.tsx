import React from 'react';
import ContextualToolbar from './components/ContextualToolbar';
import LeftSidebar from './components/LeftSidebar';
import Workspace from './components/Workspace';

export default function App() {
  return (
    <div className="flex h-screen bg-canvas-bg overflow-hidden select-none">
      <LeftSidebar />
      <div className="flex flex-col flex-1 min-w-0 min-h-0">
        <ContextualToolbar />
        <Workspace />
      </div>
    </div>
  );
}
