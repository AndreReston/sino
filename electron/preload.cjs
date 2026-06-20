const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('dreFlowDesktop', {
  isDesktopApp: true,
  platform: process.platform,
});
