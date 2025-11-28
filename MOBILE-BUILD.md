# EVIDENRA BASIC - Mobile Build Anleitung

## Übersicht

Diese Anleitung beschreibt, wie EVIDENRA BASIC für iPad (iOS) und Android Tablets gebaut wird.

## Voraussetzungen

### Allgemein
- Node.js 20 oder höher
- npm 9 oder höher

### Für iOS (iPad)
- macOS (Xcode ist nur auf Mac verfügbar)
- Xcode 15 oder höher
- CocoaPods
- Apple Developer Account (für Signierung)

### Für Android
- Java JDK 17
- Android Studio (optional, für Entwicklung)
- Android SDK

## Schnellstart

### 1. Abhängigkeiten installieren

```bash
npm install
```

### 2. Mobile Plattformen hinzufügen

```bash
# iOS hinzufügen (nur auf macOS)
npm run cap:add:ios

# Android hinzufügen
npm run cap:add:android
```

### 3. Web-Assets für Mobile bauen

```bash
npm run build-mobile
```

### 4. Projekte synchronisieren

```bash
npm run cap:sync
```

## Lokale Entwicklung

### iOS (nur macOS)

```bash
# Projekt in Xcode öffnen
npm run cap:open:ios
```

In Xcode:
1. Wähle ein iPad-Gerät als Ziel
2. Klicke auf "Run" (⌘R)

### Android

```bash
# Projekt in Android Studio öffnen
npm run cap:open:android
```

In Android Studio:
1. Wähle ein Tablet-Emulator oder verbundenes Gerät
2. Klicke auf "Run" (Shift+F10)

## Produktions-Builds

### iOS IPA erstellen (unsigned)

```bash
npm run mobile:ios
cd ios/App
pod install
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath build/App.xcarchive \
  archive \
  CODE_SIGNING_ALLOWED=NO \
  TARGETED_DEVICE_FAMILY="2"
```

### Android APK erstellen

```bash
npm run mobile:android
cd android
./gradlew assembleRelease
```

Die APK befindet sich dann unter:
`android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Android AAB erstellen (für Play Store)

```bash
cd android
./gradlew bundleRelease
```

## GitHub Actions (Automatisierte Builds)

Das Repository enthält einen GitHub Actions Workflow, der automatisch iPad- und Android-Builds erstellt.

### Workflow auslösen

1. **Automatisch**: Bei jedem Push auf `main` oder `master`
2. **Manuell**: Im GitHub Repository → Actions → "Build Mobile Apps" → "Run workflow"
3. **Bei Tags**: Erstellt automatisch einen GitHub Release

### Artefakte herunterladen

Nach dem Build:
1. Gehe zu GitHub → Actions → Letzter Workflow-Run
2. Scrolle zu "Artifacts"
3. Lade herunter:
   - `EVIDENRA-BASIC-iPad` (iOS)
   - `EVIDENRA-BASIC-Android-APK` (Android APK)
   - `EVIDENRA-BASIC-Android-AAB` (Android App Bundle)

## Installation auf Geräten

### iPad Installation

**Option 1: AltStore (kein Developer Account nötig)**
1. Installiere AltStore auf deinem Mac/PC
2. Verbinde dein iPad
3. Installiere die IPA über AltStore

**Option 2: Sideloadly**
1. Lade Sideloadly herunter (sideloadly.io)
2. Ziehe die IPA in Sideloadly
3. Melde dich mit deiner Apple ID an
4. Installiere auf dem verbundenen iPad

**Option 3: Xcode (Developer Account)**
1. Öffne Xcode
2. Window → Devices and Simulators
3. Ziehe die IPA auf das verbundene iPad

**Option 4: TestFlight (für Betatest)**
1. Erstelle eine App in App Store Connect
2. Lade die IPA hoch
3. Lade Tester über TestFlight ein

### Android Tablet Installation

**Option 1: Direkte APK-Installation**
1. Übertrage die APK auf das Tablet
2. Öffne Einstellungen → Sicherheit
3. Aktiviere "Unbekannte Quellen"
4. Öffne die APK-Datei und installiere

**Option 2: ADB (Android Debug Bridge)**
```bash
adb install EVIDENRA-BASIC-v7.6-Android-Tablet.apk
```

**Option 3: Google Play Store**
1. Melde dich bei der Google Play Console an
2. Erstelle eine neue App
3. Lade die AAB-Datei hoch
4. Veröffentliche als interner Test oder Produktion

## Tablet-Optimierungen

Die App ist für Tablets optimiert:

- **iPad**: `TARGETED_DEVICE_FAMILY="2"` (nur iPad)
- **Android**: Layout passt sich automatisch an Tablet-Größen an
- Tailwind CSS responsive Klassen für große Bildschirme

## Fehlerbehebung

### iOS: "Code Signing Required"
- Für Entwicklung: Nutze ein kostenloses Apple ID
- Für Distribution: Apple Developer Account ($99/Jahr) erforderlich

### Android: "App not installed"
- Stelle sicher, dass "Unbekannte Quellen" aktiviert ist
- Deinstalliere vorherige Versionen
- Prüfe, ob genug Speicherplatz vorhanden ist

### Build schlägt fehl
1. Lösche node_modules und installiere neu:
   ```bash
   rm -rf node_modules
   npm install
   ```
2. Lösche Plattform-Ordner und füge neu hinzu:
   ```bash
   rm -rf ios android
   npm run cap:add:ios
   npm run cap:add:android
   ```

## Projektstruktur (Mobile)

```
evidenra-basic/
├── capacitor.config.ts      # Capacitor Konfiguration
├── webpack.mobile.config.js # Mobile Webpack Config
├── ExportOptions.plist      # iOS Export Optionen
├── ios/                     # iOS Xcode Projekt (generiert)
├── android/                 # Android Studio Projekt (generiert)
└── .github/
    └── workflows/
        └── build-mobile.yml # GitHub Actions Workflow
```

## Verfügbare npm Scripts

| Script | Beschreibung |
|--------|--------------|
| `npm run build-mobile` | Baut Web-Assets für Mobile |
| `npm run cap:add:ios` | Fügt iOS-Plattform hinzu |
| `npm run cap:add:android` | Fügt Android-Plattform hinzu |
| `npm run cap:sync` | Synchronisiert alle Plattformen |
| `npm run cap:open:ios` | Öffnet iOS in Xcode |
| `npm run cap:open:android` | Öffnet Android in Android Studio |
| `npm run mobile:ios` | Baut und synchronisiert iOS |
| `npm run mobile:android` | Baut und synchronisiert Android |
| `npm run mobile:build` | Baut und synchronisiert alle |
