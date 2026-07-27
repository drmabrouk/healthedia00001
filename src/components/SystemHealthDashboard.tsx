import React, { useState, useEffect } from "react";
import {
  Activity, Database, Cpu, Mail, Search, RefreshCw, AlertTriangle,
  CheckCircle, Play, Heart, AlertOctagon, HelpCircle, FileText,
  Clock, ShieldAlert, Check, X, RotateCcw, Flame, Sliders
} from "lucide-react";
import { getStoredItem, setStoredItem } from "../lib/taxonomyStore";

interface ServiceStatus {
  status: "operational" | "degraded" | "outage" | "maintenance";
  latencyMs: number;
  uptimePercent: number;
  lastChecked: string;
  incidentsCount: number;
  details: string;
  history: ("operational" | "degraded" | "outage" | "maintenance")[];
}

interface SystemStatus {
  database: ServiceStatus;
  api: ServiceStatus;
  emailQueue: ServiceStatus;
  searchIndex: ServiceStatus;
  lastUpdated: string;
  overallStatus: "healthy" | "unstable" | "critical" | "maintenance";
}

const DEFAULT_HISTORY = () => Array(20).fill("operational") as ("operational" | "degraded" | "outage" | "maintenance")[];

const INITIAL_HEALTH_DATA = (): SystemStatus => {
  const now = new Date().toISOString();
  return {
    database: {
      status: "operational",
      latencyMs: 4,
      uptimePercent: 99.99,
      lastChecked: now,
      incidentsCount: 0,
      details: "Clinical storage stream replica running. Synced with local filesystem (atomic write enabled).",
      history: DEFAULT_HISTORY()
    },
    api: {
      status: "operational",
      latencyMs: 18,
      uptimePercent: 99.95,
      lastChecked: now,
      incidentsCount: 1,
      details: "Vite developer-proxy integration active on port 3000. All routes healthy.",
      history: DEFAULT_HISTORY().map((h, i) => i === 12 ? "degraded" : h)
    },
    emailQueue: {
      status: "operational",
      latencyMs: 42,
      uptimePercent: 99.8,
      lastChecked: now,
      incidentsCount: 0,
      details: "SMTP relay host connected. Outbound paper approvals and credential notifications sending instantly.",
      history: DEFAULT_HISTORY()
    },
    searchIndex: {
      status: "operational",
      latencyMs: 12,
      uptimePercent: 99.9,
      lastChecked: now,
      incidentsCount: 0,
      details: "In-memory trie indexes synced for 16 taxonomy collections. Standard lookup latency < 15ms.",
      history: DEFAULT_HISTORY()
    },
    lastUpdated: now,
    overallStatus: "healthy"
  };
};

export default function SystemHealthDashboard() {
  const [systemData, setSystemData] = useState<SystemStatus>(INITIAL_HEALTH_DATA());
  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState("");
  const [selectedService, setSelectedService] = useState<"database" | "api" | "emailQueue" | "searchIndex" | null>(null);
  
  // Custom Edit State for selected service overrides
  const [editDetails, setEditDetails] = useState("");
  const [editStatus, setEditStatus] = useState<"operational" | "degraded" | "outage" | "maintenance">("operational");
  const [editLatency, setEditLatency] = useState(10);
  const [editUptime, setEditUptime] = useState(99.9);

  // System Logs history
  const [incidentLogs, setIncidentLogs] = useState<Array<{ timestamp: string; service: string; message: string; type: "info" | "warn" | "error" | "success" }>>([]);

  // Load from local storage on mount
  useEffect(() => {
    const stored = getStoredItem<SystemStatus>("healthedia_system_status", INITIAL_HEALTH_DATA());
    
    // Ensure all services have history
    const sanitized = { ...stored };
    if (!sanitized.database.history) sanitized.database.history = DEFAULT_HISTORY();
    if (!sanitized.api.history) sanitized.api.history = DEFAULT_HISTORY().map((h, i) => i === 12 ? "degraded" : h);
    if (!sanitized.emailQueue.history) sanitized.emailQueue.history = DEFAULT_HISTORY();
    if (!sanitized.searchIndex.history) sanitized.searchIndex.history = DEFAULT_HISTORY();

    setSystemData(sanitized);

    // Initial log
    setIncidentLogs([
      {
        timestamp: new Date().toLocaleTimeString(),
        service: "System Health Monitor",
        message: "Diagnostics framework loaded. Ready to stream real-time operational status.",
        type: "info"
      }
    ]);
  }, []);

  const saveToStorage = (updated: SystemStatus) => {
    setSystemData(updated);
    setStoredItem("healthedia_system_status", updated);
  };

  // Recalculate overall status based on service statuses
  const computeOverallStatus = (data: SystemStatus): "healthy" | "unstable" | "critical" | "maintenance" => {
    const statuses = [data.database.status, data.api.status, data.emailQueue.status, data.searchIndex.status];
    if (statuses.includes("outage")) return "critical";
    if (statuses.includes("degraded")) return "unstable";
    if (statuses.includes("maintenance")) return "maintenance";
    return "healthy";
  };

  // Run full systems mock diagnostics scan
  const runDiagnosticsScan = () => {
    if (scanning) return;
    setScanning(true);
    setScanStep("Initiating complete clinical systems audit...");

    const logInfo = (message: string, type: "info" | "warn" | "error" | "success" = "info", svc = "Diagnostics") => {
      setIncidentLogs(prev => [
        { timestamp: new Date().toLocaleTimeString(), service: svc, message, type },
        ...prev
      ]);
    };

    setTimeout(() => {
      setScanStep("Testing database transaction pool connection latency...");
      logInfo("Scanning PostgreSQL & Local JSON atomic serialize buffers...", "info", "Database");
    }, 600);

    setTimeout(() => {
      setScanStep("Pinging Node.js Vite server router and middleware channels...");
      logInfo("API Gateway routing mappings verified. 24 active REST handlers loaded.", "success", "API Gateway");
    }, 1400);

    setTimeout(() => {
      setScanStep("Verifying SMTP envelope handshakes and queue capacity...");
      logInfo("SMTP host 'smtp.healthedia.org' accepted authorization keys.", "success", "Email SMTP");
    }, 2200);

    setTimeout(() => {
      setScanStep("Hashing taxonomy trees and optimizing in-memory index queries...");
      logInfo("16 taxonomy collections re-indexed. 412 manuscript files indexed.", "success", "Search Index");
    }, 3000);

    setTimeout(() => {
      // Complete scan and fluctuate metrics realistically
      const now = new Date().toISOString();
      const updated = { ...systemData };

      // Fluctuate latency slightly but keep status if within reason
      const fluctuate = (val: number, min: number, max: number) => {
        const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
        return Math.max(min, Math.min(max, val + change));
      };

      if (updated.database.status === "operational") updated.database.latencyMs = fluctuate(updated.database.latencyMs, 2, 8);
      if (updated.api.status === "operational") updated.api.latencyMs = fluctuate(updated.api.latencyMs, 10, 25);
      if (updated.emailQueue.status === "operational") updated.emailQueue.latencyMs = fluctuate(updated.emailQueue.latencyMs, 30, 55);
      if (updated.searchIndex.status === "operational") updated.searchIndex.latencyMs = fluctuate(updated.searchIndex.latencyMs, 8, 16);

      updated.database.lastChecked = now;
      updated.api.lastChecked = now;
      updated.emailQueue.lastChecked = now;
      updated.searchIndex.lastChecked = now;
      updated.lastUpdated = now;

      // Rotate histories by shifting left and adding current status at end
      const shiftHistory = (hist: ("operational" | "degraded" | "outage" | "maintenance")[], current: "operational" | "degraded" | "outage" | "maintenance") => {
        const newHist = [...hist];
        newHist.shift();
        newHist.push(current);
        return newHist;
      };

      updated.database.history = shiftHistory(updated.database.history || DEFAULT_HISTORY(), updated.database.status);
      updated.api.history = shiftHistory(updated.api.history || DEFAULT_HISTORY(), updated.api.status);
      updated.emailQueue.history = shiftHistory(updated.emailQueue.history || DEFAULT_HISTORY(), updated.emailQueue.status);
      updated.searchIndex.history = shiftHistory(updated.searchIndex.history || DEFAULT_HISTORY(), updated.searchIndex.status);

      updated.overallStatus = computeOverallStatus(updated);

      saveToStorage(updated);
      setScanning(false);
      setScanStep("");
      logInfo("System diagnostics completed successfully. All metrics synchronized.", "success", "System Monitor");
    }, 3800);
  };

  // Quick action: Restore all systems to optimal
  const restoreAllSystems = () => {
    const optimal = INITIAL_HEALTH_DATA();
    saveToStorage(optimal);
    setIncidentLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        service: "Global Override",
        message: "Manually forced and restored all clinical systems to Operational.",
        type: "success"
      },
      ...prev
    ]);
  };

  // Apply service modification override
  const handleApplyOverride = () => {
    if (!selectedService) return;

    const updated = { ...systemData };
    const svc = updated[selectedService];
    
    // Log change
    let logType: "info" | "warn" | "error" | "success" = "info";
    if (editStatus === "degraded") logType = "warn";
    if (editStatus === "outage") logType = "error";
    if (editStatus === "operational") logType = "success";

    setIncidentLogs(prev => [
      {
        timestamp: new Date().toLocaleTimeString(),
        service: selectedService.toUpperCase(),
        message: `Admin modified status to ${editStatus.toUpperCase()}. Latency: ${editLatency}ms. Details: "${editDetails}"`,
        type: logType
      },
      ...prev
    ]);

    svc.status = editStatus;
    svc.latencyMs = editLatency;
    svc.uptimePercent = editUptime;
    svc.details = editDetails;
    if (editStatus !== "operational") {
      svc.incidentsCount += 1;
    }

    // Update history square
    const newHist = [...(svc.history || DEFAULT_HISTORY())];
    newHist[newHist.length - 1] = editStatus;
    svc.history = newHist;

    updated.lastUpdated = new Date().toISOString();
    updated.overallStatus = computeOverallStatus(updated);

    saveToStorage(updated);
    setSelectedService(null);
  };

  const getStatusConfig = (status: "operational" | "degraded" | "outage" | "maintenance") => {
    switch (status) {
      case "operational":
        return {
          bg: "bg-green-500",
          text: "text-green-600",
          border: "border-green-200",
          badgeBg: "bg-green-50 text-green-700 border-green-200",
          label: "Operational",
          pulse: "bg-green-400"
        };
      case "degraded":
        return {
          bg: "bg-amber-500",
          text: "text-amber-600",
          border: "border-amber-200",
          badgeBg: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Degraded Performance",
          pulse: "bg-amber-400"
        };
      case "outage":
        return {
          bg: "bg-rose-500",
          text: "text-rose-600",
          border: "border-rose-200",
          badgeBg: "bg-rose-50 text-rose-700 border-rose-200",
          label: "Major Outage",
          pulse: "bg-rose-400"
        };
      case "maintenance":
        return {
          bg: "bg-sky-500",
          text: "text-sky-600",
          border: "border-sky-200",
          badgeBg: "bg-sky-50 text-sky-700 border-sky-200",
          label: "Maintenance Mode",
          pulse: "bg-sky-400"
        };
    }
  };

  const getOverallStatusConfig = (status: "healthy" | "unstable" | "critical" | "maintenance") => {
    switch (status) {
      case "healthy":
        return {
          bannerBg: "bg-gradient-to-r from-green-50/40 via-white to-green-50/20",
          border: "border-green-100",
          badge: "bg-green-100 text-green-800 border-green-200",
          glowingLight: "bg-green-500 shadow-green-500/20",
          headline: "All Clinical Systems Fully Operational",
          desc: "Real-time query engines, in-memory taxonomy search grids, and automated SMTP dispatch pipelines are operating within standard performance margins."
        };
      case "unstable":
        return {
          bannerBg: "bg-gradient-to-r from-amber-50/40 via-white to-amber-50/20",
          border: "border-amber-100",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          glowingLight: "bg-amber-500 shadow-amber-500/20",
          headline: "Minor Performance Disruption Detected",
          desc: "One or more medical repository layers are reporting elevated response delays. System failovers and automated error retries are active."
        };
      case "critical":
        return {
          bannerBg: "bg-gradient-to-r from-rose-50/40 via-white to-rose-50/20",
          border: "border-rose-100",
          badge: "bg-rose-100 text-rose-800 border-rose-200",
          glowingLight: "bg-rose-500 shadow-rose-500/20",
          headline: "Critical Infrastructure Outage",
          desc: "Major systemic failure preventing crucial manuscript processing or administrative lookups. System engineers have been notified automatically."
        };
      case "maintenance":
        return {
          bannerBg: "bg-gradient-to-r from-sky-50/40 via-white to-sky-50/20",
          border: "border-sky-100",
          badge: "bg-sky-100 text-sky-800 border-sky-200",
          glowingLight: "bg-sky-500 shadow-sky-500/20",
          headline: "Scheduled Maintenance Mode Active",
          desc: "Administrative portal is currently locked down for atomic indexing replication and directory schema upgrades."
        };
    }
  };

  const overall = getOverallStatusConfig(systemData.overallStatus);

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-100 pb-5">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-neutral-900 stroke-[1.5] animate-pulse" />
            System Health & Operational Status
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Monitor real-time status-lights for the Healthedia database connectivity, API pipelines, automated mail queue, and search index caches.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={restoreAllSystems}
            className="inline-flex items-center gap-1.5 border border-neutral-200 text-neutral-700 bg-white hover:bg-neutral-50 text-xs px-3.5 py-1.5 rounded-lg font-medium cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            Restore Defaults
          </button>
          <button
            type="button"
            onClick={runDiagnosticsScan}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white text-xs px-4 py-1.5 rounded-lg font-medium shadow-xs cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? "Scanning System..." : "Run Diagnostic Scan"}
          </button>
        </div>
      </div>

      {/* Scanning status loading state */}
      {scanning && (
        <div className="bg-neutral-50 border border-neutral-200/80 p-5 rounded-2xl flex items-center gap-4 animate-pulse">
          <div className="relative flex h-5 w-5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-30"></span>
            <span className="relative inline-flex rounded-full h-5 w-5 bg-black items-center justify-center">
              <RefreshCw className="w-3 h-3 text-white animate-spin" />
            </span>
          </div>
          <div>
            <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Live System Scan Active</h4>
            <p className="text-xs text-neutral-500 mt-0.5">{scanStep}</p>
          </div>
        </div>
      )}

      {/* Main Status Light Banner */}
      <div className={`border p-6 rounded-2xl transition-all duration-300 ${overall.border} ${overall.bannerBg}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            {/* Status pulsing indicator */}
            <div className="relative flex h-5 w-5 mt-1 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${overall.glowingLight}`}></span>
              <span className={`relative inline-flex rounded-full h-5 w-5 border border-white/40 ${overall.glowingLight}`}></span>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-neutral-900 tracking-tight">
                  {overall.headline}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 border rounded-full font-bold uppercase ${overall.badge}`}>
                  System: {systemData.overallStatus}
                </span>
              </div>
              <p className="text-xs text-neutral-600 font-light leading-relaxed max-w-4xl">
                {overall.desc}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white/60 p-3.5 rounded-xl border border-neutral-100 shadow-xs">
            <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider block">Diagnostics Sync</span>
            <span className="text-xs font-mono font-bold text-neutral-800 flex items-center gap-1.5 mt-0.5 sm:justify-end">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              {new Date(systemData.lastUpdated).toLocaleTimeString()}
            </span>
          </div>
        </div>
      </div>

      {/* Status Lights Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Service Card: Database */}
        {renderServiceCard(
          "database",
          "Clinical Store (JSON Database)",
          Database,
          systemData.database
        )}

        {/* Service Card: API Gateway */}
        {renderServiceCard(
          "api",
          "System API Gateway",
          Cpu,
          systemData.api
        )}

        {/* Service Card: Email Queue */}
        {renderServiceCard(
          "emailQueue",
          "Automated Email Dispatcher",
          Mail,
          systemData.emailQueue
        )}

        {/* Service Card: Search Indexes */}
        {renderServiceCard(
          "searchIndex",
          "Taxonomy Search Indexes",
          Search,
          systemData.searchIndex
        )}

      </div>

      {/* Admin Override Settings Drawer / Modal if selected */}
      {selectedService && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white border border-neutral-200 p-6 sm:p-8 max-w-lg w-full rounded-2xl shadow-2xl space-y-5 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Operational Tuning</span>
                <h3 className="text-sm font-bold text-neutral-900 mt-0.5">
                  Tweak Status Override: <span className="font-mono bg-neutral-100 px-1.5 py-0.5 rounded text-black text-xs uppercase">{selectedService}</span>
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 rounded-lg border border-neutral-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Status lights selector */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-2">Simulate System State</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["operational", "degraded", "outage", "maintenance"] as const).map((st) => {
                    const active = editStatus === st;
                    const conf = getStatusConfig(st);
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setEditStatus(st);
                          if (st === "operational") {
                            setEditLatency(selectedService === "database" ? 4 : selectedService === "api" ? 18 : selectedService === "emailQueue" ? 42 : 12);
                          } else if (st === "degraded") {
                            setEditLatency(selectedService === "database" ? 45 : selectedService === "api" ? 280 : selectedService === "emailQueue" ? 850 : 190);
                          } else if (st === "outage") {
                            setEditLatency(0);
                          } else {
                            setEditLatency(1);
                          }
                        }}
                        className={`p-3 border rounded-xl flex items-center gap-2.5 transition-all text-xs font-semibold cursor-pointer ${
                          active
                            ? "border-black bg-neutral-50/50 shadow-xs"
                            : "border-neutral-200 bg-white hover:border-neutral-300"
                        }`}
                      >
                        <span className={`h-3 w-3 rounded-full shrink-0 ${conf.bg}`}></span>
                        {conf.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Slider metrics for latency */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Connection Latency: <span className="font-mono text-black font-bold">{editLatency === 0 ? "Offline" : `${editLatency}ms`}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="5"
                    value={editLatency}
                    onChange={(e) => setEditLatency(Number(e.target.value))}
                    disabled={editStatus === "outage"}
                    className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                    <span>Fast (&lt;10ms)</span>
                    <span>Slow (1000ms)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1.5">
                    Target Uptime: <span className="font-mono text-black font-bold">{editUptime.toFixed(2)}%</span>
                  </label>
                  <input
                    type="range"
                    min="90"
                    max="100"
                    step="0.01"
                    value={editUptime}
                    onChange={(e) => setEditUptime(Number(e.target.value))}
                    className="w-full h-1.5 bg-neutral-100 rounded-lg appearance-none cursor-pointer accent-black"
                  />
                  <div className="flex justify-between text-[10px] text-neutral-400 font-mono mt-1">
                    <span>90.0%</span>
                    <span>100.0%</span>
                  </div>
                </div>
              </div>

              {/* Status Details Details */}
              <div>
                <label className="block text-[11px] font-semibold text-neutral-700 uppercase tracking-wider mb-1">State Log / Diagnostic Notes</label>
                <textarea
                  rows={3}
                  value={editDetails}
                  onChange={(e) => setEditDetails(e.target.value)}
                  className="w-full text-xs border border-neutral-200 bg-white py-2 px-3 rounded-lg text-black focus:outline-none focus:border-black resize-none"
                  placeholder="Provide clinical details regarding this status event..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3.5 border-t border-neutral-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs px-4 py-2 rounded-xl font-medium cursor-pointer"
              >
                Discard Override
              </button>
              <button
                type="button"
                onClick={handleApplyOverride}
                className="bg-black hover:bg-neutral-800 text-white text-xs px-4 py-2 rounded-xl font-semibold shadow-sm transition-colors cursor-pointer"
              >
                Apply State Override
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical logs and troubleshooting suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Terminal Logs list */}
        <div className="lg:col-span-2 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 text-neutral-300 flex flex-col justify-between min-h-[300px]">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Diagnostics Console Logs
              </span>
              <span className="text-[9px] font-mono text-neutral-500">LIVE STREAMS</span>
            </div>
            
            <div className="font-mono text-[11px] leading-relaxed space-y-1.5 max-h-[190px] overflow-y-auto pt-1 pr-1">
              {incidentLogs.length === 0 ? (
                <div className="text-neutral-600 italic">Console initialized. Ready for operations...</div>
              ) : (
                incidentLogs.map((log, idx) => {
                  let textClass = "text-neutral-400";
                  if (log.type === "warn") textClass = "text-amber-400 font-semibold";
                  if (log.type === "error") textClass = "text-rose-400 font-semibold";
                  if (log.type === "success") textClass = "text-emerald-400";
                  
                  return (
                    <div key={idx} className="flex items-start gap-2 border-b border-neutral-900 pb-1 last:border-0">
                      <span className="text-neutral-600 shrink-0 select-none">[{log.timestamp}]</span>
                      <span className="text-neutral-500 font-bold shrink-0 select-none uppercase tracking-wide">[{log.service}]:</span>
                      <span className={textClass}>{log.message}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="border-t border-neutral-900 pt-3 mt-4 flex items-center justify-between">
            <span className="text-[10px] text-neutral-500 font-mono">Telemetry Buffers: Active</span>
            <button
              onClick={() => {
                setIncidentLogs([
                  {
                    timestamp: new Date().toLocaleTimeString(),
                    service: "Console",
                    message: "Telemetry streams purged by administrator.",
                    type: "info"
                  }
                ]);
              }}
              className="text-[10px] font-mono text-neutral-400 hover:text-white underline cursor-pointer"
            >
              Clear Buffer Logs
            </button>
          </div>
        </div>

        {/* Informative Incident / Recovery Procedures Cards */}
        <div className="border border-neutral-200 bg-white p-6 rounded-2xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-neutral-100 pb-2.5">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">System Recovery</span>
              <h3 className="text-xs font-bold text-neutral-900 mt-0.5">Automated Clinical Failover Guidelines</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex gap-2.5">
                <div className="p-1.5 bg-neutral-100 rounded text-neutral-800 shrink-0">
                  <ShieldAlert className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">Database Degraded Override</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed font-light">
                    If connection latency exceeds 150ms, static cache engines automatically bypass database queries to protect patient metadata integrity.
                  </p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div className="p-1.5 bg-neutral-100 rounded text-neutral-800 shrink-0">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="font-semibold text-neutral-900">SMTP Relay Blockages</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-relaxed font-light">
                    Bounces or timeout events force outbound approvals into a local disk retry buffer, preventing double-mailing or delivery failures.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 bg-neutral-50 border border-neutral-200/50 p-3 rounded-xl flex items-center justify-between">
            <span className="text-[10px] font-mono text-neutral-500">Alert Registry Status:</span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full font-semibold">
              <Check className="w-3 h-3" /> Offline Backup Synced
            </span>
          </div>
        </div>

      </div>

    </div>
  );

  // Reusable sub-component renderer for Service Cards
  function renderServiceCard(
    key: "database" | "api" | "emailQueue" | "searchIndex",
    title: string,
    Icon: React.ComponentType<{ className?: string }>,
    service: ServiceStatus
  ) {
    const conf = getStatusConfig(service.status);
    
    return (
      <div className="border border-neutral-200 bg-white rounded-2xl p-5 hover:border-neutral-300 hover:shadow-xs transition-all duration-200 flex flex-col justify-between">
        <div className="space-y-4">
          
          {/* Card Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-neutral-50 border border-neutral-200/80 rounded-xl text-neutral-700">
                <Icon className="w-4 h-4 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-900">{title}</h3>
                <span className="text-[10px] font-mono text-neutral-400 block mt-0.5 uppercase">
                  Uptime: <strong className="text-neutral-800 font-bold">{service.uptimePercent}%</strong>
                </span>
              </div>
            </div>

            {/* Glowing status light */}
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono border px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${conf.badgeBg}`}>
                {conf.label}
              </span>
              <div className="relative flex h-3 w-3 shrink-0">
                {service.status !== "maintenance" && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${conf.pulse}`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 border border-white/25 ${conf.bg}`}></span>
              </div>
            </div>
          </div>

          {/* Details / Logs info */}
          <p className="text-[11px] text-neutral-500 leading-relaxed font-light min-h-[44px]">
            {service.details}
          </p>

          {/* Historical Status Light Grid (20 Days) */}
          <div className="space-y-1.5 bg-neutral-50/50 border border-neutral-150 p-3 rounded-xl">
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-400">
              <span>Historical Uptime (Last 20 Days)</span>
              <span>Today</span>
            </div>
            
            <div className="flex items-center gap-1.5 justify-between pt-0.5">
              {(service.history || DEFAULT_HISTORY()).map((histStatus, index) => {
                const dayConf = getStatusConfig(histStatus);
                return (
                  <div
                    key={index}
                    className={`h-4 flex-1 rounded-[3px] border border-white/20 transition-all ${dayConf.bg}`}
                    title={`Day -${19 - index}: ${dayConf.label}`}
                  />
                );
              })}
            </div>
          </div>

          {/* Latency and Incident stats */}
          <div className="grid grid-cols-2 gap-4 text-xs font-mono border-t border-neutral-100 pt-3">
            <div>
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Connection Latency</span>
              <span className="font-bold text-neutral-800 text-xs mt-0.5 block">
                {service.status === "outage" ? (
                  <span className="text-rose-600 font-extrabold uppercase">Offline</span>
                ) : (
                  `${service.latencyMs} ms`
                )}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-neutral-400 uppercase tracking-wider block">Incidents Logged</span>
              <span className="font-bold text-neutral-800 text-xs mt-0.5 block">
                {service.incidentsCount} events
              </span>
            </div>
          </div>

        </div>

        {/* Administrator Override trigger button */}
        <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setEditStatus(service.status);
              setEditLatency(service.latencyMs);
              setEditUptime(service.uptimePercent);
              setEditDetails(service.details);
              setSelectedService(key);
            }}
            className="inline-flex items-center gap-1 text-[11px] text-neutral-700 hover:text-black font-semibold bg-neutral-50 hover:bg-neutral-100 border border-neutral-200/60 rounded-lg px-2.5 py-1 transition-colors cursor-pointer"
          >
            <Sliders className="w-3 h-3 text-neutral-500" />
            Override State
          </button>
        </div>
      </div>
    );
  }
}
