# EVIDENRA Professional - Build Anleitung

## Portable Single-Click Versionen erstellen

### Übersicht
Die Konfiguration unterstützt das Erstellen von portablen Versionen für:
- **Windows**: Portable .exe Datei
- **macOS**: ZIP-Archiv für Intel (x64) und Apple Silicon (arm64)
- **Linux**: AppImage (portable Single-File)

---

## Option 1: GitHub Actions (Empfohlen für alle Plattformen)

### Vorteile:
- Baut alle drei Plattformen automatisch
- Keine lokale Installation erforderlich
- Keine Plattform-Einschränkungen

### Setup:
1. Push dein Projekt zu GitHub
2. GitHub Actions wird automatisch ausgelöst bei:
   - Push auf main/master Branch
   - Pull Requests
   - Manueller Trigger über "Actions" Tab

3. Download der fertigen Builds:
   - Gehe zu "Actions" Tab in deinem GitHub Repository
   - Wähle den letzten erfolgreichen Workflow Run
   - Lade die Artifacts herunter:
     - `EVIDENRA-Professional-Windows`
     - `EVIDENRA-Professional-macOS`
     - `EVIDENRA-Professional-Linux`

---

## Option 2: Lokale Builds

### Windows (Portable .exe)

**Anforderungen:**
- Windows 10/11
- Node.js 20+

**Build-Befehle:**
```bash
npm install
npm run dist:win
```

**Output:**
- Datei: `release/EVIDENRA-Professional.exe`
- Größe: ~100-200 MB
- Single-Click ausführbar

---

### macOS (ZIP Archive)

**Anforderungen:**
- macOS 10.13+
- Node.js 20+
- Xcode Command Line Tools

**Build-Befehle:**
```bash
npm install
npm run dist:mac
```

**Output:**
- Intel: `release/EVIDENRA-Professional-macOS-x64.zip`
- Apple Silicon: `release/EVIDENRA-Professional-macOS-arm64.zip`

**Verwendung:**
1. ZIP entpacken
2. App in den Applications Ordner verschieben (optional)
3. Beim ersten Start: Rechtsklick → "Öffnen" (wegen macOS Gatekeeper)

---

### Linux (AppImage)

**Anforderungen:**
- Linux (Ubuntu 20.04+, Debian, Fedora, etc.)
- Node.js 20+

**Build-Befehle:**
```bash
npm install
npm run dist:linux
```

**Output:**
- Datei: `release/EVIDENRA-Professional-Linux.AppImage`

**Verwendung:**
```bash
chmod +x EVIDENRA-Professional-Linux.AppImage
./EVIDENRA-Professional-Linux.AppImage
```

---

## Option 3: Alle Plattformen gleichzeitig (nur auf macOS/Linux)

```bash
npm run dist:all
```

**Hinweis:** Funktioniert nicht vollständig auf Windows wegen Plattform-Einschränkungen.

---

## Verfügbare NPM Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm start` | Startet die App im Entwicklungsmodus |
| `npm run dev` | Startet Webpack Dev Server |
| `npm run build` | Development Build |
| `npm run build-prod` | Production Build (optimiert) |
| `npm run dist` | Baut für die aktuelle Plattform |
| `npm run dist:win` | Baut Windows Portable .exe |
| `npm run dist:mac` | Baut macOS ZIP Archive |
| `npm run dist:linux` | Baut Linux AppImage |
| `npm run dist:all` | Baut alle Plattformen |

---

## Troubleshooting

### Windows: "Symlink Fehler" beim Linux Build
**Problem:** Windows benötigt Administrator-Rechte für Symlinks.

**Lösung:**
1. Verwende GitHub Actions
2. Oder: Führe PowerShell als Administrator aus
3. Oder: Baue nur Windows Version lokal: `npm run dist:win`

### macOS: "App von unbekanntem Entwickler"
**Problem:** macOS Gatekeeper blockiert die App.

**Lösung:**
1. Rechtsklick auf die App
2. "Öffnen" wählen
3. "Öffnen" im Dialog bestätigen

### Linux: "Permission denied"
**Problem:** AppImage ist nicht ausführbar.

**Lösung:**
```bash
chmod +x EVIDENRA-Professional-Linux.AppImage
```

---

## Build-Konfiguration

Die Build-Konfiguration findest du in `package.json` unter dem `"build"` Abschnitt:

- **Windows**: Portable .exe ohne Installation
- **macOS**: ZIP mit Universal Binary (Intel + Apple Silicon)
- **Linux**: AppImage (selbstständige ausführbare Datei)

Alle Builds werden im `release/` Ordner erstellt.
