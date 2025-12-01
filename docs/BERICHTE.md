# EVIDENRA BASIC - Die 6 Berichtstypen

EVIDENRA BASIC generiert verschiedene wissenschaftliche Berichte, die unterschiedliche Zwecke erfüllen und verschiedene Detailgrade bieten.

---

## Übersicht der Berichtstypen

| # | Berichtstyp | Umfang | Zweck |
|---|-------------|--------|-------|
| 1 | BASIS Report | ~1.500 Wörter | Schnelle Stichwort-Zusammenfassung |
| 2 | EVIDENRA Methodologie Report | ~3.000-4.000 Wörter | Methodendokumentation |
| 3 | ULTIMATE Report | ~6.000-8.000 Wörter | Vollständiger wissenschaftlicher Bericht |
| 4 | Scientific Article | ~4.000-6.000 Wörter | Publikationsfähiger Artikel |
| 5 | Universal Knowledge Report | variabel | Omniscience-Integration |
| 6 | Export Report (PDF/JSON/TXT) | variabel | Finale Exportformate |

---

## 1. BASIS Report (BasisReportService)

### Beschreibung
Kurze, prägnante Stichwort-Zusammenfassung für schnellen Überblick.

### Umfang
- Mindestens **1.500 Wörter**
- Strukturiert in Bullet Points

### Struktur
```
1. Projektübersicht (300 Wörter)
   • Projektname und Forschungsbereich
   • Datengrundlage (Dokumente, Wörter)
   • Forschungskontext und Zielsetzung

2. Hauptkategorien (400 Wörter)
   • Alle wichtigen Kategorien mit Kodierungsanzahl
   • Kernthemen in Stichpunkten
   • Kategorien-Analyse und Gewichtung

3. Zentrale Erkenntnisse (500 Wörter)
   • Wichtigste Patterns und Trends
   • Schlüsselthemen aus der Analyse
   • Wissenschaftliche Implikationen

4. Datenqualität & Methodik (200 Wörter)
   • Kodierungsstatistiken
   • Analysetiefe und Validität
   • Methodische Überlegungen

5. Fazit & Ausblick (100 Wörter)
   • Hauptergebnis
   • Empfehlungen für weitere Forschung
```

### Einsatzbereich
- Schneller Projektüberblick
- Zwischenstände kommunizieren
- Erste Orientierung

---

## 2. EVIDENRA Methodologie Report (EvidenraBasisReportService)

### Beschreibung
Detaillierte Dokumentation der EVIDENRA-spezifischen Forschungsmethodik.

### Umfang
- **3.000-4.000 Wörter**
- Wissenschaftlich-formaler Stil

### Struktur
```
1. EVIDENRA-Projektbeschreibung
   • Projektname und Kontext
   • Forschungsziel und Fragestellungen
   • Verwendete KI-Modelle

2. Datenerhebung & Upload-Prozess
   • Manuelle Uploads vs. DOI-Funde
   • PDF-Analyse-Modell
   • Dokumentenübersicht

3. Forschungsfragen-Entwicklung
   • Manuelle vs. KI-generierte Fragen
   • Verwendetes KI-Modell
   • Fragendetails mit Zeitstempel

4. Kategorisierungsprozess
   • Kategorienübersicht mit Kodierungsanzahlen
   • KI-gestützte Kategorisierung
   • Kategorien-Signifikanz

5. Kodierungsprozess
   • Mehrfach-Kodierung (z.B. 3-fach)
   • Inter-Rater-Reliabilität
   • KI-gestützte vs. manuelle Kodierung

6. Qualitätssicherung
   • Validierungsschritte
   • EVIDENRA-Compliance
   • AKIH-Score Dokumentation

7. Technische Infrastruktur
   • Plattform und Version
   • Verwendete KI-Modelle
   • Genesis Engine Status
```

### Einsatzbereich
- Methodenteil für Publikationen
- Forschungsdokumentation
- Peer-Review Vorbereitung

---

## 3. ULTIMATE Report (UltimateReportService)

### Beschreibung
Vollständiger, datengetriebener wissenschaftlicher Bericht mit maximaler Tiefe.

### Umfang
- **6.000-8.000 Wörter**
- Akademischer Schreibstil

### Struktur
```
1. Executive Summary
   • Kurzfassung der Hauptergebnisse
   • Methodenüberblick
   • Schlüsselerkenntnisse

2. Projektübersicht
   • Forschungskontext
   • Dokumentenbasis
   • Analyseparameter

3. Dokumentenanalyse
   • Einzelne Dokumentenzusammenfassungen
   • Schlüsselthemen pro Dokument
   • Methodologie-Extraktion
   • Repräsentative Zitate

4. Kategorienanalyse
   • Detaillierte Kategorienauswertung
   • Kodierungsdichte und -verteilung
   • Signifikanz-Bewertung
   • Kategorien-Verbindungen

5. Musteranalyse
   • Emergente Patterns
   • Cross-Category Connections
   • Theoretische Muster

6. Literaturintegration
   • Extrahierte Autoren
   • Zitationsdatenbank
   • Literaturmapping

7. Forschungserkenntnisse
   • Key Findings
   • Theoretische Beiträge
   • Praktische Implikationen
   • Zukünftige Forschung

8. Qualitätsmetriken
   • AKIH-Score mit allen Dimensionen
   • Reliabilitätsmaße
   • Validitätsindikatoren

9. Fazit und Ausblick
   • Zusammenfassung
   • Limitationen
   • Empfehlungen
```

### Einsatzbereich
- Vollständige Forschungsdokumentation
- Abschlussberichte
- Dissertationen/Thesis

---

## 4. Scientific Article (ScientificArticleService)

### Beschreibung
Publikationsfähiger wissenschaftlicher Artikel im Journalformat.

### Umfang
- **4.000-6.000 Wörter**
- Journal-konformer Stil

### Struktur
```
Abstract (200-300 Wörter)
   • Hintergrund
   • Methode
   • Ergebnisse
   • Schlussfolgerung

1. Einleitung
   • Forschungshintergrund
   • Problemstellung
   • Forschungslücke
   • Zielsetzung und Fragestellungen

2. Theoretischer Hintergrund
   • Stand der Forschung
   • Theoretische Rahmung
   • Begriffsdefinitionen

3. Methodik
   • Forschungsdesign
   • Datenerhebung
   • Datenanalyse (AKIH-Methode)
   • Qualitätssicherung

4. Ergebnisse
   • Deskriptive Ergebnisse
   • Kategorienanalyse
   • Musteridentifikation
   • Quantitative Befunde

5. Diskussion
   • Interpretation der Ergebnisse
   • Einordnung in Forschungsstand
   • Theoretische Implikationen
   • Praktische Relevanz

6. Fazit
   • Zusammenfassung
   • Limitationen
   • Ausblick

Literaturverzeichnis
   • APA/Harvard Format
   • Vollständige Referenzen
```

### Einsatzbereich
- Journal-Submission
- Konferenzbeiträge
- Buchkapitel

---

## 5. Universal Knowledge Report

### Beschreibung
Integration der Omniscience-Analyse in das Dokumentensystem.

### Umfang
- Variabel (abhängig von Analyse)

### Inhalt
```
Generation Details
   • Timestamp
   • Verwendetes KI-Modell
   • Forschungsfokus

Analysis Overview
   • Anzahl analysierter Themen
   • Wissenstiefe
   • Confidence Level

Key Findings
   • Haupterkenntnisse
   • Cross-Referenzen
   • Emergente Themen

Recommendations
   • Nächste Schritte
   • Vertiefungsmöglichkeiten
```

### Einsatzbereich
- Omniscience-Ergebnisse speichern
- Wissensintegration
- Projektdokumentation

---

## 6. Export Reports (PDF/JSON/TXT)

### PDF Export
Professionell formatierter Forschungsbericht:
- Deckblatt mit Projektinfo
- Inhaltsverzeichnis
- Alle Analyseergebnisse
- Visualisierungen
- Literaturverzeichnis
- AKIH-Score Dokumentation

### JSON Export
Strukturierte Daten für Weiterverarbeitung:
```json
{
  "project": {...},
  "documents": [...],
  "categories": [...],
  "codings": [...],
  "patterns": [...],
  "akihScore": {...},
  "metadata": {...}
}
```

### TXT Export
Einfacher Textexport:
- Plaintext-Format
- Keine Formatierung
- Maximale Kompatibilität

---

## Genesis Engine Integration

Alle Berichtstypen werden durch GAPES optimiert:

### Prompt-Evolution für Reports
- `ultimate_report_section`: Optimiert für wissenschaftliche Tiefe
- `basis_report`: Optimiert für Klarheit und Kürze
- `methodology_documentation`: Optimiert für Präzision
- `scientific_article`: Optimiert für Publikationsreife

### Automatische Verbesserung
- Erfolgreiche Berichte werden analysiert
- Beste Formulierungen werden gelernt
- Struktur wird kontinuierlich verfeinert

---

## Empfehlungen für die Berichtsauswahl

| Situation | Empfohlener Bericht |
|-----------|---------------------|
| Schneller Überblick | BASIS Report |
| Methodendokumentation | EVIDENRA Methodologie Report |
| Vollständige Dokumentation | ULTIMATE Report |
| Journal-Submission | Scientific Article |
| Wissensintegration | Universal Knowledge Report |
| Finale Archivierung | PDF/JSON Export |

---

## Qualitätssicherung

Alle Berichte durchlaufen:
1. **AKIH-Validierung**: Überprüfung gegen 10 Dimensionen
2. **Zitations-Check**: Validierung aller Referenzen
3. **Konsistenzprüfung**: Abgleich mit Projektdaten
4. **Genesis-Optimierung**: Automatische Verbesserung

---

*EVIDENRA BASIC v7.6 - Berichtsgenerierung basierend auf der AKIH-Methode*
