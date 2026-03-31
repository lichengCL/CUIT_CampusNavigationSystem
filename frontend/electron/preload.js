const { contextBridge } = require("electron");


contextBridge.exposeInMainWorld("electronAPI", {
  runtimeConfig: {
    apiBaseUrl: process.env.CAMPUS_NAV_API_BASE || ""
  }
});
