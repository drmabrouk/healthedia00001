import { ResearchPaper, Researcher } from "./types";
import { INITIAL_PAPERS, INITIAL_RESEARCHERS } from "./data";

// Normalizes a string by converting to lowercase and stripping punctuation
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Computes the Levenshtein distance between two words for spelling correction
export function levenshteinDistance(a: string, b: string): number {
  const tmp = [];
  let i, j, alen = a.length, blen = b.length;
  if (alen === 0) return blen;
  if (blen === 0) return alen;
  for (i = 0; i <= alen; i++) tmp[i] = [i];
  for (j = 0; j <= blen; j++) tmp[0][j] = j;
  for (i = 1; i <= alen; i++) {
    for (j = 1; j <= blen; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1,
        tmp[i][j - 1] + 1,
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return tmp[alen][blen];
}

// Builds a vocabulary dictionary of valid index terms from papers and researchers
function buildVocabulary(): string[] {
  const words = new Set<string>();
  
  // Extract words from papers
  INITIAL_PAPERS.forEach(paper => {
    // Add titles
    paper.title.split(/\s+/).forEach(w => {
      const nw = normalizeString(w);
      if (nw.length > 3) words.add(nw);
    });
    // Add authors
    paper.authors.forEach(author => {
      author.split(/\s+/).forEach(w => {
        const nw = normalizeString(w);
        if (nw.length > 2) words.add(nw);
      });
    });
    // Add keywords
    paper.keywords.forEach(keyword => {
      keyword.split(/\s+/).forEach(w => {
        const nw = normalizeString(w);
        if (nw.length > 2) words.add(nw);
      });
    });
    // Add specialty
    paper.specialty.split(/\s+/).forEach(w => {
      const nw = normalizeString(w);
      if (nw.length > 3) words.add(nw);
    });
  });

  // Extract words from researchers
  INITIAL_RESEARCHERS.forEach(res => {
    res.name.split(/\s+/).forEach(w => {
      const nw = normalizeString(w);
      if (nw.length > 2) words.add(nw);
    });
    res.specialty.split(/\s+/).forEach(w => {
      const nw = normalizeString(w);
      if (nw.length > 3) words.add(nw);
    });
  });

  return Array.from(words);
}

const VOCABULARY = buildVocabulary();

// Suggests spelling corrections for a given search query
export function suggestSpellingCorrection(query: string): string | null {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 3) return null;

  // If the query is an exact match in papers/researchers, don't correct it
  const normalizedQuery = normalizeString(trimmed);
  const terms = normalizedQuery.split(/\s+/);
  
  let correctedTerms = [...terms];
  let changed = false;

  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    if (term.length < 3) continue;

    // See if the term is already highly represented in our vocabulary
    if (VOCABULARY.includes(term)) continue;

    // Find the closest term in vocabulary
    let minDistance = 3; // Maximum distance to consider correction
    let bestMatch: string | null = null;

    for (const vocabTerm of VOCABULARY) {
      const dist = levenshteinDistance(term, vocabTerm);
      if (dist < minDistance) {
        minDistance = dist;
        bestMatch = vocabTerm;
      }
    }

    if (bestMatch && bestMatch !== term) {
      correctedTerms[i] = bestMatch;
      changed = true;
    }
  }

  return changed ? correctedTerms.join(" ") : null;
}

// Searches papers using a scoring index
export function searchPapers(query: string): ResearchPaper[] {
  const normQuery = normalizeString(query);
  if (!normQuery) return INITIAL_PAPERS;

  const queryTerms = normQuery.split(/\s+/);

  const scoredPapers = INITIAL_PAPERS.map(paper => {
    let score = 0;

    // Exact matches
    if (normalizeString(paper.doi) === normQuery) {
      score += 100; // Perfect DOI match
    }

    const normTitle = normalizeString(paper.title);
    if (normTitle.includes(normQuery)) {
      score += 50;
    }

    const normAbstract = normalizeString(paper.abstract);
    if (normAbstract.includes(normQuery)) {
      score += 20;
    }

    // Term-based matching
    queryTerms.forEach(term => {
      // Title match
      if (normTitle.includes(term)) score += 10;
      
      // Abstract match
      if (normAbstract.includes(term)) score += 3;

      // Author match
      paper.authors.forEach(author => {
        if (normalizeString(author).includes(term)) score += 15;
      });

      // Keyword match
      paper.keywords.forEach(keyword => {
        if (normalizeString(keyword).includes(term)) score += 15;
      });

      // Institution match
      if (normalizeString(paper.institution).includes(term)) score += 5;

      // Journal match
      if (normalizeString(paper.journal).includes(term)) score += 8;

      // Specialty match
      if (normalizeString(paper.specialty).includes(term)) score += 12;
    });

    return { paper, score };
  });

  // Filter out zero-scored and sort by relevance
  return scoredPapers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.paper);
}

// Searches researchers using a scoring index
export function searchResearchers(query: string): Researcher[] {
  const normQuery = normalizeString(query);
  if (!normQuery) return INITIAL_RESEARCHERS;

  const queryTerms = normQuery.split(/\s+/);

  const scoredResearchers = INITIAL_RESEARCHERS.map(res => {
    let score = 0;

    // Exact ORCID match
    if (res.orcid.replace(/-/g, "") === query.replace(/-/g, "")) {
      score += 100;
    }

    const normName = normalizeString(res.name);
    if (normName.includes(normQuery)) {
      score += 40;
    }

    // Term matches
    queryTerms.forEach(term => {
      if (normName.includes(term)) score += 15;
      if (normalizeString(res.specialty).includes(term)) score += 15;
      if (normalizeString(res.institution).includes(term)) score += 10;
      if (normalizeString(res.degree).includes(term)) score += 8;
      
      res.researchInterests.forEach(interest => {
        if (normalizeString(interest).includes(term)) score += 12;
      });

      res.qualifications.forEach(qual => {
        if (normalizeString(qual).includes(term)) score += 5;
      });
    });

    return { res, score };
  });

  return scoredResearchers
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.res);
}

// Autocomplete suggestions based on current partial query
export interface AutocompleteSuggestion {
  text: string;
  type: "title" | "author" | "keyword" | "specialty" | "researcher";
  target: string; // The text to fill in
}

export function getAutocompleteSuggestions(query: string): AutocompleteSuggestion[] {
  const normalized = normalizeString(query);
  if (!normalized || normalized.length < 2) return [];

  const suggestions: AutocompleteSuggestion[] = [];
  const seen = new Set<string>();

  // Helper to add suggestions safely
  const addSuggestion = (text: string, type: "title" | "author" | "keyword" | "specialty" | "researcher", target: string) => {
    const key = `${type}:${target.toLowerCase()}`;
    if (!seen.has(key) && suggestions.length < 6) {
      seen.add(key);
      suggestions.push({ text, type, target });
    }
  };

  // Match researchers
  INITIAL_RESEARCHERS.forEach(res => {
    if (normalizeString(res.name).includes(normalized)) {
      addSuggestion(`${res.title} ${res.name}`, "researcher", res.name);
    }
    if (normalizeString(res.specialty).includes(normalized)) {
      addSuggestion(res.specialty, "specialty", res.specialty);
    }
  });

  // Match papers
  INITIAL_PAPERS.forEach(paper => {
    if (normalizeString(paper.title).includes(normalized)) {
      addSuggestion(paper.title, "title", paper.title);
    }
    paper.authors.forEach(author => {
      if (normalizeString(author).includes(normalized)) {
        addSuggestion(author, "author", author);
      }
    });
    paper.keywords.forEach(kw => {
      if (normalizeString(kw).includes(normalized)) {
        addSuggestion(kw, "keyword", kw);
      }
    });
  });

  return suggestions;
}
