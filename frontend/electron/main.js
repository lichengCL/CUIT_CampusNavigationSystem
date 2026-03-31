const fs = require("fs");
const path = require("path");
const { execFile, spawn } = require("child_process");
const net = require("net");
const { app, BrowserWindow, dialog } = require("electron");


const DEFAULT_DEV_API_BASE_URL = "http://localhost:8000/api";
const BACKEND_STARTUP_TIMEOUT_MS = 15000;

let backendProcess = null;

function writeStartupLog(message) {
  try {
    const logPath = path.join(app.getPath("userData"), "startup.log");
    fs.appendFileSync(logPath, `[${new Date().toISOString()}] ${message}\n`, "utf8");
  } catch (error) {
    // Ignore logging failures to keep startup behavior deterministic.
  }
}

function resolveApiBaseUrl() {
  return process.env.CAMPUS_NAV_API_BASE || DEFAULT_DEV_API_BASE_URL;
}

function setApiBaseUrl(apiBaseUrl) {
  process.env.CAMPUS_NAV_API_BASE = apiBaseUrl.replace(/\/+$/, "");
}

function getBackendRoot() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend");
  }

  return path.resolve(__dirname, "..", "..", "backend");
}

function getPythonExecutable() {
  return process.env.CAMPUS_NAV_PYTHON || "python";
}

function resolveBackendPort() {
  const configuredPort = Number.parseInt(process.env.CAMPUS_NAV_BACKEND_PORT || "", 10);
  if (Number.isInteger(configuredPort) && configuredPort > 0) {
    return Promise.resolve(configuredPort);
  }

  return getFreePort();
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close(() => reject(new Error("Unable to determine a free port.")));
        return;
      }

      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(address.port);
      });
    });
  });
}

async function waitForBackend(apiBaseUrl, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  const healthUrl = `${apiBaseUrl}/config/map/`;
  let lastError = null;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(healthUrl);
      if (response.ok) {
        return;
      }
      lastError = new Error(`Health check returned HTTP ${response.status}.`);
    } catch (error) {
      lastError = error;
    }

    await wait(500);
  }

  throw lastError || new Error("Timed out waiting for the Django backend to become ready.");
}

async function startBackendServer() {
  if (!app.isPackaged) {
    setApiBaseUrl(resolveApiBaseUrl());
    writeStartupLog(`Development mode uses external API base: ${resolveApiBaseUrl()}`);
    return;
  }

  const port = await resolveBackendPort();
  const apiBaseUrl = `http://127.0.0.1:${port}/api`;
  const backendRoot = getBackendRoot();
  const managePyPath = path.join(backendRoot, "manage.py");
  const pythonExecutable = getPythonExecutable();
  const backendLogs = [];

  writeStartupLog(`Starting packaged backend with ${pythonExecutable} ${managePyPath} on port ${port}`);

  const child = spawn(
    pythonExecutable,
    [managePyPath, "runserver", `127.0.0.1:${port}`, "--noreload"],
    {
      cwd: backendRoot,
      env: {
        ...process.env,
        CAMPUS_NAV_API_BASE: apiBaseUrl,
        DJANGO_ALLOWED_HOSTS: "127.0.0.1,localhost",
        DJANGO_DEBUG: "0",
        PYTHONUNBUFFERED: "1"
      },
      stdio: ["ignore", "pipe", "pipe"]
    }
  );

  backendProcess = child;
  setApiBaseUrl(apiBaseUrl);

  function appendBackendLog(chunk) {
    if (!chunk) {
      return;
    }

    backendLogs.push(chunk.toString().trim());
    if (backendLogs.length > 10) {
      backendLogs.shift();
    }
  }

  child.stdout?.on("data", appendBackendLog);
  child.stderr?.on("data", appendBackendLog);

  const exitedEarly = new Promise((_, reject) => {
    child.once("error", (error) => {
      reject(error);
    });
    child.once("exit", (code, signal) => {
      const diagnostic = backendLogs.filter(Boolean).join("\n");
      reject(
        new Error(
          `Django backend exited before startup completed (code=${code}, signal=${signal}).${
            diagnostic ? `\n${diagnostic}` : ""
          }`
        )
      );
    });
  });

  try {
    await Promise.race([waitForBackend(apiBaseUrl, BACKEND_STARTUP_TIMEOUT_MS), exitedEarly]);
    writeStartupLog(`Backend health check passed at ${apiBaseUrl}/config/map/`);
  } catch (error) {
    writeStartupLog(`Backend startup failed: ${error.stack || error.message}`);
    stopBackendServer();
    throw error;
  }
}

function stopBackendServer() {
  if (!backendProcess || !backendProcess.pid) {
    backendProcess = null;
    return;
  }

  const { pid } = backendProcess;
  backendProcess = null;

  if (process.platform === "win32") {
    execFile("taskkill", ["/pid", String(pid), "/t", "/f"], () => {});
    return;
  }

  try {
    process.kill(pid, "SIGTERM");
  } catch (error) {
    if (error?.code !== "ESRCH") {
      throw error;
    }
  }
}


function createWindow() {
  const preloadPath = path.join(__dirname, "preload.js");
  const window = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "校园导航系统 - 成信大航空港校区",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: preloadPath
    }
  });

  if (app.isPackaged) {
    window.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    window.loadURL("http://localhost:3000");
  }
}

app.whenReady().then(() => {
  startBackendServer()
    .then(() => {
      writeStartupLog(`Creating browser window with API base ${process.env.CAMPUS_NAV_API_BASE}`);
      createWindow();
    })
    .catch((error) => {
      writeStartupLog(`Application startup failed: ${error.stack || error.message}`);
      dialog.showErrorBox("应用启动失败", error.message);
      app.quit();
    });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("before-quit", () => {
  stopBackendServer();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    stopBackendServer();
    app.quit();
  }
});
