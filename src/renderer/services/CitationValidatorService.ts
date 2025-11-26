/**
 * Citation Validator Service
 * Validates that all citations in generated articles actually exist in source documents
 * Detects hallucinations and fake references
 */

import { SemanticAnalysisService } from './SemanticAnalysisService';

export interface Citation {
  text: string;
  author?: string;
  year?: string;
  page?: string;
  fullCitation: string;
}

export interface ValidationResult {
  citation: Citation;
  isValid: boolean;
  confidence: number;
  foundIn?: string; // Document name
  matchedText?: string;
  issue?: string;
}

export interface ArticleValidationReport {
  totalCitations: number;
  validCitations: number;
  invalidCitations: number;
  suspiciousCitations: number;
  validationRate: number;
  results: ValidationResult[];
  hallucinations: string[];
  warnings: string[];
}

export class CitationValidatorService {

  /**
   * Extract all citations from generated article
   */
  static extractCitations(article: string): Citation[] {
    const citations: Citation[] = [];

    // Pattern 1: (Author, Year) or (Author Year)
    const pattern1 = /\(([A-Za-zäöüÄÖÜß\s,&\.]+),?\s*(\d{4}[a-z]?)\)/g;
    let match;
    while ((match = pattern1.exec(article)) !== null) {
      citations.push({
        text: match[0],
        author: match[1].trim(),
        year: match[2],
        fullCitation: match[0]
      });
    }

    // Pattern 2: Author (Year): "Quote"
    const pattern2 = /([A-Za-zäöüÄÖÜß]+(?:\s+(?:et\s+al\.?|&\s+[A-Za-zäöüÄÖÜß]+))?)\s*\((\d{4}[a-z]?)\):\s*[""]([^""]+)["\"]/g;
    while ((match = pattern2.exec(article)) !== null) {
      citations.push({
        text: match[3],
        author: match[1].trim(),
        year: match[2],
        fullCitation: match[0]
      });
    }

    // Pattern 3: Direct quotes with page numbers
    const pattern3 = /[""]([^""]{20,})[""]\s*\(([^)]+),?\s*S\.\s*(\d+(?:-\d+)?)\)/g;
    while ((match = pattern3.exec(article)) !== null) {
      citations.push({
        text: match[1],
        author: match[2],
        page: match[3],
        fullCitation: match[0]
      });
    }

    // Pattern 4: Footnote-style [Author, Year, p. X]
    const pattern4 = /\[([^,]+),\s*(\d{4}),\s*(?:p\.|S\.)\s*(\d+(?:-\d+)?)\]/g;
    while ((match = pattern4.exec(article)) !== null) {
      citations.push({
        text: '',
        author: match[1].trim(),
        year: match[2],
        page: match[3],
        fullCitation: match[0]
      });
    }

    return citations;
  }

  /**
   * Validate a single citation against source documents
   */
  static validateCitation(
    citation: Citation,
    documents: Array<{ name: string; content: string }>
  ): ValidationResult {

    // If no quote text, can only validate author/year
    if (!citation.text || citation.text.length < 10) {
      return {
        citation,
        isValid: false,
        confidence: 0.3,
        issue: 'Citation too short to validate'
      };
    }

    let bestMatch: { document: string; similarity: number; text: string } | null = null;

    // Search in all documents
    for (const doc of documents) {
      const content = doc.content || '';

      // Exact match check (best case)
      if (content.includes(citation.text)) {
        return {
          citation,
          isValid: true,
          confidence: 1.0,
          foundIn: doc.name,
          matchedText: citation.text
        };
      }

      // Semantic similarity check (for paraphrased quotes)
      const sentences = content.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (sentence.length < 20) continue;

        const similarity = SemanticAnalysisService.calculateSimilarity(
          citation.text,
          sentence.trim()
        );

        if (similarity > 0.8 && (!bestMatch || similarity > bestMatch.similarity)) {
          bestMatch = {
            document: doc.name,
            similarity,
            text: sentence.trim()
          };
        }
      }
    }

    // High similarity match found
    if (bestMatch && bestMatch.similarity > 0.9) {
      return {
        citation,
        isValid: true,
        confidence: bestMatch.similarity,
        foundIn: bestMatch.document,
        matchedText: bestMatch.text
      };
    }

    // Moderate similarity - suspicious
    if (bestMatch && bestMatch.similarity > 0.7) {
      return {
        citation,
        isValid: false,
        confidence: bestMatch.similarity,
        foundIn: bestMatch.document,
        matchedText: bestMatch.text,
        issue: 'Possible paraphrase or hallucination - similarity only ' +
               (bestMatch.similarity * 100).toFixed(0) + '%'
      };
    }

    // No match found - likely hallucination
    return {
      citation,
      isValid: false,
      confidence: 0,
      issue: 'Citation not found in any source document - possible hallucination!'
    };
  }

  /**
   * Validate entire article
   */
  static validateArticle(
    article: string,
    documents: Array<{ name: string; content: string }>
  ): ArticleValidationReport {

    const citations = this.extractCitations(article);
    const results: ValidationResult[] = [];
    const hallucinations: string[] = [];
    const warnings: string[] = [];

    let validCount = 0;
    let invalidCount = 0;
    let suspiciousCount = 0;

    for (const citation of citations) {
      const result = this.validateCitation(citation, documents);
      results.push(result);

      if (result.isValid && result.confidence >= 0.9) {
        validCount++;
      } else if (result.confidence === 0) {
        invalidCount++;
        hallucinations.push(
          `"${citation.text.substring(0, 100)}..." - ${result.issue}`
        );
      } else {
        suspiciousCount++;
        warnings.push(
          `"${citation.text.substring(0, 100)}..." in ${result.foundIn} - ${result.issue}`
        );
      }
    }

    const validationRate = citations.length > 0
      ? validCount / citations.length
      : 0;

    return {
      totalCitations: citations.length,
      validCitations: validCount,
      invalidCitations: invalidCount,
      suspiciousCitations: suspiciousCount,
      validationRate,
      results,
      hallucinations,
      warnings
    };
  }

  /**
   * Detect hallucinated facts (claims not supported by documents)
   */
  static detectHallucinations(
    article: string,
    documents: Array<{ name: string; content: string }>
  ): string[] {
    const hallucinations: string[] = [];

    // Extract factual claims (sentences with numbers, percentages, specific data)
    const factPattern = /[^.!?]*(?:\d+%|\d+\s*(?:participants|subjects|cases|studies)|p\s*[<>=]\s*0?\.\d+)[^.!?]*[.!?]/gi;
    const facts = article.match(factPattern) || [];

    const allDocContent = documents.map(d => d.content).join(' ');

    for (const fact of facts) {
      // Check if this factual claim is supported by any document
      const cleanFact = fact.trim();

      // Exact match
      if (allDocContent.includes(cleanFact)) {
        continue; // Valid
      }

      // Semantic match
      let foundSupport = false;
      for (const doc of documents) {
        const sentences = doc.content.split(/[.!?]+/);
        for (const sentence of sentences) {
          const similarity = SemanticAnalysisService.calculateSimilarity(
            cleanFact,
            sentence
          );
          if (similarity > 0.8) {
            foundSupport = true;
            break;
          }
        }
        if (foundSupport) break;
      }

      if (!foundSupport) {
        hallucinations.push(
          `Unsupported claim: "${cleanFact.substring(0, 150)}..."`
        );
      }
    }

    return hallucinations;
  }

  /**
   * Generate validation report as markdown
   */
  static generateValidationReport(report: ArticleValidationReport): string {
    const validationGrade =
      report.validationRate >= 0.9 ? 'Excellent (A)' :
      report.validationRate >= 0.7 ? 'Good (B)' :
      report.validationRate >= 0.5 ? 'Fair (C)' :
      report.validationRate >= 0.3 ? 'Poor (D)' : 'Failed (F)';

    return `# Citation Validation Report

## Summary
- **Total Citations:** ${report.totalCitations}
- **Valid Citations:** ${report.validCitations} (${(report.validationRate * 100).toFixed(1)}%)
- **Invalid Citations:** ${report.invalidCitations}
- **Suspicious Citations:** ${report.suspiciousCitations}
- **Validation Grade:** ${validationGrade}

## ✅ Valid Citations
${report.results
  .filter(r => r.isValid && r.confidence >= 0.9)
  .map(r => `- "${r.citation.text.substring(0, 100)}..." → Found in: ${r.foundIn}`)
  .join('\n') || 'None'}

## ⚠️ Suspicious Citations
${report.warnings.map(w => `- ${w}`).join('\n') || 'None'}

## ❌ Hallucinations Detected
${report.hallucinations.map(h => `- ${h}`).join('\n') || 'None'}

## Recommendation
${report.validationRate >= 0.9
  ? '✅ Article citations are well-supported by source documents. Safe to use.'
  : report.validationRate >= 0.7
  ? '⚠️ Most citations are valid, but review suspicious items before publication.'
  : '❌ Significant citation issues detected. Review and revise before using.'}
`;
  }
}
