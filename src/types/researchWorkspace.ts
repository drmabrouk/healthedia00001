export interface ReferenceItem {
  id: string;
  number: number;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi?: string;
  isbn?: string;
  url?: string;
}

export interface FigureItem {
  id: string;
  number: number;
  caption: string;
  imageUrl?: string;
}

export interface TableItem {
  id: string;
  number: number;
  caption: string;
  content: string[][]; // Rows of cells
}

export interface CollaboratorItem {
  username: string;
  permission: "View Only" | "Comment" | "Edit";
}

export interface CommentReply {
  id: string;
  author: string;
  content: string;
  timestamp: string;
}

export interface CommentItem {
  id: string;
  sectionId: string; // The manuscript section key (e.g. "introduction")
  selectedText?: string; // Text fragment linked to
  author: string;
  content: string;
  timestamp: string;
  resolved: boolean;
  replies?: CommentReply[];
}

export interface HighlightItem {
  id: string;
  sectionId: string;
  text: string;
  type: "revision_required" | "suggested_improvement" | "approved_section" | "important_note" | "citation_needed";
  comment?: string;
  author: string;
  timestamp: string;
}

export interface VersionHistoryItem {
  id: string;
  versionName: string;
  timestamp: string;
  author: string;
  sectionsSnapshot: Record<string, string>;
  referencesSnapshot: ReferenceItem[];
}

export interface ExportHistoryItem {
  id: string;
  format: "PDF" | "DOCX";
  timestamp: string;
  fileName: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  status: "Draft" | "Archived" | "Completed";
  owner: string; // email of the owner
  createdAt: string;
  updatedAt: string;
  sections: Record<string, string>; // e.g. { "abstract": "...", "introduction": "..." }
  references: ReferenceItem[];
  figures: FigureItem[];
  tables: TableItem[];
  collaborators: CollaboratorItem[];
  comments: CommentItem[];
  highlights: HighlightItem[];
  versionHistory: VersionHistoryItem[];
  exportHistory: ExportHistoryItem[];
}

export interface WorkspaceSettings {
  maxStorageLimitMb: number;
  allowedStyles: string[];
  defaultStyle: string;
  allowExternalSharing: boolean;
  backupFrequency: "Daily" | "Weekly" | "Manual";
  ethicalApprovalRequired: boolean;
}

export interface CitationStyle {
  id: string;
  name: string;
  format: string;
  description: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  defaultSections: string[];
}

export interface ExportTemplate {
  id: string;
  name: string;
  fileFormat: string;
  hasCoverPage: boolean;
  margins: "Standard" | "Narrow" | "Wide";
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  userEmail: string;
  action: string;
  category: "Project" | "Collaboration" | "System" | "Export";
  details: string;
}
