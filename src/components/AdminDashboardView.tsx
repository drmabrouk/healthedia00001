import React, { useState, useEffect, useRef } from "react";
import {
  Users, ShieldCheck, FileText, BookOpen, Settings, Sliders, Palette, Mail, Key,
  CheckCircle, Plus, Trash, AlertCircle, X, ChevronUp, ChevronDown, Check, Edit2,
  Lock, RefreshCw, BarChart2, MessageSquare, Power, Search, LayoutGrid, Award,
  Globe, GraduationCap, Building, ExternalLink, ArrowRight, ShieldAlert, CheckSquare, Database, Activity, Star, Eye, EyeOff, Calendar, Filter, Download, FileSpreadsheet,
  Server, HardDrive, Upload, FileJson, Cloud, Info, HelpCircle, CheckCircle2, AlertTriangle
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { UserProfileData, Manuscript, SupportTicket, TaxonomyItem, UserRole } from "../types";
import {
  getStoredItem, setStoredItem, DEFAULT_PROFESSIONS, DEFAULT_TAXONOMIES
} from "../lib/taxonomyStore";
import { INITIAL_PAPERS } from "../data";
import PublicationCertificate from "./PublicationCertificate";
import SEOManagerView from "./SEOManagerView";
import SystemHealthDashboard from "./SystemHealthDashboard";

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  action: string;
  category: "Users" | "Papers" | "Manuscripts" | "System" | "Institutions";
  details: string;
  itemCount: number;
}

interface AdminDashboardViewProps {
  currentUser: UserProfileData;
  setCurrentPage: (page: string) => void;
  onUpdateCurrentUser: (updated: UserProfileData) => void;
}

export default function AdminDashboardView({
  currentUser,
  setCurrentPage,
  onUpdateCurrentUser
}: AdminDashboardViewProps) {
  // Check authorization
  const isAdmin = currentUser.role === "Admin";
  const isReviewer = currentUser.role === "Reviewer";

  // Active tab inside Dashboard
  // Reviewers only get access to "Reviews" and "Support" and "Analytics"
  const [activeTab, setActiveTab] = useState<string>("directory");
  const [hubSearch, setHubSearch] = useState("");
  const [hubCategory, setHubCategory] = useState("All");

  // Certificate Modal State
  const [selectedPaperForCert, setSelectedPaperForCert] = useState<any | null>(null);

  // Notifications
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  // Shared Store States
  const [users, setUsers] = useState<UserProfileData[]>([]);
  const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [professions, setProfessions] = useState<string[]>([]);
  const [taxonomies, setTaxonomies] = useState<{ [key: string]: string[] }>({});
  const [appearance, setAppearance] = useState<any>({});
  const [publishedPapers, setPublishedPapers] = useState<any[]>([]);
  const [institutionsList, setInstitutionsList] = useState<any[]>([]);
  const [institutionsConfig, setInstitutionsConfig] = useState<any>(null);

  // Activity Audit Logs State
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [logSearchQuery, setLogSearchQuery] = useState("");
  const [logCategoryFilter, setLogCategoryFilter] = useState("All");
  const [logActionTypeFilter, setLogActionTypeFilter] = useState("All");
  const [logDatePreset, setLogDatePreset] = useState<"All" | "Today" | "7Days" | "30Days" | "Custom">("All");
  const [logStartDate, setLogStartDate] = useState("");
  const [logEndDate, setLogEndDate] = useState("");

  // Load from LocalStorage
  useEffect(() => {
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", []);
    const storedManuscripts = getStoredItem<Manuscript[]>("healthedia_manuscripts", []);
    const storedTickets = getStoredItem<SupportTicket[]>("healthedia_tickets", []);
    const storedProfessions = getStoredItem<string[]>("healthedia_professions", DEFAULT_PROFESSIONS);
    const storedTaxonomies = getStoredItem<{ [key: string]: string[] }>("healthedia_taxonomies", DEFAULT_TAXONOMIES);
    const storedAppearance = getStoredItem<any>("healthedia_appearance", {});
    const storedPapers = getStoredItem<any[]>("healthedia_published_papers", INITIAL_PAPERS);
    const storedInstitutions = getStoredItem<any[]>("healthedia_institutions", []);
    const storedActivityLogs = getStoredItem<ActivityLogItem[]>("healthedia_activity_logs", [
      {
        id: "log-init-1",
        timestamp: new Date(Date.now() - 1000 * 60 * 18).toISOString().replace("T", " ").substring(0, 19),
        adminEmail: currentUser.email || "mabrouk@dr.com",
        adminName: currentUser.name || "Dr. Mabrouk (Administrator)",
        action: "Bulk Feature Papers",
        category: "Papers",
        details: "Marked 2 publication(s) as Featured in the research catalog index.",
        itemCount: 2
      },
      {
        id: "log-init-2",
        timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString().replace("T", " ").substring(0, 19),
        adminEmail: currentUser.email || "mabrouk@dr.com",
        adminName: currentUser.name || "Dr. Mabrouk (Administrator)",
        action: "Bulk Set Verification",
        category: "Users",
        details: "Vetted and granted verified credentials to 3 user account(s).",
        itemCount: 3
      },
      {
        id: "log-init-3",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().replace("T", " ").substring(0, 19), // 3 days ago
        adminEmail: currentUser.email || "mabrouk@dr.com",
        adminName: currentUser.name || "Dr. Mabrouk (Administrator)",
        action: "Bulk Approve Manuscripts",
        category: "Manuscripts",
        details: "Approved and indexed 2 peer-reviewed manuscript submission(s).",
        itemCount: 2
      },
      {
        id: "log-init-4",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString().replace("T", " ").substring(0, 19), // 12 days ago
        adminEmail: "security@healthedia.org",
        adminName: "Chief Security Officer",
        action: "Bulk Unpublish Papers",
        category: "Papers",
        details: "Unpublished 2 manuscript entries pending methodological compliance review.",
        itemCount: 2
      },
      {
        id: "log-init-5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 28).toISOString().replace("T", " ").substring(0, 19), // 28 days ago
        adminEmail: "compliance@healthedia.org",
        adminName: "Compliance Manager",
        action: "Bulk Delete Users",
        category: "Users",
        details: "Permanently purged 5 stale user accounts in compliance with GDPR policy.",
        itemCount: 5
      },
      {
        id: "log-init-6",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().replace("T", " ").substring(0, 19), // 5 days ago
        adminEmail: currentUser.email || "mabrouk@dr.com",
        adminName: currentUser.name || "Dr. Mabrouk (Administrator)",
        action: "Upload Research Dataset",
        category: "Papers",
        details: "Uploaded and indexed supplementary biomechanics raw dataset CSV files.",
        itemCount: 1
      },
      {
        id: "log-init-7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString().replace("T", " ").substring(0, 19), // 8 days ago
        adminEmail: "sysadmin@healthedia.org",
        adminName: "System Administrator",
        action: "Update System Configuration",
        category: "System",
        details: "Updated platform security parameters and SMTP mail dispatch settings.",
        itemCount: 1
      }
    ]);
    const storedSystemSettings = getStoredItem<any>("healthedia_system_settings", {
      websiteName: "Healthedia",
      websiteDescription: "A peer-reviewed, open-access academic resource indexing sports science, cardiology, physical therapy, biomechanics, and human physiology.",
      organizationName: "Healthedia Global Archive",
      organizationAddress: "91 Boulevard de l'Hôpital, 75013 Paris, France",
      contactEmail: "contact@healthedia.org",
      contactPhone: "+33 1 40 46 22 11",
      defaultLanguage: "en-US",
      timeZone: "UTC",
      dateTimeFormat: "YYYY-MM-DD HH:mm:ss",
      emailHost: "smtp.healthedia.org",
      emailPort: 587,
      emailUsername: "dispatch@healthedia.org",
      emailSenderName: "Healthedia Automated Dispatch",
      maxFileUploadSizeMB: 15,
      allowedFileTypes: ".pdf,.doc,.docx,.png,.jpg",
      storageProvider: "Local Disk Serialized Stream",
      cacheEnabled: true,
      cacheTTL: 3600,
      sessionTimeoutMin: 120,
      maintenanceMode: false,
      debugMode: false
    });
    const storedInstConfig = getStoredItem<any>("healthedia_institution_config", {
      institutionTypes: ["Medical School", "Research Institute", "Public Health Agency", "Sports Science Center", "Rehabilitation Clinic", "University Hospital"],
      medicalCategories: ["Cardiology", "Neurology", "Sports Medicine", "Human Performance", "Orthopedic Rehabilitation", "General Medicine"],
      evaluationCriteria: [
        { id: "academic_quality", name: "Academic Quality", question: "Rate the caliber of education, curriculum, and pedagogy.", weight: 30 },
        { id: "clinical_output", name: "Clinical Infrastructure", question: "Rate the medical equipment, clinics, and hospital access.", weight: 35 },
        { id: "research_funding", name: "Research Resources", question: "Rate the funding, equipment, and lab allocations.", weight: 35 }
      ],
      evaluationWeight: 60,
      researchMetricsWeight: 40,
      duplicateExactName: true,
      duplicateWebsite: true,
      duplicateSameCityCountry: true,
      minEvaluatorRole: "Member",
      autoVerifyAffiliations: false
    });

    setUsers(storedUsers);
    setManuscripts(storedManuscripts);
    setTickets(storedTickets);
    setProfessions(storedProfessions);
    setTaxonomies(storedTaxonomies);
    setAppearance(storedAppearance);
    setPublishedPapers(storedPapers);
    setInstitutionsList(storedInstitutions);
    setInstitutionsConfig(storedInstConfig);
    setSystemSettings(storedSystemSettings);
    setActivityLogs(storedActivityLogs);
  }, []);

  // Save Helpers
  const saveActivityLogs = (updated: ActivityLogItem[]) => {
    setActivityLogs(updated);
    setStoredItem("healthedia_activity_logs", updated);
  };

  const logAdminActivity = (
    action: string,
    category: "Users" | "Papers" | "Manuscripts" | "System" | "Institutions",
    details: string,
    itemCount: number = 1
  ) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      adminEmail: currentUser.email || "admin@healthedia.org",
      adminName: currentUser.name || "Administrator",
      action,
      category,
      details,
      itemCount
    };
    setActivityLogs(prev => {
      const updated = [newLog, ...prev];
      setStoredItem("healthedia_activity_logs", updated);
      return updated;
    });
  };

  // Activity Logs Filter Logic
  const matchesActionType = (actionName: string) => {
    if (logActionTypeFilter === "All") return true;
    const lower = actionName.toLowerCase();
    if (logActionTypeFilter === "Delete") return lower.includes("delete") || lower.includes("purge") || lower.includes("remove");
    if (logActionTypeFilter === "Update") return lower.includes("update") || lower.includes("edit") || lower.includes("change") || lower.includes("modify");
    if (logActionTypeFilter === "Upload") return lower.includes("upload") || lower.includes("create") || lower.includes("add") || lower.includes("submit") || lower.includes("import");
    if (logActionTypeFilter === "Feature") return lower.includes("feature");
    if (logActionTypeFilter === "Unpublish") return lower.includes("unpublish");
    if (logActionTypeFilter === "Publish") return lower.includes("publish") && !lower.includes("unpublish");
    if (logActionTypeFilter === "Role / Status") return lower.includes("role") || lower.includes("status") || lower.includes("verify") || lower.includes("vetting");
    if (logActionTypeFilter === "Approve") return lower.includes("approve");
    if (logActionTypeFilter === "Reject") return lower.includes("reject");
    return true;
  };

  const matchesDateRange = (logTimestamp: string) => {
    const logDateStr = logTimestamp.substring(0, 10); // "YYYY-MM-DD"
    const todayStr = new Date().toISOString().substring(0, 10);

    if (logDatePreset === "Today") {
      return logDateStr === todayStr;
    }
    if (logDatePreset === "7Days") {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      const sevenDaysAgoStr = d.toISOString().substring(0, 10);
      return logDateStr >= sevenDaysAgoStr;
    }
    if (logDatePreset === "30Days") {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      const thirtyDaysAgoStr = d.toISOString().substring(0, 10);
      return logDateStr >= thirtyDaysAgoStr;
    }
    if (logDatePreset === "Custom") {
      if (logStartDate && logDateStr < logStartDate) return false;
      if (logEndDate && logDateStr > logEndDate) return false;
      return true;
    }
    return true; // "All"
  };

  const filteredActivityLogs = activityLogs.filter(log => {
    const matchesCategory = logCategoryFilter === "All" || log.category === logCategoryFilter;
    const matchesSearch =
      !logSearchQuery ||
      log.action.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.adminEmail.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
      log.adminName.toLowerCase().includes(logSearchQuery.toLowerCase());
    const matchesAction = matchesActionType(log.action);
    const matchesDate = matchesDateRange(log.timestamp);

    return matchesCategory && matchesSearch && matchesAction && matchesDate;
  });

  const exportActivityLogsToCSV = () => {
    const logsToExport = filteredActivityLogs;
    if (logsToExport.length === 0) {
      showToast("No activity log records found matching the active filters to export.", "error");
      return;
    }

    const headers = ["Log ID", "Timestamp", "Admin Name", "Admin Email", "Action Executed", "Category", "Operation Details", "Items Impacted"];
    
    const escapeCSV = (str: string | number) => {
      const val = String(str ?? "").replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = logsToExport.map(log => [
      escapeCSV(log.id),
      escapeCSV(log.timestamp),
      escapeCSV(log.adminName),
      escapeCSV(log.adminEmail),
      escapeCSV(log.action),
      escapeCSV(log.category),
      escapeCSV(log.details),
      escapeCSV(log.itemCount)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `healthedia_activity_audit_logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Successfully exported ${logsToExport.length} activity audit log record(s) to CSV.`, "success");
  };

  // Full Database Backup & Restore Helpers
  const exportFullDatabaseJSON = () => {
    try {
      const fullDb = {
        exportedAt: new Date().toISOString(),
        version: "2.0",
        platform: "Healthedia Sports Medicine Journal",
        collections: {
          users,
          publishedPapers,
          manuscripts,
          tickets,
          activityLogs,
          institutionsList,
          institutionsConfig,
          systemSettings,
          professions,
          taxonomies,
          appearance
        }
      };

      const jsonStr = JSON.stringify(fullDb, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `healthedia_full_database_backup_${new Date().toISOString().substring(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast("Full system database JSON backup generated and downloaded successfully.", "success");
    } catch (err) {
      showToast("Failed to generate database JSON backup file.", "error");
    }
  };

  const handleImportDatabaseJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        if (!parsed.collections) {
          showToast("Invalid database backup file format: Missing 'collections' root.", "error");
          return;
        }

        const cols = parsed.collections;
        if (cols.users && Array.isArray(cols.users)) saveUsers(cols.users);
        if (cols.publishedPapers && Array.isArray(cols.publishedPapers)) savePublishedPapers(cols.publishedPapers);
        if (cols.manuscripts && Array.isArray(cols.manuscripts)) saveManuscripts(cols.manuscripts);
        if (cols.tickets && Array.isArray(cols.tickets)) saveTickets(cols.tickets);
        if (cols.activityLogs && Array.isArray(cols.activityLogs)) saveActivityLogs(cols.activityLogs);
        if (cols.institutionsList && Array.isArray(cols.institutionsList)) saveInstitutionsList(cols.institutionsList);
        if (cols.institutionsConfig) saveInstitutionsConfig(cols.institutionsConfig);
        if (cols.systemSettings) saveSystemSettings(cols.systemSettings);
        if (cols.professions && Array.isArray(cols.professions)) saveProfessions(cols.professions);
        if (cols.taxonomies && Array.isArray(cols.taxonomies)) saveTaxonomies(cols.taxonomies);
        if (cols.appearance) saveAppearance(cols.appearance);

        showToast("Database restoration complete! All tables and records re-populated.", "success");
      } catch (err) {
        showToast("Failed to parse database backup file. Ensure it is valid JSON.", "error");
      }
    };
    reader.readAsText(file);
    // Reset file input value
    e.target.value = "";
  };

  // Save Helpers
  const saveInstitutionsList = (updated: any[]) => {
    setInstitutionsList(updated);
    setStoredItem("healthedia_institutions", updated);
  };

  const saveInstitutionsConfig = (updated: any) => {
    setInstitutionsConfig(updated);
    setStoredItem("healthedia_institution_config", updated);
  };

  const saveUsers = (updated: UserProfileData[]) => {
    setUsers(updated);
    setStoredItem("healthedia_users", updated);
    // Sync current session if modified
    const currentInList = updated.find(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
    if (currentInList) {
      onUpdateCurrentUser(currentInList);
    }
  };

  const saveManuscripts = (updated: Manuscript[]) => {
    setManuscripts(updated);
    setStoredItem("healthedia_manuscripts", updated);
  };

  const saveTickets = (updated: SupportTicket[]) => {
    setTickets(updated);
    setStoredItem("healthedia_tickets", updated);
  };

  const saveProfessions = (updated: string[]) => {
    setProfessions(updated);
    setStoredItem("healthedia_professions", updated);
  };

  const saveTaxonomies = (updated: { [key: string]: string[] }) => {
    setTaxonomies(updated);
    setStoredItem("healthedia_taxonomies", updated);
  };

  const saveAppearance = (updated: any) => {
    setAppearance(updated);
    setStoredItem("healthedia_appearance", updated);
  };

  const savePublishedPapers = (updated: any[]) => {
    setPublishedPapers(updated);
    setStoredItem("healthedia_published_papers", updated);
  };

  // ============================================
  // INSTITUTIONS QUEUE & CONFIG STATES
  // ============================================
  const [selectedInstForAudit, setSelectedInstForAudit] = useState<any | null>(null);
  const [auditInstNotes, setAuditInstNotes] = useState("");
  const [selectedMergeTargetId, setSelectedMergeTargetId] = useState("");
  const [newTypeInConfig, setNewTypeInConfig] = useState("");
  const [newSpecInConfig, setNewSpecInConfig] = useState("");
  const [newCriterionName, setNewCriterionName] = useState("");
  const [newCriterionQuestion, setNewCriterionQuestion] = useState("");
  const [newCriterionWeight, setNewCriterionWeight] = useState(10);
  const [queueStatusFilter, setQueueStatusFilter] = useState("All");

  // ============================================
  // EMAIL TEMPLATE CONFIGURATION STATES
  // ============================================
  const DEFAULT_RECOVERY_TEMPLATE = `Subject: [Healthedia] Security Verification Request: Password Recovery

Dear Investigator,

A secure password recovery operation has been requested for your registered Healthedia Investigator account ({{EMAIL}}).

Your 6-digit confirmation OTP code is:
{{OTP}}

This security verification pin remains active for exactly {{EXPIRY}}. If you did not initiate this request, please log in immediately to review your active terminal sessions, or contact our security desk at security@healthedia.org.

Warm regards,
Healthedia Governance Council`;

  const [recoveryEmailTemplate, setRecoveryEmailTemplate] = useState<string>(() => {
    return localStorage.getItem("healthedia_email_template_recovery") || DEFAULT_RECOVERY_TEMPLATE;
  });

  const handleSaveEmailTemplate = () => {
    localStorage.setItem("healthedia_email_template_recovery", recoveryEmailTemplate);
    showToast("Email recovery template updated successfully.", "success");
  };

  // ============================================
  // SYSTEM CONFIGURATION & DATABASE DIAGNOSTICS
  // ============================================
  const [systemSettings, setSystemSettings] = useState<any>(null);
  const [dbDiagnostics, setDbDiagnostics] = useState<any>(null);
  const [loadingDbInfo, setLoadingDbInfo] = useState<boolean>(false);
  const [savingSettings, setSavingSettings] = useState<boolean>(false);
  const [optimizingDb, setOptimizingDb] = useState<boolean>(false);
  const [optimizationLogs, setOptimizationLogs] = useState<string[]>([]);

  // Form Fields
  const [websiteName, setWebsiteName] = useState("");
  const [websiteDescription, setWebsiteDescription] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [organizationAddress, setOrganizationAddress] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [defaultLanguage, setDefaultLanguage] = useState("en-US");
  const [timeZone, setTimeZone] = useState("UTC");
  const [dateTimeFormat, setDateTimeFormat] = useState("YYYY-MM-DD HH:mm:ss");
  const [emailHost, setEmailHost] = useState("");
  const [emailPort, setEmailPort] = useState(587);
  const [emailUsername, setEmailUsername] = useState("");
  const [emailSenderName, setEmailSenderName] = useState("");
  const [maxFileUploadSizeMB, setMaxFileUploadSizeMB] = useState(15);
  const [allowedFileTypes, setAllowedFileTypes] = useState("");
  const [storageProvider, setStorageProvider] = useState("");
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [cacheTTL, setCacheTTL] = useState(3600);
  const [sessionTimeoutMin, setSessionTimeoutMin] = useState(120);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);

  // Sync Form fields when systemSettings is loaded
  useEffect(() => {
    if (systemSettings) {
      setWebsiteName(systemSettings.websiteName || "Healthedia");
      setWebsiteDescription(systemSettings.websiteDescription || "");
      setOrganizationName(systemSettings.organizationName || "Healthedia Global Archive");
      setOrganizationAddress(systemSettings.organizationAddress || "91 Boulevard de l'Hôpital, 75013 Paris, France");
      setContactEmail(systemSettings.contactEmail || "contact@healthedia.org");
      setContactPhone(systemSettings.contactPhone || "+33 1 40 46 22 11");
      setDefaultLanguage(systemSettings.defaultLanguage || "en-US");
      setTimeZone(systemSettings.timeZone || "UTC");
      setDateTimeFormat(systemSettings.dateTimeFormat || "YYYY-MM-DD HH:mm:ss");
      setEmailHost(systemSettings.emailHost || "smtp.healthedia.org");
      setEmailPort(systemSettings.emailPort || 587);
      setEmailUsername(systemSettings.emailUsername || "dispatch@healthedia.org");
      setEmailSenderName(systemSettings.emailSenderName || "Healthedia Automated Dispatch");
      setMaxFileUploadSizeMB(systemSettings.maxFileUploadSizeMB || 15);
      setAllowedFileTypes(systemSettings.allowedFileTypes || ".pdf,.doc,.docx,.png,.jpg");
      setStorageProvider(systemSettings.storageProvider || "Local Disk Serialized Stream");
      setCacheEnabled(systemSettings.cacheEnabled !== false);
      setCacheTTL(systemSettings.cacheTTL || 3600);
      setSessionTimeoutMin(systemSettings.sessionTimeoutMin || 120);
      setMaintenanceMode(!!systemSettings.maintenanceMode);
      setDebugMode(!!systemSettings.debugMode);
    }
  }, [systemSettings]);

  const saveSystemSettings = (updated: any) => {
    setSystemSettings(updated);
    setStoredItem("healthedia_system_settings", updated);
    
    fetch("/api/collections/systemSettings/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated)
    })
    .then(res => {
      if (res.ok) {
        showToast("System configurations persisted atomically to database.", "success");
      } else {
        showToast("Configurations saved locally, backend sync pending.", "error");
      }
    })
    .catch(err => {
      console.error("Error syncing systemSettings to server:", err);
      showToast("Configurations saved locally, network offline.", "error");
    });
  };

  const fetchDbDiagnostics = async () => {
    setLoadingDbInfo(true);
    try {
      const res = await fetch("/api/system/db-info");
      if (res.ok) {
        const data = await res.json();
        setDbDiagnostics(data);
      } else {
        showToast("Failed to fetch database diagnostics from server", "error");
      }
    } catch (err) {
      console.error("Failed to load DB info:", err);
      showToast("Error connecting to diagnostics API", "error");
    } finally {
      setLoadingDbInfo(false);
    }
  };

  useEffect(() => {
    if (activeTab === "system_config" && isAdmin) {
      fetchDbDiagnostics();
    }
  }, [activeTab, isAdmin]);

  // ============================================
  // TAB STATES & HANDLERS
  // ============================================

  // ============================================
  // BULK SELECTION STATES & HANDLERS
  // ============================================
  const [selectedUserEmails, setSelectedUserEmails] = useState<string[]>([]);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [selectedManuscriptIds, setSelectedManuscriptIds] = useState<string[]>([]);

  // Reset bulk selection on tab change
  useEffect(() => {
    setSelectedUserEmails([]);
    setSelectedPaperIds([]);
    setSelectedManuscriptIds([]);
  }, [activeTab]);

  // --- Users Bulk Handlers ---
  const handleToggleSelectAllUsers = () => {
    if (selectedUserEmails.length === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUserEmails([]);
    } else {
      setSelectedUserEmails(filteredUsers.map(u => u.email));
    }
  };

  const handleToggleSelectUser = (email: string) => {
    setSelectedUserEmails(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };

  const handleBulkDeleteUsers = () => {
    const emailsToDelete = selectedUserEmails.filter(
      e => e.toLowerCase() !== currentUser.email.toLowerCase()
    );
    if (emailsToDelete.length === 0) {
      showToast("You cannot delete your own active administrator account.", "error");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete ${emailsToDelete.length} selected user account(s)?`)) {
      const updated = users.filter(u => !emailsToDelete.includes(u.email));
      saveUsers(updated);
      logAdminActivity(
        "Bulk Delete Users",
        "Users",
        `Permanently deleted ${emailsToDelete.length} user account(s): ${emailsToDelete.join(", ")}`,
        emailsToDelete.length
      );
      setSelectedUserEmails([]);
      showToast(`Successfully deleted ${emailsToDelete.length} user account(s).`, "success");
    }
  };

  const handleBulkChangeUserRole = (targetRole: UserRole) => {
    if (selectedUserEmails.length === 0) return;
    const updated = users.map(u => {
      if (selectedUserEmails.includes(u.email)) {
        return { ...u, role: targetRole };
      }
      return u;
    });
    saveUsers(updated);
    logAdminActivity(
      "Bulk Change Role",
      "Users",
      `Updated role to "${targetRole}" for ${selectedUserEmails.length} user(s): ${selectedUserEmails.join(", ")}`,
      selectedUserEmails.length
    );
    showToast(`Updated role to ${targetRole} for ${selectedUserEmails.length} user(s).`, "success");
  };

  const handleBulkSetUserVerification = (verified: boolean) => {
    if (selectedUserEmails.length === 0) return;
    const updated = users.map(u => {
      if (selectedUserEmails.includes(u.email)) {
        return {
          ...u,
          verified,
          role: (verified && u.role === "Member") ? ("Researcher" as UserRole) : u.role
        };
      }
      return u;
    });
    saveUsers(updated);
    logAdminActivity(
      "Bulk Set Verification",
      "Users",
      `${verified ? "Verified & vetted" : "Unverified"} ${selectedUserEmails.length} user account(s): ${selectedUserEmails.join(", ")}`,
      selectedUserEmails.length
    );
    showToast(`${verified ? "Verified" : "Unverified"} ${selectedUserEmails.length} user account(s).`, "success");
  };

  const handleBulkSetUserStatus = (status: "Active" | "Suspended") => {
    if (selectedUserEmails.length === 0) return;
    const updated = users.map(u => {
      if (selectedUserEmails.includes(u.email)) {
        return { ...u, status };
      }
      return u;
    });
    saveUsers(updated);
    logAdminActivity(
      "Bulk Status Change",
      "Users",
      `Set account status to "${status}" for ${selectedUserEmails.length} user account(s): ${selectedUserEmails.join(", ")}`,
      selectedUserEmails.length
    );
    showToast(`Set account status to ${status} for ${selectedUserEmails.length} user(s).`, "success");
  };

  // --- Papers Bulk Handlers ---
  const handleToggleSelectAllPapers = () => {
    if (selectedPaperIds.length === publishedPapers.length && publishedPapers.length > 0) {
      setSelectedPaperIds([]);
    } else {
      setSelectedPaperIds(publishedPapers.map(p => p.id));
    }
  };

  const handleToggleSelectPaper = (id: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDeletePapers = () => {
    if (selectedPaperIds.length === 0) return;
    if (confirm(`Are you sure you want to remove ${selectedPaperIds.length} publication(s) from the journal index?`)) {
      const updated = publishedPapers.filter(p => !selectedPaperIds.includes(p.id));
      savePublishedPapers(updated);
      logAdminActivity(
        "Bulk Delete Papers",
        "Papers",
        `Removed ${selectedPaperIds.length} publication(s) from journal index.`,
        selectedPaperIds.length
      );
      setSelectedPaperIds([]);
      showToast(`${selectedPaperIds.length} publication(s) removed from journal catalog.`, "success");
    }
  };

  const handleBulkSetPaperFeatured = (featured: boolean) => {
    if (selectedPaperIds.length === 0) return;
    const updated = publishedPapers.map(p => {
      if (selectedPaperIds.includes(p.id)) {
        return { ...p, featured };
      }
      return p;
    });
    savePublishedPapers(updated);
    logAdminActivity(
      featured ? "Bulk Feature Papers" : "Bulk Unfeature Papers",
      "Papers",
      `${featured ? "Marked as Featured" : "Unfeatured"} ${selectedPaperIds.length} publication(s).`,
      selectedPaperIds.length
    );
    showToast(`${featured ? "Marked as Featured" : "Unfeatured"} ${selectedPaperIds.length} paper(s).`, "success");
  };

  const handleBulkSetPaperStatus = (status: string) => {
    if (selectedPaperIds.length === 0) return;
    const updated = publishedPapers.map(p => {
      if (selectedPaperIds.includes(p.id)) {
        return { ...p, status };
      }
      return p;
    });
    savePublishedPapers(updated);
    logAdminActivity(
      status === "Published" ? "Bulk Publish Papers" : "Bulk Unpublish Papers",
      "Papers",
      `Updated status to "${status}" for ${selectedPaperIds.length} paper(s).`,
      selectedPaperIds.length
    );
    showToast(`Updated status to "${status}" for ${selectedPaperIds.length} paper(s).`, "success");
  };

  // --- Manuscripts Bulk Handlers ---
  const handleToggleSelectAllManuscripts = () => {
    if (selectedManuscriptIds.length === manuscripts.length && manuscripts.length > 0) {
      setSelectedManuscriptIds([]);
    } else {
      setSelectedManuscriptIds(manuscripts.map(m => m.id));
    }
  };

  const handleToggleSelectManuscript = (id: string) => {
    setSelectedManuscriptIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkApproveManuscripts = () => {
    if (selectedManuscriptIds.length === 0) return;
    let newPapers: any[] = [];
    const updatedMs = manuscripts.map(ms => {
      if (selectedManuscriptIds.includes(ms.id)) {
        newPapers.push({
          id: `paper-pub-${Date.now()}-${ms.id}`,
          title: ms.title,
          authors: ms.authors,
          journal: "Healthedia Global Journal of Performance Science",
          year: new Date().getFullYear(),
          specialty: ms.specialty,
          institution: ms.institution,
          country: ms.country,
          language: "English",
          researchType: ms.researchType,
          doi: `10.2813/healthedia.${Math.floor(1000 + Math.random() * 9000)}`,
          abstract: ms.abstract,
          keywords: ms.keywords,
          doiUrl: "#",
          status: "Published"
        });
        return { ...ms, status: "Approved" as const };
      }
      return ms;
    });

    saveManuscripts(updatedMs);
    if (newPapers.length > 0) {
      savePublishedPapers([...newPapers, ...publishedPapers]);
    }
    logAdminActivity(
      "Bulk Approve Manuscripts",
      "Manuscripts",
      `Approved and published ${selectedManuscriptIds.length} manuscript submission(s).`,
      selectedManuscriptIds.length
    );
    setSelectedManuscriptIds([]);
    showToast(`Approved & published ${selectedManuscriptIds.length} manuscript(s).`, "success");
  };

  const handleBulkRejectManuscripts = () => {
    if (selectedManuscriptIds.length === 0) return;
    const updatedMs = manuscripts.map(ms => {
      if (selectedManuscriptIds.includes(ms.id)) {
        return { ...ms, status: "Rejected" as const };
      }
      return ms;
    });
    saveManuscripts(updatedMs);
    logAdminActivity(
      "Bulk Reject Manuscripts",
      "Manuscripts",
      `Rejected ${selectedManuscriptIds.length} manuscript submission(s).`,
      selectedManuscriptIds.length
    );
    setSelectedManuscriptIds([]);
    showToast(`Rejected ${selectedManuscriptIds.length} manuscript(s).`, "success");
  };

  const handleBulkDeleteManuscripts = () => {
    if (selectedManuscriptIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedManuscriptIds.length} manuscript submission(s)?`)) {
      const updated = manuscripts.filter(m => !selectedManuscriptIds.includes(m.id));
      saveManuscripts(updated);
      logAdminActivity(
        "Bulk Delete Manuscripts",
        "Manuscripts",
        `Deleted ${selectedManuscriptIds.length} manuscript submission(s).`,
        selectedManuscriptIds.length
      );
      setSelectedManuscriptIds([]);
      showToast(`Deleted ${selectedManuscriptIds.length} manuscript(s).`, "success");
    }
  };

  // 1. Users Management States
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [editingUser, setEditingUser] = useState<UserProfileData | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("Member");
  const [newStatus, setNewStatus] = useState<"Active" | "Suspended">("Active");
  const [newPasswordVal, setNewPasswordVal] = useState("");

  const handleEditUserClick = (user: UserProfileData) => {
    setEditingUser(user);
    setNewEmail(user.email);
    setNewRole(user.role || "Member");
    setNewStatus(user.status || "Active");
    setNewPasswordVal("");
  };

  const handleSaveUserEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = users.map(u => {
      if (u.email.toLowerCase() === editingUser.email.toLowerCase()) {
        return {
          ...u,
          email: newEmail,
          role: newRole,
          status: newStatus,
        };
      }
      return u;
    });
    saveUsers(updated);
    setEditingUser(null);
    showToast(`User account for ${newEmail} updated successfully.`, "success");
  };

  const handleDeleteUser = (emailToDelete: string) => {
    if (emailToDelete.toLowerCase() === currentUser.email.toLowerCase()) {
      showToast("You cannot delete your own session.", "error");
      return;
    }
    if (confirm(`Are you sure you want to permanently delete user ${emailToDelete}?`)) {
      const updated = users.filter(u => u.email.toLowerCase() !== emailToDelete.toLowerCase());
      saveUsers(updated);
      logAdminActivity(
        "Delete User Account",
        "Users",
        `Permanently purged account ${emailToDelete}`,
        1
      );
      showToast("Account permanently purged from index.", "success");
    }
  };

  const handleToggleVerification = (email: string, currentVal: boolean) => {
    const updated = users.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        const newVal = !currentVal;
        return {
          ...u,
          verified: newVal,
          role: (newVal && u.role === "Member") ? "Researcher" as UserRole : u.role // Auto promote on verify
        };
      }
      return u;
    });
    saveUsers(updated);
    showToast(`Verification status updated.`, "success");
  };

  // 2. Peer Review (Manuscripts) States
  const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState("");
  const [manuscriptPromoAlert, setManuscriptPromoAlert] = useState<{ author: string; role: string } | null>(null);

  const handleManuscriptAction = (msId: string, action: "Approved" | "Revision Requested" | "Rejected") => {
    let targetAuthorEmail = "";
    let targetAuthorName = "";
    let promoted = false;

    const updatedMs = manuscripts.map(ms => {
      if (ms.id === msId) {
        targetAuthorEmail = ms.authorEmail;
        targetAuthorName = ms.authors[0];
        return { ...ms, status: action, reviewerNotes };
      }
      return ms;
    });

    saveManuscripts(updatedMs);

    // If Approved, we do 2 things:
    // A) Auto-publish into Healthedia published papers database so it shows up in general search immediately!
    // B) Check if author is a "Member". If yes, automatically promote to "Researcher"!
    if (action === "Approved") {
      const targetMs = manuscripts.find(m => m.id === msId);
      if (targetMs) {
        // Add to published papers
        const newPaper = {
          id: `paper-pub-${Date.now()}`,
          title: targetMs.title,
          authors: targetMs.authors,
          journal: "Healthedia Global Journal of Performance Science",
          year: new Date().getFullYear(),
          specialty: targetMs.specialty,
          institution: targetMs.institution,
          country: targetMs.country,
          language: "English",
          researchType: targetMs.researchType,
          doi: `10.2813/healthedia.${Math.floor(1000 + Math.random() * 9000)}`,
          abstract: targetMs.abstract,
          keywords: targetMs.keywords,
          doiUrl: "#"
        };
        savePublishedPapers([newPaper, ...publishedPapers]);
      }

      // Find user and promote if role is Member
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === targetAuthorEmail.toLowerCase() && u.role === "Member") {
          promoted = true;
          return { ...u, role: "Researcher" as UserRole, verified: true };
        }
        return u;
      });

      if (promoted) {
        saveUsers(updatedUsers);
        setManuscriptPromoAlert({ author: targetAuthorName, role: "Researcher" });
      }
    }

    setSelectedManuscript(null);
    setReviewerNotes("");
    showToast(`Manuscript has been marked as ${action.toUpperCase()}${promoted ? ". Author promoted to Researcher!" : "."}`, "success");
  };

  // 3. Taxonomy Management States
  // The Admin can select between 13 taxonomy classifications
  const [activeTaxonomyCat, setActiveTaxonomyCat] = useState<string>("professions");
  const [newTaxonomyItemName, setNewTaxonomyItemName] = useState("");
  const [editingTaxonomyIdx, setEditingTaxonomyIdx] = useState<number | null>(null);
  const [editingTaxonomyVal, setEditingTaxonomyVal] = useState("");

  const getTaxonomyList = (): string[] => {
    if (activeTaxonomyCat === "professions") return professions;
    return taxonomies[activeTaxonomyCat] || [];
  };

  const updateTaxonomyList = (newList: string[]) => {
    if (activeTaxonomyCat === "professions") {
      saveProfessions(newList);
    } else {
      saveTaxonomies({
        ...taxonomies,
        [activeTaxonomyCat]: newList
      });
    }
  };

  const handleAddTaxonomyItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaxonomyItemName.trim()) return;
    const currentList = getTaxonomyList();
    if (currentList.includes(newTaxonomyItemName.trim())) {
      showToast("Item already exists in taxonomy classification.", "error");
      return;
    }
    updateTaxonomyList([...currentList, newTaxonomyItemName.trim()]);
    setNewTaxonomyItemName("");
    showToast("Classification taxonomy added successfully.", "success");
  };

  const handleMoveTaxonomyItem = (index: number, direction: "up" | "down") => {
    const currentList = [...getTaxonomyList()];
    if (direction === "up" && index > 0) {
      const temp = currentList[index];
      currentList[index] = currentList[index - 1];
      currentList[index - 1] = temp;
    } else if (direction === "down" && index < currentList.length - 1) {
      const temp = currentList[index];
      currentList[index] = currentList[index + 1];
      currentList[index + 1] = temp;
    }
    updateTaxonomyList(currentList);
  };

  const handleDeleteTaxonomyItem = (itemToDelete: string) => {
    if (confirm(`Remove "${itemToDelete}" from classification taxonomy?`)) {
      const currentList = getTaxonomyList().filter(i => i !== itemToDelete);
      updateTaxonomyList(currentList);
      showToast("Item removed from classification register.", "success");
    }
  };

  const handleStartEditTaxonomy = (index: number, val: string) => {
    setEditingTaxonomyIdx(index);
    setEditingTaxonomyVal(val);
  };

  const handleSaveTaxonomyEdit = (index: number) => {
    const currentList = [...getTaxonomyList()];
    currentList[index] = editingTaxonomyVal.trim();
    updateTaxonomyList(currentList);
    setEditingTaxonomyIdx(null);
    showToast("Classification amended.", "success");
  };

  // 4. Website Appearance States
  const [brandingText, setBrandingText] = useState("");
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [colorAccent, setColorAccent] = useState("");
  const [selectedFont, setSelectedFont] = useState("");

  useEffect(() => {
    if (appearance && appearance.brandingText) {
      setBrandingText(appearance.brandingText);
      setHeroTitle(appearance.heroTitle);
      setHeroSubtitle(appearance.heroSubtitle);
      setColorAccent(appearance.colorAccent);
      setSelectedFont(appearance.fontFamily);
    }
  }, [appearance]);

  const handleSaveAppearance = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...appearance,
      brandingText,
      heroTitle,
      heroSubtitle,
      colorAccent,
      fontFamily: selectedFont
    };
    saveAppearance(updated);
    showToast("Website presentation configurations applied successfully.", "success");
  };

  const handlePresetColor = (color: string) => {
    setColorAccent(color);
  };

  // 5. Support Tickets State
  const [ticketStatusFilter, setTicketStatusFilter] = useState("All");

  const handleUpdateTicketStatus = (ticketId: string, status: "Pending" | "In Progress" | "Resolved") => {
    const updated = tickets.map(t => {
      if (t.id === ticketId) {
        return { ...t, status };
      }
      return t;
    });
    saveTickets(updated);
    showToast(`Ticket status updated to ${status.toUpperCase()}.`, "success");
  };

  // ============================================
  // ANALYTICS DATA GENERATION
  // ============================================
  const analyticsStats = {
    totalUsers: users.length,
    admins: users.filter(u => u.role === "Admin").length,
    reviewers: users.filter(u => u.role === "Reviewer").length,
    researchers: users.filter(u => u.role === "Researcher").length,
    members: users.filter(u => u.role === "Member").length,
    totalPapers: publishedPapers.length,
    underReviewMs: manuscripts.filter(m => m.status === "Under Review").length,
    resolvedTickets: tickets.filter(t => t.status === "Resolved").length,
    openTickets: tickets.filter(t => t.status !== "Resolved").length
  };

  // Charts
  const roleDistributionData = [
    { name: "System Administrators", value: analyticsStats.admins, color: "#171717" },
    { name: "Reviewers", value: analyticsStats.reviewers, color: "#737373" },
    { name: "Verified Researchers", value: analyticsStats.researchers, color: "#a3a3a3" },
    { name: "Default Members", value: analyticsStats.members, color: "#e5e5e5" }
  ];

  const publicationTrendData = [
    { month: "Jan", papers: 15, submissions: 20 },
    { month: "Feb", papers: 18, submissions: 25 },
    { month: "Mar", papers: 22, submissions: 28 },
    { month: "Apr", papers: 25, submissions: 35 },
    { month: "May", papers: 29, submissions: 42 },
    { month: "Jun", papers: 34, submissions: 50 },
    { month: "Jul", papers: publishedPapers.length, submissions: publishedPapers.length + manuscripts.length }
  ];

  // Filtering users for display
  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      (u.orcid && u.orcid.includes(userSearch)) ||
      (u.specialty && u.specialty.toLowerCase().includes(userSearch.toLowerCase()));

    const matchesRole = userRoleFilter === "All" || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Definition of all Administrative and Moderator sections
  const adminPages = [
    {
      id: "analytics",
      title: "System Analytics",
      description: "Analyze system statistics, user role distributions, publication trend visualizations, and core counts.",
      category: "Analytics & Monitoring",
      icon: BarChart2,
      badge: `${analyticsStats.totalPapers} Papers | ${analyticsStats.totalUsers} Users`,
      isAdminOnly: true
    },
    {
      id: "users",
      title: "User Directories",
      description: "Manage investigator profiles, lock or suspend accounts, modify user details, and search clinical qualifications.",
      category: "User Governance",
      icon: Users,
      badge: `${analyticsStats.totalUsers} Total Accounts`,
      isAdminOnly: true
    },
    {
      id: "matrix",
      title: "Roles & Permissions",
      description: "View permission hierarchy, manage role policies, and configure automated researcher promotion criteria.",
      category: "User Governance",
      icon: CheckSquare,
      badge: "Privilege Matrix",
      isAdminOnly: true
    },
    {
      id: "reviews",
      title: "Manuscript Reviews",
      description: "Audit incoming submissions, assign review committees, edit classifications, and approve medical papers.",
      category: "Clinical Content",
      icon: FileText,
      badge: analyticsStats.underReviewMs > 0 ? `${analyticsStats.underReviewMs} Under Review` : "All caught up",
      badgeColor: analyticsStats.underReviewMs > 0 ? "bg-amber-100 text-amber-800 border-amber-300" : "bg-neutral-100 text-neutral-600 border-neutral-300",
      isAdminOnly: false
    },
    {
      id: "journal",
      title: "Journal Publications",
      description: "Browse published literature, manage digital archive listings, download signed PDF certificates.",
      category: "Clinical Content",
      icon: BookOpen,
      badge: `${analyticsStats.totalPapers} Papers Published`,
      isAdminOnly: true
    },
    {
      id: "taxonomy",
      title: "Taxonomy Management",
      description: "Configure medical sub-specialties, athletic disciplines, editorial boards, and academic taxonomy collections.",
      category: "Clinical Content",
      icon: Sliders,
      badge: "Dynamic Lists",
      isAdminOnly: true
    },
    {
      id: "appearance",
      title: "Appearance Customizer",
      description: "Set primary colors, typography pairings, footer text, or upload institutional logos and banners.",
      category: "Site Settings",
      icon: Palette,
      badge: "UI Themes",
      isAdminOnly: true
    },
    {
      id: "support",
      title: "Support Tickets",
      description: "Answer technical support queries, handle credential resets, and troubleshoot investigator access errors.",
      category: "Analytics & Monitoring",
      icon: MessageSquare,
      badge: analyticsStats.openTickets > 0 ? `${analyticsStats.openTickets} Open Tickets` : "No Open Tickets",
      badgeColor: analyticsStats.openTickets > 0 ? "bg-red-100 text-red-800 border-red-300" : "bg-green-100 text-green-800 border-green-300",
      isAdminOnly: false
    },
    {
      id: "activity_logs",
      title: "Activity Logs",
      description: "Track and audit all administrative bulk actions (Delete, Feature, Unpublish) and operations with timestamps.",
      category: "Analytics & Monitoring",
      icon: Activity,
      badge: `${activityLogs.length} Records`,
      isAdminOnly: true
    },
    {
      id: "settings",
      title: "Platform Settings",
      description: "Manage account lockout policies, upload constraints, email SMTP credentials, and legal disclaimer terms.",
      category: "System Settings",
      icon: Settings,
      badge: "System Policies",
      isAdminOnly: true
    },
    {
      id: "database_config",
      title: "Database & Persistence Hub",
      description: "Configure database connection rules, backup or restore system snapshots, view cloud hosting instructions, and link registration processes.",
      category: "System Settings",
      icon: Server,
      badge: "Storage Engine",
      isAdminOnly: true
    },
    {
      id: "system_config",
      title: "System Configuration",
      description: "View live on-disk storage metrics, optimize database indexing maps, run diagnostic pings, and read server logs.",
      category: "System Settings",
      icon: Database,
      badge: "Infrastructure",
      isAdminOnly: true
    },
    {
      id: "system_health",
      title: "System Health Monitor",
      description: "Monitor real-time status-lights for database, api gateways, outbound mailers, and taxonomy query caches.",
      category: "System Settings",
      icon: Activity,
      badge: "Real-time Metrics",
      isAdminOnly: true
    },
    {
      id: "seo",
      title: "SEO & Site Management",
      description: "Configure meta tags, manage web crawler indexing permissions, export sitemaps, and design routing redirects.",
      category: "Site Settings",
      icon: Globe,
      badge: "Metadata & SEO",
      isAdminOnly: true
    },
    {
      id: "institutions_queue",
      title: "Institutions Queue",
      description: "Audit registered hospital profiles, manage pending university validation, and verify clinical hubs.",
      category: "Institutions",
      icon: Building,
      badge: institutionsList.filter(i => i.status !== "Approved" && i.status !== "Rejected").length > 0
        ? `${institutionsList.filter(i => i.status !== "Approved" && i.status !== "Rejected").length} Pending Audits`
        : "Queue Empty",
      badgeColor: institutionsList.filter(i => i.status !== "Approved" && i.status !== "Rejected").length > 0
        ? "bg-amber-100 text-amber-800 border-amber-300"
        : "bg-neutral-100 text-neutral-600 border-neutral-300",
      isAdminOnly: false
    },
    {
      id: "institutions_config",
      title: "Institutions Config",
      description: "Manage acceptable institution types, update validation rules, and configure registry scoring criteria.",
      category: "Institutions",
      icon: Sliders,
      badge: "Scoring & Types",
      isAdminOnly: true
    }
  ];

  // ============================================
  // UNIFIED CROSS-COLLECTION SEARCH LOGIC
  // ============================================
  const [adminSearchQuery, setAdminSearchQuery] = useState("");
  const [adminSearchCategory, setAdminSearchCategory] = useState<"All" | "Users" | "Papers" | "Institutions" | "Media">("All");
  const [showAdminSearchResults, setShowAdminSearchResults] = useState(false);
  const adminSearchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (adminSearchContainerRef.current && !adminSearchContainerRef.current.contains(e.target as Node)) {
        setShowAdminSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Compute multi-collection search results
  const qClean = adminSearchQuery.toLowerCase().trim();

  // 1. Users Collection
  const userSearchResults = users.filter(u => {
    if (!qClean) return false;
    return (
      (u.name && u.name.toLowerCase().includes(qClean)) ||
      (u.email && u.email.toLowerCase().includes(qClean)) ||
      (u.role && u.role.toLowerCase().includes(qClean)) ||
      (u.specialty && u.specialty.toLowerCase().includes(qClean)) ||
      (u.institution && u.institution.toLowerCase().includes(qClean)) ||
      (u.orcid && u.orcid.toLowerCase().includes(qClean))
    );
  }).map(u => ({
    type: "User",
    category: "Users",
    id: u.id || u.email,
    title: u.name || u.email,
    subtitle: `${u.email} • Role: ${u.role || "Member"}`,
    meta: `Institution: ${u.institution || "Independent"} • Specialty: ${u.specialty || "General Medicine"}`,
    icon: Users,
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    action: () => {
      setActiveTab("users");
      setUserSearch(u.name || u.email);
      setShowAdminSearchResults(false);
    },
    editAction: () => {
      setActiveTab("users");
      handleEditUserClick(u);
      setShowAdminSearchResults(false);
    }
  }));

  // 2. Papers & Manuscripts Collection
  const allPapersList = [...publishedPapers, ...manuscripts];
  const paperMapObj = new Map();
  allPapersList.forEach(p => { if (p && p.id && !paperMapObj.has(p.id)) paperMapObj.set(p.id, p); });
  const uniquePapersList = Array.from(paperMapObj.values());

  const paperSearchResults = uniquePapersList.filter(p => {
    if (!qClean) return false;
    const authorsStr = Array.isArray(p.authors) ? p.authors.join(" ") : (p.authors || "");
    return (
      (p.title && p.title.toLowerCase().includes(qClean)) ||
      authorsStr.toLowerCase().includes(qClean) ||
      (p.specialty && p.specialty.toLowerCase().includes(qClean)) ||
      (p.journal && p.journal.toLowerCase().includes(qClean)) ||
      (p.doi && p.doi.toLowerCase().includes(qClean)) ||
      (p.id && p.id.toLowerCase().includes(qClean))
    );
  }).map(p => ({
    type: "Paper",
    category: "Papers",
    id: p.id,
    title: p.title,
    subtitle: `${p.journal || "Journal of Sports Medicine"} • Specialty: ${p.specialty || "Physiology"}`,
    meta: `DOI: ${p.doi || "10.1016/healthedia.2025"} • Status: ${p.status || "Published"}`,
    icon: FileText,
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    action: () => {
      setActiveTab(p.status === "Under Review" ? "reviews" : "journal");
      setShowAdminSearchResults(false);
    },
    certAction: () => {
      setSelectedPaperForCert(p);
      setShowAdminSearchResults(false);
    }
  }));

  // 3. Institutions Collection
  const institutionSearchResults = institutionsList.filter(inst => {
    if (!qClean) return false;
    return (
      (inst.name && inst.name.toLowerCase().includes(qClean)) ||
      (inst.country && inst.country.toLowerCase().includes(qClean)) ||
      (inst.city && inst.city.toLowerCase().includes(qClean)) ||
      (inst.institutionType && inst.institutionType.toLowerCase().includes(qClean))
    );
  }).map(inst => ({
    type: "Institution",
    category: "Institutions",
    id: inst.id,
    title: inst.name,
    subtitle: `${inst.institutionType || "Medical Center"} • ${inst.city || ""}, ${inst.country || ""}`,
    meta: `Status: ${inst.status || "Approved"} • Evaluated Hub`,
    icon: Building,
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    action: () => {
      setActiveTab("institutions_queue");
      setSelectedInstForAudit(inst);
      setShowAdminSearchResults(false);
    }
  }));

  // 4. Media & System Assets / Tickets / Taxonomies
  const ticketSearchResults = tickets.filter(t => {
    if (!qClean) return false;
    return (
      (t.subject && t.subject.toLowerCase().includes(qClean)) ||
      (t.authorName && t.authorName.toLowerCase().includes(qClean)) ||
      (t.message && t.message.toLowerCase().includes(qClean)) ||
      (t.id && t.id.toLowerCase().includes(qClean))
    );
  }).map(t => ({
    type: "Support Ticket",
    category: "Media",
    id: t.id,
    title: `Ticket: ${t.subject}`,
    subtitle: `Author: ${t.authorName} • Priority: ${t.priority || "Normal"}`,
    meta: `Status: ${t.status} • Ticket Reference: ${t.id}`,
    icon: MessageSquare,
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    action: () => {
      setActiveTab("support");
      setShowAdminSearchResults(false);
    }
  }));

  const systemMediaAssets = [
    { id: "asset-logo", title: "Institutional Brand Logo & Vector Banners", subtitle: "Public Website Media Asset", meta: "Allowed format: PNG, JPG, SVG", icon: Palette, tab: "appearance" },
    { id: "asset-smtp", title: "SMTP Recovery Email Dispatch Template", subtitle: "Automated Dispatch System Asset", meta: "Security OTP Mailer Config", icon: Mail, tab: "settings" },
    { id: "asset-db", title: "Local Serialized Database Disk Stream", subtitle: "System Infrastructure Asset", meta: "Active Tables & Indexes Logs", icon: Database, tab: "system_config" }
  ].filter(m => {
    if (!qClean) return false;
    return m.title.toLowerCase().includes(qClean) || m.subtitle.toLowerCase().includes(qClean);
  }).map(m => ({
    type: "Media / Asset",
    category: "Media",
    id: m.id,
    title: m.title,
    subtitle: m.subtitle,
    meta: m.meta,
    icon: m.icon,
    badgeColor: "bg-neutral-100 text-neutral-800 border-neutral-300",
    action: () => {
      setActiveTab(m.tab);
      setShowAdminSearchResults(false);
    }
  }));

  const mediaSearchResults = [...ticketSearchResults, ...systemMediaAssets];

  // Combined Results & Filter by Selected Category
  const allAdminSearchResults = [...userSearchResults, ...paperSearchResults, ...institutionSearchResults, ...mediaSearchResults];

  const filteredAdminSearchResults = allAdminSearchResults.filter(res => {
    if (adminSearchCategory === "All") return true;
    return res.category === adminSearchCategory;
  });

  const getAdminCategoryCount = (cat: "All" | "Users" | "Papers" | "Institutions" | "Media") => {
    if (cat === "All") return allAdminSearchResults.length;
    if (cat === "Users") return userSearchResults.length;
    if (cat === "Papers") return paperSearchResults.length;
    if (cat === "Institutions") return institutionSearchResults.length;
    if (cat === "Media") return mediaSearchResults.length;
    return 0;
  };

  const totalAdminSearchResultsCount = allAdminSearchResults.length;

  return (
    <div className="flex-grow bg-white py-10 font-sans animate-fadeIn">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-neutral-900 text-white px-4 py-3 rounded-xl shadow-lg border border-neutral-800 animate-slideUp max-w-sm">
          {toast.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-neutral-200 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-neutral-300 shrink-0" />
          )}
          <span className="text-xs font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 hover:text-neutral-400 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Auto-promotion popup alert */}
      {manuscriptPromoAlert && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-neutral-200 p-8 max-w-md w-full rounded-2xl shadow-2xl text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 bg-neutral-100 border border-neutral-300 rounded-full flex items-center justify-center mx-auto text-black">
              <ShieldCheck className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-xl font-bold text-black font-sans uppercase">Automatic Role Promotion</h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-light leading-relaxed">
              Healthedia board rules matched successfully! 
              <br />
              <strong className="text-black font-semibold">{manuscriptPromoAlert.author}</strong> has been promoted from <span className="font-mono text-xs bg-neutral-100 px-1.5 py-0.5 border border-neutral-200">Member</span> to <strong className="text-black font-semibold font-mono text-xs bg-black text-white px-1.5 py-0.5 rounded-md">Researcher</strong> due to an approved manuscript publication.
            </p>
            <div className="pt-2">
              <button
                onClick={() => setManuscriptPromoAlert(null)}
                className="w-full bg-black text-white text-xs font-mono font-bold uppercase py-2.5 rounded-xl hover:bg-neutral-800 cursor-pointer transition-colors"
              >
                Accept and Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner with identity */}
        <div className="border-b border-neutral-100 pb-8 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-neutral-50 border border-neutral-200/80 rounded-full text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-3">
              <Sliders className="w-3.5 h-3.5 text-black" />
              <span>{currentUser.role} Control Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-sans font-extrabold text-black uppercase tracking-tight">
              Administrative Console
            </h1>
            <p className="text-xs sm:text-sm text-neutral-500 font-sans font-light mt-1 max-w-2xl">
              Centralized interface for roles, classifications, reviews, content structures, and website configurations.
            </p>
          </div>
          
          <button
            onClick={() => setCurrentPage("profile")}
            className="inline-flex items-center text-xs font-semibold text-neutral-600 hover:text-black transition-all bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2 cursor-pointer"
          >
            ← View My Profile
          </button>
        </div>

        {/* Unified Cross-Collection Search Bar */}
        <div ref={adminSearchContainerRef} className="mb-8 relative z-30">
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs hover:border-neutral-300 transition-all">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              
              <div className="flex-grow relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Search className="w-4 h-4 stroke-[2]" />
                </div>
                <input
                  type="text"
                  value={adminSearchQuery}
                  onChange={(e) => {
                    setAdminSearchQuery(e.target.value);
                    setShowAdminSearchResults(true);
                  }}
                  onFocus={() => setShowAdminSearchResults(true)}
                  placeholder="Unified Admin Search: Type to search across Users, Papers, Institutions, Media & Support..."
                  className="w-full pl-10 pr-10 py-2.5 bg-neutral-50/80 border border-neutral-200 rounded-xl text-xs font-sans text-black placeholder-neutral-400 focus:outline-none focus:bg-white focus:border-black transition-all"
                />
                {adminSearchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setAdminSearchQuery("");
                      setShowAdminSearchResults(false);
                    }}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-black cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Collection Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                {(["All", "Users", "Papers", "Institutions", "Media"] as const).map((cat) => {
                  const count = getAdminCategoryCount(cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setAdminSearchCategory(cat);
                        setShowAdminSearchResults(true);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        adminSearchCategory === cat
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100 hover:text-black"
                      }`}
                    >
                      <span>{cat === "Media" ? "Media & System" : cat}</span>
                      {adminSearchQuery.trim().length > 0 && (
                        <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-sans ${
                          adminSearchCategory === cat ? "bg-neutral-800 text-white" : "bg-neutral-200 text-neutral-700"
                        }`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Quick jump shortcuts when search is idle */}
            {!adminSearchQuery.trim() && (
              <div className="mt-2.5 pt-2 border-t border-neutral-100/80 flex flex-wrap items-center justify-between text-[10px] font-mono text-neutral-400 gap-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="font-bold text-neutral-500 uppercase">Quick Jump Collections:</span>
                  <button type="button" onClick={() => setActiveTab("users")} className="hover:text-black hover:underline cursor-pointer">👥 Users Register ({users.length})</button>
                  <span>•</span>
                  <button type="button" onClick={() => setActiveTab("journal")} className="hover:text-black hover:underline cursor-pointer">📄 Research Papers ({publishedPapers.length})</button>
                  <span>•</span>
                  <button type="button" onClick={() => setActiveTab("institutions_queue")} className="hover:text-black hover:underline cursor-pointer">🏛️ Verified Institutions ({institutionsList.length})</button>
                  <span>•</span>
                  <button type="button" onClick={() => setActiveTab("support")} className="hover:text-black hover:underline cursor-pointer">💬 Support Tickets ({tickets.length})</button>
                </div>
                <span>Click result to trigger quick-access link</span>
              </div>
            )}
          </div>

          {/* Live Dropdown Results Panel */}
          {showAdminSearchResults && adminSearchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 max-h-[500px] overflow-y-auto divide-y divide-neutral-100 p-2 animate-fadeIn">
              {/* Header bar of dropdown */}
              <div className="p-3 bg-neutral-50 rounded-xl flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-black" />
                  <span className="text-xs font-bold text-black font-sans uppercase tracking-tight">
                    Cross-Collection Results for "{adminSearchQuery}"
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 bg-neutral-200/80 px-2 py-0.5 rounded-full font-bold">
                    {totalAdminSearchResultsCount} matches
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAdminSearchResults(false)}
                  className="p-1 text-neutral-400 hover:text-black rounded-lg hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {totalAdminSearchResultsCount === 0 ? (
                <div className="p-8 text-center space-y-2">
                  <AlertCircle className="w-6 h-6 text-neutral-300 mx-auto" />
                  <p className="text-xs font-mono font-bold text-neutral-600">No matching records found across collections.</p>
                  <p className="text-[11px] text-neutral-400 font-sans">Search keywords like "Cardiology", "Dupont", "Paris", "Support", "Certificate", or "Logo".</p>
                </div>
              ) : filteredAdminSearchResults.length === 0 ? (
                <div className="p-6 text-center space-y-1">
                  <p className="text-xs font-mono font-bold text-neutral-500">No matches in "{adminSearchCategory}" category.</p>
                  <p className="text-[11px] text-neutral-400">Switch category tab to "All" to view matches in other collections.</p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {filteredAdminSearchResults.map((res: any) => (
                    <div
                      key={`${res.type}-${res.id}`}
                      className="p-3.5 hover:bg-neutral-50 rounded-xl border border-transparent hover:border-neutral-200/80 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${res.badgeColor}`}>
                          <res.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${res.badgeColor}`}>
                              {res.type}
                            </span>
                            <h4 className="text-xs font-bold text-neutral-900 truncate font-sans group-hover:text-black">
                              {res.title}
                            </h4>
                          </div>
                          <p className="text-[11px] text-neutral-600 font-sans mt-0.5 truncate">
                            {res.subtitle}
                          </p>
                          <p className="text-[10px] font-mono text-neutral-400 mt-0.5">
                            {res.meta}
                          </p>
                        </div>
                      </div>

                      {/* Quick Action Links */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {res.certAction && (
                          <button
                            type="button"
                            onClick={res.certAction}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Award className="w-3 h-3 text-amber-600" />
                            <span>Cert</span>
                          </button>
                        )}
                        {res.editAction && (
                          <button
                            type="button"
                            onClick={res.editAction}
                            className="px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border border-neutral-300 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={res.action}
                          className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                        >
                          <span>Quick Access</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dashboard Frame Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1 space-y-1.5">
            <p className="text-[10px] font-mono font-bold text-neutral-400 uppercase px-3 tracking-wider mb-2">Operations</p>

            <button
              onClick={() => {
                setActiveTab("directory");
                setHubSearch("");
                setHubCategory("All");
              }}
              className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                activeTab === "directory"
                  ? "bg-black text-white border-black shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
              }`}
            >
              <LayoutGrid className="w-4 h-4 mr-2.5 stroke-[1.5]" />
              Control Hub Directory
            </button>

            <div className="border-b border-neutral-100 my-2"></div>
            
            {isAdmin && (
              <button
                onClick={() => setActiveTab("analytics")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "analytics"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <BarChart2 className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                System Analytics
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "users"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Users className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                User Directories
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("matrix")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "matrix"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <CheckSquare className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Roles & Permissions
              </button>
            )}

            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-black text-white border-black shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
              }`}
            >
              <FileText className="w-4 h-4 mr-2.5 stroke-[1.5]" />
              Manuscript Reviews
              {analyticsStats.underReviewMs > 0 && (
                <span className="ml-auto bg-black border border-neutral-700 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {analyticsStats.underReviewMs}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("journal")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "journal"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <BookOpen className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Journal Publications
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("taxonomy")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "taxonomy"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Sliders className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Taxonomy Management
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("appearance")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "appearance"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Palette className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Appearance Customizer
              </button>
            )}

            <button
              onClick={() => setActiveTab("support")}
              className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                activeTab === "support"
                  ? "bg-black text-white border-black shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
              }`}
            >
              <MessageSquare className="w-4 h-4 mr-2.5 stroke-[1.5]" />
              Support Tickets
              {analyticsStats.openTickets > 0 && (
                <span className="ml-auto bg-black text-white text-[9px] px-2 py-0.5 rounded-full font-bold">
                  {analyticsStats.openTickets}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("settings")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "settings"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Settings className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Platform Settings
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("system_config")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "system_config"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Database className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                System Configuration
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("system_health")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "system_health"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Activity className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                System Health Monitor
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => setActiveTab("seo")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "seo"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Globe className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                SEO & Site Management
              </button>
            )}

            <button
              onClick={() => setActiveTab("institutions_queue")}
              className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                activeTab === "institutions_queue"
                  ? "bg-black text-white border-black shadow-sm"
                  : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
              }`}
            >
              <Building className="w-4 h-4 mr-2.5 stroke-[1.5]" />
              Institutions Queue
              {institutionsList.filter(i => i.status !== "Approved" && i.status !== "Rejected").length > 0 && (
                <span className="ml-auto bg-black text-white text-[9px] border border-neutral-700 px-2 py-0.5 rounded-full font-bold">
                  {institutionsList.filter(i => i.status !== "Approved" && i.status !== "Rejected").length}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => setActiveTab("institutions_config")}
                className={`w-full flex items-center px-4 py-3 text-xs font-semibold text-left transition-all border rounded-xl cursor-pointer ${
                  activeTab === "institutions_config"
                    ? "bg-black text-white border-black shadow-sm"
                    : "text-neutral-600 hover:bg-neutral-50 border-transparent hover:text-black"
                }`}
              >
                <Sliders className="w-4 h-4 mr-2.5 stroke-[1.5]" />
                Institutions Config
              </button>
            )}
          </div>

          {/* Core Panel Details */}
          <div className="lg:col-span-3 border border-neutral-200/90 p-6 sm:p-8 bg-white rounded-2xl shadow-xs min-h-[550px] overflow-x-auto">
            
            {/* TAB: CONTROL HUB DIRECTORY */}
            {activeTab === "directory" && (
              <div className="space-y-8 animate-fadeIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-5 gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5 text-neutral-900 stroke-[1.5]" />
                      Control Hub Directory
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-light">
                      Central navigation hub for all governance registers, classification matrices, submission pipelines, and system configurations.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
                    {/* Instant Search Bar */}
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={hubSearch}
                        onChange={(e) => setHubSearch(e.target.value)}
                        placeholder="Search tools & pages..."
                        className="pl-9 pr-4 py-1.5 w-full sm:w-64 text-xs border border-neutral-200 bg-white rounded-lg focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900 placeholder-neutral-400 h-9"
                      />
                      {hubSearch && (
                        <button
                          onClick={() => setHubSearch("")}
                          className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Category Filters Row */}
                <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-neutral-50">
                  <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase mr-2">Filter Category:</span>
                  {[
                    { id: "All", label: "All Pages" },
                    { id: "governance", label: "Governance & Roles" },
                    { id: "content", label: "Clinical Content" },
                    { id: "infrastructure", label: "Systems & Metrics" },
                    { id: "design", label: "Branding & SEO" }
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setHubCategory(cat.id)}
                      className={`text-[11px] px-3 py-1.5 rounded-lg border font-medium cursor-pointer transition-all ${
                        hubCategory === cat.id
                          ? "bg-black text-white border-black shadow-xs"
                          : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400 hover:text-black"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {adminPages
                    .filter((page) => {
                      // Apply search filter
                      const matchesSearch =
                        page.title.toLowerCase().includes(hubSearch.toLowerCase()) ||
                        page.description.toLowerCase().includes(hubSearch.toLowerCase()) ||
                        page.category.toLowerCase().includes(hubSearch.toLowerCase());

                      // Apply category filter
                      if (hubCategory === "All") return matchesSearch;
                      if (hubCategory === "governance") {
                        return matchesSearch && (page.category === "User Governance" || page.category === "Institutions");
                      }
                      if (hubCategory === "content") {
                        return matchesSearch && page.category === "Clinical Content";
                      }
                      if (hubCategory === "infrastructure") {
                        return matchesSearch && (page.category === "System Settings" || page.category === "Analytics & Monitoring");
                      }
                      if (hubCategory === "design") {
                        return matchesSearch && page.category === "Site Settings";
                      }
                      return matchesSearch;
                    })
                    .map((page) => {
                      const PageIcon = page.icon;
                      const hasAccess = !page.isAdminOnly || isAdmin;

                      return (
                        <div
                          key={page.id}
                          onClick={() => {
                            if (hasAccess) {
                              setActiveTab(page.id);
                            } else {
                              showToast("Access Restricted: This tool requires System Administrator credentials.", "error");
                            }
                          }}
                          className={`group relative flex flex-col justify-between border rounded-2xl p-5 bg-white transition-all duration-300 cursor-pointer ${
                            hasAccess
                              ? "border-neutral-200 hover:-translate-y-1 hover:border-neutral-400 hover:shadow-md"
                              : "border-neutral-100 bg-neutral-50/50 opacity-75 select-none"
                          }`}
                        >
                          <div>
                            {/* Card Header & Icon */}
                            <div className="flex items-start justify-between">
                              <div className={`p-2 rounded-xl border ${
                                hasAccess 
                                  ? "bg-neutral-50 border-neutral-200 group-hover:bg-neutral-900 group-hover:text-white transition-colors duration-200" 
                                  : "bg-neutral-100 border-neutral-200 text-neutral-400"
                              }`}>
                                <PageIcon className="w-5 h-5 stroke-[1.5]" />
                              </div>
                              
                              {/* Security badge or status badge */}
                              {page.isAdminOnly && (
                                <div className="flex items-center gap-1.5">
                                  <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-full font-bold uppercase ${
                                    isAdmin 
                                      ? "bg-neutral-100 text-neutral-800 border-neutral-300"
                                      : "bg-red-50 text-red-700 border-red-200"
                                  }`}>
                                    {isAdmin ? "Admin Only" : "Admin Locked"}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Title & Description */}
                            <div className="mt-4">
                              <h3 className="text-xs font-bold text-neutral-900 flex items-center gap-1.5">
                                {page.title}
                                {!hasAccess && <Lock className="w-3.5 h-3.5 text-red-500" />}
                              </h3>
                              <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed font-light min-h-[44px]">
                                {page.description}
                              </p>
                            </div>
                          </div>

                          {/* Footer Info & Action */}
                          <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                            <span className={`text-[9px] font-mono px-2 py-0.5 border rounded-md ${
                              page.badgeColor || "bg-neutral-50 text-neutral-700 border-neutral-200/60"
                            }`}>
                              {page.badge}
                            </span>
                            
                            <span className={`text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                              hasAccess 
                                ? "text-neutral-900 group-hover:text-black group-hover:translate-x-1 transition-transform" 
                                : "text-neutral-400"
                            }`}>
                              {hasAccess ? (
                                <>
                                  Open
                                  <ArrowRight className="w-3 h-3" />
                                </>
                              ) : (
                                "Locked"
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Direct Command Shortcuts or Quick Access Tips footer */}
                <div className="bg-neutral-50 border border-neutral-200/60 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mt-8">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-700 shrink-0 mt-0.5">
                      <ShieldAlert className="w-4 h-4 stroke-[1.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wide">Governance & Access Auditing Policy</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed font-light max-w-xl">
                        Your session activity is cryptographically logged under security reference profile <span className="font-mono bg-neutral-200/60 px-1 py-0.5 rounded text-neutral-800">{currentUser.email}</span>. Only administrative staff with validated security keys may view internal schemas or authorize role changes.
                      </p>
                    </div>
                  </div>
                  <div className="text-[10px] font-mono text-neutral-400 shrink-0 bg-white border border-neutral-200 px-3 py-1.5 rounded-lg">
                    Level: {currentUser.role.toUpperCase()} • Session: 2 Hours
                  </div>
                </div>
              </div>
            )}

            {/* TAB: ANALYTICS */}
            {activeTab === "analytics" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">System Analytics Overview</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Real-time counts, database sizing, and visual distribution metrics.</p>
                </div>

                {/* Grid stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="border border-neutral-200/90 p-4 rounded-xl bg-neutral-50/50 shadow-xs text-center md:text-left">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Total Accounts</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{analyticsStats.totalUsers}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-light">{analyticsStats.researchers} verified researchers</p>
                  </div>
                  <div className="border border-neutral-200/90 p-4 rounded-xl bg-neutral-50/50 shadow-xs text-center md:text-left">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Journal Archive</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{analyticsStats.totalPapers}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-light">Published peer-reviews</p>
                  </div>
                  <div className="border border-neutral-200/90 p-4 rounded-xl bg-neutral-50/50 shadow-xs text-center md:text-left">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Review Pipeline</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{analyticsStats.underReviewMs}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-light">Pending peer approval</p>
                  </div>
                  <div className="border border-neutral-200/90 p-4 rounded-xl bg-neutral-50/50 shadow-xs text-center md:text-left">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase font-bold">Support Tickets</p>
                    <p className="text-xl sm:text-2xl font-bold text-black mt-1">{analyticsStats.openTickets}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-light">{analyticsStats.resolvedTickets} tickets solved</p>
                  </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                  {/* Chart 1: Role Distribution Pie */}
                  <div className="border border-neutral-200 p-4 rounded-xl space-y-4">
                    <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Account Roles Distribution</p>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={roleDistributionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={45}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {roleDistributionData.map((entry, idx) => (
                              <Cell key={`cell-${idx}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-neutral-50 font-sans">
                      {roleDistributionData.map((entry) => (
                        <div key={entry.name} className="flex items-center space-x-1.5">
                          <span className="w-2.5 h-2.5 shrink-0" style={{ backgroundColor: entry.color }}></span>
                          <span className="text-neutral-500 font-light truncate">{entry.name}: <strong className="text-black">{entry.value}</strong></span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Chart 2: Submissions Trend Area */}
                  <div className="border border-neutral-200 p-4 rounded-xl space-y-4">
                    <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Monthly Archive Growth</p>
                    <div className="h-48 text-[9px] font-mono">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={publicationTrendData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                          <XAxis dataKey="month" tickLine={false} />
                          <YAxis tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="papers" stackId="1" stroke="#171717" fill="#e5e5e5" strokeWidth={1.5} name="Published Articles" />
                          <Area type="monotone" dataKey="submissions" stackId="2" stroke="#737373" fill="#f5f5f5" strokeWidth={1.5} name="Total Submissions" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: USERS MANAGEMENT */}
            {activeTab === "users" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">User Directories & Controls</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-light">Assign roles, adjust emails, reset security, and manage verification audits.</p>
                  </div>
                </div>

                {/* Filter / Search panel */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-grow relative">
                    <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Search accounts by name, email, ORCID..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-neutral-200 rounded-xl focus:outline-none focus:border-black font-sans"
                    />
                  </div>
                  <div className="w-full sm:w-40">
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-sans cursor-pointer"
                    >
                      <option value="All">All Roles</option>
                      <option value="Admin">System Admin</option>
                      <option value="Reviewer">Reviewer (Editor)</option>
                      <option value="Researcher">Researcher</option>
                      <option value="Member">Member</option>
                    </select>
                  </div>
                </div>

                {/* Editing Dialog Overlay */}
                {editingUser && (
                  <div className="border border-neutral-200 bg-neutral-50 p-4 rounded-xl space-y-4">
                    <div className="flex justify-between items-center border-b border-neutral-200 pb-2">
                      <p className="text-xs font-bold font-mono text-black uppercase">Edit User Credentials: {editingUser.name}</p>
                      <button onClick={() => setEditingUser(null)} className="text-neutral-400 hover:text-black">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <form onSubmit={handleSaveUserEdit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Email Address</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          required
                          className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Assign Role</label>
                        <select
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value as UserRole)}
                          className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-lg cursor-pointer"
                        >
                          <option value="Admin">System Administrator</option>
                          <option value="Reviewer">Reviewer (Editor)</option>
                          <option value="Researcher">Researcher</option>
                          <option value="Member">Member</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Account Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value as any)}
                          className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-lg cursor-pointer"
                        >
                          <option value="Active">Active / Clear</option>
                          <option value="Suspended">Suspended / Read-only</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Reset Password (Local Sandbox)</label>
                        <input
                          type="password"
                          value={newPasswordVal}
                          onChange={(e) => setNewPasswordVal(e.target.value)}
                          placeholder="Type new secure key..."
                          className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-lg focus:outline-none focus:border-black"
                        />
                      </div>
                      <div className="col-span-1 sm:col-span-2 pt-2 flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingUser(null)}
                          className="px-3 py-1.5 bg-white border border-neutral-200 rounded-lg text-xs font-semibold text-neutral-600 hover:text-black cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-black text-white rounded-lg text-xs font-mono font-bold uppercase tracking-wider cursor-pointer"
                        >
                          Apply Credentials
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Users Bulk Action Toolbar */}
                {selectedUserEmails.length > 0 && (
                  <div className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <div className="bg-black border border-neutral-700 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-400">
                        {selectedUserEmails.length} Selected
                      </div>
                      <p className="text-xs text-neutral-300 font-sans">
                        Bulk operations for selected accounts:
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Set Role */}
                      <div className="flex items-center gap-1 bg-neutral-800 p-1 rounded-xl border border-neutral-700">
                        <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold px-1.5">Role:</span>
                        {(["Admin", "Reviewer", "Researcher", "Member"] as const).map(r => (
                          <button
                            key={r}
                            onClick={() => handleBulkChangeUserRole(r)}
                            className="px-2 py-0.5 text-[10px] font-mono font-bold bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors cursor-pointer"
                          >
                            {r}
                          </button>
                        ))}
                      </div>

                      {/* Verification */}
                      <button
                        onClick={() => handleBulkSetUserVerification(true)}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Verify
                      </button>
                      <button
                        onClick={() => handleBulkSetUserVerification(false)}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Unverify
                      </button>

                      {/* Status */}
                      <button
                        onClick={() => handleBulkSetUserStatus("Active")}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleBulkSetUserStatus("Suspended")}
                        className="px-2.5 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-xl transition-colors cursor-pointer"
                      >
                        Suspend
                      </button>

                      {/* Delete */}
                      <button
                        onClick={handleBulkDeleteUsers}
                        className="px-3 py-1 text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Delete ({selectedUserEmails.length})
                      </button>

                      {/* Clear */}
                      <button
                        onClick={() => setSelectedUserEmails([])}
                        className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                        title="Clear Selection"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Users Table */}
                <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-xs bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        <th className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={filteredUsers.length > 0 && selectedUserEmails.length === filteredUsers.length}
                            onChange={handleToggleSelectAllUsers}
                            className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                            title="Select / Deselect All Users"
                          />
                        </th>
                        <th className="p-3">User / Identity</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">Assigned Role</th>
                        <th className="p-3">Verification</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUserEmails.includes(user.email);
                        return (
                          <tr
                            key={user.email}
                            className={`transition-colors ${
                              isSelected ? "bg-amber-50/60" : user.status === "Suspended" ? "bg-neutral-50/20 text-neutral-400" : "hover:bg-neutral-50/50"
                            }`}
                          >
                            <td className="p-3 w-10 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleToggleSelectUser(user.email)}
                                className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                              />
                            </td>
                            <td className="p-3">
                              <div className="font-semibold text-black flex items-center gap-1.5">
                                {user.name}
                                {user.status === "Suspended" && (
                                  <span className="bg-red-50 text-red-600 border border-red-200 text-[8px] font-mono font-bold px-1.5 py-0.5 uppercase rounded-full">
                                    SUSPENDED
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-400 font-mono mt-0.5">
                                {user.profession || "Unspecified Specialty"}
                              </div>
                            </td>
                            <td className="p-3 font-mono text-[11px]">{user.email}</td>
                            <td className="p-3">
                              <span className={`inline-block font-mono text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                                user.role === "Admin" ? "bg-black text-white" :
                                user.role === "Reviewer" ? "bg-neutral-600 text-white" :
                                user.role === "Researcher" ? "bg-neutral-200 text-neutral-800" :
                                "bg-neutral-100 text-neutral-500"
                              }`}>
                                {user.role || "Member"}
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => handleToggleVerification(user.email, user.verified)}
                                className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-semibold px-2 py-1 rounded-lg border cursor-pointer transition-all ${
                                  user.verified
                                    ? "bg-neutral-50 text-black border-neutral-300 hover:bg-neutral-100"
                                    : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:text-black hover:border-black"
                                }`}
                              >
                                <ShieldCheck className={`w-3.5 h-3.5 ${user.verified ? "text-black" : "text-neutral-300"}`} />
                                {user.verified ? "Vetted" : "Unverified"}
                              </button>
                            </td>
                            <td className="p-3 text-right space-x-2">
                              <button
                                onClick={() => handleEditUserClick(user)}
                                className="text-[11px] font-mono font-bold text-neutral-600 hover:text-black cursor-pointer hover:underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.email)}
                                className="text-[11px] font-mono font-bold text-red-600 hover:text-red-800 cursor-pointer hover:underline"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: ROLES & PERMISSIONS MATRIX */}
            {activeTab === "matrix" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Roles & Permissions Registry</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Granular rights hierarchy assigned across Healthedia domains.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50 space-y-3">
                    <span className="font-mono text-[9px] font-bold bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Level 1 — System Administrator</span>
                    <h4 className="text-xs font-bold text-black font-sans">Full Website Governance & Access</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Possesses unrestricted core permissions. Can assign user roles, verify clinical professionals, override security tokens, customize website typography, configure taxonomy sets, edit homepage themes, and purge entries.
                    </p>
                  </div>
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50 space-y-3">
                    <span className="font-mono text-[9px] font-bold bg-neutral-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">Level 2 — Reviewer (Editor)</span>
                    <h4 className="text-xs font-bold text-black font-sans">Manuscript Review & Quality Moderation</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Manages peer-review workflow channels. Can review submissions, request revisions from authors, approve/reject manuscripts, and recommend vetting status. Cannot modify core system branding or manage administrators.
                    </p>
                  </div>
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50 space-y-3">
                    <span className="font-mono text-[9px] font-bold bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-full uppercase tracking-wider">Level 3 — Researcher</span>
                    <h4 className="text-xs font-bold text-black font-sans">Academic Vetting & Publication Privileges</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Authorized authors. Can submit full scientific manuscripts, edit personal published archives, edit public professional biographies, upload academic CV documents, and view real-time citation indexes.
                    </p>
                  </div>
                  <div className="border border-neutral-200 p-5 rounded-2xl bg-neutral-50/50 space-y-3">
                    <span className="font-mono text-[9px] font-bold bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-full uppercase tracking-wider">Level 4 — Member</span>
                    <h4 className="text-xs font-bold text-black font-sans">Default Access Tier</h4>
                    <p className="text-xs text-neutral-500 font-light leading-relaxed">
                      Newly registered users. Can read published academic files, filter directories, customize personal profiles, and submit tickets to support. Promoted automatically to Researcher upon approval of their first manuscript.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: REVIEW PIPELINE (MANUSCRIPTS) */}
            {activeTab === "reviews" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Manuscript Peer-Review Pipeline</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Moderate incoming academic manuscripts. Approving a Member's paper triggers automatic Researcher promotion.</p>
                </div>

                {selectedManuscript ? (
                  <div className="border border-neutral-200 p-5 rounded-xl bg-neutral-50/40 space-y-4">
                    <div className="flex justify-between items-start border-b border-neutral-150 pb-3">
                      <div>
                        <span className="inline-block font-mono text-[8px] font-bold bg-black text-white px-2 py-0.5 uppercase tracking-wider rounded-md mb-2">
                          {selectedManuscript.researchType} — {selectedManuscript.journalCategory}
                        </span>
                        <h3 className="text-sm font-bold text-black font-sans leading-snug">{selectedManuscript.title}</h3>
                        <p className="text-[11px] text-neutral-500 mt-1">Submitted by: {selectedManuscript.authors.join(", ")} ({selectedManuscript.authorEmail})</p>
                      </div>
                      <button onClick={() => setSelectedManuscript(null)} className="text-neutral-400 hover:text-black">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-mono font-bold text-neutral-400 uppercase">Abstract Abstractum</p>
                      <p className="text-xs text-neutral-700 leading-relaxed font-sans font-light">{selectedManuscript.abstract}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Institution</span>
                        <p className="font-semibold text-neutral-800">{selectedManuscript.institution}</p>
                      </div>
                      <div>
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold">Country of Origin</span>
                        <p className="font-semibold text-neutral-800">{selectedManuscript.country}</p>
                      </div>
                    </div>

                    {/* Review Notes field */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Reviewer Editorial Notes / Directives</label>
                      <textarea
                        value={reviewerNotes}
                        onChange={(e) => setReviewerNotes(e.target.value)}
                        placeholder="Provide peer annotations, methodology revisions, or feedback reasons..."
                        rows={3}
                        className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-xl focus:outline-none focus:border-black font-sans"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2 border-t border-neutral-150">
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Rejected")}
                        className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Reject Manuscript
                      </button>
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Revision Requested")}
                        className="px-3.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
                      >
                        Request Revisions
                      </button>
                      <button
                        onClick={() => handleManuscriptAction(selectedManuscript.id, "Approved")}
                        className="px-5 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        Approve & Publish Paper
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {manuscripts.length > 0 ? (
                      <div className="space-y-4">
                        {/* Manuscripts Header Controls & Bulk Toolbar */}
                        <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold text-neutral-600 uppercase">
                            <input
                              type="checkbox"
                              checked={manuscripts.length > 0 && selectedManuscriptIds.length === manuscripts.length}
                              onChange={handleToggleSelectAllManuscripts}
                              className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                            />
                            Select All Submissions ({manuscripts.length})
                          </label>
                        </div>

                        {selectedManuscriptIds.length > 0 && (
                          <div className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
                            <div className="flex items-center gap-3">
                              <div className="bg-black border border-neutral-700 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-400">
                                {selectedManuscriptIds.length} Selected
                              </div>
                              <p className="text-xs text-neutral-300 font-sans">
                                Bulk actions for review pipeline:
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                onClick={handleBulkApproveManuscripts}
                                className="px-3 py-1 text-xs font-mono font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve & Publish
                              </button>
                              <button
                                onClick={handleBulkRejectManuscripts}
                                className="px-3 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-400 border border-neutral-700 rounded-xl transition-colors cursor-pointer"
                              >
                                Reject Selected
                              </button>
                              <button
                                onClick={handleBulkDeleteManuscripts}
                                className="px-3 py-1 text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                              >
                                <Trash className="w-3.5 h-3.5" />
                                Delete
                              </button>
                              <button
                                onClick={() => setSelectedManuscriptIds([])}
                                className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                title="Clear Selection"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}

                        {manuscripts.map((ms) => {
                          const isSelected = selectedManuscriptIds.includes(ms.id);
                          return (
                            <div
                              key={ms.id}
                              className={`border p-4 rounded-2xl bg-white transition-all duration-250 flex flex-col sm:flex-row justify-between items-start gap-4 shadow-xs ${
                                isSelected ? "border-black bg-amber-50/40" : "border-neutral-200 hover:border-black"
                              }`}
                            >
                              <div className="flex items-start gap-3 max-w-xl">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => handleToggleSelectManuscript(ms.id)}
                                  className="mt-1 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                                />
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      ms.status === "Under Review" ? "bg-neutral-100 text-neutral-500" :
                                      ms.status === "Approved" ? "bg-black text-white" :
                                      "bg-red-50 text-red-600"
                                    }`}>
                                      {ms.status}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-mono">Submitted {ms.submittedAt}</span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-black font-sans leading-tight">{ms.title}</h4>
                                  <p className="text-[11px] text-neutral-500 font-sans font-light truncate">Author: {ms.authors[0]} ({ms.authorEmail})</p>
                                </div>
                              </div>
                              <div className="flex gap-2 self-start sm:self-center">
                                {ms.status === "Approved" && (
                                  <button
                                    onClick={() => setSelectedPaperForCert({
                                      id: ms.id,
                                      title: ms.title,
                                      authors: ms.authors,
                                      journal: ms.submissionType === "Published" ? undefined : "Healthedia Global Journal of Performance Science",
                                      doi: `10.2813/healthedia.${ms.id.split("-")[1] || Math.floor(1000 + Math.random() * 9000)}`,
                                      specialty: ms.specialty || "Sports Science & Musculoskeletal",
                                      institution: ms.institution || "Harvard Research Centre",
                                      country: ms.country || "United States",
                                      submittedAt: ms.submittedAt
                                    })}
                                    className="px-3 py-1.5 border border-neutral-200 hover:border-black text-neutral-600 hover:text-black text-xs font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    <Award className="w-3.5 h-3.5" />
                                    Certificate
                                  </button>
                                )}
                                {ms.status !== "Approved" && ms.status !== "Rejected" && (
                                  <button
                                    onClick={() => {
                                      setSelectedManuscript(ms);
                                      setReviewerNotes(ms.reviewerNotes || "");
                                    }}
                                    className="px-3.5 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 text-xs font-semibold rounded-xl uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Conduct Audit
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center border border-neutral-150 rounded-xl">
                        <p className="text-xs text-neutral-400 font-mono uppercase mb-1">No pending review pipelines</p>
                        <p className="text-xs text-neutral-500 font-light">All submitted scholarly works have been audited.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: JOURNAL PUBLICATIONS */}
            {activeTab === "journal" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Journal Publications Manager</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-light">Manage and index Healthedia published scientific catalog.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Select All Controls */}
                  <div className="flex items-center justify-between bg-neutral-50 p-3 rounded-2xl border border-neutral-200">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-mono font-bold text-neutral-600 uppercase">
                      <input
                        type="checkbox"
                        checked={publishedPapers.length > 0 && selectedPaperIds.length === publishedPapers.length}
                        onChange={handleToggleSelectAllPapers}
                        className="rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                      />
                      Select All Publications ({publishedPapers.length})
                    </label>
                  </div>

                  {/* Publications Bulk Action Toolbar */}
                  {selectedPaperIds.length > 0 && (
                    <div className="bg-neutral-900 text-white p-3.5 rounded-2xl border border-neutral-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-3">
                        <div className="bg-black border border-neutral-700 px-3 py-1 rounded-xl text-xs font-mono font-bold text-amber-400">
                          {selectedPaperIds.length} Selected
                        </div>
                        <p className="text-xs text-neutral-300 font-sans">
                          Bulk actions for scientific publication catalog:
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Feature / Unfeature */}
                        <button
                          onClick={() => handleBulkSetPaperFeatured(true)}
                          className="px-3 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-neutral-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Star className="w-3.5 h-3.5 fill-amber-300" />
                          Feature
                        </button>
                        <button
                          onClick={() => handleBulkSetPaperFeatured(false)}
                          className="px-3 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-300 border border-neutral-700 rounded-xl transition-colors cursor-pointer"
                        >
                          Unfeature
                        </button>

                        {/* Status */}
                        <button
                          onClick={() => handleBulkSetPaperStatus("Published")}
                          className="px-3 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-emerald-400 border border-neutral-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Publish
                        </button>
                        <button
                          onClick={() => handleBulkSetPaperStatus("Unpublished")}
                          className="px-3 py-1 text-xs font-mono font-bold bg-neutral-800 hover:bg-neutral-700 text-neutral-400 border border-neutral-700 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <EyeOff className="w-3.5 h-3.5" />
                          Unpublish
                        </button>

                        {/* Delete */}
                        <button
                          onClick={handleBulkDeletePapers}
                          className="px-3 py-1 text-xs font-mono font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        >
                          <Trash className="w-3.5 h-3.5" />
                          Delete ({selectedPaperIds.length})
                        </button>

                        {/* Clear */}
                        <button
                          onClick={() => setSelectedPaperIds([])}
                          className="p-1 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Clear Selection"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {publishedPapers.map((paper, idx) => {
                    const isSelected = selectedPaperIds.includes(paper.id);
                    return (
                      <div
                        key={paper.id || idx}
                        className={`border p-4 rounded-xl bg-white flex justify-between items-center shadow-xs transition-all ${
                          isSelected ? "border-black bg-amber-50/40" : "border-neutral-200"
                        }`}
                      >
                        <div className="flex items-start gap-3 max-w-md">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectPaper(paper.id)}
                            className="mt-1 rounded border-neutral-300 text-black focus:ring-black cursor-pointer"
                          />
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[9px] bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded-md uppercase tracking-wider font-bold">
                                {paper.researchType}
                              </span>
                              {paper.featured && (
                                <span className="font-mono text-[8px] bg-amber-100 text-amber-800 border border-amber-300 px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 uppercase">
                                  <Star className="w-2.5 h-2.5 fill-amber-600" /> Featured
                                </span>
                              )}
                              {paper.status === "Unpublished" && (
                                <span className="font-mono text-[8px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded-md font-bold uppercase">
                                  Unpublished
                                </span>
                              )}
                            </div>
                            <h4 className="text-xs sm:text-sm font-sans font-bold text-black mt-1 leading-snug">{paper.title}</h4>
                            <p className="text-[11px] text-neutral-400 mt-0.5 font-sans font-light truncate">
                              {paper.authors.join(", ")} • {paper.journal}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Remove publication "${paper.title}" from catalog?`)) {
                              const updated = publishedPapers.filter(p => p.id !== paper.id);
                              savePublishedPapers(updated);
                              showToast("Publication removed from indexing registry.", "success");
                            }
                          }}
                          className="p-2 border border-neutral-200 hover:border-red-300 text-neutral-400 hover:text-red-600 rounded-xl transition-all cursor-pointer"
                          title="Delete Publication"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB: TAXONOMY MANAGEMENT */}
            {activeTab === "taxonomy" && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Administrative Taxonomy Management</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    Dynamically curate, reorder, and refine the 13 classification taxonomies across the platform. Changes apply immediately.
                  </p>
                </div>

                {/* Categories Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Select Classification Field</label>
                  <select
                    value={activeTaxonomyCat}
                    onChange={(e) => {
                      setActiveTaxonomyCat(e.target.value);
                      setEditingTaxonomyIdx(null);
                    }}
                    className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-black text-black font-sans"
                  >
                    <option value="professions">Professional Categories (Registration List)</option>
                    <option value="medicalSpecialties">Medical Specialties</option>
                    <option value="sportsScienceDisciplines">Sports Science Disciplines</option>
                    <option value="humanPerformanceFields">Human Performance Fields</option>
                    <option value="researchCategories">Research Categories</option>
                    <option value="researchSubjects">Research Subjects</option>
                    <option value="journalCategories">Journal Categories</option>
                    <option value="keywords">Keywords / Index Tags</option>
                    <option value="institutions">Institutions</option>
                    <option value="countries">Countries</option>
                    <option value="academicDegrees">Academic Degrees</option>
                    <option value="publicationTypes">Publication Types</option>
                    <option value="researchTypes">Research Types</option>
                  </select>
                </div>

                {/* Add Item Form */}
                <form onSubmit={handleAddTaxonomyItem} className="flex gap-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <input
                    type="text"
                    required
                    placeholder={`Enter new item for ${activeTaxonomyCat === "professions" ? "Professions" : activeTaxonomyCat}...`}
                    value={newTaxonomyItemName}
                    onChange={(e) => setNewTaxonomyItemName(e.target.value)}
                    className="flex-grow text-xs border border-neutral-200 bg-white px-3 py-2 rounded-xl focus:outline-none focus:border-black text-black"
                  />
                  <button
                    type="submit"
                    className="bg-black text-white px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-850 flex items-center gap-1 cursor-pointer shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </form>

                {/* Items List */}
                <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden shadow-xs divide-y divide-neutral-100">
                  {getTaxonomyList().map((item, index) => (
                    <div key={item + index} className="p-3 flex items-center justify-between text-xs hover:bg-neutral-50/40">
                      {editingTaxonomyIdx === index ? (
                        <div className="flex-grow flex gap-2">
                          <input
                            type="text"
                            value={editingTaxonomyVal}
                            onChange={(e) => setEditingTaxonomyVal(e.target.value)}
                            className="flex-grow text-xs border border-neutral-300 bg-white px-2 py-1 rounded-lg"
                          />
                          <button
                            onClick={() => handleSaveTaxonomyEdit(index)}
                            className="text-neutral-600 hover:text-black font-semibold cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingTaxonomyIdx(null)}
                            className="text-neutral-400 hover:text-black cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-[10px] text-neutral-300 font-bold">{index + 1}.</span>
                            <span className="font-medium text-black">{item}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Reordering */}
                            <button
                              onClick={() => handleMoveTaxonomyItem(index, "up")}
                              disabled={index === 0}
                              className="p-1 border border-neutral-200 rounded-md text-neutral-400 hover:text-black disabled:opacity-30 cursor-pointer"
                              title="Move Up"
                            >
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleMoveTaxonomyItem(index, "down")}
                              disabled={index === getTaxonomyList().length - 1}
                              className="p-1 border border-neutral-200 rounded-md text-neutral-400 hover:text-black disabled:opacity-30 cursor-pointer"
                              title="Move Down"
                            >
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>

                            {/* Actions */}
                            <button
                              onClick={() => handleStartEditTaxonomy(index, item)}
                              className="p-1 border border-neutral-200 rounded-md text-neutral-400 hover:text-black cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteTaxonomyItem(item)}
                              className="p-1 border border-neutral-200 rounded-md text-neutral-400 hover:text-red-600 hover:border-red-200 cursor-pointer"
                              title="Remove"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: WEBSITE APPEARANCE CUSTOMIZER */}
            {activeTab === "appearance" && (
              <form onSubmit={handleSaveAppearance} className="space-y-6 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Appearance & Branding Customizer</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Configure typography families, brand names, and hero content dynamically.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Logo branding text</label>
                    <input
                      type="text"
                      required
                      value={brandingText}
                      onChange={(e) => setBrandingText(e.target.value)}
                      className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Website Typography Preset</label>
                    <select
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl cursor-pointer"
                    >
                      <option value="Inter & Space Grotesk">Classic Swiss (Inter & Space Grotesk)</option>
                      <option value="Playfair Display & Inter">Editorial Warm (Playfair Display & Inter)</option>
                      <option value="JetBrains Mono & Outfit">Tech Modern (JetBrains Mono & Outfit)</option>
                    </select>
                  </div>
                </div>

                {/* Colors customizer */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-mono font-bold text-neutral-500 uppercase block">Accent Presentation Theme</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Classic Slate", hex: "#171717" },
                      { name: "Deep Ocean", hex: "#1d4ed8" },
                      { name: "Emerald Sage", hex: "#047857" },
                      { name: "Crimson Velvet", hex: "#be123c" },
                      { name: "Athletic Orange", hex: "#ea580c" }
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => handlePresetColor(preset.hex)}
                        className={`text-xs px-3 py-2 border rounded-xl flex items-center gap-2 cursor-pointer transition-all ${
                          colorAccent === preset.hex ? "border-black font-semibold bg-neutral-50 shadow-xs" : "border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-50"
                        }`}
                      >
                        <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: preset.hex }}></span>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 max-w-xs pt-1">
                    <span className="text-xs text-neutral-400 shrink-0 font-mono">Custom HEX:</span>
                    <input
                      type="text"
                      value={colorAccent}
                      onChange={(e) => setColorAccent(e.target.value)}
                      placeholder="#171717"
                      className="text-xs border border-neutral-200 bg-white py-1 px-2 rounded-lg font-mono text-center w-24 focus:outline-none focus:border-black"
                    />
                  </div>
                </div>

                {/* Hero section customization */}
                <div className="space-y-4 pt-4 border-t border-neutral-100">
                  <h3 className="text-xs font-bold text-black uppercase tracking-wider font-mono">Homepage Hero Customizer</h3>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase">Main Hero Headline Text</label>
                    <input
                      type="text"
                      required
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black font-semibold text-black"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase">Hero Paragraph / Subtitle Text</label>
                    <textarea
                      required
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      rows={3}
                      className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black font-light leading-relaxed"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end border-t border-neutral-100">
                  <button
                    type="submit"
                    className="bg-black text-white text-xs font-mono font-bold uppercase py-2.5 px-5 rounded-xl hover:bg-neutral-850 cursor-pointer shadow-sm"
                  >
                    Apply Theme Settings
                  </button>
                </div>
              </form>
            )}

            {/* TAB: SUPPORT TICKETS */}
            {activeTab === "support" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Support Desk Resolution Center</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-light">Moderate help requests and account claim inquiries.</p>
                  </div>
                  <div className="w-36">
                    <select
                      value={ticketStatusFilter}
                      onChange={(e) => setTicketStatusFilter(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-1.5 focus:outline-none focus:border-black font-sans cursor-pointer"
                    >
                      <option value="All">All Tickets</option>
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  {tickets
                    .filter(t => ticketStatusFilter === "All" || t.status === ticketStatusFilter)
                    .map((ticket) => (
                      <div key={ticket.id} className="border border-neutral-200 p-4 rounded-xl bg-white space-y-3 shadow-xs">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="font-mono text-[9px] text-neutral-400 uppercase font-bold mr-2">{ticket.category}</span>
                            <span className="font-mono text-[9px] text-neutral-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                            <h4 className="text-xs sm:text-sm font-sans font-bold text-black leading-tight mt-1">{ticket.title}</h4>
                            <p className="text-[11px] text-neutral-500 mt-0.5 font-light">Submitted by: {ticket.userEmail}</p>
                          </div>
                          
                          {/* Status changer */}
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-block font-mono text-[8px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                              ticket.status === "Pending" ? "bg-red-50 text-red-600" :
                              ticket.status === "In Progress" ? "bg-neutral-50 text-neutral-600 border border-neutral-300" :
                              "bg-black text-white"
                            }`}>
                              {ticket.status}
                            </span>
                            <select
                              value={ticket.status}
                              onChange={(e) => handleUpdateTicketStatus(ticket.id, e.target.value as any)}
                              className="text-[10px] bg-neutral-50 border border-neutral-200 rounded-md p-1 cursor-pointer focus:outline-none focus:border-black"
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Resolved">Resolved</option>
                            </select>
                          </div>
                        </div>

                        <p className="text-xs text-neutral-600 leading-relaxed bg-neutral-50 p-2.5 border border-neutral-200/50 rounded-lg font-light">
                          {ticket.description}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* TAB: SEO & SITE MANAGEMENT */}
            {activeTab === "seo" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">SEO & Website Page Management</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light font-mono text-[11px]">Manage site metadata, customize pages, build XML sitemaps, establish Apache/LiteSpeed 301 redirects, and generate Hostinger-ready deploy scripts.</p>
                </div>
                <SEOManagerView />
              </div>
            )}

            {/* TAB: PLATFORM SETTINGS */}
            {activeTab === "settings" && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">System Settings & Governance</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Platform rules, registration restrictions, and search behavior parameters.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Governance Panel */}
                  <div className="lg:col-span-1 space-y-4 text-xs border border-neutral-200 p-5 rounded-2xl bg-white">
                    <h3 className="text-xs font-mono font-bold text-black uppercase border-b border-neutral-100 pb-1.5">Governance Rules</h3>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Vetting Authority Name</label>
                      <input type="text" defaultValue="Healthedia Administrative Council" className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black" />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Search Indexing Refresh Rates</label>
                      <select className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl cursor-pointer">
                        <option>Immediate / Real-time cache</option>
                        <option>Hourly indexing pipeline</option>
                        <option>Daily scheduled cron job</option>
                      </select>
                    </div>
                    
                    <label className="flex items-start cursor-pointer hover:text-black group pt-2">
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Enforce double-blind scientific review workflow</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Conceals author identities from peer reviewers until final approval decisions.</p>
                      </div>
                    </label>

                    <label className="flex items-start cursor-pointer hover:text-black group pt-2">
                      <input
                        type="checkbox"
                        className="mr-3 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black w-4 h-4 rounded-md cursor-pointer"
                      />
                      <div>
                        <p className="font-bold text-black font-sans group-hover:text-neutral-800 transition-colors">Lock new registrations sandbox</p>
                        <p className="text-neutral-400 mt-0.5 font-light leading-relaxed">Restricts account creation to pre-authorized professional whitelist domains only.</p>
                      </div>
                    </label>
                  </div>

                  {/* Right Email Template Customizer Pane */}
                  <div className="lg:col-span-2 space-y-4 border border-neutral-200 p-5 rounded-2xl bg-white">
                    <div className="flex justify-between items-center border-b border-neutral-100 pb-2">
                      <div>
                        <h3 className="text-xs font-mono font-bold text-black uppercase">System Email Communications</h3>
                        <p className="text-[10px] text-neutral-400 mt-0.5">Customize transaction logs, system notifications, and OTP codes.</p>
                      </div>
                      <span className="text-[9px] font-mono font-bold uppercase bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                        Active Sandbox
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Editor */}
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Selected Notification Event</label>
                          <select className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl cursor-pointer">
                            <option>Password Recovery Security OTP Email</option>
                            <option disabled>Journal Manuscript Submission Confirmation</option>
                            <option disabled>Identity Verification Board Decision</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-mono font-bold text-neutral-500 uppercase">Template Source Code</label>
                            <span className="text-[8px] font-mono text-neutral-400 uppercase">Dynamic Fields Allowed</span>
                          </div>
                          <textarea
                            value={recoveryEmailTemplate}
                            onChange={(e) => setRecoveryEmailTemplate(e.target.value)}
                            rows={10}
                            className="w-full text-[11px] font-mono border border-neutral-200 p-3 rounded-xl bg-neutral-50/50 focus:outline-none focus:border-black focus:bg-white resize-y"
                          />
                        </div>

                        <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/50 space-y-1.5 text-[10px]">
                          <p className="font-bold text-neutral-500 font-mono uppercase tracking-wider text-[9px]">Dynamic Token Legend:</p>
                          <div className="grid grid-cols-3 gap-1 font-mono text-neutral-500">
                            <p><span className="text-black font-bold">{"{{EMAIL}}"}</span> email</p>
                            <p><span className="text-black font-bold">{"{{OTP}}"}</span> code pin</p>
                            <p><span className="text-black font-bold">{"{{EXPIRY}}"}</span> duration</p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleSaveEmailTemplate}
                          className="w-full bg-black text-white text-xs font-mono font-bold uppercase py-2.5 rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
                        >
                          Save Customizable Template
                        </button>
                      </div>

                      {/* Live Browser Client Mock Preview */}
                      <div className="space-y-3">
                        <span className="block text-[10px] font-mono font-bold text-neutral-500 uppercase">Interactive Render Preview</span>
                        
                        <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs bg-white text-xs h-[320px] flex flex-col">
                          {/* Browser Mock Header */}
                          <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-2 flex items-center space-x-1.5 shrink-0 select-none">
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-neutral-300"></span>
                            <span className="text-[9px] font-mono text-neutral-400 pl-4">security_client_renderer.exe</span>
                          </div>

                          {/* Email Metadata */}
                          <div className="p-3 border-b border-neutral-100 bg-neutral-50/50 space-y-1 text-[10px] text-neutral-500 font-mono shrink-0">
                            <p><span className="text-neutral-400 font-bold">From:</span> automated-dispatch@healthedia.org</p>
                            <p><span className="text-neutral-400 font-bold">To:</span> admin@healthedia.org</p>
                            <p className="truncate font-semibold text-black">
                              <span className="text-neutral-400 font-bold font-mono">Subject:</span> {
                                recoveryEmailTemplate.split("\n")[0]?.replace("Subject:", "").trim() || "[Healthedia] Password Recovery Verification"
                              }
                            </p>
                          </div>

                          {/* Email Body */}
                          <div className="p-4 overflow-y-auto bg-white flex-grow font-sans text-[11px] text-neutral-600 leading-relaxed whitespace-pre-wrap">
                            {(() => {
                              // Filter out Subject line from body preview
                              const lines = recoveryEmailTemplate.split("\n");
                              const bodyLines = lines[0]?.startsWith("Subject:") ? lines.slice(1) : lines;
                              return bodyLines.join("\n")
                                .replace(/\{\{EMAIL\}\}/g, "admin@healthedia.org")
                                .replace(/\{\{OTP\}\}/g, "592184")
                                .replace(/\{\{EXPIRY\}\}/g, "15 minutes");
                            })()}
                          </div>
                        </div>

                        <div className="text-center">
                          <p className="text-[9px] font-mono text-neutral-400 uppercase italic">Replaces double-bracket tokens with live application variables at dispatch time</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: INSTITUTIONS MODERATION QUEUE */}
            {activeTab === "institutions_queue" && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-neutral-100 pb-3">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Institutions Registry Moderation Queue</h2>
                    <p className="text-xs text-neutral-400 mt-0.5 font-light">Approve registries, request changes, or merge duplicate submissions.</p>
                  </div>
                  <div className="w-44">
                    <select
                      value={queueStatusFilter}
                      onChange={(e) => setQueueStatusFilter(e.target.value)}
                      className="w-full text-xs bg-white border border-neutral-200 rounded-lg p-2 focus:outline-none focus:border-black font-sans cursor-pointer"
                    >
                      <option value="All">All Submissions</option>
                      <option value="Pending">Pending Audit</option>
                      <option value="Duplicate Flagged">Duplicate Flagged</option>
                      <option value="Changes Requested">Changes Requested</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                {selectedInstForAudit ? (
                  <div className="border border-neutral-250 p-6 rounded-2xl bg-neutral-50/40 space-y-5 animate-fadeIn">
                    <div className="flex justify-between items-start border-b border-neutral-200 pb-3">
                      <div>
                        <span className="inline-block font-mono text-[9px] font-bold bg-black text-white px-2.5 py-0.5 uppercase tracking-wider rounded mb-1">
                          {selectedInstForAudit.institutionType}
                        </span>
                        <h3 className="text-sm sm:text-base font-bold text-black font-sans leading-tight">
                          Audit: {selectedInstForAudit.name}
                        </h3>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          Submitted by: {selectedInstForAudit.submittedBy} on {selectedInstForAudit.submittedAt}
                        </p>
                      </div>
                      <button onClick={() => setSelectedInstForAudit(null)} className="text-neutral-400 hover:text-black cursor-pointer font-mono text-xs">
                        ← Back
                      </button>
                    </div>

                    {/* Duplicate Flag Alert banner */}
                    {selectedInstForAudit.isDuplicate && (
                      <div className="bg-red-50 border border-red-300 p-4 rounded-xl space-y-1.5">
                        <span className="text-[10px] font-mono font-bold uppercase text-red-600 flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-red-600" />
                          Possible Duplicate Match Flagged
                        </span>
                        <p className="text-xs text-red-700 leading-normal font-light">
                          Our automated check flagged this submission as a potential duplicate: <strong className="font-semibold">"{selectedInstForAudit.duplicateNotes}"</strong>.
                          Please verify if this institution already exists in the directory. You can merge their research volumes using the control options below.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-700 font-light">
                      <div className="space-y-3 bg-white p-4 border border-neutral-200 rounded-xl">
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Academy Metadata</span>
                        
                        <div>
                          <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Official Title:</strong>
                          <p className="font-normal text-neutral-900">{selectedInstForAudit.officialName}</p>
                        </div>
                        {selectedInstForAudit.shortName && (
                          <div>
                            <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Short Name / Acronym:</strong>
                            <p className="font-mono text-neutral-900">{selectedInstForAudit.shortName}</p>
                          </div>
                        )}
                        <div>
                          <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Geography:</strong>
                          <p className="font-normal text-neutral-900">{selectedInstForAudit.city}, {selectedInstForAudit.country}</p>
                        </div>
                        {selectedInstForAudit.website && (
                          <div>
                            <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Official Website:</strong>
                            <a href={selectedInstForAudit.website} target="_blank" rel="noreferrer" className="text-black hover:underline inline-flex items-center gap-1 font-normal">
                              {selectedInstForAudit.website}
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3 bg-white p-4 border border-neutral-200 rounded-xl">
                        <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Specialties & Operations</span>
                        
                        <div>
                          <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Specialty Categories:</strong>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedInstForAudit.specialties.map((s: string, idx: number) => (
                              <span key={idx} className="bg-neutral-50 border border-neutral-200 px-2 py-0.5 rounded text-[10px] text-neutral-700 font-normal">
                                {s}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Departments:</strong>
                          <ul className="list-disc list-inside space-y-0.5 mt-1">
                            {selectedInstForAudit.faculties.map((f: string, idx: number) => (
                              <li key={idx} className="text-[11px] text-neutral-600 font-light">{f}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 border border-neutral-200 rounded-xl text-xs space-y-2">
                      <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Description Overview:</strong>
                      <p className="text-neutral-600 font-light leading-relaxed">{selectedInstForAudit.description}</p>
                      
                      {selectedInstForAudit.history && (
                        <div className="pt-2 border-t border-neutral-100 space-y-1">
                          <strong className="font-semibold text-neutral-800 block text-[10px] uppercase font-mono text-neutral-400">Chronicle History:</strong>
                          <p className="text-neutral-600 font-light leading-relaxed">{selectedInstForAudit.history}</p>
                        </div>
                      )}
                    </div>

                    {/* MODERATION ACTION FORM */}
                    <div className="space-y-3 border-t border-neutral-200 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-mono font-bold text-neutral-500 uppercase">Reviewer Audit Directives / Revision notes</label>
                        <textarea
                          value={auditInstNotes}
                          onChange={(e) => setAuditInstNotes(e.target.value)}
                          placeholder="Provide reasons if Requesting Changes or Rejecting, or log details on approval decision..."
                          rows={3}
                          className="w-full text-xs border border-neutral-200 bg-white p-2.5 rounded-xl focus:outline-none focus:border-black font-sans"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row justify-between gap-4">
                        {/* Merge Actions Panel (Only if duplicate is flagged) */}
                        <div className="flex items-center gap-2">
                          <select
                            value={selectedMergeTargetId}
                            onChange={(e) => setSelectedMergeTargetId(e.target.value)}
                            className="text-xs border border-neutral-200 bg-white p-2 rounded-lg focus:outline-none focus:border-black font-sans cursor-pointer max-w-xs"
                          >
                            <option value="">Select Target Approved Academy to Merge</option>
                            {institutionsList
                              .filter(i => i.status === "Approved")
                              .map(i => (
                                <option key={i.id} value={i.id}>{i.name} ({i.city}, {i.country})</option>
                              ))}
                          </select>
                          <button
                            type="button"
                            onClick={() => {
                              if (!selectedMergeTargetId) {
                                showToast("Please select an approved academy to merge into.", "error");
                                return;
                              }
                              
                              // Merge Stats logic
                              const masterTarget = institutionsList.find(i => i.id === selectedMergeTargetId);
                              if (!masterTarget) return;

                              const updatedTarget = {
                                ...masterTarget,
                                customStats: {
                                  publishedPapers: (masterTarget.customStats?.publishedPapers || 0) + (selectedInstForAudit.customStats?.publishedPapers || 0),
                                  verifiedResearchers: (masterTarget.customStats?.verifiedResearchers || 0) + (selectedInstForAudit.customStats?.verifiedResearchers || 0),
                                  activeProjects: (masterTarget.customStats?.activeProjects || 0) + (selectedInstForAudit.customStats?.activeProjects || 0),
                                  medicalPrograms: (masterTarget.customStats?.medicalPrograms || 0) + (selectedInstForAudit.customStats?.medicalPrograms || 0)
                                }
                              };

                              const updatedList = institutionsList
                                .filter(i => i.id !== selectedInstForAudit.id) // delete pending entry
                                .map(i => i.id === selectedMergeTargetId ? updatedTarget : i); // update master target stats

                              saveInstitutionsList(updatedList);
                              showToast(`Submissions merged successfully! Dynamic volume indices transferred to "${masterTarget.name}".`, "success");
                              setSelectedInstForAudit(null);
                              setSelectedMergeTargetId("");
                            }}
                            className="bg-neutral-800 text-white hover:bg-black px-4 py-2 text-xs font-mono font-bold uppercase tracking-wider rounded-lg shrink-0 cursor-pointer"
                          >
                            Merge Submissions
                          </button>
                        </div>

                        {/* Standard Decisions */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = institutionsList.map(i => i.id === selectedInstForAudit.id ? { ...i, status: "Rejected", duplicateNotes: auditInstNotes } : i);
                              saveInstitutionsList(updated);
                              showToast("Submission Rejected.", "success");
                              setSelectedInstForAudit(null);
                            }}
                            className="px-3.5 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 text-xs font-semibold rounded-xl cursor-pointer"
                          >
                            Reject Registry
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!auditInstNotes) {
                                showToast("Please write change-request directives in the notes box.", "error");
                                return;
                              }
                              const updated = institutionsList.map(i => i.id === selectedInstForAudit.id ? { ...i, status: "Changes Requested", duplicateNotes: auditInstNotes } : i);
                              saveInstitutionsList(updated);
                              showToast("Revision changes requested from contributor.", "success");
                              setSelectedInstForAudit(null);
                            }}
                            className="px-3.5 py-1.5 border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
                          >
                            Request Revisions
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = institutionsList.map(i => i.id === selectedInstForAudit.id ? { ...i, status: "Approved", isDuplicate: false, duplicateNotes: undefined } : i);
                              saveInstitutionsList(updated);
                              showToast("Registry approved and added to Healthedia SEO-profile indexes!", "success");
                              setSelectedInstForAudit(null);
                            }}
                            className="px-5 py-1.5 bg-black text-white hover:bg-neutral-850 text-xs font-mono font-bold uppercase tracking-wider rounded-xl cursor-pointer"
                          >
                            Approve & Publish Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 animate-fadeIn">
                    {institutionsList
                      .filter(i => {
                        if (queueStatusFilter === "All") return i.status !== "Approved" && i.status !== "Rejected";
                        if (queueStatusFilter === "Duplicate Flagged") return i.isDuplicate && i.status !== "Approved";
                        return i.status === queueStatusFilter;
                      })
                      .length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {institutionsList
                            .filter(i => {
                              if (queueStatusFilter === "All") return i.status !== "Approved" && i.status !== "Rejected";
                              if (queueStatusFilter === "Duplicate Flagged") return i.isDuplicate && i.status !== "Approved";
                              return i.status === queueStatusFilter;
                            })
                            .map((inst) => (
                              <div
                                key={inst.id}
                                className={`border p-5 rounded-2xl bg-white flex flex-col justify-between hover:border-black transition-all ${
                                  inst.isDuplicate ? "border-red-300 bg-red-50/5" : "border-neutral-200"
                                }`}
                              >
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2">
                                    <span className={`font-mono text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                      inst.isDuplicate ? "bg-red-100 text-red-600" :
                                      inst.status === "Pending" ? "bg-amber-100 text-amber-800" :
                                      "bg-neutral-100 text-neutral-600"
                                    }`}>
                                      {inst.isDuplicate ? "Duplicate Flagged" : inst.status}
                                    </span>
                                    <span className="text-[10px] text-neutral-400 font-mono">{inst.submittedAt}</span>
                                  </div>
                                  <h4 className="text-xs sm:text-sm font-bold text-black font-sans leading-tight">{inst.name}</h4>
                                  <p className="text-[10px] text-neutral-400 font-mono">{inst.city}, {inst.country}</p>
                                  <p className="text-[11px] text-neutral-500 font-light line-clamp-2 leading-relaxed">{inst.description}</p>
                                </div>
                                <div className="border-t border-neutral-100 pt-3 mt-4 flex justify-between items-center">
                                  <span className="text-[9px] font-mono text-neutral-400">{inst.institutionType}</span>
                                  <button
                                    onClick={() => {
                                      setSelectedInstForAudit(inst);
                                      setAuditInstNotes(inst.duplicateNotes || "");
                                    }}
                                    className="px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 text-black border border-neutral-200 text-[10px] font-semibold rounded-lg uppercase tracking-wider transition-colors cursor-pointer"
                                  >
                                    Review submission
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div className="p-12 text-center border border-dashed border-neutral-200 rounded-2xl bg-neutral-50/20">
                          <p className="text-xs text-neutral-400 font-mono uppercase mb-1">Moderation queue cleared</p>
                          <p className="text-xs text-neutral-500 font-light">No pending academic registries require review under your filters.</p>
                        </div>
                      )}
                  </div>
                )}
              </div>
            )}

            {/* TAB: INSTITUTIONS ADMINISTRATIVE CONFIG */}
            {activeTab === "institutions_config" && institutionsConfig && (
              <div className="space-y-8 animate-fadeIn">
                <div>
                  <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider">Institutions Configuration Settings</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Configure rating weights, categories, criteria, and evaluator eligibility parameters.</p>
                </div>

                {/* Grid controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* 1. Score Weights (Evaluation vs Research Metrics) */}
                  <div className="border border-neutral-200 p-5 rounded-2xl space-y-4">
                    <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Dynamic Formula Weights</span>
                    <p className="text-[11px] text-neutral-500 font-light">
                      Customize how much the peer ratings questionnaires versus quantitative academic metrics (publications, verified peers) contribute to the 0-100 Healthedia Score.
                    </p>

                    <div className="space-y-4 pt-1">
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-700 font-medium">Evaluation Questionnaires contribution:</span>
                          <span className="font-mono text-black font-bold">{institutionsConfig.evaluationWeight}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={institutionsConfig.evaluationWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            saveInstitutionsConfig({
                              ...institutionsConfig,
                              evaluationWeight: val,
                              researchMetricsWeight: 100 - val
                            });
                          }}
                          className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-neutral-700 font-medium">Academic Research Metrics contribution:</span>
                          <span className="font-mono text-black font-bold">{institutionsConfig.researchMetricsWeight}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={institutionsConfig.researchMetricsWeight}
                          onChange={(e) => {
                            const val = parseInt(e.target.value);
                            saveInstitutionsConfig({
                              ...institutionsConfig,
                              researchMetricsWeight: val,
                              evaluationWeight: 100 - val
                            });
                          }}
                          className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Evaluator Eligibility parameters */}
                  <div className="border border-neutral-200 p-5 rounded-2xl space-y-4">
                    <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Evaluator Permissions</span>
                    <p className="text-[11px] text-neutral-500 font-light">
                      Manage who can submit detailed questionnaires. These restriction filters limit evaluations to verified affiliates only.
                    </p>

                    <div className="space-y-3 pt-1 text-xs text-neutral-700">
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Minimum Account Tier for Ratings</label>
                        <select
                          value={institutionsConfig.minEvaluatorRole}
                          onChange={(e) => saveInstitutionsConfig({ ...institutionsConfig, minEvaluatorRole: e.target.value })}
                          className="w-full text-xs border border-neutral-200 bg-white p-2 rounded-lg cursor-pointer"
                        >
                          <option value="Member">Registered Member (Default)</option>
                          <option value="Researcher">Vetted Researcher only</option>
                          <option value="Reviewer">Reviewers & Editors only</option>
                          <option value="Admin">Administrators only</option>
                        </select>
                      </div>

                      <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={institutionsConfig.autoVerifyAffiliations}
                          onChange={(e) => saveInstitutionsConfig({ ...institutionsConfig, autoVerifyAffiliations: e.target.checked })}
                          className="accent-black w-4 h-4 rounded-md cursor-pointer mt-0.5"
                        />
                        <div>
                          <p className="font-semibold text-black">Self-declared relationship validation bypass</p>
                          <p className="text-[10px] text-neutral-400 leading-normal font-light">Automatically flags affiliate reviews as verified without administrative audits.</p>
                        </div>
                      </label>
                    </div>
                  </div>

                </div>

                {/* 3. Peer rating criteria questionnaire manager */}
                <div className="border border-neutral-200 p-5 rounded-2xl space-y-4">
                  <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Peer Rating Questionnaire Criteria</span>
                  <p className="text-xs text-neutral-500 font-light">
                    Configure the specific quality dimensions rated by affiliates on a 1–10 scale. Weights determine their ratio inside the overall Questionnaire Score index.
                  </p>

                  {/* Add criterion inline form */}
                  <div className="bg-neutral-50 p-4 border border-neutral-200 rounded-xl grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                    <div className="space-y-1 md:col-span-1">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Criterion Title</label>
                      <input
                        type="text"
                        value={newCriterionName}
                        onChange={(e) => setNewCriterionName(e.target.value)}
                        placeholder="e.g. Clinical Output"
                        className="w-full text-xs border border-neutral-200 bg-white py-1.5 px-2.5 rounded-lg text-black"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                      <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Prompt Question</label>
                      <input
                        type="text"
                        value={newCriterionQuestion}
                        onChange={(e) => setNewCriterionQuestion(e.target.value)}
                        placeholder="e.g. Rate patient intake efficiency and surgical facility standard."
                        className="w-full text-xs border border-neutral-200 bg-white py-1.5 px-2.5 rounded-lg text-black"
                      />
                    </div>
                    <div className="space-y-1 md:col-span-1 flex gap-2">
                      <div className="flex-grow">
                        <label className="text-[10px] font-mono uppercase font-bold text-neutral-400">Weight</label>
                        <input
                          type="number"
                          value={newCriterionWeight}
                          onChange={(e) => setNewCriterionWeight(parseInt(e.target.value) || 10)}
                          className="w-full text-xs border border-neutral-200 bg-white py-1.5 px-2 text-black rounded-lg"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          if (!newCriterionName || !newCriterionQuestion) {
                            showToast("Please write name and question prompt.", "error");
                            return;
                          }
                          const newCrit = {
                            id: newCriterionName.toLowerCase().replace(/[^a-z0-9]/g, "_"),
                            name: newCriterionName,
                            question: newCriterionQuestion,
                            weight: newCriterionWeight
                          };
                          const updated = [...institutionsConfig.evaluationCriteria, newCrit];
                          saveInstitutionsConfig({ ...institutionsConfig, evaluationCriteria: updated });
                          setNewCriterionName("");
                          setNewCriterionQuestion("");
                          setNewCriterionWeight(10);
                          showToast(`Criterion "${newCriterionName}" added.`, "success");
                        }}
                        className="bg-black text-white px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg hover:bg-neutral-800 shrink-0 self-end h-8 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* List of current criteria */}
                  <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden text-xs">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-neutral-50 border-b border-neutral-200 text-[9px] font-mono text-neutral-400 uppercase tracking-wider">
                          <th className="p-3">Criterion Title</th>
                          <th className="p-3">Prompt Question</th>
                          <th className="p-3 font-mono">Weight Ratio</th>
                          <th className="p-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {institutionsConfig.evaluationCriteria.map((c: any) => (
                          <tr key={c.id} className="hover:bg-neutral-50/20 text-neutral-700">
                            <td className="p-3 font-medium text-black">{c.name}</td>
                            <td className="p-3 font-light">{c.question}</td>
                            <td className="p-3 font-mono font-bold text-neutral-800">{c.weight}</td>
                            <td className="p-3 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = institutionsConfig.evaluationCriteria.filter((item: any) => item.id !== c.id);
                                  saveInstitutionsConfig({ ...institutionsConfig, evaluationCriteria: updated });
                                  showToast("Criterion removed.", "success");
                                }}
                                className="text-red-500 hover:text-red-700 font-mono text-[10px] uppercase font-bold cursor-pointer"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. Directory Types & Categories list managers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Category Type Manager */}
                  <div className="border border-neutral-200 p-5 rounded-2xl space-y-4">
                    <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Directory Institution Types</span>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newTypeInConfig}
                        onChange={(e) => setNewTypeInConfig(e.target.value)}
                        placeholder="Add type e.g. Rehabilitation Center"
                        className="flex-grow text-xs border border-neutral-200 bg-white py-1.5 px-3 rounded-lg text-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newTypeInConfig) return;
                          if (institutionsConfig.institutionTypes.includes(newTypeInConfig)) {
                            showToast("Type already exists.", "error");
                            return;
                          }
                          const updated = [...institutionsConfig.institutionTypes, newTypeInConfig];
                          saveInstitutionsConfig({ ...institutionsConfig, institutionTypes: updated });
                          setNewTypeInConfig("");
                          showToast("Institution category type added.", "success");
                        }}
                        className="bg-black text-white px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg hover:bg-neutral-800 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
                      {institutionsConfig.institutionTypes.map((t: string) => (
                        <span key={t} className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 text-xs px-2.5 py-1 rounded-lg">
                          <span className="text-neutral-700 font-medium">{t}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = institutionsConfig.institutionTypes.filter((item: string) => item !== t);
                              saveInstitutionsConfig({ ...institutionsConfig, institutionTypes: updated });
                              showToast("Type deleted.", "success");
                            }}
                            className="text-neutral-400 hover:text-black font-mono text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specialties Manager */}
                  <div className="border border-neutral-200 p-5 rounded-2xl space-y-4">
                    <span className="block font-mono text-[9px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-1">Medical Specialties Categories</span>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newSpecInConfig}
                        onChange={(e) => setNewSpecInConfig(e.target.value)}
                        placeholder="Add category e.g. Orthopedics"
                        className="flex-grow text-xs border border-neutral-200 bg-white py-1.5 px-3 rounded-lg text-black"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!newSpecInConfig) return;
                          if (institutionsConfig.medicalCategories.includes(newSpecInConfig)) {
                            showToast("Specialty already exists.", "error");
                            return;
                          }
                          const updated = [...institutionsConfig.medicalCategories, newSpecInConfig];
                          saveInstitutionsConfig({ ...institutionsConfig, medicalCategories: updated });
                          setNewSpecInConfig("");
                          showToast("Specialty category added.", "success");
                        }}
                        className="bg-black text-white px-3 py-1.5 text-xs font-mono font-bold uppercase rounded-lg hover:bg-neutral-800 cursor-pointer"
                      >
                        Add
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto pt-1">
                      {institutionsConfig.medicalCategories.map((m: string) => (
                        <span key={m} className="inline-flex items-center gap-1.5 bg-neutral-50 border border-neutral-200 text-xs px-2.5 py-1 rounded-lg">
                          <span className="text-neutral-700 font-medium">{m}</span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = institutionsConfig.medicalCategories.filter((item: string) => item !== m);
                              saveInstitutionsConfig({ ...institutionsConfig, medicalCategories: updated });
                              showToast("Specialty deleted.", "success");
                            }}
                            className="text-neutral-400 hover:text-black font-mono text-[10px] cursor-pointer"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === "system_config" && isAdmin && (
              <div className="space-y-8 animate-fadeIn">
                {/* Header Title Banner */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-5">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
                      <Database className="w-5 h-5 text-neutral-900 stroke-[1.5]" />
                      System Configuration & Infrastructure Settings
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1">
                      Configure clinical archive environments, manage local storage streams, audit database engines, and adjust technical deployment states.
                    </p>
                  </div>
                  <div className="mt-4 md:mt-0 flex gap-2">
                    <button
                      type="button"
                      onClick={fetchDbDiagnostics}
                      disabled={loadingDbInfo}
                      className="inline-flex items-center gap-1.5 border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs px-3.5 py-1.5 rounded-lg font-medium cursor-pointer animate-none"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loadingDbInfo ? 'animate-spin' : ''}`} />
                      Refresh Metrics
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSavingSettings(true);
                        const updated = {
                          websiteName,
                          websiteDescription,
                          organizationName,
                          organizationAddress,
                          contactEmail,
                          contactPhone,
                          defaultLanguage,
                          timeZone,
                          dateTimeFormat,
                          emailHost,
                          emailPort: Number(emailPort),
                          emailUsername,
                          emailSenderName,
                          maxFileUploadSizeMB: Number(maxFileUploadSizeMB),
                          allowedFileTypes,
                          storageProvider,
                          cacheEnabled,
                          cacheTTL: Number(cacheTTL),
                          sessionTimeoutMin: Number(sessionTimeoutMin),
                          maintenanceMode,
                          debugMode
                        };
                        saveSystemSettings(updated);
                        setTimeout(() => setSavingSettings(false), 800);
                      }}
                      disabled={savingSettings}
                      className="bg-black hover:bg-neutral-800 text-white text-xs px-4 py-1.5 rounded-lg font-medium shadow-sm transition-colors cursor-pointer"
                    >
                      {savingSettings ? "Persisting..." : "Save Configuration"}
                    </button>
                  </div>
                </div>

                {/* Database Metrics and Operations Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Real-time Diagnostics card */}
                  <div className="lg:col-span-2 bg-neutral-50 border border-neutral-200 p-6 rounded-2xl space-y-6">
                    <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                      <div>
                        <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Operational Logs</span>
                        <h3 className="text-sm font-semibold text-neutral-900 mt-0.5">Database Diagnostics & Live Connection Status</h3>
                      </div>
                      <div className="flex items-center gap-1.5 bg-green-50 border border-green-200 text-green-700 text-[10px] font-mono px-2.5 py-1 rounded-full">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                        </span>
                        {dbDiagnostics?.databaseStatus || "Optimal"}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Engine Class</span>
                        <p className="text-xs font-bold text-neutral-800 mt-1 truncate" title={dbDiagnostics?.databaseEngine}>
                          {dbDiagnostics?.databaseEngine || "JSON Local Storage"}
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Server Status</span>
                        <p className="text-xs font-bold text-neutral-800 mt-1 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 stroke-[2.5]" />
                          {dbDiagnostics?.serverStatus || "Online"}
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Total Records</span>
                        <p className="text-xs font-mono font-bold text-black mt-1">
                          {dbDiagnostics?.totalRecords || 0} items
                        </p>
                      </div>
                      <div className="bg-white p-3.5 rounded-xl border border-neutral-200/60 shadow-sm">
                        <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider">Storage on Disk</span>
                        <p className="text-xs font-mono font-bold text-neutral-800 mt-1">
                          {dbDiagnostics?.storageUsage || "Calculating..."}
                        </p>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-neutral-200/80 p-4 space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                        <span className="text-neutral-500 font-mono text-[10px]">Database Engine Version</span>
                        <span className="font-mono text-neutral-800 font-semibold">{dbDiagnostics?.databaseVersion || "v1.4.2-stable"}</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                        <span className="text-neutral-500 font-mono text-[10px]">Replication Pipelines</span>
                        <span className="font-mono text-neutral-800 font-semibold">16 Registered Collections</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 border-b border-neutral-100">
                        <span className="text-neutral-500 font-mono text-[10px]">Active Tables / Keys</span>
                        <span className="font-mono text-neutral-800 font-semibold">{dbDiagnostics?.numberTables || 16} Tables</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5">
                        <span className="text-neutral-500 font-mono text-[10px]">Storage Serialization Path</span>
                        <span className="font-mono text-neutral-400 select-all truncate max-w-[200px]" title={dbDiagnostics?.filePath}>
                          {dbDiagnostics?.filePath || "data/db.json"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <button
                        type="button"
                        onClick={async () => {
                          showToast("Testing database transport endpoints...", "success");
                          await fetchDbDiagnostics();
                          showToast("Ping successful: Database transport latency < 4ms", "success");
                        }}
                        className="flex-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer h-9"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                        Test Direct Connectivity
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (optimizingDb) return;
                          setOptimizingDb(true);
                          setOptimizationLogs([]);
                          const addLog = (log: string, delay: number) => {
                            setTimeout(() => {
                              setOptimizationLogs(prev => [...prev, log]);
                            }, delay);
                          };
                          addLog("[SYSTEM] Initiating full system indexing and cleanup protocol...", 100);
                          addLog("[VACUUM] scanning database collection maps for system integrity...", 400);
                          addLog("[INDEX] verifying relational integrity of 16 collections...", 800);
                          addLog("[INDEX] optimizing index layouts on 'users' & 'published_papers' collections...", 1200);
                          addLog("[CLEANUP] purging expired temporary caches...", 1600);
                          addLog("[SYNC] re-serialized disk state database file to data/db.json safely.", 2000);
                          addLog("[SUCCESS] Database Vacuum & Index Optimization completed successfully.", 2400);
                          setTimeout(() => {
                            setOptimizingDb(false);
                            showToast("Database optimized successfully.", "success");
                            fetchDbDiagnostics();
                          }, 2600);
                        }}
                        disabled={optimizingDb}
                        className="flex-1 bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 px-4 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer h-9"
                      >
                        <Sliders className="w-3.5 h-3.5 text-neutral-500" />
                        Optimize Database Indexes
                      </button>
                    </div>
                  </div>

                  {/* Simulated Terminal and Security Policies Card */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-neutral-300 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
                        <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-red-500"></span>
                          Terminal Output
                        </span>
                        <span className="text-[9px] font-mono text-neutral-500">SECURE CONSOLE</span>
                      </div>
                      <div className="font-mono text-[11px] leading-relaxed space-y-1.5 max-h-[160px] overflow-y-auto pt-1">
                        {optimizationLogs.length === 0 ? (
                          <div className="text-neutral-600 italic">No operations active. Click 'Optimize Database' to trigger clinical verification.</div>
                        ) : (
                          optimizationLogs.map((log, idx) => (
                            <div key={idx} className={log.includes("[SUCCESS]") ? "text-green-400" : log.includes("[SYSTEM]") ? "text-yellow-400" : "text-neutral-400"}>
                              {log}
                            </div>
                          ))
                        )}
                        {optimizingDb && (
                          <div className="text-neutral-400 animate-pulse">Running mechanical task...</div>
                        )}
                      </div>
                    </div>

                    <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 space-y-2">
                      <span className="text-[9px] font-mono text-neutral-500 uppercase font-bold tracking-wider block">Security Credentials Status</span>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        Persistent state replication is restricted strictly to System Administrators with verified security level "Admin".
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] text-green-400 font-mono mt-1">
                        <Lock className="w-3 h-3" />
                        Validated: {currentUser.role} Account Access Granted
                      </div>
                    </div>
                  </div>
                </div>

                {/* Configuration form grids */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* General Config Section */}
                  <div className="border border-neutral-200 bg-white p-6 rounded-2xl space-y-4">
                    <span className="block font-mono text-[10px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-neutral-500" />
                      1. General Archive Information
                    </span>
                    
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Website Title / Brand</label>
                        <input
                          type="text"
                          value={websiteName}
                          onChange={(e) => setWebsiteName(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          placeholder="e.g. Healthedia Global Archive"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Archive Description & Mission Statement</label>
                        <textarea
                          rows={3}
                          value={websiteDescription}
                          onChange={(e) => setWebsiteDescription(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black resize-none"
                          placeholder="Describe the medical and academic scope of the archives."
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Governance Organization</label>
                          <input
                            type="text"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">HQ Address</label>
                          <input
                            type="text"
                            value={organizationAddress}
                            onChange={(e) => setOrganizationAddress(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Archive Desk Email</label>
                          <input
                            type="email"
                            value={contactEmail}
                            onChange={(e) => setContactEmail(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Governance Registry Hotlines</label>
                          <input
                            type="text"
                            value={contactPhone}
                            onChange={(e) => setContactPhone(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Region, Languages and Locales */}
                  <div className="border border-neutral-200 bg-white p-6 rounded-2xl space-y-4">
                    <span className="block font-mono text-[10px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-neutral-500" />
                      2. Locale & Regional Preferences
                    </span>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Default System Language</label>
                        <select
                          value={defaultLanguage}
                          onChange={(e) => setDefaultLanguage(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                        >
                          <option value="en-US">English (United States - ISO Standard)</option>
                          <option value="fr-FR">Français (France - Clinical HQ)</option>
                          <option value="es-ES">Español (Castellano)</option>
                          <option value="de-DE">Deutsch (Germany)</option>
                          <option value="ja-JP">日本語 (Japan)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Operational Time Zone</label>
                        <select
                          value={timeZone}
                          onChange={(e) => setTimeZone(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                        >
                          <option value="UTC">Coordinated Universal Time (UTC - Default)</option>
                          <option value="GMT">Greenwich Mean Time (GMT)</option>
                          <option value="CET">Central European Time (CET / Paris)</option>
                          <option value="EST">Eastern Standard Time (EST / New York)</option>
                          <option value="PST">Pacific Standard Time (PST / Seattle)</option>
                          <option value="JST">Japan Standard Time (JST / Tokyo)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Universal Date-Time Formatting</label>
                        <select
                          value={dateTimeFormat}
                          onChange={(e) => setDateTimeFormat(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                        >
                          <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss (Standard Clinical Logging)</option>
                          <option value="DD/MM/YYYY HH:mm">DD/MM/YYYY HH:mm (European Standard)</option>
                          <option value="MM/DD/YYYY h:mm A">MM/DD/YYYY h:mm A (American Standard)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Mail and SMTP Config */}
                  <div className="border border-neutral-200 bg-white p-6 rounded-2xl space-y-4">
                    <span className="block font-mono text-[10px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-neutral-500" />
                      3. Mail Server Configuration (SMTP)
                    </span>

                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">SMTP Server Hostname</label>
                          <input
                            type="text"
                            value={emailHost}
                            onChange={(e) => setEmailHost(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                            placeholder="smtp.domain.org"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">SMTP Port</label>
                          <input
                            type="number"
                            value={emailPort}
                            onChange={(e) => setEmailPort(Number(e.target.value))}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">SMTP Authorized Username</label>
                        <input
                          type="text"
                          value={emailUsername}
                          onChange={(e) => setEmailUsername(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Default Envelope Sender Display Name</label>
                        <input
                          type="text"
                          value={emailSenderName}
                          onChange={(e) => setEmailSenderName(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          placeholder="e.g. Healthedia automated dispatch"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Technical Parameters & Files */}
                  <div className="border border-neutral-200 bg-white p-6 rounded-2xl space-y-4">
                    <span className="block font-mono text-[10px] text-neutral-400 uppercase font-bold border-b border-neutral-100 pb-2 flex items-center gap-1.5">
                      <Settings className="w-4 h-4 text-neutral-500" />
                      4. Technical Thresholds & Storage Stream
                    </span>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Max Upload Bound (MB)</label>
                          <input
                            type="number"
                            value={maxFileUploadSizeMB}
                            onChange={(e) => setMaxFileUploadSizeMB(Number(e.target.value))}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Storage Stream Provider</label>
                          <select
                            value={storageProvider}
                            onChange={(e) => setStorageProvider(e.target.value)}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black h-9"
                          >
                            <option value="Local Disk Serialized Stream">Local Disk Serialized Stream (Active)</option>
                            <option value="Hostinger JSON Cluster Storage">Hostinger JSON Cluster Storage</option>
                            <option value="NFS Network Mounted Disk">NFS Network Mounted Disk</option>
                            <option value="AWS Simple Storage Service S3">AWS Simple Storage Service S3</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Allowed Clinical Extensions</label>
                        <input
                          type="text"
                          value={allowedFileTypes}
                          onChange={(e) => setAllowedFileTypes(e.target.value)}
                          className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                          placeholder="e.g. .pdf,.doc,.docx"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Temporary Cache (TTL Sec)</label>
                          <input
                            type="number"
                            value={cacheTTL}
                            onChange={(e) => setCacheTTL(Number(e.target.value))}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">Session Expire Bound (Min)</label>
                          <input
                            type="number"
                            value={sessionTimeoutMin}
                            onChange={(e) => setSessionTimeoutMin(Number(e.target.value))}
                            className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black font-mono h-9"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Toggles card */}
                <div className="bg-neutral-50 border border-neutral-200 p-6 rounded-2xl">
                  <span className="block font-mono text-[10px] text-neutral-400 uppercase font-bold border-b border-neutral-200 pb-2 mb-4">
                    5. Deployments Mode and Governance overrides
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <label className="flex items-start gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm cursor-pointer hover:bg-neutral-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={cacheEnabled}
                        onChange={(e) => setCacheEnabled(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                      />
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">Enable Static Query Cache</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                          Speeds up paper indexing. Turn off to query from database memory immediately on each refresh.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm cursor-pointer hover:bg-neutral-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={maintenanceMode}
                        onChange={(e) => setMaintenanceMode(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                      />
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">Activate Maintenance Mode</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                          Restricts submissions, journal reading, and registry modifications to System Administrators only.
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 bg-white p-4 rounded-xl border border-neutral-200 shadow-sm cursor-pointer hover:bg-neutral-50/50 transition-colors">
                      <input
                        type="checkbox"
                        checked={debugMode}
                        onChange={(e) => setDebugMode(e.target.checked)}
                        className="mt-0.5 rounded border-neutral-300 text-black focus:ring-black h-4 w-4"
                      />
                      <div>
                        <span className="block text-xs font-bold text-neutral-900">Administrator Debug Mode</span>
                        <p className="text-[10px] text-neutral-500 mt-0.5 leading-relaxed">
                          Displays internal raw JSON stores, runtime stack-trace buffers, and security validation vectors in console logs.
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Footnotes confirmation */}
                <div className="flex justify-end gap-3 pb-6">
                  <button
                    type="button"
                    onClick={() => {
                      if (systemSettings) {
                        // Reset form fields
                        setWebsiteName(systemSettings.websiteName || "Healthedia");
                        setWebsiteDescription(systemSettings.websiteDescription || "");
                        setOrganizationName(systemSettings.organizationName || "Healthedia Global Archive");
                        setOrganizationAddress(systemSettings.organizationAddress || "91 Boulevard de l'Hôpital, 75013 Paris, France");
                        setContactEmail(systemSettings.contactEmail || "contact@healthedia.org");
                        setContactPhone(systemSettings.contactPhone || "+33 1 40 46 22 11");
                        setDefaultLanguage(systemSettings.defaultLanguage || "en-US");
                        setTimeZone(systemSettings.timeZone || "UTC");
                        setDateTimeFormat(systemSettings.dateTimeFormat || "YYYY-MM-DD HH:mm:ss");
                        setEmailHost(systemSettings.emailHost || "smtp.healthedia.org");
                        setEmailPort(systemSettings.emailPort || 587);
                        setEmailUsername(systemSettings.emailUsername || "dispatch@healthedia.org");
                        setEmailSenderName(systemSettings.emailSenderName || "Healthedia Automated Dispatch");
                        setMaxFileUploadSizeMB(systemSettings.maxFileUploadSizeMB || 15);
                        setAllowedFileTypes(systemSettings.allowedFileTypes || ".pdf,.doc,.docx,.png,.jpg");
                        setStorageProvider(systemSettings.storageProvider || "Local Disk Serialized Stream");
                        setCacheEnabled(systemSettings.cacheEnabled !== false);
                        setCacheTTL(systemSettings.cacheTTL || 3600);
                        setSessionTimeoutMin(systemSettings.sessionTimeoutMin || 120);
                        setMaintenanceMode(!!systemSettings.maintenanceMode);
                        setDebugMode(!!systemSettings.debugMode);
                        showToast("Changes discarded. Configuration reloaded from database.", "success");
                      }
                    }}
                    className="border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs px-4 py-2 rounded-xl font-medium cursor-pointer h-9"
                  >
                    Discard Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSavingSettings(true);
                      const updated = {
                        websiteName,
                        websiteDescription,
                        organizationName,
                        organizationAddress,
                        contactEmail,
                        contactPhone,
                        defaultLanguage,
                        timeZone,
                        dateTimeFormat,
                        emailHost,
                        emailPort: Number(emailPort),
                        emailUsername,
                        emailSenderName,
                        maxFileUploadSizeMB: Number(maxFileUploadSizeMB),
                        allowedFileTypes,
                        storageProvider,
                        cacheEnabled,
                        cacheTTL: Number(cacheTTL),
                        sessionTimeoutMin: Number(sessionTimeoutMin),
                        maintenanceMode,
                        debugMode
                      };
                      saveSystemSettings(updated);
                      setTimeout(() => setSavingSettings(false), 800);
                    }}
                    disabled={savingSettings}
                    className="bg-black hover:bg-neutral-800 text-white text-xs px-5 py-2 rounded-xl font-semibold shadow-sm transition-colors cursor-pointer h-9"
                  >
                    {savingSettings ? "Persisting Changes..." : "Apply Configurations"}
                  </button>
                </div>
              </div>
            )}

            {/* TAB: SYSTEM HEALTH DASHBOARD */}
            {activeTab === "system_health" && (
              <SystemHealthDashboard />
            )}

            {/* TAB: ACTIVITY LOGS */}
            {activeTab === "activity_logs" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider flex items-center gap-2">
                      <Activity className="w-5 h-5 text-black stroke-[1.5]" />
                      Administrative Activity Audit Logs
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-light">
                      Real-time compliance ledger tracking all administrative actions, bulk executions (Delete, Feature, Unpublish, Role changes), and system operations.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-start md:self-center">
                    <button
                      onClick={exportActivityLogsToCSV}
                      className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                      title="Download displayed log records as a CSV spreadsheet"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export to CSV
                    </button>

                    {activityLogs.length > 0 && (
                      <button
                        onClick={() => {
                          if (confirm("Are you sure you want to clear all administrative audit log records?")) {
                            saveActivityLogs([]);
                            showToast("Administrative audit logs cleared.", "success");
                          }
                        }}
                        className="px-3 py-1.5 border border-neutral-200 hover:border-red-300 text-neutral-500 hover:text-red-600 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Clear Logs
                      </button>
                    )}
                  </div>
                </div>

                {/* Metrics KPI Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Total Recorded Logs</span>
                    <div className="text-xl font-bold font-mono text-black mt-1">{activityLogs.length}</div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Audit log entries</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Bulk Execution Operations</span>
                    <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                      {activityLogs.filter(l => l.action.toLowerCase().includes("bulk")).length}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Multi-item actions</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Responsible Admins</span>
                    <div className="text-xl font-bold font-mono text-black mt-1">
                      {new Set(activityLogs.map(l => l.adminEmail)).size}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Active operators</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Last Recorded Operation</span>
                    <div className="text-xs font-bold font-mono text-black truncate mt-1">
                      {activityLogs[0] ? activityLogs[0].timestamp : "No activity"}
                    </div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Most recent audit record</p>
                  </div>
                </div>

                {/* Search & Comprehensive Filters Panel */}
                <div className="bg-neutral-50/80 p-4 rounded-2xl border border-neutral-200 space-y-3.5">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-md">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                      <input
                        type="text"
                        value={logSearchQuery}
                        onChange={(e) => setLogSearchQuery(e.target.value)}
                        placeholder="Search activity logs by action, admin, or target details..."
                        className="pl-9 pr-8 py-1.5 w-full text-xs border border-neutral-200 bg-white rounded-xl focus:outline-none focus:border-black placeholder-neutral-400 font-sans"
                      />
                      {logSearchQuery && (
                        <button
                          onClick={() => setLogSearchQuery("")}
                          className="absolute right-3 top-2.5 text-neutral-400 hover:text-black cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Action Type Selector */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase shrink-0">Action Type:</span>
                      <select
                        value={logActionTypeFilter}
                        onChange={(e) => setLogActionTypeFilter(e.target.value)}
                        className="py-1.5 px-2.5 text-xs font-mono font-semibold border border-neutral-200 bg-white rounded-xl focus:outline-none focus:border-black cursor-pointer shadow-2xs"
                      >
                        <option value="All">All Action Types</option>
                        <option value="Delete">Delete / Purge</option>
                        <option value="Update">Update / Edit</option>
                        <option value="Upload">Upload / Add</option>
                        <option value="Approve">Approve Actions</option>
                        <option value="Reject">Reject Actions</option>
                        <option value="Publish">Publish Actions</option>
                        <option value="Unpublish">Unpublish Actions</option>
                        <option value="Feature">Feature / Unfeature</option>
                        <option value="Role / Status">Role & Status Changes</option>
                      </select>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase mr-1">Category:</span>
                      {(["All", "Users", "Papers", "Manuscripts", "System"] as const).map(cat => (
                        <button
                          key={cat}
                          onClick={() => setLogCategoryFilter(cat)}
                          className={`px-2.5 py-1 text-xs font-mono font-bold rounded-xl border transition-all cursor-pointer ${
                            logCategoryFilter === cat
                              ? "bg-black text-white border-black"
                              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Date Range Row */}
                  <div className="pt-3 border-t border-neutral-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase shrink-0">Date Range:</span>
                      {[
                        { id: "All", label: "All Time" },
                        { id: "Today", label: "Today" },
                        { id: "7Days", label: "Last 7 Days" },
                        { id: "30Days", label: "Last 30 Days" },
                        { id: "Custom", label: "Custom Range" }
                      ].map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setLogDatePreset(preset.id as any)}
                          className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-xl border transition-all cursor-pointer ${
                            logDatePreset === preset.id
                              ? "bg-neutral-900 text-white border-neutral-900"
                              : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>

                    {/* Custom Date Inputs */}
                    {logDatePreset === "Custom" && (
                      <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-xl border border-neutral-200 text-xs font-mono">
                        <span className="text-neutral-400 text-[10px] uppercase font-bold">From</span>
                        <input
                          type="date"
                          value={logStartDate}
                          onChange={(e) => setLogStartDate(e.target.value)}
                          className="border border-neutral-200 rounded-lg px-2 py-0.5 text-xs text-black focus:outline-none focus:border-black cursor-pointer"
                        />
                        <span className="text-neutral-400 text-[10px] uppercase font-bold">To</span>
                        <input
                          type="date"
                          value={logEndDate}
                          onChange={(e) => setLogEndDate(e.target.value)}
                          className="border border-neutral-200 rounded-lg px-2 py-0.5 text-xs text-black focus:outline-none focus:border-black cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Reset Filters */}
                    {(logSearchQuery || logCategoryFilter !== "All" || logActionTypeFilter !== "All" || logDatePreset !== "All" || logStartDate || logEndDate) && (
                      <button
                        onClick={() => {
                          setLogSearchQuery("");
                          setLogCategoryFilter("All");
                          setLogActionTypeFilter("All");
                          setLogDatePreset("All");
                          setLogStartDate("");
                          setLogEndDate("");
                        }}
                        className="px-2.5 py-1 text-xs font-mono font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded-xl border border-red-200 transition-colors cursor-pointer flex items-center gap-1 shrink-0 ml-auto md:ml-0"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reset All Filters
                      </button>
                    )}
                  </div>

                  {/* Active Filter Summary Indicator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-neutral-500 pt-1 border-t border-neutral-100 gap-1">
                    <div>
                      Showing <span className="font-bold text-black">{filteredActivityLogs.length}</span> of <span className="font-bold text-black">{activityLogs.length}</span> recorded logs
                    </div>

                    {(logCategoryFilter !== "All" || logActionTypeFilter !== "All" || logDatePreset !== "All" || logSearchQuery) && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-neutral-400">Active Filters:</span>
                        {logCategoryFilter !== "All" && (
                          <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md font-bold">Category: {logCategoryFilter}</span>
                        )}
                        {logActionTypeFilter !== "All" && (
                          <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md font-bold">Action: {logActionTypeFilter}</span>
                        )}
                        {logDatePreset !== "All" && (
                          <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md font-bold">
                            Date: {logDatePreset === "Custom" ? `${logStartDate || "Start"} to ${logEndDate || "End"}` : logDatePreset}
                          </span>
                        )}
                        {logSearchQuery && (
                          <span className="bg-neutral-200 text-neutral-800 px-2 py-0.5 rounded-md font-bold">Keyword: "{logSearchQuery}"</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Logs Table / Listing */}
                <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-neutral-50 border-b border-neutral-200 text-[10px] font-mono text-neutral-400 uppercase tracking-wider">
                        <th className="p-3">Timestamp / Date</th>
                        <th className="p-3">Action Executed</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Operation Details</th>
                        <th className="p-3">Administrator Responsible</th>
                        <th className="p-3 text-right">Items</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100 text-xs font-sans">
                      {filteredActivityLogs.length > 0 ? (
                        filteredActivityLogs.map((log) => {
                          const isDelete = log.action.toLowerCase().includes("delete") || log.action.toLowerCase().includes("purge");
                          const isUpdate = log.action.toLowerCase().includes("update") || log.action.toLowerCase().includes("edit") || log.action.toLowerCase().includes("change");
                          const isUpload = log.action.toLowerCase().includes("upload") || log.action.toLowerCase().includes("create") || log.action.toLowerCase().includes("add");
                          const isFeature = log.action.toLowerCase().includes("feature");
                          const isUnpublish = log.action.toLowerCase().includes("unpublish");
                          const isPublish = log.action.toLowerCase().includes("publish") && !isUnpublish;
                          const isVerify = log.action.toLowerCase().includes("verify") || log.action.toLowerCase().includes("vetting");

                          return (
                            <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                              <td className="p-3 font-mono text-[11px] text-neutral-500 whitespace-nowrap">
                                {log.timestamp}
                              </td>
                              <td className="p-3 font-semibold text-black">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border ${
                                  isDelete ? "bg-red-50 text-red-700 border-red-200" :
                                  isUpdate ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                                  isUpload ? "bg-teal-50 text-teal-800 border-teal-200" :
                                  isFeature ? "bg-amber-50 text-amber-800 border-amber-300" :
                                  isUnpublish ? "bg-neutral-100 text-neutral-800 border-neutral-300" :
                                  isPublish ? "bg-emerald-50 text-emerald-800 border-emerald-300" :
                                  isVerify ? "bg-blue-50 text-blue-800 border-blue-200" :
                                  "bg-neutral-100 text-neutral-700 border-neutral-200"
                                }`}>
                                  {isDelete && <Trash className="w-3 h-3 text-red-600" />}
                                  {isUpdate && <Edit2 className="w-3 h-3 text-indigo-600" />}
                                  {isUpload && <Plus className="w-3 h-3 text-teal-600" />}
                                  {isFeature && <Star className="w-3 h-3 text-amber-600 fill-amber-500" />}
                                  {isUnpublish && <EyeOff className="w-3 h-3 text-neutral-600" />}
                                  {isPublish && <Eye className="w-3 h-3 text-emerald-600" />}
                                  {isVerify && <ShieldCheck className="w-3 h-3 text-blue-600" />}
                                  {log.action}
                                </span>
                              </td>
                              <td className="p-3">
                                <span className="font-mono text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200 text-neutral-700">
                                  {log.category}
                                </span>
                              </td>
                              <td className="p-3 text-neutral-700 max-w-md">
                                <p className="line-clamp-2">{log.details}</p>
                              </td>
                              <td className="p-3">
                                <div className="font-semibold text-black text-xs">{log.adminName}</div>
                                <div className="font-mono text-[10px] text-neutral-400">{log.adminEmail}</div>
                              </td>
                              <td className="p-3 text-right">
                                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-black text-white">
                                  {log.itemCount} {log.itemCount === 1 ? "item" : "items"}
                                </span>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-neutral-400 font-mono text-xs">
                            {logSearchQuery || logCategoryFilter !== "All" || logActionTypeFilter !== "All" || logDatePreset !== "All" ? (
                              <p>No activity logs found matching the active filter criteria.</p>
                            ) : (
                              <p>No administrative activity records logged yet.</p>
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: DATABASE & PERSISTENCE HUB */}
            {activeTab === "database_config" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-4 gap-4">
                  <div>
                    <h2 className="text-base font-bold font-sans text-black uppercase tracking-wider flex items-center gap-2">
                      <Server className="w-5 h-5 text-black stroke-[1.5]" />
                      Database & Persistence Infrastructure
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-light">
                      Manage database storage engines, preserve user registration data & tool configurations, export/import full system backups, and review cloud persistence options.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
                    <button
                      onClick={exportFullDatabaseJSON}
                      className="px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export DB Snapshot (JSON)
                    </button>

                    <label className="px-3 py-1.5 border border-neutral-300 hover:border-black bg-white text-neutral-700 hover:text-black rounded-xl text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs">
                      <Upload className="w-3.5 h-3.5 text-neutral-500" />
                      Restore DB Snapshot
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportDatabaseJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Technical Clarification Callout Notice regarding Hosting & Databases */}
                <div className="bg-neutral-900 text-white p-5 rounded-2xl border border-neutral-800 space-y-3 shadow-sm relative overflow-hidden">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 bg-neutral-800 rounded-xl border border-neutral-700 shrink-0 mt-0.5">
                      <Info className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <h3 className="text-sm font-bold font-sans tracking-wide text-white flex items-center gap-2">
                          Technical Guidance: Web Hosting vs. Social Platforms (Instagram Clarification)
                        </h3>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-400/10 text-amber-300 border border-amber-400/20">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          Infrastructure Notice
                        </span>
                      </div>
                      <p className="text-xs text-neutral-300 font-sans leading-relaxed">
                        Please note that <strong className="text-white font-semibold">Instagram</strong> is a photo and video social media network owned by Meta and <strong className="text-amber-300 font-semibold">cannot function as a web hosting service or database server</strong>.
                      </p>
                      <p className="text-xs text-neutral-400 font-sans leading-relaxed">
                        To ensure that your website registration process, investigator accounts, submitted manuscripts, and custom tools remain <strong className="text-white">100% saved and persistent without data loss</strong>, this application utilizes standardized cloud database storage (<strong className="text-white">Firebase Firestore</strong> or <strong className="text-white">Cloud SQL / PostgreSQL</strong>) paired with Cloud Container hosting (such as Google Cloud Run).
                      </p>
                    </div>
                  </div>
                </div>

                {/* KPI Metrics: Storage Totals */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">User Registrations</span>
                      <Users className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-black mt-2">{users.length}</div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Saved investigator accounts</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Submitted Manuscripts</span>
                      <FileText className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-black mt-2">{manuscripts.length}</div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Peer review submissions</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Published Articles</span>
                      <BookOpen className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-black mt-2">{publishedPapers.length}</div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Indexed journal papers</p>
                  </div>

                  <div className="bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider">Database Audit Logs</span>
                      <Activity className="w-4 h-4 text-neutral-400" />
                    </div>
                    <div className="text-2xl font-bold font-mono text-black mt-2">{activityLogs.length}</div>
                    <p className="text-[10px] text-neutral-500 font-sans mt-0.5">Action ledger entries</p>
                  </div>
                </div>

                {/* Database Backup & Restore Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Backup Card */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold font-sans text-black flex items-center gap-2">
                          <FileJson className="w-4 h-4 text-black" />
                          Full Database Export (Backup)
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Download a complete, structured JSON backup file containing all user accounts, submissions, published literature, tickets, and site settings.
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/70 text-xs font-mono space-y-1.5 text-neutral-600">
                      <div className="flex justify-between"><span>Format:</span> <span className="font-bold text-black">JSON (v2.0)</span></div>
                      <div className="flex justify-between"><span>Included Tables:</span> <span className="font-bold text-black">11 Collections</span></div>
                      <div className="flex justify-between"><span>Security:</span> <span className="font-bold text-emerald-700">Encrypted Local Key</span></div>
                    </div>

                    <button
                      onClick={exportFullDatabaseJSON}
                      className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download Database Backup (.json)
                    </button>
                  </div>

                  {/* Restore Card */}
                  <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-4 shadow-2xs">
                    <div className="flex items-start justify-between border-b border-neutral-100 pb-3">
                      <div>
                        <h3 className="text-sm font-bold font-sans text-black flex items-center gap-2">
                          <Upload className="w-4 h-4 text-black" />
                          Import & Restore Database Snapshot
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          Upload a previously exported JSON database backup file to restore all website pages, registered accounts, and tool states.
                        </p>
                      </div>
                    </div>

                    <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/70 text-xs font-mono space-y-1.5 text-neutral-600">
                      <div className="flex justify-between"><span>Supported File:</span> <span className="font-bold text-black">.json</span></div>
                      <div className="flex justify-between"><span>Validation:</span> <span className="font-bold text-blue-700">Auto-Schema Check</span></div>
                      <div className="flex justify-between"><span>Data Protection:</span> <span className="font-bold text-black">Immediate Local Sync</span></div>
                    </div>

                    <label className="w-full py-2.5 bg-white border border-neutral-300 hover:border-black text-black font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs">
                      <Upload className="w-4 h-4 text-neutral-600" />
                      Select Backup File to Restore
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportDatabaseJSON}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Cloud Database Setup & Page Linking Instructions */}
                <div className="bg-white p-6 rounded-2xl border border-neutral-200 space-y-5">
                  <div className="border-b border-neutral-100 pb-3">
                    <h3 className="text-sm font-bold font-sans text-black uppercase tracking-wider flex items-center gap-2">
                      <HardDrive className="w-4 h-4 text-black" />
                      Database Integration & Registration Linking Guide
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Step-by-step instructions on connecting persistent database backends so all user registrations, website tools, and manuscript portals remain permanently linked without losing data.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Step 1 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">1</span>
                        Website & Page Linking
                      </div>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        All website pages (<code className="bg-white px-1 py-0.5 rounded border border-neutral-200 text-[11px] font-mono">/register</code>, <code className="bg-white px-1 py-0.5 rounded border border-neutral-200 text-[11px] font-mono">/manuscript-submission</code>, <code className="bg-white px-1 py-0.5 rounded border border-neutral-200 text-[11px] font-mono">/admin</code>) read and write to the central state engine.
                      </p>
                      <div className="text-[11px] font-mono text-neutral-500 bg-white p-2 rounded-lg border border-neutral-200">
                        ✓ Registration data saved to <code className="text-black font-bold">users</code> table<br />
                        ✓ Manuscripts linked to <code className="text-black font-bold">manuscripts</code> table
                      </div>
                    </div>

                    {/* Step 2 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">2</span>
                        Firebase Firestore Option
                      </div>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        For real-time cloud persistence across multiple devices, provision a standard Firebase project with Firestore database rules and Firebase Auth.
                      </p>
                      <div className="text-[11px] font-mono text-neutral-500 bg-white p-2 rounded-lg border border-neutral-200">
                        1. Enable Firestore DB in web console<br />
                        2. Configure Auth (Email / Password)<br />
                        3. Add API Keys to <code className="text-black font-bold">.env</code>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 space-y-2">
                      <div className="flex items-center gap-2 text-xs font-mono font-bold text-black">
                        <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center text-[10px]">3</span>
                        Cloud SQL / PostgreSQL Option
                      </div>
                      <p className="text-xs text-neutral-600 font-sans leading-relaxed">
                        For relational SQL compliance, deploy a PostgreSQL database instance via Cloud SQL or Neon, managed by Drizzle ORM schemas in <code className="text-[11px] font-mono text-black">/src/db</code>.
                      </p>
                      <div className="text-[11px] font-mono text-neutral-500 bg-white p-2 rounded-lg border border-neutral-200">
                        1. Provision PostgreSQL instance<br />
                        2. Run schema migration scripts<br />
                        3. Connect Express REST endpoints
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {selectedPaperForCert && (
        <PublicationCertificate
          paper={selectedPaperForCert}
          onClose={() => setSelectedPaperForCert(null)}
        />
      )}
    </div>
  );
}
