// 🔌 EVIDENRA Claude Bridge - Firefox Background Script
// Verwaltet Kommunikation zwischen EVIDENRA App und Extension

console.log('🚀 EVIDENRA Claude Bridge Background Worker gestartet (Firefox)');

class EvidenraBackgroundServiceFirefox {
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
    // Von Content Scripts
    browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
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

        case 'GENERATE_REPORT':
          this.handleGenerateReport(message.data);
          break;
      }

      return true;
    });

    // Native Messaging für EVIDENRA App (falls verfügbar)
    if (browser.runtime.connectNative) {
      try {
        this.setupNativeMessaging();
      } catch (error) {
        console.log('ℹ️ Native Messaging nicht verfügbar:', error.message);
      }
    }
  }

  // Native Messaging Setup
  setupNativeMessaging() {
    try {
      const nativePort = browser.runtime.connectNative('evidenra_claude_bridge');

      nativePort.onMessage.addListener((message) => {
        console.log('📥 Native Message von EVIDENRA App:', message.type);
        this.handleEvidenraMessage(message);
      });

      nativePort.onDisconnect.addListener(() => {
        console.log('🔌 Native EVIDENRA App getrennt');
        this.evidenraPort = null;
      });

      this.evidenraPort = nativePort;
      console.log('✅ Native Messaging verbunden');

    } catch (error) {
      console.log('ℹ️ Native Messaging Setup fehlgeschlagen:', error.message);
    }
  }

  // EVIDENRA App Messages
  handleEvidenraMessage(message) {
    switch (message.type) {
      case 'GENERATE_REPORT':
        this.handleGenerateReport(message.data);
        break;

      case 'PING':
        if (this.evidenraPort) {
          this.evidenraPort.postMessage({
            type: 'PONG',
            timestamp: new Date().toISOString()
          });
        }
        break;

      case 'GET_CLAUDE_TABS':
        this.sendClaudeTabs();
        break;
    }
  }

  // Tab Management
  setupTabHandlers() {
    // Neue Tabs überwachen
    browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url?.includes('claude.ai')) {
        console.log('🌐 Claude Tab erkannt:', tabId);
        this.claudeTabId = tabId;
        this.notifyEvidenraApp('CLAUDE_TAB_READY', {tabId, url: tab.url});
      }
    });

    // Tab Schließung überwachen
    browser.tabs.onRemoved.addListener((tabId) => {
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
    if (browser.runtime.onStartup) {
      browser.runtime.onStartup.addListener(() => {
        console.log('🚀 Extension gestartet');
      });
    }

    // Extension Install
    browser.runtime.onInstalled.addListener((details) => {
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
      await browser.tabs.sendMessage(claudeTab.id, {
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
        const tab = await browser.tabs.get(this.claudeTabId);
        if (tab && tab.url?.includes('claude.ai')) {
          return tab;
        }
      } catch (error) {
        this.claudeTabId = null;
      }
    }

    // Sucht nach Claude Tabs
    const claudeTabs = await browser.tabs.query({url: '*://claude.ai/*'});

    if (claudeTabs.length > 0) {
      this.claudeTabId = claudeTabs[0].id;
      return claudeTabs[0];
    }

    // Öffnet neuen Claude Tab
    const newTab = await browser.tabs.create({
      url: 'https://claude.ai/chat',
      active: true
    });

    this.claudeTabId = newTab.id;

    // Wartet bis Tab geladen
    return new Promise((resolve) => {
      const checkTab = () => {
        browser.tabs.get(newTab.id).then((tab) => {
          if (tab.status === 'complete') {
            resolve(tab);
          } else {
            setTimeout(checkTab, 1000);
          }
        }).catch(() => {
          resolve(null);
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
    const message = {
      type: type,
      data: data,
      timestamp: new Date().toISOString()
    };

    if (this.evidenraPort) {
      this.evidenraPort.postMessage(message);
    }

    // Alternative: Local Storage für App-Extension Kommunikation
    browser.storage.local.set({
      [`evidenra_message_${Date.now()}`]: message
    });
  }

  // Sendet Claude Tabs Liste
  async sendClaudeTabs() {
    const claudeTabs = await browser.tabs.query({url: '*://claude.ai/*'});

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
    browser.tabs.create({
      url: browser.runtime.getURL('welcome.html')
    });
  }
}

// Startet Background Service
const backgroundService = new EvidenraBackgroundServiceFirefox();

// Globale Service Referenz für Debugging
self.EVIDENRA_SERVICE = backgroundService;