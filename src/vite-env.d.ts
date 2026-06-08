/// <reference types="vite/client" />

interface DesignForgeDesktop {
  isDesktopApp: boolean;
  platform: string;
}

interface Window {
  designForgeDesktop?: DesignForgeDesktop;
}
