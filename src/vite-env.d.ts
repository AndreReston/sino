/// <reference types="vite/client" />

interface DreFlowDesktop {
  isDesktopApp: boolean;
  platform: string;
}

interface Window {
  dreFlowDesktop?: DreFlowDesktop;
}
