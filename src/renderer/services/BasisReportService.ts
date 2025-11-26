// BasisReportService.ts - Kurze 500-Wörter Stichwort-Zusammenfassung
import APIService from '../../services/APIService';
import { ContinuationService } from '../../services/ContinuationService'; // 🔧 FIX: Add continuation support

export interface ProjectData {
  name: string;
  documents: any[];
  categories: any[];
  codings: any[];
  patterns?: any[];
  questions?: any[];
}

export class BasisReportService {

  /**
   * Generate BASIS Mode Report - 500 Wörter Stichwort-Zusammenfassung
   */
  static async generateBasisReport(
    project: ProjectData,
    apiSettings: { provider: string; model: string; apiKey: string },
    language: string = 'de',
    onStatusUpdate?: (status: string) => void
  ): Promise<{ success: boolean; content?: string; error?: string; wordCount?: number; cost?: number }> {

    try {
      onStatusUpdate?.('📋 Generiere BASIS Stichwort-Zusammenfassung...');

      // Extract key project statistics
      const projectStats = {
        totalDocuments: project.documents.length,
        totalWords: project.documents.reduce((sum: number, d: any) => sum + (d.wordCount || 0), 0),
        totalCategories: project.categories.length,
        totalCodings: project.codings.length,
        topCategories: project.categories
          .map((cat: any) => ({
            name: cat.name,
            codingCount: project.codings.filter((c: any) => c.categoryId === cat.id).length
          }))
          .sort((a, b) => b.codingCount - a.codingCount)
          .slice(0, 5)
      };

      // Extract key insights from top codings
      const keyInsights = project.codings
        .slice(0, 10)
        .map((c: any) => c.text?.substring(0, 100))
        .filter(Boolean);

      const messages = [
        {
          role: 'system',
          content: language === 'de'
            ? `Du bist ein Experte für ausführliche wissenschaftliche Zusammenfassungen. Erstelle eine umfassende MINDESTENS 1500-Wörter BASIS-Zusammenfassung in Stichpunkt-Format.

🎯 **ANFORDERUNGEN:**
- MINDESTENS 1500 Wörter für umfassende Analyse - schreibe ausführlich!
- Klare Stichpunkt-Struktur mit Bullet Points
- Detaillierte, prägnante Formulierungen mit Tiefgang
- Fokus auf die wichtigsten Erkenntnisse und Daten
- Deutsche Sprache, professioneller Ton
- WICHTIG: Schreibe viel Text, nicht zu knapp!

📊 **STRUKTUR (MINDESTENS 1500 Wörter):**
1. **Projektübersicht** (300 Wörter)
   - Projektname und Forschungsbereich ausführlich
   - Datengrundlage (Dokumente, Wörter) mit Details
   - Forschungskontext und Zielsetzung

2. **Hauptkategorien** (400 Wörter)
   - Alle wichtigen Kategorien mit Kodierungsanzahl
   - Kernthemen in detaillierten Stichpunkten
   - Kategorien-Analyse und Gewichtung

3. **Zentrale Erkenntnisse** (500 Wörter)
   - Wichtigste Patterns und Trends ausführlich
   - Schlüsselthemen aus der Analyse mit Beispielen
   - Wissenschaftliche Implikationen

4. **Datenqualität & Methodik** (200 Wörter)
   - Kodierungsstatistiken detailliert
   - Analysetiefe und Validität
   - Methodische Überlegungen

5. **Fazit & Ausblick** (100 Wörter)
   - Hauptergebnis ausführlich
   - Empfehlungen für weitere Forschung

⚠️ **ULTRA-KRITISCH:** Schreibe VOLLSTÄNDIGEN Bericht mit MINDESTENS 1500 Wörtern. NIEMALS abbrechen! NIEMALS stoppen! Schreibe bis zum Ende ALLER 5 Abschnitte! Verwende • für Bullet Points. VOLLSTÄNDIGE AUSFÜHRUNG ZWINGEND ERFORDERLICH!`

            : `You are an expert in extensive scientific summaries. Create a comprehensive MINIMUM 1500-word BASIS summary in bullet-point format.

🎯 **REQUIREMENTS:**
- MINIMUM 1500 words for comprehensive analysis - write extensively!
- Clear bullet-point structure
- Detailed, precise formulations with depth
- Focus on key insights and data with examples
- English language, professional tone
- IMPORTANT: Write extensive text, not too brief!

📊 **STRUCTURE (MINIMUM 1500 words):**
1. **Project Overview** (300 words)
   - Project name and research domain extensively
   - Data foundation (documents, words) with details
   - Research context and objectives

2. **Main Categories** (400 words)
   - All important categories with coding counts
   - Core themes in detailed bullet points
   - Category analysis and weighting

3. **Central Insights** (500 words)
   - Key patterns and trends extensively
   - Main themes from analysis with examples
   - Scientific implications

4. **Data Quality & Methodology** (200 words)
   - Coding statistics in detail
   - Analysis depth and validity
   - Methodological considerations

5. **Conclusion & Outlook** (100 words)
   - Main result extensively
   - Recommendations for further research

⚠️ **ULTRA-CRITICAL:** Write COMPLETE report with MINIMUM 1500 words. NEVER cut off! NEVER stop! Write until the end of ALL 5 sections! Use • for bullet points. COMPLETE EXECUTION MANDATORY!`
        },
        {
          role: 'user',
          content: `BASIS REPORT - KOMPAKTE ZUSAMMENFASSUNG

## PROJEKTDATEN:
- **Name:** ${project.name}
- **Dokumente:** ${projectStats.totalDocuments} (${projectStats.totalWords.toLocaleString()} Wörter)
- **Kategorien:** ${projectStats.totalCategories}
- **Kodierungen:** ${projectStats.totalCodings}

## TOP KATEGORIEN:
${projectStats.topCategories.map(cat =>
  `- **${cat.name}:** ${cat.codingCount} Kodierungen`
).join('\n')}

## ZENTRALE THEMEN (Auswahl):
${keyInsights.slice(0, 5).map(insight => `- "${insight}..."`).join('\n')}

## AUFTRAG:
Erstelle eine ${language === 'de' ? 'ausführliche MINDESTENS 1500-Wörter BASIS-Zusammenfassung' : 'extensive MINIMUM 1500-word BASIS summary'} mit der oben geforderten Struktur. ${language === 'de' ? 'Verwende deutsche Sprache und professionelle Stichpunkt-Formatierung. Schreibe ausführlich und detailliert!' : 'Use English and professional bullet-point formatting. Write extensively and in detail!'}`
        }
      ];

      // 🔧 FIX: Use ContinuationService to guarantee 1500 words without cutoff
      const result = await ContinuationService.generateWithContinuation(
        apiSettings,
        messages,
        1500, // Target word count
        8000, // Higher token limit
        {
          maxContinuations: 2,
          minWordsPerContinuation: 500,
          truncationSignals: [
            '[Fortsetzung folgt]',
            '[Continued in next response]',
            '... (gekürzt)',
            'Die Analyse wird fortgesetzt'
          ]
        },
        (status, currentWords, targetWords) => {
          onStatusUpdate?.(`BASIS Report: ${status} (${currentWords}/${targetWords} Wörter)`);
        }
      );

      if (result.success) {
        return {
          success: true,
          content: result.content,
          wordCount: result.wordCount,
          cost: result.cost
        };
      } else {
        return { success: false, error: result.error || 'BASIS Report generation failed' };
      }

    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}