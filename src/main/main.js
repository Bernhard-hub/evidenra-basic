const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const LicenseValidator = require('./licenseValidator');

let mainWindow;
let licenseValidator;

// Initialize license validator with your Gumroad product ID
const PRODUCT_ID = 'BAHleQbgEXcGPy68OhfynQ==';
licenseValidator = new LicenseValidator(PRODUCT_ID);

// Deep link protocol for auth callback
const PROTOCOL = 'evidenra';
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient(PROTOCOL, process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient(PROTOCOL);
}

// Single instance lock - required for deep links on Windows
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Apply essential command line switches for API access
app.commandLine.appendSwitch('--disable-web-security');
app.commandLine.appendSwitch('--disable-features', 'VizDisplayCompositor');

// Cache management switches to prevent permission errors
app.commandLine.appendSwitch('--disable-gpu-cache');
app.commandLine.appendSwitch('--disable-http-cache');
app.commandLine.appendSwitch('--disk-cache-size', '0');
app.commandLine.appendSwitch('--media-cache-size', '0');
app.commandLine.appendSwitch('--disable-application-cache');
app.commandLine.appendSwitch('--disable-offline-load-stale-cache');
app.commandLine.appendSwitch('--disable-background-timer-throttling');
app.commandLine.appendSwitch('--force-device-scale-factor', '1');

function createWindow() {
  console.log('Creating EVIDENRA BASIC v7.6 window...');

  // Determine correct icon path based on environment
  const iconPath = process.env.NODE_ENV === 'development'
    ? path.join(__dirname, '../../Logo.ico')
    : path.join(process.resourcesPath, 'Logo.ico');

  console.log('Loading icon from:', iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    icon: iconPath, // Custom favicon
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false, // Allow external API calls for research features
      preload: path.join(__dirname, '../preload/preload.js')
    },
    title: 'EVIDENRA BASIC v7.6',
    autoHideMenuBar: true,
    show: false
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    console.log('EVIDENRA BASIC v7.6 ready!');
    
    // Clear all caches on startup
    mainWindow.webContents.session.clearCache().then(() => {
      console.log('🧹 Browser cache cleared');
    }).catch(err => {
      console.warn('Could not clear cache:', err);
    });
  });

  // Load the application
  const isDev = process.env.NODE_ENV === 'development';
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    // ❌ REMOVED: DevTools no longer open automatically
    // Use Console Toggle button in app to open/close DevTools
    // mainWindow.webContents.openDevTools();
    // Try multiple locations for the HTML file
    const possiblePaths = [
      path.join(__dirname, '../../dist/index.html'),
      path.join(__dirname, '../../public/index.html'),
      path.join(__dirname, '../../src/renderer/index.html')
    ];
    
    let loaded = false;
    for (const filePath of possiblePaths) {
      try {
        const fs = require('fs');
        if (fs.existsSync(filePath)) {
          console.log('Loading HTML from:', filePath);
          mainWindow.loadFile(filePath);
          loaded = true;
          break;
        }
      } catch (error) {
        console.warn('Could not load from:', filePath);
      }
    }
    
    if (!loaded) {
      console.error('Could not find index.html file');
      console.log('Creating fallback HTML...');
      
      // Create a simple fallback HTML
      const fallbackHtml = `<!DOCTYPE html>
<html>
<head>
    <title>EVIDENRA BASIC</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .container { max-width: 800px; margin: 0 auto; text-align: center; }
        .error { background: rgba(255,255,255,0.1); padding: 20px; border-radius: 10px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>EVIDENRA BASIC v7.6</h1>
        <div class="error">
            <h2>Application Loading...</h2>
            <p>The main application is being initialized.</p>
            <p>Please check the console for more information.</p>
        </div>
    </div>
</body>
</html>`;
      
      const tempHtml = path.join(__dirname, 'temp.html');
      require('fs').writeFileSync(tempHtml, fallbackHtml);
      mainWindow.loadFile(tempHtml);
    }
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Error handling
  mainWindow.webContents.on('crashed', () => {
    console.error('Window crashed! Reloading...');
    if (mainWindow) {
      mainWindow.reload();
    }
  });
}

app.whenReady().then(async () => {
  console.log('EVIDENRA BASIC v7.6 - Starting...');
  
  // Temporarily skip license check - user will enter license in app settings
  createWindow();
  
  // COMMENTED OUT: Check license validity before creating window
  // const isLicenseValid = await licenseValidator.isLicenseValid();
  // 
  // if (!isLicenseValid) {
  //   await showLicenseDialog();
  // } else {
  //   createWindow();
  // }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    console.log('👋 Shutting down EVIDENRA BASIC...');
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// Global error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection:', reason);
});

// License management functions
async function showLicenseDialog() {
  const result = await dialog.showMessageBox(null, {
    type: 'info',
    title: 'EVIDENRA BASIC - License Required',
    message: 'Please enter your license key to continue.',
    detail: 'You need a valid license key to use EVIDENRA BASIC.',
    buttons: ['Enter License Key', 'Exit'],
    defaultId: 0,
    cancelId: 1
  });

  if (result.response === 0) {
    await showLicenseInputDialog();
  } else {
    app.quit();
  }
}

async function showLicenseInputDialog() {
  // Create a simple input window
  const licenseWindow = new BrowserWindow({
    width: 500,
    height: 300,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload/licensePreload.js')
    },
    title: 'Enter License Key',
    autoHideMenuBar: true,
    modal: true,
    resizable: false
  });

  const licenseHtml = `<!DOCTYPE html>
<html>
<head>
    <title>License Key</title>
    <style>
        * { box-sizing: border-box; }
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            margin: 0; 
            padding: 30px; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100vh;
            background-attachment: fixed;
        }
        .container { 
            text-align: center; 
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        h1 { 
            margin-bottom: 20px; 
            font-size: 22px; 
            font-weight: 600;
        }
        input { 
            width: 100%; 
            padding: 12px 15px; 
            font-size: 14px; 
            border: 2px solid rgba(255,255,255,0.3); 
            border-radius: 8px; 
            margin-bottom: 20px;
            text-align: center;
            background: rgba(255,255,255,0.9);
            color: #333;
            font-weight: 500;
        }
        input:focus {
            outline: none;
            border-color: #fff;
            background: white;
        }
        button { 
            padding: 12px 24px; 
            font-size: 14px; 
            border: none; 
            border-radius: 8px; 
            margin: 5px;
            cursor: pointer;
            background: white;
            color: #333;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        button:hover { 
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .error { 
            color: #ffcccb; 
            margin-top: 15px; 
            font-weight: 500;
            min-height: 20px;
        }
        #loading { 
            color: #90EE90; 
            font-weight: 500;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔑 Enter Your License Key</h1>
        <input type="text" id="licenseKey" placeholder="Enter your license key here..." />
        <br>
        <button onclick="validateLicense()">Validate License</button>
        <button onclick="exitApp()">Exit</button>
        <div id="error" class="error"></div>
        <div id="loading" style="display: none;">Validating license...</div>
    </div>
    
    <script>
        async function validateLicense() {
            const licenseKey = document.getElementById('licenseKey').value.trim();
            if (!licenseKey) {
                document.getElementById('error').textContent = 'Please enter a license key';
                return;
            }
            
            document.getElementById('loading').style.display = 'block';
            document.getElementById('error').textContent = '';
            
            try {
                const result = await window.electronAPI.validateLicense(licenseKey);
                document.getElementById('loading').style.display = 'none';
                
                if (result.valid) {
                    document.getElementById('error').style.color = '#90EE90';
                    document.getElementById('error').textContent = 'License valid! Starting application...';
                    setTimeout(() => {
                        window.electronAPI.startApp();
                    }, 2000);
                } else {
                    document.getElementById('error').textContent = 'Invalid license key: ' + (result.error || 'Unknown error');
                }
            } catch (error) {
                document.getElementById('loading').style.display = 'none';
                document.getElementById('error').textContent = 'Error validating license: ' + error.message;
            }
        }
        
        function exitApp() {
            window.electronAPI.exitApp();
        }
        
        // Focus input on load and wait for DOM
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('licenseKey').focus();
        });
        
        // Allow Enter key to validate
        document.addEventListener('DOMContentLoaded', () => {
            document.getElementById('licenseKey').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') validateLicense();
            });
        });
    </script>
</body>
</html>`;

  const tempLicenseHtml = path.join(__dirname, 'license.html');
  require('fs').writeFileSync(tempLicenseHtml, licenseHtml);
  licenseWindow.loadFile(tempLicenseHtml);
}

// 🚨 PRODUCTION: IPC handlers for license validation
ipcMain.handle('validate-license', async (event, licenseKey) => {
  console.log('🔐 Validating license key (Production)...');
  const result = await licenseValidator.validateLicenseProduction(licenseKey);
  return result;
});

ipcMain.handle('exit-app', () => {
  app.quit();
});

ipcMain.handle('start-app', () => {
  createWindow();
  // Close all license windows
  BrowserWindow.getAllWindows().forEach(window => {
    if (window.getTitle() === 'Enter License Key') {
      window.close();
    }
  });
});

ipcMain.handle('clear-license', async () => {
  await licenseValidator.clearLicenseData();
  return { success: true };
});

ipcMain.handle('get-license-info', async () => {
  const licenseData = await licenseValidator.loadLicenseData();
  if (licenseData) {
    return {
      valid: true,
      validatedAt: licenseData.validatedAt,
      uses: licenseData.uses,
      customerEmail: licenseData.purchase?.email || 'Unknown'
    };
  }
  return { valid: false };
});

// 🚨 PRODUCTION: Trial Management with Hardware ID Protection
const fs = require('fs');

ipcMain.handle('check-trial-status', async () => {
  console.log('🔐 Checking trial status (Production)...');
  const result = await licenseValidator.checkTrialStatus();
  return result;
});

// Console Toggle - Toggle DevTools on/off
ipcMain.handle('toggle-devtools', () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
      return { isOpen: false };
    } else {
      mainWindow.webContents.openDevTools();
      return { isOpen: true };
    }
  }
  return { isOpen: false };
});

// Handle deep link protocol on Windows
app.on('second-instance', (event, commandLine) => {
  // Find the deep link URL in command line args
  const deepLinkUrl = commandLine.find(arg => arg.startsWith(`${PROTOCOL}://`));
  if (deepLinkUrl) {
    handleDeepLink(deepLinkUrl);
  }

  // Focus the main window
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// Handle deep link protocol on macOS
app.on('open-url', (event, url) => {
  event.preventDefault();
  handleDeepLink(url);
});

// Process deep link URL and extract auth tokens
function handleDeepLink(url) {
  console.log('🔗 Deep link received:', url);

  try {
    // Parse the URL: evidenra://auth/callback?access_token=...&refresh_token=...
    const urlObj = new URL(url);

    // Try query params first (from website callback)
    let accessToken = urlObj.searchParams.get('access_token');
    let refreshToken = urlObj.searchParams.get('refresh_token');

    // Fallback to hash params if not in query
    if (!accessToken || !refreshToken) {
      const hash = urlObj.hash.substring(1); // Remove #
      const hashParams = new URLSearchParams(hash);
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
    }

    console.log('📝 Parsed tokens - access:', accessToken ? 'found' : 'missing', 'refresh:', refreshToken ? 'found' : 'missing');

    if (accessToken && refreshToken) {
      console.log('✅ Auth tokens extracted from deep link');
      // Send tokens to renderer
      if (mainWindow && mainWindow.webContents) {
        mainWindow.webContents.send('auth-callback', { access_token: accessToken, refresh_token: refreshToken });
      }
    } else {
      console.error('❌ No auth tokens in deep link');
    }
  } catch (error) {
    console.error('❌ Error parsing deep link:', error);
  }
}

// IPC: Open external URL in default browser
ipcMain.handle('open-external', async (event, url) => {
  await shell.openExternal(url);
  return { success: true };
});

console.log('📋 EVIDENRA BASIC main process loaded');