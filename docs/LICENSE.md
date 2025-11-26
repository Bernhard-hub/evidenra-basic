# Lizenzierung - EVIDENRA BASIC v7.6

## Trial-Version

### 30-Tage Testphase
- **Vollfunktional**: Alle Features verfügbar
- **Keine Einschränkungen**: Unbegrenzte Dokumentenverarbeitung
- **Hardware-gebunden**: Trial ist an einen Computer gebunden

### Nach Ablauf der Trial
- App startet mit Lizenz-Dialog
- Alle Funktionen blockiert
- Lizenzschlüssel erforderlich

## Lizenzschlüssel erwerben

### Via Gumroad
1. [Gumroad Produktseite](https://gumroad.com/l/evidenra-basic) besuchen
2. Lizenz kaufen
3. Lizenzschlüssel per E-Mail erhalten

### Aktivierung
1. EVIDENRA BASIC starten
2. Lizenzschlüssel eingeben
3. "Aktivieren" klicken
4. Fertig!

## Lizenzbedingungen

### Was ist erlaubt
- Nutzung auf einem Computer
- Kommerzielle Nutzung
- Forschungsnutzung
- Bildungsnutzung

### Was nicht erlaubt ist
- Weitergabe des Lizenzschlüssels
- Aktivierung auf mehreren Computern
- Reverse Engineering
- Weiterverkauf

## Hardware-ID

Die Lizenz ist an Ihre Hardware-ID gebunden:
- Automatisch beim ersten Start generiert
- Basiert auf: Betriebssystem, Hostname, CPU, RAM
- Verhindert Mehrfachaktivierung

### Computer wechseln?
1. Support kontaktieren
2. Alte Aktivierung deaktivieren lassen
3. Neu aktivieren

## Technische Details

### Lizenz-Validierung
- Offline-Check: Gespeicherte Lizenzdaten
- Online-Check: Gumroad API (alle 30 Tage)
- Fallback: Lokale Validierung bei Netzwerkproblemen

### Gespeicherte Daten
```
%APPDATA%/EVIDENRA BASIC/
├── license.json    # Lizenzdaten
└── trial.json      # Trial-Status
```

### Lizenz zurücksetzen
```bash
# Windows
del "%APPDATA%\EVIDENRA BASIC\license.json"

# macOS/Linux
rm ~/Library/Application\ Support/EVIDENRA\ BASIC/license.json
```

## FAQ

### Wie lange ist meine Lizenz gültig?
Unbegrenzt - einmalige Zahlung, lebenslanger Zugang.

### Kann ich upgraden?
Ja, Upgrade-Pfade von BASIC zu Professional verfügbar.

### Was passiert bei Hardware-Wechsel?
Support kontaktieren für kostenlose Reaktivierung.

### Funktioniert die App offline?
Ja, nach einmaliger Online-Aktivierung.

## Support

Bei Lizenz-Problemen:
- E-Mail: support@evidenra.com
- GitHub: Issues erstellen
- Response Time: 24-48 Stunden

---

Gumroad Product ID: `BAHleQbgEXcGPy68OhfynQ==`
