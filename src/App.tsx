import React from 'react';
import TopBar from './components/TopBar';
import ToolSidebar from './components/ToolSidebar';
import LeftPanel from './components/LeftPanel';
import CanvasArea from './components/CanvasArea';
import RightPanel from './components/RightPanel';

export default function App() {
  return (
    <div className="flex flex-col h-screen bg-canvas-bg overflow-hidden">
      <TopBar />
      <div className="flex flex-1 min-h-0">
        <ToolSidebar />
        <LeftPanel />
        <CanvasArea />
        <RightPanel />
      </div>
    </div>
  );
}
