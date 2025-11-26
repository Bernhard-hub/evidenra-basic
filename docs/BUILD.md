# Build-Anleitung für EVIDENRA BASIC v7.6

## Voraussetzungen

### Software
- **Node.js**: v18.x oder höher
- **npm**: v9.x oder höher
- **Git**: Für Versionskontrolle

### Betriebssystem-spezifisch

#### Windows
- Visual Studio Build Tools (für native Module)
- Windows SDK

#### macOS
- Xcode Command Line Tools: `xcode-select --install`
- Für Universal Binaries: Rosetta 2 (auf Apple Silicon)

#### Linux
- build-essential: `sudo apt install build-essential`
- libgtk-3-dev, libwebkit2gtk-4.0-dev
- rpm-build (für .rpm Builds)

## Installation

```bash
# Repository klonen
git clone https://github.com/your-repo/evidenra-basic.git
cd evidenra-basic

# Dependencies installieren
npm install

# Electron-Cache vorbereiten
npm run clean:cache
```

## Development

```bash
# Webpack Dev Server starten
npm run dev

# Electron im Development-Modus
npm run electron-dev
```

## Production Build

### Alle Dateien kompilieren
```bash
npm run build-prod
```

### Plattform-spezifische Builds

#### Windows (Portable .exe)
```bash
npm run dist:win
```
Output: `release/EVIDENRA-BASIC-v7.6-GENESIS.exe`

#### macOS (DMG)
```bash
npm run dist:mac
```
Output:
- `release/EVIDENRA-BASIC-v7.6-macOS-x64.dmg` (Intel)
- `release/EVIDENRA-BASIC-v7.6-macOS-arm64.dmg` (Apple Silicon)

#### Linux (AppImage)
```bash
npm run dist:linux
```
Output: `release/EVIDENRA-BASIC-v7.6-Linux.AppImage`

#### Alle Plattformen (nur auf macOS/Linux)
```bash
npm run dist:all
```

## GitHub Actions

### Automatischer Build bei Tag-Push
```bash
git tag v7.6.0
git push origin v7.6.0
```

Der GitHub Actions Workflow:
1. Baut für Windows, macOS, Linux parallel
2. Lädt Artifacts zu GitHub Releases hoch
3. Generiert Release Notes

### Manueller Build-Trigger
1. GitHub Repository öffnen
2. Actions Tab
3. "Build EVIDENRA BASIC Multi-Platform Release" auswählen
4. "Run workflow" klicken

## Konfigurationsdateien

### package.json - Build-Sektion
```json
{
  "build": {
    "appId": "com.evidenra.basic",
    "productName": "EVIDENRA BASIC",
    "win": { ... },
    "mac": { ... },
    "linux": { ... }
  }
}
```

### webpack.config.js
- Entry: `./src/renderer/index.tsx`
- Output: `./dist/renderer.js`
- Target: `electron-renderer`

### tsconfig.json
- Target: ES2020
- JSX: react
- Strict: false (für schnellere Entwicklung)

## Troubleshooting

### Build schlägt fehl

#### "Cannot find module 'electron'"
```bash
npm install electron --save-dev
```

#### Native Module Fehler
```bash
npm run rebuild
# oder
./node_modules/.bin/electron-rebuild
```

#### PDF.js Worker Probleme
PDF.js Worker wird aus CDN geladen. Bei Offline-Builds:
```bash
# Worker-Datei manuell kopieren
cp node_modules/pdfjs-dist/build/pdf.worker.min.js dist/
```

### macOS Code Signing
Für Verteilung außerhalb App Store:
```bash
# Developer ID Certificate erforderlich
export CSC_LINK="path/to/certificate.p12"
export CSC_KEY_PASSWORD="password"
npm run dist:mac
```

### Linux AppImage auf alten Systemen
```bash
# FUSE installieren
sudo apt install fuse libfuse2
```

## Release Checklist

- [ ] Version in package.json aktualisieren
- [ ] CHANGELOG.md aktualisieren
- [ ] Alle Tests bestanden
- [ ] Build auf allen Plattformen getestet
- [ ] Git Tag erstellen und pushen
- [ ] Release Notes schreiben
- [ ] Artifacts auf GitHub Release hochladen

## Verzeichnisstruktur nach Build

```
release/
├── EVIDENRA-BASIC-v7.6-GENESIS.exe     # Windows Portable
├── EVIDENRA-BASIC-v7.6-macOS-x64.dmg   # macOS Intel
├── EVIDENRA-BASIC-v7.6-macOS-arm64.dmg # macOS Apple Silicon
├── EVIDENRA-BASIC-v7.6-Linux.AppImage  # Linux
├── win-unpacked/                        # Windows unpacked
├── mac/                                 # macOS unpacked
└── linux-unpacked/                      # Linux unpacked
```

---

Bei Fragen: Issues auf GitHub erstellen
