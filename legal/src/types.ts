// src/types.ts
export interface KeyClause {
    title: string;
    text: string;
    explanation: string;
    implications: string;
  }
  
  export interface ImportantTerm {
    term: string;
    definition: string;
  }
  
  export interface SummaryData {
    executive_summary: string;
    key_clauses: KeyClause[];
    important_terms: ImportantTerm[];
    actionable_items: string[];
    error?: string;
    raw_response?: string;
  }
  
  export type Page = 'home' | 'summarize' | 'history' | 'settings';