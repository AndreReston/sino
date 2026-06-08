const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('designForgeDesktop', {
  isDesktopApp: true,
  platform: process.platform,
});
