# EVIDENRA BASIC v7.6 - Benutzerhandbuch

## Übersicht der Benutzeroberfläche

EVIDENRA BASIC bietet eine strukturierte Arbeitsumgebung für qualitative Datenanalyse mit KI-Unterstützung. Die Anwendung ist in verschiedene Tabs organisiert, die den AKIH-Workflow abbilden.

---

## Tab-Übersicht

### 1. Dashboard
**Der Startpunkt Ihrer Analyse**

Das Dashboard bietet:
- **Projektübersicht**: Status der aktuellen Analyse
- **Schnellzugriff**: Direktlinks zu allen Funktionen
- **AKIH-Score**: Live-Anzeige der Analysequalität
- **Genesis Engine Status**: Anzeige des KI-Lernfortschritts
- **Statistiken**: Dokumentenanzahl, Kodierungen, Kategorien

**Aktionen:**
- Neues Projekt starten
- Bestehendes Projekt fortsetzen
- Setup aufrufen

---

### 2. Setup
**Konfiguration der Analyse**

Hier konfigurieren Sie:
- **API-Einstellungen**: OpenAI API-Key eingeben
- **Sprache**: Deutsch oder Englisch
- **Forschungsfokus**: Themenbereich definieren
- **Lizenz**: Lizenzschlüssel eingeben/prüfen

**Wichtig:**
- API-Key wird lokal gespeichert
- Ohne API-Key keine KI-Analyse möglich

---

### 3. Upload
**Dokumente importieren**

Unterstützte Formate:
- **PDF**: Vollständige Textextraktion mit PDF.js
- **TXT**: Direkter Import
- **DOCX**: Microsoft Word-Dokumente

**Funktionen:**
- Drag & Drop Upload
- Mehrfachauswahl möglich
- Automatische Textextraktion
- Qualitätsprüfung der Dokumente
- Vorschau des extrahierten Texts

**Workflow:**
1. Dateien per Drag & Drop hinzufügen
2. Extrahierten Text prüfen
3. Weiter zur Wissensbank

---

### 4. Knowledge (Wissensbank)
**Dokumentenverwaltung und Analyse**

Die Wissensbank zeigt:
- **Alle importierten Dokumente**
- **Metadaten**: Seitenzahl, Wortanzahl, Qualität
- **Textvorschau**
- **Analysestatus** pro Dokument

**Funktionen:**
- Dokumente durchsuchen
- Einzelne Dokumente analysieren
- Dokumente entfernen
- Qualitätsbewertung einsehen

---

### 5. Omniscience
**KI-gestützte Gesamtanalyse**

Der Omniscience-Modus analysiert alle Dokumente mit dem 7-Persona-System:

**Die 7 Perspektiven:**
1. **Orthodox Scholar** - Methodische Strenge
2. **Pragmatic Analyst** - Praktische Anwendung
3. **Creative Explorer** - Neue Muster
4. **Critical Theorist** - Kritische Reflexion
5. **Synthetic Integrator** - Synthese
6. **Hermeneutic Interpreter** - Tiefenverständnis
7. **Phenomenological Observer** - Erfahrungsbasis

**Output:**
- Konsens-Analyse aller Perspektiven
- Identifizierte Themen
- Vorgeschlagene Kategorien
- Forschungsfragen

---

### 6. Questions (Forschungsfragen)
**Forschungsfragen entwickeln**

Hier definieren und verfeinern Sie:
- **Hauptforschungsfrage**
- **Unterforschungsfragen**
- **KI-generierte Vorschläge**

**Funktionen:**
- Manuelle Eingabe
- KI-Generierung basierend auf Dokumenten
- Priorisierung
- Verknüpfung mit Kategorien

---

### 7. Categories (Kategorien)
**Kategoriensystem entwickeln**

Das Herzstück der qualitativen Analyse:

**Kategorientypen:**
- **Hauptkategorien**: Übergeordnete Themen
- **Subkategorien**: Detaillierte Untergliederung
- **Codes**: Einzelne Kodierungen

**Funktionen:**
- Kategorien erstellen/bearbeiten
- Drag & Drop Organisation
- Farbcodierung
- Beschreibungen hinzufügen
- KI-Vorschläge für neue Kategorien

**AKIH-Empfehlung:** 8-12 Hauptkategorien (Miller's Law)

---

### 8. Coding (Kodierung)
**Textstellen kodieren**

Hier erfolgt die eigentliche Kodierarbeit:

**Workflow:**
1. Dokument auswählen
2. Textstelle markieren
3. Kategorie zuweisen
4. Optional: Memo hinzufügen

**Funktionen:**
- Multi-Dokument-Ansicht
- Suchfunktion
- Filter nach Kategorie
- KI-Vorschläge für Kodierungen
- Inter-Rater-Reliabilität (Multi-Persona)

**Tastenkürzel:**
- `Strg+K`: Schnellkodierung
- `Strg+F`: Suche
- `Strg+M`: Memo hinzufügen

---

### 9. Patterns (Muster)
**Muster und Zusammenhänge erkennen**

Die KI identifiziert:
- **Thematische Muster**
- **Kategorien-Cluster**
- **Häufigkeitsverteilungen**
- **Co-Occurrenzen**

**Visualisierungen:**
- Netzwerkgraphen
- Heatmaps
- Frequenzdiagramme

---

### 10. Article (Wissenschaftlicher Artikel)
**Automatische Artikelgenerierung**

EVIDENRA generiert wissenschaftliche Texte:

**Abschnitte:**
- Abstract
- Einleitung
- Methodenteil
- Ergebnisse
- Diskussion
- Fazit
- Literaturverzeichnis

**Funktionen:**
- Abschnitt-für-Abschnitt Generierung
- Bearbeitung im Editor
- Zitationsintegration
- Formatvorlagen (APA, Harvard, etc.)

---

### 11. Analysis (Analyse-Übersicht)
**Gesamtübersicht der Analyse**

Zeigt den aktuellen Stand:
- **AKIH-Score** mit allen 10 Dimensionen
- **Fortschrittsanzeige**
- **Qualitätsmetriken**
- **Empfehlungen zur Verbesserung**

---

### 12. Export
**Ergebnisse exportieren**

Exportformate:
- **PDF**: Professioneller Forschungsbericht
- **JSON**: Strukturierte Daten für Weiterverarbeitung
- **TXT**: Einfacher Textexport

**PDF-Report enthält:**
- Zusammenfassung
- Kategoriensystem
- Kodierungsübersicht
- Musteranalyse
- AKIH-Score
- Zitationsverzeichnis

---

## Genesis Engine

### Was ist die Genesis Engine?

Die Genesis Engine ist ein selbstlernendes KI-System, das:
- Aus Ihren Analysemustern lernt
- Prompts automatisch optimiert (GAPES)
- Die Analysequalität kontinuierlich verbessert

### Genesis Dashboard

Zeigt:
- Lernfortschritt
- Optimierte Prompts
- Performance-Metriken
- Anpassungsvorschläge

---

## Tastenkürzel

| Kürzel | Funktion |
|--------|----------|
| `Strg+O` | Datei öffnen |
| `Strg+S` | Speichern |
| `Strg+E` | Export |
| `Strg+K` | Schnellkodierung |
| `Strg+F` | Suche |
| `Strg+M` | Memo hinzufügen |
| `F12` | DevTools umschalten |
| `Strg+,` | Einstellungen |

---

## Workflow-Empfehlung

### Schritt 1: Setup
1. API-Key eingeben
2. Sprache wählen
3. Forschungsfokus definieren

### Schritt 2: Datenimport
1. Dokumente hochladen (Upload-Tab)
2. Qualität prüfen (Knowledge-Tab)

### Schritt 3: Exploration
1. Omniscience-Analyse durchführen
2. Forschungsfragen entwickeln (Questions-Tab)

### Schritt 4: Kategorisierung
1. Kategoriensystem aufbauen (Categories-Tab)
2. KI-Vorschläge prüfen

### Schritt 5: Kodierung
1. Systematische Kodierung (Coding-Tab)
2. Multi-Persona-Validierung

### Schritt 6: Musteranalyse
1. Patterns analysieren
2. Theoretische Sättigung prüfen

### Schritt 7: Ergebnisse
1. Artikel generieren (Article-Tab)
2. AKIH-Score prüfen (Analysis-Tab)
3. Export durchführen

---

## Fehlerbehebung

### App startet nicht
1. Cache löschen: `%APPDATA%/EVIDENRA BASIC`
2. Als Administrator starten
3. Antivirus-Ausnahme hinzufügen

### Keine KI-Analyse möglich
1. API-Key prüfen
2. Internetverbindung prüfen
3. API-Kontingent prüfen

### PDF wird nicht erkannt
1. PDF-Qualität prüfen (gescannt vs. digital)
2. Kleinere PDFs testen
3. Als TXT exportieren und importieren

### Lizenz-Probleme
1. Internetverbindung prüfen
2. Lizenz erneut eingeben
3. support@evidenra.com kontaktieren

---

## Support

Bei Fragen:
- **E-Mail**: support@evidenra.com
- **GitHub**: Issues erstellen
- **Response Time**: 24-48 Stunden

---

*EVIDENRA BASIC v7.6 - GENESIS Edition*
*Basierend auf der AKIH-Methode von Prof. Dr. Bernhard Strobl*
