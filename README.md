# EVIDENRA BASIC v7.6 - GENESIS Edition

Qualitative Datenanalyse mit KI-Unterstützung

## Übersicht

EVIDENRA BASIC ist eine Desktop-Anwendung für qualitative Datenanalyse, die KI-gestützte Methoden zur systematischen Analyse von Textdaten verwendet. Die Anwendung basiert auf der AKIH-Methodologie (AI-Assisted Key Insight Harvesting).

## Features

### Dokumentenverarbeitung
- **PDF Import**: Vollständige Textextraktion aus PDF-Dokumenten
- **TXT/DOCX Support**: Import von Text- und Word-Dokumenten
- **Multi-Dokument Analyse**: Gleichzeitige Verarbeitung mehrerer Dokumente

### KI-Analyse
- **AKIH-Methodologie**: Wissenschaftlich fundierte Analysemethode
- **7-Persona System**: Multiple Expertenperspektiven für tiefgreifende Analyse
- **Quantum Enhanced Engine**: Fortgeschrittene Analysealgorithmen
- **Genesis Engine Integration**: Selbstlernende KI-Komponenten

### Export & Berichte
- **PDF Export**: Professionelle Forschungsberichte
- **JSON Export**: Strukturierte Datenspeicherung
- **TXT Export**: Einfacher Textexport

### Benutzerfreundlichkeit
- **Moderne UI**: React-basierte Benutzeroberfläche
- **Dark Mode**: Augenfreundliches Design
- **Kontextmenü**: Cut/Copy/Paste in allen Eingabefeldern
- **Auto-Save**: Automatische Sicherung der Arbeit

## Installation

### Windows
1. `EVIDENRA-BASIC-v7.6-GENESIS.exe` herunterladen
2. Doppelklick zum Starten (Portable - keine Installation nötig)

### macOS
1. `.dmg` Datei herunterladen (Intel oder Apple Silicon)
2. In Applications-Ordner ziehen
3. Beim ersten Start ggf. in Systemeinstellungen erlauben

### Linux
1. `.AppImage` herunterladen
2. Ausführbar machen: `chmod +x EVIDENRA-BASIC-v7.6-Linux.AppImage`
3. Starten: `./EVIDENRA-BASIC-v7.6-Linux.AppImage`

## Lizenzierung

- **30-Tage Testversion**: Voller Funktionsumfang
- **Nach Ablauf**: Lizenzschlüssel erforderlich (via Gumroad)
- **1 Aktivierung pro Lizenz**: Hardware-ID gebunden

## Systemanforderungen

| Betriebssystem | Minimum |
|----------------|---------|
| Windows | 10/11 (x64) |
| macOS | 11+ (Intel/Apple Silicon) |
| Linux | x64, glibc 2.28+ |

**Empfohlen:**
- 8 GB RAM
- 500 MB freier Speicherplatz
- Internetverbindung (für KI-Funktionen)

## Build from Source

```bash
# Repository klonen
git clone https://github.com/your-repo/evidenra-basic.git
cd evidenra-basic

# Dependencies installieren
npm install

# Development starten
npm run dev

# Production Build
npm run build-prod

# Plattform-spezifische Builds
npm run dist:win    # Windows
npm run dist:mac    # macOS
npm run dist:linux  # Linux
npm run dist:all    # Alle Plattformen
```

## Projektstruktur

```
evidenra-basic/
├── src/
│   ├── main/           # Electron Main Process
│   │   ├── main.js     # App-Einstiegspunkt
│   │   ├── licenseValidator.js
│   │   └── hardwareId.js
│   ├── preload/        # IPC Bridge
│   │   ├── preload.js
│   │   └── licensePreload.js
│   ├── renderer/       # React Frontend
│   │   ├── App.tsx     # Hauptkomponente
│   │   ├── services/   # Business Logic
│   │   └── core/       # Engine-Komponenten
│   └── services/       # Shared Services
├── genesis-engine/     # Genesis AI System
├── assets/             # Icons & Bilder
├── docs/               # Dokumentation
└── .github/workflows/  # CI/CD
```

## Technologie-Stack

- **Electron 37.4.0**: Cross-Platform Desktop Framework
- **React 18.3.1**: UI Framework
- **TypeScript**: Typisierung
- **Tailwind CSS**: Styling
- **Webpack**: Bundling
- **PDF.js**: PDF-Verarbeitung

## Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- Lizenz-Probleme: support@evidenra.com

## Changelog

Siehe [CHANGELOG.md](./CHANGELOG.md) für alle Änderungen.

## Lizenz

ISC License - Siehe [LICENSE](./LICENSE) für Details.

---

Made with EVIDENRA Team
