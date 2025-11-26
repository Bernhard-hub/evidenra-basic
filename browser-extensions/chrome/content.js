// 🔌 EVIDENRA Claude Bridge - Content Script
// Läuft direkt auf claude.ai und überwacht Interaktionen

console.log('🔌 EVIDENRA Claude Bridge aktiviert');

class EvidenraClaudeBridge {
  constructor() {
    this.isConnected = false;
    this.evidenraData = null;
    this.init();
  }

  init() {
    this.injectPageScript();
    this.setupMessageListener();
    this.addEvidenraIndicator();
    this.monitorClaudeInterface();
  }

  // Injiziert Script direkt in die Seite
  injectPageScript() {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('inject.js');
    script.onload = function() {
      this.remove();
    };
    (document.head || document.documentElement).appendChild(script);
  }

  // Nachrichten zwischen Extension und App
  setupMessageListener() {
    // Von EVIDENRA App
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('📨 Message von EVIDENRA:', message);

      if (message.type === 'EVIDENRA_DATA') {
        this.evidenraData = message.data;
        this.isConnected = true;
        this.updateIndicator('connected');
        this.prepareClaudeInput(message.data);
        sendResponse({status: 'success', message: 'Daten empfangen'});
      }

      if (message.type === 'GET_CLAUDE_RESPONSE') {
        const response = this.extractClaudeResponse();
        sendResponse({status: 'success', data: response});
      }

      return true;
    });

    // Von injiziertem Script
    window.addEventListener('message', (event) => {
      if (event.source !== window) return;

      if (event.data.type === 'CLAUDE_RESPONSE_READY') {
        this.handleClaudeResponse(event.data.response);
      }
    });
  }

  // Visueller Indikator für EVIDENRA Verbindung
  addEvidenraIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'evidenra-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #FF6B6B;
      color: white;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: all 0.3s ease;
    `;
    indicator.textContent = '🔴 EVIDENRA nicht verbunden';
    document.body.appendChild(indicator);
  }

  updateIndicator(status) {
    const indicator = document.getElementById('evidenra-indicator');
    if (!indicator) return;

    if (status === 'connected') {
      indicator.style.background = '#4ECDC4';
      indicator.textContent = '🟢 EVIDENRA verbunden';
    } else if (status === 'processing') {
      indicator.style.background = '#FFE66D';
      indicator.textContent = '🟡 Verarbeitung läuft...';
    }
  }

  // Claude Interface überwachen
  monitorClaudeInterface() {
    // Überwacht neue Nachrichten von Claude
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1 && this.isClaudeMessage(node)) {
            this.handleNewClaudeMessage(node);
          }
        });
      });
    });

    // Startet Überwachung sobald Chat Container gefunden
    const startObserving = () => {
      const chatContainer = document.querySelector('[data-testid="conversation"]') ||
                          document.querySelector('.conversation') ||
                          document.querySelector('[role="main"]');

      if (chatContainer) {
        observer.observe(chatContainer, {
          childList: true,
          subtree: true
        });
        console.log('📱 Claude Interface Überwachung gestartet');
      } else {
        setTimeout(startObserving, 1000);
      }
    };

    startObserving();
  }

  // Erkennt Claude Antwort-Nachrichten
  isClaudeMessage(node) {
    return node.querySelector && (
      node.querySelector('[data-is-streaming="false"]') ||
      node.classList?.contains('message') ||
      node.getAttribute?.('data-message-author-role') === 'assistant'
    );
  }

  // Neue Claude Nachricht verarbeiten
  handleNewClaudeMessage(messageNode) {
    if (this.isConnected && this.evidenraData) {
      console.log('📝 Neue Claude Antwort erkannt');
      setTimeout(() => {
        const response = this.extractClaudeResponse();
        this.sendToEvidenra(response);
      }, 2000); // Warten bis Nachricht vollständig geladen
    }
  }

  // EVIDENRA Daten in Claude Input vorbereiten
  prepareClaudeInput(data) {
    this.updateIndicator('processing');

    // Findet das Eingabefeld
    const inputField = document.querySelector('textarea[placeholder*="Message"]') ||
                      document.querySelector('textarea[data-testid="chat-input"]') ||
                      document.querySelector('.ProseMirror') ||
                      document.querySelector('[contenteditable="true"]');

    if (inputField) {
      // Erstellt formatierte Eingabe
      const formattedInput = this.formatEvidenraData(data);

      // Setzt Text im Eingabefeld
      if (inputField.tagName === 'TEXTAREA') {
        inputField.value = formattedInput;
        inputField.dispatchEvent(new Event('input', {bubbles: true}));
      } else {
        inputField.innerHTML = formattedInput;
        inputField.dispatchEvent(new Event('input', {bubbles: true}));
      }

      // Scrollt zum Eingabefeld
      inputField.scrollIntoView({behavior: 'smooth'});
      inputField.focus();

      console.log('✅ EVIDENRA Daten in Claude Input eingefügt');
    }
  }

  // Formatiert EVIDENRA Daten für Claude
  formatEvidenraData(data) {
    return `# 📊 EVIDENRA PROFESSIONAL - ${data.reportType.toUpperCase()} REPORT

${data.prompt}

## 📋 Projekt Information
- **Projekt:** ${data.projectName}
- **Dokumente:** ${data.documentCount}
- **Codierungen:** ${data.codingCount}
- **Kategorien:** ${data.categoryCount}

## 🧠 Smart Data Intelligence
${data.intelligence}

**⚠️ WICHTIG:** Verwende ausschließlich die bereitgestellten Daten. Keine erfundenen Inhalte!`;
  }

  // Extrahiert Claude Antwort
  extractClaudeResponse() {
    const lastMessage = document.querySelector('[data-message-author-role="assistant"]:last-of-type') ||
                       document.querySelector('.message:last-child [data-message-author-role="assistant"]') ||
                       document.querySelector('[data-is-streaming="false"]:last-of-type');

    if (lastMessage) {
      const content = lastMessage.querySelector('.prose') ||
                     lastMessage.querySelector('.markdown') ||
                     lastMessage;

      return {
        text: content.innerText || content.textContent || '',
        html: content.innerHTML || '',
        timestamp: new Date().toISOString()
      };
    }

    return null;
  }

  // Sendet Antwort zurück zu EVIDENRA
  sendToEvidenra(response) {
    if (response) {
      chrome.runtime.sendMessage({
        type: 'CLAUDE_RESPONSE',
        data: response,
        projectData: this.evidenraData
      });
      console.log('📤 Claude Antwort an EVIDENRA gesendet');
    }
  }

  // Claude Antwort verarbeitet
  handleClaudeResponse(response) {
    this.sendToEvidenra(response);
    this.updateIndicator('connected');
  }
}

// Startet Bridge sobald Seite geladen
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EvidenraClaudeBridge();
  });
} else {
  new EvidenraClaudeBridge();
}