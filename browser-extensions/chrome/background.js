// 🔌 EVIDENRA Claude Bridge - Background Service Worker
// Verwaltet Kommunikation zwischen EVIDENRA App und Extension

console.log('🚀 EVIDENRA Claude Bridge Background Worker gestartet');

class EvidenraBackgroundService {
  constructor() {
    this.connections = new Map();
    this.evidenraPort = null;
    this.claudeTabId = null;
    this.pendingRequests = new Map();
    this.init();
  }

  init() {
    this.setupMessageHandlers();
    this.setupTabHandlers();
    this.setupRuntimeHandlers();
  }

  // Message Handler für verschiedene Quellen
  setupMessageHandlers() {
    // Von EVIDENRA App (Native Messaging)
    chrome.runtime.onConnectExternal.addListener((port) => {
      console.log('📡 Externe Verbindung von EVIDENRA App:', port.name);

      if (port.name === 'evidenra-claude-bridge') {
        this.evidenraPort = port;
        this.setupEvidenraPortHandlers(port);
      }
    });

    // Von Content Scripts
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Message empfangen:', message.type, 'von Tab:', sender.tab?.id);

      switch (message.type) {
        case 'CLAUDE_RESPONSE':
          this.handleClaudeResponse(message, sender);
          break;

        case 'TAB_READY':
          this.handleTabReady(sender);
          break;

        case 'GET_STATUS':
          sendResponse({
            connected: !!this.evidenraPort,
            claudeTab: this.claudeTabId,
            timestamp: new Date().toISOString()
          });
          break;
      }

      return true;
    });
  }

  // EVIDENRA App Port Handler
  setupEvidenraPortHandlers(port) {
    port.onMessage.addListener((message) => {
      console.log('📥 Message von EVIDENRA App:', message.type);

      switch (message.type) {
        case 'GENERATE_REPORT':
          this.handleGenerateReport(message.data);
          break;

        case 'PING':
          port.postMessage({type: 'PONG', timestamp: new Date().toISOString()});
          break;

        case 'GET_CLAUDE_TABS':
          this.sendClaudeTabs();
          break;
      }
    });

    port.onDisconnect.addListener(() => {
      console.log('🔌 EVIDENRA App getrennt');
      this.evidenraPort = null;
    });

    // Bestätigt Verbindung
    port.postMessage({
      type: 'CONNECTION_ESTABLISHED',
      timestamp: new Date().toISOString()
    });
  }

  // Tab Management
  setupTabHandlers() {
    // Neue Tabs überwachen
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url?.includes('claude.ai')) {
        console.log('🌐 Claude Tab erkannt:', tabId);
        this.claudeTabId = tabId;
        this.notifyEvidenraApp('CLAUDE_TAB_READY', {tabId, url: tab.url});
      }
    });

    // Tab Schließung überwachen
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (tabId === this.claudeTabId) {
        console.log('❌ Claude Tab geschlossen');
        this.claudeTabId = null;
        this.notifyEvidenraApp('CLAUDE_TAB_CLOSED', {tabId});
      }
    });
  }

  // Runtime Handler
  setupRuntimeHandlers() {
    // Extension Start
    chrome.runtime.onStartup.addListener(() => {
      console.log('🚀 Extension gestartet');
    });

    // Extension Install
    chrome.runtime.onInstalled.addListener((details) => {
      console.log('📦 Extension installiert:', details.reason);

      if (details.reason === 'install') {
        this.openWelcomePage();
      }
    });
  }

  // Report Generation von EVIDENRA App
  async handleGenerateReport(data) {
    console.log('📊 Report Generation angefordert:', data.reportType);

    try {
      // Findet oder öffnet Claude Tab
      const claudeTab = await this.ensureClaudeTab();

      if (!claudeTab) {
        throw new Error('Claude Tab konnte nicht geöffnet werden');
      }

      // Sendet Daten an Content Script
      await chrome.tabs.sendMessage(claudeTab.id, {
        type: 'EVIDENRA_DATA',
        data: data
      });

      console.log('✅ Daten an Claude Tab gesendet');

    } catch (error) {
      console.error('❌ Fehler bei Report Generation:', error);
      this.notifyEvidenraApp('GENERATION_ERROR', {
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Claude Tab sicherstellen
  async ensureClaudeTab() {
    // Prüft existierenden Tab
    if (this.claudeTabId) {
      try {
        const tab = await chrome.tabs.get(this.claudeTabId);
        if (tab && tab.url?.includes('claude.ai')) {
          return tab;
        }
      } catch (error) {
        this.claudeTabId = null;
      }
    }

    // Sucht nach Claude Tabs
    const claudeTabs = await chrome.tabs.query({url: '*://claude.ai/*'});

    if (claudeTabs.length > 0) {
      this.claudeTabId = claudeTabs[0].id;
      return claudeTabs[0];
    }

    // Öffnet neuen Claude Tab
    const newTab = await chrome.tabs.create({
      url: 'https://claude.ai/chat',
      active: true
    });

    this.claudeTabId = newTab.id;

    // Wartet bis Tab geladen
    return new Promise((resolve) => {
      const checkTab = () => {
        chrome.tabs.get(newTab.id, (tab) => {
          if (tab.status === 'complete') {
            resolve(tab);
          } else {
            setTimeout(checkTab, 1000);
          }
        });
      };
      checkTab();
    });
  }

  // Claude Antwort verarbeiten
  handleClaudeResponse(message, sender) {
    console.log('📝 Claude Antwort verarbeitet:', message.data.wordCount, 'Wörter');

    this.notifyEvidenraApp('CLAUDE_RESPONSE', {
      response: message.data,
      projectData: message.projectData,
      tabId: sender.tab.id,
      timestamp: new Date().toISOString()
    });
  }

  // Tab Ready Handler
  handleTabReady(sender) {
    console.log('✅ Tab bereit:', sender.tab.id);

    if (sender.tab.url?.includes('claude.ai')) {
      this.claudeTabId = sender.tab.id;
    }
  }

  // Benachrichtigt EVIDENRA App
  notifyEvidenraApp(type, data) {
    if (this.evidenraPort) {
      this.evidenraPort.postMessage({
        type: type,
        data: data,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Sendet Claude Tabs Liste
  async sendClaudeTabs() {
    const claudeTabs = await chrome.tabs.query({url: '*://claude.ai/*'});

    this.notifyEvidenraApp('CLAUDE_TABS_LIST', {
      tabs: claudeTabs.map(tab => ({
        id: tab.id,
        url: tab.url,
        title: tab.title,
        active: tab.active
      })),
      current: this.claudeTabId
    });
  }

  // Öffnet Welcome Page
  openWelcomePage() {
    chrome.tabs.create({
      url: chrome.runtime.getURL('welcome.html')
    });
  }
}

// Startet Background Service
const backgroundService = new EvidenraBackgroundService();

// Globale Service Referenz für Debugging
self.EVIDENRA_SERVICE = backgroundService;