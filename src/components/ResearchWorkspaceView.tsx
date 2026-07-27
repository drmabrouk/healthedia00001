import React, { useState, useEffect, useRef } from "react";
import { 
  FileText, Search, Plus, ArrowRight, BookOpen, Users, History, Check, HelpCircle,
  FileDown, Trash2, Copy, Archive, RotateCcw, Share2, MessageSquare, AlertTriangle, 
  Settings, Save, Globe, Eye, UserPlus, Send, CheckCircle, Info, Bookmark, RefreshCw, 
  Layout, ListOrdered, Clipboard, ShieldAlert, BarChart3, Database, Calendar, User
} from "lucide-react";
import { UserProfileData } from "../types";
import { 
  ResearchProject, 
  ReferenceItem, 
  FigureItem, 
  TableItem, 
  CollaboratorItem, 
  CommentItem, 
  HighlightItem, 
  VersionHistoryItem, 
  ExportHistoryItem,
  WorkspaceSettings,
  CitationStyle,
  DocumentTemplate,
  ExportTemplate,
  ActivityLog
} from "../types/researchWorkspace";
import { 
  CITATION_STYLES, 
  DOCUMENT_TEMPLATES, 
  EXPORT_TEMPLATES, 
  INITIAL_WORKSPACE_SETTINGS, 
  INITIAL_ACTIVITY_LOGS, 
  SECTION_LABELS, 
  INITIAL_PROJECTS, 
  validateReference, 
  detectDuplicateReference, 
  formatBibliographyItem, 
  renumberReferences 
} from "../services/researchWorkspaceService";

interface ResearchWorkspaceViewProps {
  currentUser: UserProfileData;
  setCurrentPage: (page: string) => void;
}

export default function ResearchWorkspaceView({ currentUser, setCurrentPage }: ResearchWorkspaceViewProps) {
  // State for active screen
  const [activeTab, setActiveTab] = useState<"dashboard" | "editor" | "admin">("dashboard");
  
  // Storage keys
  const PROJECTS_KEY = "healthedia_research_projects";
  const SETTINGS_KEY = "healthedia_workspace_settings";
  const STYLES_KEY = "healthedia_citation_styles";
  const DOCUMENTS_KEY = "healthedia_document_templates";
  const LOGS_KEY = "healthedia_workspace_logs";
  const EXPORTS_KEY = "healthedia_export_history";

  // State loaded from localStorage or fallback
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [settings, setSettings] = useState<WorkspaceSettings>(INITIAL_WORKSPACE_SETTINGS);
  const [styles, setStyles] = useState<CitationStyle[]>(CITATION_STYLES);
  const [docTemplates, setDocTemplates] = useState<DocumentTemplate[]>(DOCUMENT_TEMPLATES);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);

  // Filtering / Sorting / Searching
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Draft" | "Archived" | "Completed" | "Shared">("All");
  const [sortBy, setSortBy] = useState<"Newest" | "Oldest" | "Alphabetical" | "Last Updated">("Last Updated");

  // Active Project & Editor State
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("abstract");
  const [editorSubTab, setEditorSubTab] = useState<"write" | "references" | "figures_tables" | "sharing" | "review" | "versions" | "preview">("write");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving..." | "Unsaved Changes">("Saved");
  
  // References Editor State
  const [refForm, setRefForm] = useState<Partial<ReferenceItem>>({
    title: "", authors: "", journal: "", year: new Date().getFullYear(), doi: "", isbn: "", url: ""
  });
  const [refErrors, setRefErrors] = useState<string[]>([]);
  const [selectedStyleId, setSelectedStyleId] = useState<string>("apa");

  // Figures & Tables State
  const [figCaption, setFigCaption] = useState("");
  const [figUrl, setFigUrl] = useState("");
  const [tabCaption, setTabCaption] = useState("");
  const [tabCols, setTabCols] = useState("Metric, Control Group, Interventional Group");
  const [tabRows, setTabRows] = useState("Mean Hb (g/dL), 14.1, 15.6*\nVO2max (mL/kg/min), 72.4, 76.8*");

  // Collaborators State
  const [inviteUsername, setInviteUsername] = useState("");
  const [invitePermission, setInvitePermission] = useState<"View Only" | "Comment" | "Edit">("Edit");

  // Inline Comments state
  const [commentText, setCommentText] = useState("");
  const [commentSelection, setCommentSelection] = useState("");
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({});

  // Highlighting State
  const [highlightText, setHighlightText] = useState("");
  const [highlightType, setHighlightType] = useState<"revision_required" | "suggested_improvement" | "approved_section" | "important_note" | "citation_needed">("revision_required");
  const [highlightComment, setHighlightComment] = useState("");

  // Version Control State
  const [checkpointName, setCheckpointName] = useState("");
  const [compareVersionId, setCompareVersionId] = useState<string | null>(null);

  // Admin Module settings form state
  const [adminStorageLimit, setAdminStorageLimit] = useState(100);
  const [adminBackupFreq, setAdminBackupFreq] = useState<"Daily" | "Weekly" | "Manual">("Daily");
  const [adminEthicalRequired, setAdminEthicalRequired] = useState(true);

  // Load state on mount
  useEffect(() => {
    const storedProjects = localStorage.getItem(PROJECTS_KEY);
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    } else {
      setProjects(INITIAL_PROJECTS);
      localStorage.setItem(PROJECTS_KEY, JSON.stringify(INITIAL_PROJECTS));
    }

    const storedSettings = localStorage.getItem(SETTINGS_KEY);
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      setSettings(parsed);
      setAdminStorageLimit(parsed.maxStorageLimitMb);
      setAdminBackupFreq(parsed.backupFrequency);
      setAdminEthicalRequired(parsed.ethicalApprovalRequired);
    }

    const storedLogs = localStorage.getItem(LOGS_KEY);
    if (storedLogs) {
      setActivityLogs(JSON.parse(storedLogs));
    } else {
      localStorage.setItem(LOGS_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
    }

    const storedExports = localStorage.getItem(EXPORTS_KEY);
    if (storedExports) {
      setExportHistory(JSON.parse(storedExports));
    }
  }, []);

  // Save projects callback helper
  const saveProjectsToStorage = (updatedProjects: ResearchProject[]) => {
    setProjects(updatedProjects);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updatedProjects));
  };

  // Add an Activity Log helper
  const addWorkspaceLog = (action: string, category: "Project" | "Collaboration" | "System" | "Export", details: string) => {
    const newLog: ActivityLog = {
      id: "log-" + Date.now(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      userEmail: currentUser.email,
      action,
      category,
      details
    };
    const updated = [newLog, ...activityLogs];
    setActivityLogs(updated);
    localStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  };

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  // Auto-Save Effect
  useEffect(() => {
    if (!activeProject) return;
    const timer = setTimeout(() => {
      setSaveStatus("Saved");
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeProject?.sections, activeProject?.references, activeProject?.figures, activeProject?.tables]);

  // Project Dashboard Handlers
  const handleCreateProject = (templateId: string = "clinical_trial") => {
    const template = docTemplates.find(t => t.id === templateId) || docTemplates[0];
    const initialSections: Record<string, string> = {};
    template.defaultSections.forEach(s => {
      initialSections[s] = "";
    });

    const newProject: ResearchProject = {
      id: "proj-" + Date.now(),
      title: "Untitled Research Paper",
      status: "Draft",
      owner: currentUser.email,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      sections: initialSections,
      references: [],
      figures: [],
      tables: [],
      collaborators: [],
      comments: [],
      highlights: [],
      versionHistory: [],
      exportHistory: []
    };

    const updated = [newProject, ...projects];
    saveProjectsToStorage(updated);
    setActiveProjectId(newProject.id);
    setActiveSection(template.defaultSections[0] || "abstract");
    setActiveTab("editor");
    setEditorSubTab("write");
    addWorkspaceLog("Project Created", "Project", `Created project with ${template.name} blueprint.`);
  };

  const handleRenameProject = (id: string, newTitle: string) => {
    if (!newTitle.trim()) return;
    const updated = projects.map(p => {
      if (p.id === id) {
        return { 
          ...p, 
          title: newTitle, 
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16) 
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    addWorkspaceLog("Project Renamed", "Project", `Renamed project to '${newTitle}'.`);
  };

  const handleDuplicateProject = (proj: ResearchProject) => {
    const duplicated: ResearchProject = {
      ...proj,
      id: "proj-" + Date.now() + "-dup",
      title: `${proj.title} (Copy)`,
      owner: currentUser.email,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      versionHistory: [],
      exportHistory: [],
      collaborators: [] // Reset collaborators for security on copy
    };

    const updated = [duplicated, ...projects];
    saveProjectsToStorage(updated);
    addWorkspaceLog("Project Duplicated", "Project", `Duplicated '${proj.title}'.`);
  };

  const handleArchiveProject = (id: string) => {
    const updated = projects.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === "Archived" ? "Draft" as const : "Archived" as const;
        return { 
          ...p, 
          status: nextStatus,
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16) 
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    addWorkspaceLog("Project Archived Toggle", "Project", `Toggled archive state on project ID ${id}.`);
  };

  const handleDeleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    saveProjectsToStorage(updated);
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setActiveTab("dashboard");
    }
    addWorkspaceLog("Project Deleted", "Project", `Removed project reference ID ${id}.`);
  };

  // Writing Assistant & Editor Handlers
  const handleSectionTextChange = (text: string) => {
    if (!activeProject) return;
    setSaveStatus("Saving...");
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          sections: {
            ...p.sections,
            [activeSection]: text
          },
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
      }
      return p;
    });
    setProjects(updated);
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  };

  // References Module
  const handleAddReference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) return;

    const errors = validateReference(refForm);
    if (errors.length > 0) {
      setRefErrors(errors);
      return;
    }

    if (detectDuplicateReference(activeProject.references, refForm)) {
      setRefErrors(["A reference with the identical Title or DOI already exists."]);
      return;
    }

    const newRef: ReferenceItem = {
      id: "ref-" + Date.now(),
      number: activeProject.references.length + 1,
      title: refForm.title || "",
      authors: refForm.authors || "",
      journal: refForm.journal || "",
      year: Number(refForm.year),
      doi: refForm.doi,
      isbn: refForm.isbn,
      url: refForm.url
    };

    const updatedRefs = renumberReferences([...activeProject.references, newRef]);

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, references: updatedRefs };
      }
      return p;
    });

    saveProjectsToStorage(updated);
    setRefForm({ title: "", authors: "", journal: "", year: new Date().getFullYear(), doi: "", isbn: "", url: "" });
    setRefErrors([]);
    addWorkspaceLog("Reference Added", "Project", `Added '${newRef.title}' to reference bibliography.`);
  };

  const handleDeleteReference = (refId: string) => {
    if (!activeProject) return;
    const filtered = activeProject.references.filter(r => r.id !== refId);
    const updatedRefs = renumberReferences(filtered);

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, references: updatedRefs };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    addWorkspaceLog("Reference Deleted", "Project", `Deleted reference entry.`);
  };

  // Tables & Figures
  const handleAddFigure = () => {
    if (!activeProject || !figCaption.trim()) return;
    const newFig: FigureItem = {
      id: "fig-" + Date.now(),
      number: activeProject.figures.length + 1,
      caption: figCaption,
      imageUrl: figUrl || "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?q=80&w=400"
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, figures: [...p.figures, newFig] };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    setFigCaption("");
    setFigUrl("");
    addWorkspaceLog("Figure Added", "Project", `Added Figure ${newFig.number} inside resources.`);
  };

  const handleAddTable = () => {
    if (!activeProject || !tabCaption.trim()) return;
    const colNames = tabCols.split(",").map(c => c.trim());
    const rowLines = tabRows.split("\n").map(line => line.split(",").map(cell => cell.trim()));

    const tableContent = [colNames, ...rowLines];
    const newTab: TableItem = {
      id: "tab-" + Date.now(),
      number: activeProject.tables.length + 1,
      caption: tabCaption,
      content: tableContent
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, tables: [...p.tables, newTab] };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    setTabCaption("");
    addWorkspaceLog("Table Added", "Project", `Added Table ${newTab.number} into preprint components.`);
  };

  // Collaborators
  const handleInviteCollaborator = () => {
    if (!activeProject || !inviteUsername.trim()) return;
    
    // Check if duplicate
    const exists = activeProject.collaborators.some(c => c.username.toLowerCase() === inviteUsername.toLowerCase());
    if (exists) {
      alert("This collaborator is already registered on this project.");
      return;
    }

    const newCollab: CollaboratorItem = {
      username: inviteUsername.trim(),
      permission: invitePermission
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, collaborators: [...p.collaborators, newCollab] };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    setInviteUsername("");
    addWorkspaceLog("Collaborator Shared", "Collaboration", `Shared project '${activeProject.title}' with user ${newCollab.username} as ${newCollab.permission}.`);
  };

  const handleRevokeCollaborator = (username: string) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          collaborators: p.collaborators.filter(c => c.username !== username)
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    addWorkspaceLog("Collaboration Revoked", "Collaboration", `Revoked project access for ${username}.`);
  };

  // Comments
  const handleAddComment = () => {
    if (!activeProject || !commentText.trim()) return;

    const newComment: CommentItem = {
      id: "comm-" + Date.now(),
      sectionId: activeSection,
      selectedText: commentSelection || undefined,
      author: currentUser.name,
      content: commentText,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      resolved: false,
      replies: []
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });
    saveProjectsToStorage(updated);
    setCommentText("");
    setCommentSelection("");
    addWorkspaceLog("Comment Logged", "Collaboration", `Added editorial comment on section ${activeSection}.`);
  };

  const handleAddReply = (commentId: string) => {
    const text = replyTexts[commentId];
    if (!activeProject || !text || !text.trim()) return;

    const reply = {
      id: "rep-" + Date.now(),
      author: currentUser.name,
      content: text,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    const updatedComments = activeProject.comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), reply]
        };
      }
      return c;
    });

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, comments: updatedComments };
      }
      return p;
    });

    saveProjectsToStorage(updated);
    setReplyTexts(prev => ({ ...prev, [commentId]: "" }));
  };

  const handleResolveComment = (commentId: string) => {
    if (!activeProject) return;
    const updatedComments = activeProject.comments.map(c => {
      if (c.id === commentId) {
        return { ...c, resolved: !c.resolved };
      }
      return c;
    });

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, comments: updatedComments };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  // Highlighting selected text blocks
  const handleAddHighlight = () => {
    if (!activeProject || !highlightText.trim()) return;

    const newHighlight: HighlightItem = {
      id: "high-" + Date.now(),
      sectionId: activeSection,
      text: highlightText,
      type: highlightType,
      comment: highlightComment || undefined,
      author: currentUser.name,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16)
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return { ...p, highlights: [...p.highlights, newHighlight] };
      }
      return p;
    });

    saveProjectsToStorage(updated);
    setHighlightText("");
    setHighlightComment("");
    addWorkspaceLog("Text Highlighted", "Collaboration", `Highlighted text segment under '${highlightType}' classification.`);
  };

  const handleDeleteHighlight = (highId: string) => {
    if (!activeProject) return;
    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          highlights: p.highlights.filter(h => h.id !== highId)
        };
      }
      return p;
    });
    saveProjectsToStorage(updated);
  };

  // Version Control
  const handleSaveVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject || !checkpointName.trim()) return;

    const newVersion: VersionHistoryItem = {
      id: "v-" + Date.now(),
      versionName: checkpointName.trim(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      author: currentUser.name,
      sectionsSnapshot: JSON.parse(JSON.stringify(activeProject.sections)),
      referencesSnapshot: JSON.parse(JSON.stringify(activeProject.references))
    };

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          versionHistory: [...p.versionHistory, newVersion]
        };
      }
      return p;
    });

    saveProjectsToStorage(updated);
    setCheckpointName("");
    addWorkspaceLog("Checkpoint Saved", "Project", `Saved version snapshot: '${newVersion.versionName}'.`);
  };

  const handleRestoreVersion = (version: VersionHistoryItem) => {
    if (!activeProject) return;
    const confirmRestore = window.confirm(`Are you sure you want to restore snapshot: "${version.versionName}"? Current unsaved changes will be overwritten.`);
    if (!confirmRestore) return;

    const updated = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          sections: JSON.parse(JSON.stringify(version.sectionsSnapshot)),
          references: JSON.parse(JSON.stringify(version.referencesSnapshot)),
          updatedAt: new Date().toISOString().replace("T", " ").substring(0, 16)
        };
      }
      return p;
    });

    saveProjectsToStorage(updated);
    addWorkspaceLog("Version Restored", "Project", `Restored snapshot back to '${version.versionName}'.`);
    alert(`Successfully restored to snapshot: ${version.versionName}`);
  };

  // Export Engine Simulation with real document compilation
  const handleExportManuscript = (format: "PDF" | "DOCX") => {
    if (!activeProject) return;

    const cleanTitle = activeProject.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${cleanTitle}_manuscript.${format === "PDF" ? "pdf" : "docx"}`;
    
    // Simulate compilation delay and generate full text for downloading
    let documentBody = `====================================================\n`;
    documentBody += `         HEALTHEDIA MANUSCRIPT PREPRINT ARCHIVE\n`;
    documentBody += `====================================================\n\n`;
    documentBody += `TITLE: ${activeProject.sections.title || activeProject.title}\n`;
    documentBody += `AUTHORS: ${activeProject.sections.authors || "Unspecified Author"}\n`;
    documentBody += `AFFILIATIONS: ${activeProject.sections.affiliations || "None"}\n\n`;
    documentBody += `ABSTRACT:\n${activeProject.sections.abstract || "No abstract compiled."}\n\n`;
    documentBody += `KEYWORDS: ${activeProject.sections.keywords || "None"}\n\n`;
    documentBody += `----------------------------------------------------\n`;
    documentBody += `               MANUSCRIPT SECTIONS\n`;
    documentBody += `----------------------------------------------------\n\n`;

    Object.entries(activeProject.sections).forEach(([key, value]) => {
      if (!["title", "authors", "affiliations", "abstract", "keywords"].includes(key)) {
        documentBody += `[${SECTION_LABELS[key] || key.toUpperCase()}]\n`;
        documentBody += `${value || "--- Section Unwritten ---"}\n\n`;
      }
    });

    if (activeProject.figures.length > 0) {
      documentBody += `\n----------------------------------------------------\n`;
      documentBody += `                 FIGURES LIST\n`;
      documentBody += `----------------------------------------------------\n\n`;
      activeProject.figures.forEach(fig => {
        documentBody += `Figure ${fig.number}: ${fig.caption}\n`;
        documentBody += `Resource URI: ${fig.imageUrl}\n\n`;
      });
    }

    if (activeProject.tables.length > 0) {
      documentBody += `\n----------------------------------------------------\n`;
      documentBody += `                 TABLES LIST\n`;
      documentBody += `----------------------------------------------------\n\n`;
      activeProject.tables.forEach(tab => {
        documentBody += `Table ${tab.number}: ${tab.caption}\n`;
        tab.content.forEach(row => {
          documentBody += `| ${row.join(" | ")} |\n`;
        });
        documentBody += `\n`;
      });
    }

    if (activeProject.references.length > 0) {
      documentBody += `\n----------------------------------------------------\n`;
      documentBody += `              REFERENCES & BIBLIOGRAPHY\n`;
      documentBody += `----------------------------------------------------\n\n`;
      activeProject.references.forEach(ref => {
        const formatted = formatBibliographyItem(selectedStyleId, ref);
        documentBody += `[${ref.number}] ${formatted}\n`;
      });
    }

    // Trigger download
    const blob = new Blob([documentBody], { type: "text/plain;charset=utf-8" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update history
    const newExport: ExportHistoryItem = {
      id: "exp-" + Date.now(),
      format,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      fileName
    };

    const updatedHistory = [newExport, ...exportHistory];
    setExportHistory(updatedHistory);
    localStorage.setItem(EXPORTS_KEY, JSON.stringify(updatedHistory));

    const updatedProjects = projects.map(p => {
      if (p.id === activeProject.id) {
        return {
          ...p,
          exportHistory: [newExport, ...(p.exportHistory || [])]
        };
      }
      return p;
    });
    saveProjectsToStorage(updatedProjects);

    addWorkspaceLog("Manuscript Compiled", "Export", `Compiled & downloaded '${activeProject.title}' as ${format}.`);
    alert(`Manuscript successfully formatted! Download started: ${fileName}`);
  };

  // Administrator Controls Handlers
  const handleSaveAdminSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: WorkspaceSettings = {
      ...settings,
      maxStorageLimitMb: adminStorageLimit,
      backupFrequency: adminBackupFreq,
      ethicalApprovalRequired: adminEthicalRequired
    };
    setSettings(updatedSettings);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
    addWorkspaceLog("Admin Settings Updated", "System", `Modified disk quotas to ${adminStorageLimit}MB & backup to ${adminBackupFreq}.`);
    alert("Administrative workspace policies applied successfully.");
  };

  const handleSimulateBackup = () => {
    addWorkspaceLog("Database Backup Executed", "System", "Full logical backup of 3 databases and draft arrays completed.");
    alert("Logical restore checkpoint created successfully! Saved to backup log registry.");
  };

  // Filter & Search computation
  const filteredProjects = projects.filter(p => {
    // Role filter - Users can view projects they own, or projects they are collaborators on
    const isOwner = p.owner.toLowerCase() === currentUser.email.toLowerCase();
    const isCollaborator = p.collaborators?.some(col => col.username.toLowerCase() === (currentUser.username || "").toLowerCase());
    
    if (!isOwner && !isCollaborator) return false;

    // Search query
    const matchSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        Object.values(p.sections).some(val => typeof val === "string" && val.toLowerCase().includes(searchQuery.toLowerCase()));

    // Status filter
    if (statusFilter === "All") return matchSearch;
    if (statusFilter === "Draft") return p.status === "Draft" && isOwner && matchSearch;
    if (statusFilter === "Archived") return p.status === "Archived" && matchSearch;
    if (statusFilter === "Completed") return p.status === "Completed" && matchSearch;
    if (statusFilter === "Shared") return isCollaborator && matchSearch;

    return matchSearch;
  });

  // Sorting
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortBy === "Newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (sortBy === "Oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (sortBy === "Alphabetical") return a.title.localeCompare(b.title);
    if (sortBy === "Last Updated") return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    return 0;
  });

  // Calculate high level dashboard statistics
  const activeCount = projects.filter(p => p.status === "Draft" && p.owner === currentUser.email).length;
  const completedCount = projects.filter(p => p.status === "Completed" && p.owner === currentUser.email).length;
  const sharedCount = projects.filter(p => p.collaborators?.some(c => c.username === currentUser.username)).length;
  const archiveCount = projects.filter(p => p.status === "Archived").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow flex flex-col space-y-6" id="research-workspace-root">
      
      {/* Workspace Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-neutral-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-semibold tracking-wider">Independent Sandbox</span>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <h1 className="text-3xl font-sans font-black tracking-tight text-neutral-900 mt-1">Research Workspace</h1>
          <p className="text-sm text-neutral-500 mt-1">Pre-submission drafting workbench, reference compiler, and double-blind collaborative review engine.</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Main Workspace Navigation Controls */}
          <button
            onClick={() => { setActiveTab("dashboard"); setActiveProjectId(null); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "dashboard" ? "bg-black text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
            }`}
          >
            Dashboard
          </button>
          
          {activeProjectId && (
            <button
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === "editor" ? "bg-black text-white" : "bg-neutral-50 text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              Active Paper Editor
            </button>
          )}

          {currentUser.role === "Admin" && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/50 flex items-center gap-1 cursor-pointer ${
                activeTab === "admin" ? "bg-red-900! text-white!" : ""
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Settings & Auditing
            </button>
          )}
        </div>
      </div>

      {/* VIEW: DASHBOARD */}
      {activeTab === "dashboard" && (
        <div className="space-y-8 animate-fadeIn" id="workspace-dashboard-screen">
          
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Active Drafts</span>
              <p className="text-2xl font-black text-neutral-900">{activeCount}</p>
              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-neutral-900 h-full" style={{ width: `${Math.min(100, activeCount * 20)}%` }}></div>
              </div>
            </div>
            
            <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Shared Manuscripts</span>
              <p className="text-2xl font-black text-neutral-900">{sharedCount}</p>
              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-neutral-900 h-full" style={{ width: `${Math.min(100, sharedCount * 33)}%` }}></div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Compiled Preprint Exports</span>
              <p className="text-2xl font-black text-neutral-900">{exportHistory.length}</p>
              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-neutral-900 h-full" style={{ width: `${Math.min(100, exportHistory.length * 25)}%` }}></div>
              </div>
            </div>

            <div className="p-4 bg-neutral-50 border border-neutral-200/50 rounded-2xl space-y-1">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Archived Projects</span>
              <p className="text-2xl font-black text-neutral-900">{archiveCount}</p>
              <div className="w-full bg-neutral-200 h-1 rounded-full overflow-hidden mt-2">
                <div className="bg-neutral-900 h-full" style={{ width: `${Math.min(100, archiveCount * 15)}%` }}></div>
              </div>
            </div>
          </div>

          {/* Create new project button section */}
          <div className="bg-neutral-900 text-white p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="text-lg font-bold tracking-tight">Initiate New Guided Manuscript Blueprint</h3>
              <p className="text-xs text-neutral-400">Launch a blank draft structured explicitly to comply with the CONSORT medical trials or PRISMA review guidelines.</p>
            </div>
            
            <div className="flex flex-wrap gap-2 shrink-0">
              {docTemplates.map(t => (
                <button
                  key={t.id}
                  onClick={() => handleCreateProject(t.id)}
                  className="px-4 py-2 bg-white text-black hover:bg-neutral-100 font-mono text-[10px] font-bold uppercase rounded-xl transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  {t.name.split(" ")[0]} Blueprint
                </button>
              ))}
            </div>
          </div>

          {/* Project Catalog Search / Filters */}
          <div className="space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-between">
              <div className="relative flex-grow max-w-lg">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search project titles, abstracts, hypotheses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Status selection */}
                <div className="flex bg-neutral-100 p-1 rounded-xl">
                  {(["All", "Draft", "Completed", "Shared", "Archived"] as const).map(f => (
                    <button
                      key={f}
                      onClick={() => setStatusFilter(f)}
                      className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-lg transition-all cursor-pointer ${
                        statusFilter === f ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>

                {/* Sort selection */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-[10px] font-mono font-bold uppercase focus:outline-none cursor-pointer"
                >
                  <option value="Last Updated">Last Updated</option>
                  <option value="Newest">Created Newest</option>
                  <option value="Oldest">Created Oldest</option>
                  <option value="Alphabetical">Alphabetical</option>
                </select>
              </div>
            </div>

            {/* Project Grid */}
            {sortedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedProjects.map(p => {
                  const isOwner = p.owner.toLowerCase() === currentUser.email.toLowerCase();
                  const completePercentage = Math.round(
                    (Object.values(p.sections).filter(v => typeof v === "string" && v.trim().length > 0).length / Object.keys(p.sections).length) * 100
                  );
                  
                  return (
                    <div 
                      key={p.id}
                      className="p-5 border border-neutral-200/80 hover:border-black bg-white rounded-2xl flex flex-col justify-between space-y-4 group transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono uppercase text-neutral-400">ID: {p.id}</span>
                          <div className="flex items-center gap-1.5">
                            {p.status === "Archived" ? (
                              <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-mono font-bold uppercase rounded border border-amber-100">Archived</span>
                            ) : p.status === "Completed" ? (
                              <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[8px] font-mono font-bold uppercase rounded border border-emerald-100">Completed</span>
                            ) : (
                              <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 text-[8px] font-mono font-bold uppercase rounded border border-neutral-200">Active Draft</span>
                            )}
                            {!isOwner && (
                              <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-mono font-bold uppercase rounded border border-indigo-100">Shared</span>
                            )}
                          </div>
                        </div>

                        {/* Editable Title form / Simple Rename directly on card */}
                        <input
                          type="text"
                          defaultValue={p.title}
                          onBlur={(e) => handleRenameProject(p.id, e.target.value)}
                          className="font-sans font-bold text-neutral-900 text-sm bg-transparent border-b border-transparent hover:border-neutral-300 focus:border-black focus:outline-none w-full"
                          title="Click to rename"
                          placeholder="Untitled Draft"
                        />

                        <p className="text-xs text-neutral-400 line-clamp-2">
                          {p.sections.abstract || p.sections.introduction || "No content compiled in structural sections yet."}
                        </p>
                      </div>

                      {/* Card Footer / Controls */}
                      <div className="space-y-3 pt-2 border-t border-neutral-100">
                        {/* Progress */}
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                            <span>Completeness</span>
                            <span>{completePercentage}%</span>
                          </div>
                          <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                            <div className="bg-black h-full" style={{ width: `${completePercentage}%` }}></div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                          <span>Updated: {p.updatedAt}</span>
                          <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" /> {p.references.length} references</span>
                        </div>

                        <div className="flex items-center justify-between gap-1.5 pt-1">
                          <button
                            onClick={() => {
                              setActiveProjectId(p.id);
                              setActiveTab("editor");
                              setEditorSubTab("write");
                            }}
                            className="flex-grow py-1.5 bg-neutral-50 hover:bg-neutral-900 hover:text-white text-neutral-800 text-[10px] font-mono font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                          >
                            Open Assistant <ArrowRight className="w-3 h-3" />
                          </button>

                          {/* Quick Actions Dropdown Simulated */}
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleDuplicateProject(p)}
                              className="p-1.5 text-neutral-400 hover:text-black hover:bg-neutral-100 rounded-lg cursor-pointer"
                              title="Duplicate Paper"
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </button>
                            {isOwner && (
                              <button
                                onClick={() => handleArchiveProject(p.id)}
                                className="p-1.5 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
                                title="Toggle Archive"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {isOwner && (
                              <button
                                onClick={() => handleDeleteProject(p.id)}
                                className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                                title="Delete Project"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 border border-dashed border-neutral-200 rounded-3xl bg-neutral-50 space-y-3">
                <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
                <h4 className="text-sm font-bold text-neutral-800">No Projects Found</h4>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">Either no drafts match your search query, or you have not created any drafts under your verified account yet.</p>
                <button
                  onClick={() => handleCreateProject("clinical_trial")}
                  className="px-4 py-2 bg-black text-white hover:opacity-95 text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Create Initial Draft
                </button>
              </div>
            )}
          </div>

          {/* Export History Log Panel */}
          <div className="p-6 border border-neutral-200 rounded-3xl bg-white space-y-4">
            <h3 className="text-xs font-mono font-black uppercase text-neutral-400 tracking-widest">Preprint Download & Export Registry</h3>
            {exportHistory.length > 0 ? (
              <div className="space-y-2">
                {exportHistory.slice(0, 5).map(exp => (
                  <div key={exp.id} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200/30">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-neutral-900 text-white rounded-lg">
                        <FileDown className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{exp.fileName}</p>
                        <p className="text-[10px] text-neutral-400 font-mono">{exp.timestamp} • Format: {exp.format}</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 font-mono text-[8px] font-semibold rounded uppercase">Verified Clean</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-neutral-400 italic">No historical compiling logs compiled yet.</p>
            )}
          </div>
        </div>
      )}

      {/* VIEW: PROJECT EDITOR */}
      {activeTab === "editor" && activeProject && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn" id="workspace-editor-screen">
          
          {/* Section sidebar navigator (Col-3) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-3">
              <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold tracking-wider">Active Workspace</span>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-neutral-900 truncate" title={activeProject.title}>{activeProject.title}</h3>
                <div className="flex items-center justify-between text-[10px] font-mono text-neutral-500">
                  <span>Author: {activeProject.owner}</span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === "Saved" ? "bg-emerald-500" : saveStatus === "Saving..." ? "bg-amber-500 animate-pulse" : "bg-rose-500"}`} />
                    {saveStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Sections Selector */}
            <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
              <div className="p-3 bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono font-bold uppercase text-neutral-500">
                Manuscript Sections List
              </div>
              <div className="max-h-[480px] overflow-y-auto divide-y divide-neutral-100">
                {Object.keys(activeProject.sections).map((secKey) => {
                  const label = SECTION_LABELS[secKey] || secKey;
                  const isFilled = (activeProject.sections[secKey] || "").trim().length > 0;
                  const isActive = activeSection === secKey;
                  return (
                    <button
                      key={secKey}
                      onClick={() => {
                        setActiveSection(secKey);
                        setEditorSubTab("write");
                      }}
                      className={`w-full text-left p-3 text-xs flex items-center justify-between transition-all cursor-pointer ${
                        isActive 
                          ? "bg-black text-white font-bold" 
                          : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="truncate">{label}</span>
                      {isFilled ? (
                        <Check className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-emerald-500"}`} />
                      ) : (
                        <span className="text-[9px] font-mono text-neutral-300">Empty</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main workspace arena (Col-9) */}
          <div className="lg:col-span-9 space-y-6">
            
            {/* Workbench tab header */}
            <div className="flex flex-wrap border-b border-neutral-200 gap-1 bg-neutral-50 p-1 rounded-xl">
              {[
                { id: "write", label: "Structured Assistant", icon: FileText },
                { id: "references", label: "Citations Manager", icon: BookOpen },
                { id: "figures_tables", label: "Illustrations & Tables", icon: Layout },
                { id: "sharing", label: "Collaborators", icon: Users },
                { id: "review", label: "Revision Colors", icon: MessageSquare },
                { id: "versions", label: "Version Control", icon: History },
                { id: "preview", label: "Pre-print Mockup", icon: Eye }
              ].map(sub => {
                const Icon = sub.icon;
                const isSelected = editorSubTab === sub.id;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setEditorSubTab(sub.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected ? "bg-white text-black shadow-sm" : "text-neutral-500 hover:text-black"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {sub.label}
                  </button>
                );
              })}
            </div>

            {/* SUB-VIEW: STRUCTURED WRITING ASSISTANT */}
            {editorSubTab === "write" && (
              <div className="space-y-4 animate-fadeIn" id="structured-editor-tab">
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Now Drafting Section</h3>
                    <h2 className="text-base font-bold text-neutral-900">{SECTION_LABELS[activeSection] || activeSection}</h2>
                  </div>

                  {/* Highlight state tool instructions shortcut */}
                  <span className="text-[10px] text-neutral-500 max-w-xs text-right hidden sm:block">
                    Changes save in real-time. Use the <strong className="text-black font-semibold">Citations Manager</strong> tab to build reference indexes.
                  </span>
                </div>

                {/* Text Area */}
                <div className="space-y-1">
                  <textarea
                    rows={12}
                    value={activeProject.sections[activeSection] || ""}
                    onChange={(e) => handleSectionTextChange(e.target.value)}
                    placeholder={`Enter text or drag-and-drop research blocks into this ${SECTION_LABELS[activeSection]} viewport...`}
                    className="w-full p-4 border border-neutral-200 focus:border-black focus:outline-none rounded-2xl text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400 px-1">
                    <span>Character Count: {(activeProject.sections[activeSection] || "").length}</span>
                    <span>Words: {(activeProject.sections[activeSection] || "").split(/\s+/).filter(Boolean).length}</span>
                  </div>
                </div>

                {/* Insertion Utilities Block */}
                <div className="p-4 border border-neutral-200 rounded-2xl bg-white space-y-3">
                  <h4 className="text-[10px] font-mono font-bold uppercase text-neutral-400">Quick Insertion Shortcuts</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeProject.references.map(ref => (
                      <button
                        key={ref.id}
                        onClick={() => handleSectionTextChange((activeProject.sections[activeSection] || "") + ` [${ref.number}]`)}
                        className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-lg text-[9px] font-mono border border-neutral-200 transition-all cursor-pointer"
                        title={ref.title}
                      >
                        + Cite Ref [{ref.number}]
                      </button>
                    ))}
                    {activeProject.figures.map(fig => (
                      <button
                        key={fig.id}
                        onClick={() => handleSectionTextChange((activeProject.sections[activeSection] || "") + ` (Figure ${fig.number})`)}
                        className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-lg text-[9px] font-mono border border-neutral-200 transition-all cursor-pointer"
                        title={fig.caption}
                      >
                        + Cite Fig [{fig.number}]
                      </button>
                    ))}
                    {activeProject.tables.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => handleSectionTextChange((activeProject.sections[activeSection] || "") + ` (Table ${tab.number})`)}
                        className="px-2.5 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-800 rounded-lg text-[9px] font-mono border border-neutral-200 transition-all cursor-pointer"
                        title={tab.caption}
                      >
                        + Cite Table [{tab.number}]
                      </button>
                    ))}
                    {activeProject.references.length === 0 && (
                      <span className="text-[10px] text-neutral-400 italic">No quick elements compiled yet. Open Citing tab below.</span>
                    )}
                  </div>
                </div>

                {/* Workspace Inline Commenter */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Highlight Highlight tools */}
                  <div className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-3">
                    <h4 className="text-[10px] font-mono font-black uppercase text-neutral-400 tracking-wider">Highlight Selection Marker</h4>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[9px] font-mono uppercase font-semibold text-neutral-500 mb-1">Text Selection To Mark</label>
                        <input
                          type="text"
                          value={highlightText}
                          onChange={(e) => setHighlightText(e.target.value)}
                          placeholder="Type or copy-paste text fragment..."
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-mono uppercase font-semibold text-neutral-500 mb-1">Academic Category</label>
                          <select
                            value={highlightType}
                            onChange={(e) => setHighlightType(e.target.value as any)}
                            className="w-full p-1.5 bg-white border border-neutral-200 rounded-xl text-[10px] font-mono focus:outline-none"
                          >
                            <option value="revision_required">Revision Required</option>
                            <option value="suggested_improvement">Suggested Improvement</option>
                            <option value="approved_section">Approved Section</option>
                            <option value="important_note">Important Note</option>
                            <option value="citation_needed">Citation Needed</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[9px] font-mono uppercase font-semibold text-neutral-500 mb-1">Highlight Note</label>
                          <input
                            type="text"
                            value={highlightComment}
                            onChange={(e) => setHighlightComment(e.target.value)}
                            placeholder="Add editorial justification..."
                            className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                          />
                        </div>
                      </div>

                      <button
                        onClick={handleAddHighlight}
                        disabled={!highlightText.trim()}
                        className="w-full py-1.5 bg-black text-white hover:opacity-90 disabled:opacity-40 text-[10px] font-mono font-bold uppercase rounded-lg cursor-pointer"
                      >
                        Highlight Selection Block
                      </button>
                    </div>
                  </div>

                  {/* Quick comment on section */}
                  <div className="p-4 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-3">
                    <h4 className="text-[10px] font-mono font-black uppercase text-neutral-400 tracking-wider">Inline Workspace Discussions</h4>
                    
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-mono uppercase font-semibold text-neutral-500 mb-1">Optional selection string</label>
                        <input
                          type="text"
                          value={commentSelection}
                          onChange={(e) => setCommentSelection(e.target.value)}
                          placeholder="Reference text (optional)..."
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Type conversation thread..."
                          className="flex-grow p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                        <button
                          onClick={handleAddComment}
                          className="p-2 bg-black text-white hover:opacity-90 rounded-xl cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-[120px] overflow-y-auto space-y-2 pr-1 pt-1">
                      {activeProject.comments.filter(c => c.sectionId === activeSection).map(c => (
                        <div key={c.id} className="p-2 bg-white border border-neutral-100 rounded-lg text-[10px]">
                          <div className="flex items-center justify-between font-bold text-neutral-800">
                            <span>{c.author}</span>
                            <span className="text-[8px] font-mono text-neutral-400">{c.timestamp}</span>
                          </div>
                          {c.selectedText && <p className="text-[9px] italic text-neutral-400 border-l border-neutral-200 pl-1 my-1">"{c.selectedText}"</p>}
                          <p className="text-neutral-600">{c.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: CITATIONS MANAGER */}
            {editorSubTab === "references" && (
              <div className="space-y-6 animate-fadeIn" id="citations-manager-tab">
                
                {/* Reference Entry Form */}
                <form onSubmit={handleAddReference} className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Compile Reference Metadata</h3>
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-mono uppercase text-neutral-500 font-bold">Citation Style:</label>
                      <select
                        value={selectedStyleId}
                        onChange={(e) => setSelectedStyleId(e.target.value)}
                        className="p-1 bg-white border border-neutral-200 rounded text-[9px] font-mono focus:outline-none cursor-pointer"
                      >
                        {styles.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {refErrors.length > 0 && (
                    <div className="p-3 bg-red-50 text-red-800 border border-red-200 rounded-xl text-xs space-y-1">
                      <p className="font-bold flex items-center gap-1"><ShieldAlert className="w-4 h-4 shrink-0" /> Validation Anomalies Detected:</p>
                      <ul className="list-disc pl-4 space-y-0.5 font-mono text-[10px]">
                        {refErrors.map((err, idx) => <li key={idx}>{err}</li>)}
                      </ul>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Title *</label>
                      <input
                        type="text"
                        placeholder="e.g. Erythropoietin Response and Erythrocyte Expansion"
                        value={refForm.title}
                        onChange={(e) => setRefForm({ ...refForm, title: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Author List *</label>
                      <input
                        type="text"
                        placeholder="e.g. Levine B. D., Stray-Gundersen J."
                        value={refForm.authors}
                        onChange={(e) => setRefForm({ ...refForm, authors: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Journal/Publisher Name *</label>
                      <input
                        type="text"
                        placeholder="e.g. Journal of Applied Physiology"
                        value={refForm.journal}
                        onChange={(e) => setRefForm({ ...refForm, journal: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Year *</label>
                        <input
                          type="number"
                          placeholder="2026"
                          value={refForm.year}
                          onChange={(e) => setRefForm({ ...refForm, year: Number(e.target.value) })}
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">DOI Registry</label>
                        <input
                          type="text"
                          placeholder="10.1152/jappl.xxxx"
                          value={refForm.doi}
                          onChange={(e) => setRefForm({ ...refForm, doi: e.target.value })}
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">ISBN Number</label>
                      <input
                        type="text"
                        placeholder="e.g. 978-3-16-148410-0"
                        value={refForm.isbn}
                        onChange={(e) => setRefForm({ ...refForm, isbn: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono uppercase text-neutral-500 mb-1">Online URL Link</label>
                      <input
                        type="text"
                        placeholder="https://journals.physiology.org/..."
                        value={refForm.url}
                        onChange={(e) => setRefForm({ ...refForm, url: e.target.value })}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-black text-white hover:opacity-90 font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Verify & Index Reference
                    </button>
                  </div>
                </form>

                {/* Indexed Bibliography List */}
                <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                  <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Bibliography Database ({activeProject.references.length} references)</span>
                    <span className="text-[9px] font-mono bg-neutral-200 text-neutral-700 px-1.5 py-0.2 rounded font-semibold uppercase">Auto-Renumbering Engaged</span>
                  </div>

                  {activeProject.references.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      {activeProject.references.map((ref) => (
                        <div key={ref.id} className="p-4 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-mono font-black text-neutral-400 bg-neutral-100 p-1 rounded shrink-0 min-w-[24px] text-center">[{ref.number}]</span>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-neutral-900">{ref.title}</p>
                              <p className="text-[10px] text-neutral-500 font-mono">{ref.authors} ({ref.year}) • {ref.journal}</p>
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {ref.doi && <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded text-[8px] font-mono">DOI: {ref.doi}</span>}
                                {ref.isbn && <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-600 rounded text-[8px] font-mono">ISBN: {ref.isbn}</span>}
                                {ref.url && <a href={ref.url} target="_blank" rel="noreferrer" className="px-1.5 py-0.2 bg-neutral-100 text-neutral-600 hover:text-black rounded text-[8px] font-mono hover:underline">Link ↗</a>}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReference(ref.id)}
                            className="p-1.5 text-neutral-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            title="Remove citation reference"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-neutral-400 italic text-xs">
                      No citation models indexed for this project. Fill the form above to register your first source.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW: FIGURES & TABLES */}
            {editorSubTab === "figures_tables" && (
              <div className="space-y-6 animate-fadeIn" id="figures-tables-tab">
                
                {/* Figures Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Figure Adding tool */}
                  <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-4">
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Add Figures Asset</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-neutral-500 mb-1">Figure Caption *</label>
                        <input
                          type="text"
                          value={figCaption}
                          onChange={(e) => setFigCaption(e.target.value)}
                          placeholder="e.g. Hemoglobin mass changes from baseline to Day 21"
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-neutral-500 mb-1">Illustration Image URL (Optional)</label>
                        <input
                          type="text"
                          value={figUrl}
                          onChange={(e) => setFigUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <button
                        onClick={handleAddFigure}
                        disabled={!figCaption.trim()}
                        className="w-full py-2 bg-black text-white hover:opacity-95 disabled:opacity-40 font-mono text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Register Figure
                      </button>
                    </div>
                  </div>

                  {/* Table Adding tool */}
                  <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-4">
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Compile Grid Table</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-neutral-500 mb-1">Table Caption *</label>
                        <input
                          type="text"
                          value={tabCaption}
                          onChange={(e) => setTabCaption(e.target.value)}
                          placeholder="e.g. Physiological Metrics Baseline vs Post-Intervention"
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-neutral-500 mb-1">Comma-Separated Columns</label>
                        <input
                          type="text"
                          value={tabCols}
                          onChange={(e) => setTabCols(e.target.value)}
                          placeholder="Col A, Col B, Col C"
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-mono uppercase text-neutral-500 mb-1">Comma-Separated Rows (Newline per row)</label>
                        <textarea
                          rows={2}
                          value={tabRows}
                          onChange={(e) => setTabRows(e.target.value)}
                          placeholder="Row 1 Cell A, Row 1 Cell B&#10;Row 2 Cell A, Row 2 Cell B"
                          className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none font-mono"
                        />
                      </div>
                      <button
                        onClick={handleAddTable}
                        disabled={!tabCaption.trim()}
                        className="w-full py-2 bg-black text-white hover:opacity-95 disabled:opacity-40 font-mono text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                      >
                        Register Table
                      </button>
                    </div>
                  </div>
                </div>

                {/* Registered figures and tables list */}
                <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                  <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono font-bold uppercase text-neutral-500">
                    Compiled Pre-Print Assets
                  </div>
                  <div className="p-4 space-y-6">
                    {activeProject.figures.length === 0 && activeProject.tables.length === 0 && (
                      <p className="text-xs text-neutral-400 italic text-center py-6">No custom figures or tables generated.</p>
                    )}

                    {/* Render Figures */}
                    {activeProject.figures.map(fig => (
                      <div key={fig.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 flex gap-4 items-center">
                        <img src={fig.imageUrl} alt={fig.caption} className="w-16 h-16 object-cover rounded-lg bg-neutral-200" />
                        <div>
                          <p className="text-xs font-bold text-neutral-900">Figure {fig.number}: {fig.caption}</p>
                          <span className="text-[9px] font-mono text-neutral-400">Reference code: (Figure {fig.number})</span>
                        </div>
                      </div>
                    ))}

                    {/* Render Tables */}
                    {activeProject.tables.map(tab => (
                      <div key={tab.id} className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 space-y-2">
                        <p className="text-xs font-bold text-neutral-900">Table {tab.number}: {tab.caption}</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full text-[10px] bg-white border border-neutral-200 rounded-lg">
                            <thead>
                              <tr className="bg-neutral-50 border-b border-neutral-200">
                                {tab.content[0]?.map((col, idx) => (
                                  <th key={idx} className="p-1 text-left font-mono font-bold text-neutral-600">{col}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tab.content.slice(1).map((row, rowIdx) => (
                                <tr key={rowIdx} className="border-b border-neutral-100 last:border-0">
                                  {row.map((cell, cellIdx) => (
                                    <td key={cellIdx} className="p-1 text-neutral-700">{cell}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <span className="text-[9px] font-mono text-neutral-400 block">Reference code: (Table {tab.number})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: COLLABORATIVE SHARING */}
            {editorSubTab === "sharing" && (
              <div className="space-y-6 animate-fadeIn" id="collaborators-tab">
                <div className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Invite Co-Authors & Editorial Reviewers</h3>
                    <p className="text-xs text-neutral-500">Provide an active researcher’s username to establish direct manuscript delegation.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                      <input
                        type="text"
                        value={inviteUsername}
                        onChange={(e) => setInviteUsername(e.target.value)}
                        placeholder="Type researcher's unique username (e.g. evelyn-thorne)"
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      />
                    </div>

                    <div className="sm:w-40">
                      <select
                        value={invitePermission}
                        onChange={(e) => setInvitePermission(e.target.value as any)}
                        className="w-full p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                      >
                        <option value="Edit">Can Edit (Full)</option>
                        <option value="Comment">Can Comment Only</option>
                        <option value="View Only">View Only</option>
                      </select>
                    </div>

                    <button
                      onClick={handleInviteCollaborator}
                      disabled={!inviteUsername.trim()}
                      className="px-5 py-2 bg-black text-white hover:opacity-90 disabled:opacity-45 font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Establish Share Link
                    </button>
                  </div>
                </div>

                <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                  <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono font-bold uppercase text-neutral-500">
                    Active Share Delegations
                  </div>

                  {activeProject.collaborators.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      {activeProject.collaborators.map((col, idx) => (
                        <div key={idx} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                              <User className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-800">@{col.username}</p>
                              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.2 rounded font-semibold uppercase">{col.permission}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRevokeCollaborator(col.username)}
                            className="text-[10px] font-mono font-bold uppercase text-neutral-400 hover:text-rose-600 cursor-pointer"
                          >
                            Revoke Access
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-neutral-400 italic text-xs">
                      No active shared collaborations registered. Invite your peer researchers to begin editing.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SUB-VIEW: REVISION HIGHLIGHTS & DEBATES */}
            {editorSubTab === "review" && (
              <div className="space-y-6 animate-fadeIn" id="review-color-tab">
                
                {/* Active Highlight Marker colors ledger */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl">
                  <h3 className="text-xs font-mono font-black uppercase text-neutral-400 mb-3">Academic Review Color Ledger</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono font-bold">
                    <div className="p-2 bg-red-100 border border-red-200 rounded-xl text-red-800 text-center">Revision Required</div>
                    <div className="p-2 bg-amber-100 border border-amber-200 rounded-xl text-amber-800 text-center">Suggested Impr.</div>
                    <div className="p-2 bg-emerald-100 border border-emerald-200 rounded-xl text-emerald-800 text-center">Approved Sec.</div>
                    <div className="p-2 bg-blue-100 border border-blue-200 rounded-xl text-blue-800 text-center">Important Note</div>
                    <div className="p-2 bg-purple-100 border border-purple-200 rounded-xl text-purple-800 text-center">Citation Needed</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Highlights listing */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono">Academic Highlight Items</h4>
                    {activeProject.highlights.length > 0 ? (
                      <div className="space-y-2">
                        {activeProject.highlights.map(high => {
                          const bgClass = high.type === "revision_required" ? "bg-red-50 border-red-200 text-red-900" :
                                          high.type === "suggested_improvement" ? "bg-amber-50 border-amber-200 text-amber-900" :
                                          high.type === "approved_section" ? "bg-emerald-50 border-emerald-200 text-emerald-900" :
                                          high.type === "important_note" ? "bg-blue-50 border-blue-200 text-blue-900" :
                                          "bg-purple-50 border-purple-200 text-purple-900";
                          
                          return (
                            <div key={high.id} className={`p-3 border rounded-xl space-y-1 text-xs relative ${bgClass}`}>
                              <button
                                onClick={() => handleDeleteHighlight(high.id)}
                                className="absolute top-2 right-2 text-neutral-400 hover:text-black text-[10px]"
                              >
                                ✕
                              </button>
                              <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] font-mono">
                                <span>{high.type.replace("_", " ")}</span>
                                <span className="text-neutral-400">• By {high.author}</span>
                              </div>
                              <p className="italic pl-1 border-l border-neutral-300 font-semibold font-sans">"{high.text}"</p>
                              {high.comment && <p className="text-[10px] opacity-80 pt-1">Note: {high.comment}</p>}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No marked revision ranges in this draft.</p>
                    )}
                  </div>

                  {/* Threaded Discussions listing */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-neutral-800 uppercase font-mono">Threaded Peer Disputes</h4>
                    {activeProject.comments.length > 0 ? (
                      <div className="space-y-4">
                        {activeProject.comments.map(comm => (
                          <div key={comm.id} className="p-4 border border-neutral-200 bg-white rounded-2xl space-y-3">
                            <div className="flex items-center justify-between text-xs border-b border-neutral-100 pb-1.5">
                              <div>
                                <span className="font-bold text-neutral-800">{comm.author}</span>
                                <span className="text-neutral-400 font-mono text-[9px] ml-1.5">({comm.timestamp})</span>
                              </div>
                              <button
                                onClick={() => handleResolveComment(comm.id)}
                                className={`px-2 py-0.5 font-mono text-[8px] font-bold rounded uppercase cursor-pointer ${
                                  comm.resolved ? "bg-emerald-100 text-emerald-800" : "bg-neutral-100 text-neutral-700"
                                }`}
                              >
                                {comm.resolved ? "Resolved ✓" : "Active Discussion"}
                              </button>
                            </div>

                            <p className="text-xs text-neutral-600">{comm.content}</p>

                            {/* Replies */}
                            <div className="pl-4 space-y-2 border-l-2 border-neutral-100">
                              {comm.replies?.map(rep => (
                                <div key={rep.id} className="bg-neutral-50 p-2 rounded-xl text-[10px]">
                                  <div className="font-bold text-neutral-700">{rep.author} <span className="text-[8px] text-neutral-400 font-normal">({rep.timestamp})</span></div>
                                  <p className="text-neutral-600">{rep.content}</p>
                                </div>
                              ))}

                              {/* Reply Form */}
                              <div className="flex gap-1.5 pt-1">
                                <input
                                  type="text"
                                  placeholder="Reply to thread..."
                                  value={replyTexts[comm.id] || ""}
                                  onChange={(e) => setReplyTexts({ ...replyTexts, [comm.id]: e.target.value })}
                                  className="flex-grow p-1.5 bg-neutral-50 border border-neutral-200 rounded-lg text-[10px] focus:outline-none"
                                />
                                <button
                                  onClick={() => handleAddReply(comm.id)}
                                  className="px-2 py-1 bg-black text-white rounded-lg text-[10px] cursor-pointer"
                                >
                                  Reply
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-neutral-400 italic">No co-author disputes initiated yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-VIEW: VERSION CONTROL */}
            {editorSubTab === "versions" && (
              <div className="space-y-6 animate-fadeIn" id="version-control-tab">
                
                {/* Save Checkpoint Form */}
                <form onSubmit={handleSaveVersion} className="p-5 border border-neutral-200 rounded-2xl bg-neutral-50 space-y-4">
                  <h3 className="text-xs font-mono font-black uppercase text-neutral-400">Save Manuscript Checkpoint</h3>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="text"
                      placeholder="e.g. Added Results data for reticulocyte ANOVA changes"
                      value={checkpointName}
                      onChange={(e) => setCheckpointName(e.target.value)}
                      className="flex-grow p-2 bg-white border border-neutral-200 rounded-xl text-xs focus:outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!checkpointName.trim()}
                      className="px-5 py-2 bg-black text-white hover:opacity-90 disabled:opacity-45 font-mono text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      Commit Checkpoint
                    </button>
                  </div>
                </form>

                {/* History Ledger list */}
                <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden">
                  <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono font-bold uppercase text-neutral-500">
                    Version Ledger History ({activeProject.versionHistory.length} checkpoints)
                  </div>

                  {activeProject.versionHistory.length > 0 ? (
                    <div className="divide-y divide-neutral-100">
                      {activeProject.versionHistory.map(ver => (
                        <div key={ver.id} className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-neutral-100 text-neutral-600 rounded-xl">
                              <History className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-neutral-800">{ver.versionName}</p>
                              <span className="text-[9px] font-mono text-neutral-400">Committed: {ver.timestamp} • By {ver.author}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCompareVersionId(ver.id)}
                              className="px-2.5 py-1 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 rounded text-[10px] font-mono font-bold uppercase cursor-pointer"
                            >
                              Compare Difference
                            </button>
                            <button
                              onClick={() => handleRestoreVersion(ver)}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-mono font-bold uppercase cursor-pointer"
                            >
                              Restore Here
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-neutral-400 italic text-xs">
                      No version milestones committed. Use the utility above to save reference points during draft shifts.
                    </div>
                  )}
                </div>

                {/* Comparison Dashboard */}
                {compareVersionId && (() => {
                  const compVersion = activeProject.versionHistory.find(v => v.id === compareVersionId);
                  if (!compVersion) return null;
                  return (
                    <div className="p-5 border border-amber-200 bg-amber-50/50 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold text-amber-800 uppercase">Snapshot Differences vs Current Active Draft</h3>
                        <button onClick={() => setCompareVersionId(null)} className="text-xs font-mono font-bold uppercase text-neutral-500 hover:text-black">Close Comparison</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-mono font-black text-neutral-400 uppercase">Snapshot content ({compVersion.versionName})</h4>
                          <pre className="p-3 bg-white border border-neutral-200 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {JSON.stringify(compVersion.sectionsSnapshot, null, 2)}
                          </pre>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-[10px] font-mono font-black text-neutral-400 uppercase">Active Live Document State</h4>
                          <pre className="p-3 bg-white border border-neutral-200 rounded-xl text-[11px] font-mono whitespace-pre-wrap max-h-60 overflow-y-auto">
                            {JSON.stringify(activeProject.sections, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* SUB-VIEW: LIVE PREPRINT PREVIEW */}
            {editorSubTab === "preview" && (
              <div className="space-y-6 animate-fadeIn" id="document-preview-tab">
                
                {/* Interactive Formatting Controls Panel */}
                <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">Document Export Settings</span>
                    <div className="flex items-center gap-4">
                      <label className="text-xs font-semibold text-neutral-700 flex items-center gap-1">
                        Style: <strong className="text-black">{styles.find(s => s.id === selectedStyleId)?.name}</strong>
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Font: <strong className="text-black font-mono">Times New Roman (Academic)</strong>
                      </label>
                      <label className="text-xs font-semibold text-neutral-700">
                        Spacing: <strong className="text-black">1.5 Lines</strong>
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleExportManuscript("PDF")}
                      className="px-3.5 py-1.5 bg-neutral-900 hover:bg-black text-white text-[10px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Export PDF Preprint
                    </button>
                    <button
                      onClick={() => handleExportManuscript("DOCX")}
                      className="px-3.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[10px] font-mono font-bold uppercase rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <FileDown className="w-3.5 h-3.5" /> Export Word .docx
                    </button>
                  </div>
                </div>

                {/* Simulated Scholarly Pre-print paper canvas */}
                <div className="p-8 sm:p-12 border border-neutral-200/80 bg-white rounded-3xl shadow-lg font-serif space-y-6 text-neutral-800 text-sm leading-relaxed max-w-4xl mx-auto min-h-[842px]">
                  
                  {/* Journal Preprint Watermark Header */}
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3 font-sans text-[10px] text-neutral-400 tracking-widest font-bold uppercase">
                    <span>Healthedia Preprint Archive</span>
                    <span>For peer review submission only</span>
                  </div>

                  {/* Title */}
                  <div className="text-center space-y-3 pt-4">
                    <h1 className="text-2xl font-bold font-sans tracking-tight text-neutral-900 leading-tight">
                      {activeProject.sections.title || activeProject.title}
                    </h1>
                    
                    <p className="text-xs text-neutral-600 font-sans italic font-bold">
                      {activeProject.sections.authors || "Mabrouk A., Thorne E."}
                    </p>

                    <p className="text-[11px] text-neutral-400 font-sans">
                      {activeProject.sections.affiliations || "Department of Physiological Studies, Sorbonne Medical Center"}
                    </p>
                  </div>

                  {/* Abstract card layout */}
                  <div className="bg-neutral-50 p-5 rounded-2xl border border-neutral-200/50 font-sans space-y-2 mx-auto max-w-2xl my-6">
                    <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-widest block text-center">Abstract Block</span>
                    <p className="text-xs text-neutral-700 leading-normal text-justify">
                      {activeProject.sections.abstract || "Abstract unwritten."}
                    </p>
                    {activeProject.sections.keywords && (
                      <p className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-100">
                        <strong>Keywords:</strong> {activeProject.sections.keywords}
                      </p>
                    )}
                  </div>

                  {/* Table of Contents auto-compiler */}
                  <div className="p-4 border border-neutral-200 rounded-xl bg-neutral-50/50 font-sans space-y-2">
                    <h4 className="text-[10px] font-mono font-black uppercase text-neutral-400 tracking-widest">Document Table of Contents</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs">
                      {Object.keys(activeProject.sections).map((key, index) => {
                        if (["title", "authors", "affiliations", "abstract", "keywords"].includes(key)) return null;
                        const isFilled = (activeProject.sections[key] || "").trim().length > 0;
                        if (!isFilled) return null;
                        return (
                          <div key={key} className="flex justify-between border-b border-dashed border-neutral-200">
                            <span className="text-neutral-700">{SECTION_LABELS[key] || key}</span>
                            <span className="font-mono text-neutral-400">Page {index + 1}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Sections Rendering */}
                  <div className="space-y-6 pt-4 text-justify">
                    {Object.entries(activeProject.sections).map(([key, value]) => {
                      if (["title", "authors", "affiliations", "abstract", "keywords"].includes(key)) return null;
                      const valStr = value as string;
                      if (!valStr || !valStr.trim()) return null;
                      return (
                        <div key={key} className="space-y-2">
                          <h3 className="text-sm font-bold text-neutral-900 font-sans border-b border-neutral-100 pb-1 uppercase tracking-wider">
                            {SECTION_LABELS[key] || key}
                          </h3>
                          <p className="text-xs leading-relaxed text-neutral-700 leading-6">{valStr}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Render figures in line in preview */}
                  {activeProject.figures.map(fig => (
                    <div key={fig.id} className="my-6 space-y-2 text-center font-sans">
                      <div className="p-1 border border-neutral-200 rounded-xl max-w-sm mx-auto">
                        <img src={fig.imageUrl} alt={fig.caption} className="w-full h-auto rounded-lg" />
                      </div>
                      <p className="text-[11px] text-neutral-500 italic max-w-md mx-auto">Figure {fig.number}: {fig.caption}</p>
                    </div>
                  ))}

                  {/* Render tables in line in preview */}
                  {activeProject.tables.map(tab => (
                    <div key={tab.id} className="my-6 space-y-2 font-sans">
                      <p className="text-[11px] text-neutral-800 font-bold">Table {tab.number}: {tab.caption}</p>
                      <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                        <table className="min-w-full text-xs text-left bg-white">
                          <thead>
                            <tr className="bg-neutral-50 border-b border-neutral-200">
                              {tab.content[0]?.map((col, idx) => (
                                <th key={idx} className="p-2 text-neutral-600 font-bold font-mono">{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {tab.content.slice(1).map((row, rIdx) => (
                              <tr key={rIdx} className="border-b border-neutral-100 last:border-0">
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="p-2 text-neutral-700">{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}

                  {/* References bibliography footer block */}
                  {activeProject.references.length > 0 && (
                    <div className="pt-8 border-t border-neutral-200 space-y-4">
                      <h3 className="text-xs font-mono font-black uppercase text-neutral-400">References & Bibliography</h3>
                      <div className="space-y-2 text-xs text-neutral-600">
                        {activeProject.references.map(ref => {
                          const citation = formatBibliographyItem(selectedStyleId, ref);
                          return (
                            <p key={ref.id} className="text-[11px] text-justify leading-relaxed">
                              <strong>[{ref.number}]</strong> {citation}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Footer Page Numbers */}
                  <div className="flex items-center justify-between border-t border-neutral-100 pt-3 text-[9px] text-neutral-400 font-mono">
                    <span>Healthedia Preprint ID: {activeProject.id}</span>
                    <span>Page 1 of 1</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW: ADMINISTRATIVE POLICIES */}
      {activeTab === "admin" && currentUser.role === "Admin" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn" id="workspace-admin-screen">
          
          {/* Policy controls sidebar (Col-4) */}
          <div className="lg:col-span-4 space-y-6">
            <form onSubmit={handleSaveAdminSettings} className="p-5 border border-neutral-200 rounded-2xl bg-white space-y-4 shadow-sm">
              <h3 className="text-sm font-sans font-black uppercase text-neutral-800 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                <Database className="w-4 h-4 text-neutral-600" />
                Workspace Quota & Storage Policies
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">Max Disk Space (MB per profile)</label>
                  <input
                    type="number"
                    value={adminStorageLimit}
                    onChange={(e) => setAdminStorageLimit(Number(e.target.value))}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase font-bold text-neutral-500 mb-1">Backup Retention Frequency</label>
                  <select
                    value={adminBackupFreq}
                    onChange={(e) => setAdminBackupFreq(e.target.value as any)}
                    className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-xl text-xs focus:outline-none focus:border-black"
                  >
                    <option value="Daily">Daily Snapshot Sync</option>
                    <option value="Weekly">Weekly Logical Dump</option>
                    <option value="Manual">Manual Recovery Points</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 bg-neutral-50 border border-neutral-200/50 rounded-xl">
                  <span className="text-[10px] font-mono uppercase font-bold text-neutral-500">Ethical Approval Mandatory</span>
                  <input
                    type="checkbox"
                    checked={adminEthicalRequired}
                    onChange={(e) => setAdminEthicalRequired(e.target.checked)}
                    className="w-4 h-4 accent-black cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2 bg-black hover:opacity-90 text-white font-mono text-[10px] font-bold uppercase rounded-xl cursor-pointer"
                >
                  Save Configuration Policies
                </button>
              </div>
            </form>

            {/* Quick backup trigger */}
            <div className="p-5 border border-amber-200 bg-amber-50/40 rounded-2xl space-y-3 shadow-sm">
              <h3 className="text-xs font-mono font-bold text-amber-800 uppercase flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> System Recovery Sandbox
              </h3>
              <p className="text-[11px] text-amber-700">Manually trigger a cold-backup of all active and archived research drafts within local caches.</p>
              <button
                onClick={handleSimulateBackup}
                className="w-full py-2 bg-amber-900 text-white hover:bg-amber-950 font-mono text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
              >
                Force logical backup dump
              </button>
            </div>
          </div>

          {/* Audit Logs Arena (Col-8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* System settings and telemetry info banner */}
            <div className="p-4 bg-neutral-900 text-white rounded-3xl flex items-center justify-between">
              <div>
                <span className="text-[8px] font-mono text-emerald-400 uppercase font-black block">WORKSPACE HEALTH STATUS</span>
                <p className="text-xs font-bold font-mono">ALL DISK SYSTEMS STABLE • READ/WRITE LATENCY: 2.1ms</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 font-mono text-[8px] rounded uppercase font-bold">Secure Vault</span>
            </div>

            {/* Activity Logs List */}
            <div className="border border-neutral-200 rounded-2xl bg-white overflow-hidden shadow-sm">
              <div className="p-3.5 bg-neutral-50 border-b border-neutral-200 flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold uppercase text-neutral-500">Security & Workspace Audit logs</span>
                <button
                  onClick={() => {
                    localStorage.removeItem(LOGS_KEY);
                    setActivityLogs([]);
                  }}
                  className="text-[9px] font-mono text-neutral-400 hover:text-rose-600 underline cursor-pointer"
                >
                  Purge ledger history
                </button>
              </div>

              {activityLogs.length > 0 ? (
                <div className="divide-y divide-neutral-100 font-mono max-h-[440px] overflow-y-auto">
                  {activityLogs.map(log => (
                    <div key={log.id} className="p-3.5 text-[10px] flex items-start justify-between gap-4 hover:bg-neutral-50">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-neutral-800">{log.action}</span>
                          <span className="px-1.5 py-0.2 bg-neutral-100 text-neutral-500 rounded uppercase text-[8px] font-semibold">{log.category}</span>
                        </div>
                        <p className="text-neutral-500">{log.details}</p>
                        <span className="text-[8px] text-neutral-300">Audited By: {log.userEmail}</span>
                      </div>
                      <span className="text-[8px] text-neutral-400 font-mono shrink-0">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-400 italic text-xs">
                  No activities in audit vault.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
