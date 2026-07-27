import React, { useState } from "react";
import { ShieldCheck, Mail, Lock, User, Globe, Building, AlertCircle, ShieldAlert, Eye, EyeOff } from "lucide-react";
import { UserProfileData, UserRole } from "../types";
import { getStoredItem, setStoredItem, initializeTaxonomyStore, DEFAULT_PROFESSIONS, DEMO_USERS } from "../lib/taxonomyStore";
import { motion, AnimatePresence } from "motion/react";

const DEFAULT_RECOVERY_TEMPLATE = `Subject: [Healthedia] Security Verification Request: Password Recovery

Dear Investigator,

A secure password recovery operation has been requested for your registered Healthedia Investigator account ({{EMAIL}}).

Your 6-digit confirmation OTP code is:
{{OTP}}

This security verification pin remains active for exactly {{EXPIRY}}. If you did not initiate this request, please log in immediately to review your active terminal sessions, or contact our security desk at security@healthedia.org.

Warm regards,
Healthedia Governance Council`;

interface AuthViewProps {
  initialMode: "login" | "register";
  setCurrentPage: (page: string) => void;
  onLoginSuccess: (user: UserProfileData) => void;
}

export default function AuthView({
  initialMode,
  setCurrentPage,
  onLoginSuccess,
}: AuthViewProps) {
  const [mode, setMode] = useState<"login" | "register" | "recovery" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Registration fields
  const [name, setName] = useState("");
  const [title, setTitle] = useState("Dr.");
  const [specialty, setSpecialty] = useState("");
  const [institution, setInstitution] = useState("");
  const [country, setCountry] = useState("");
  const [orcid, setOrcid] = useState("");
  const [isProfessional, setIsProfessional] = useState(true);

  // Recovery State
  const [recoverySent, setRecoverySent] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState("");
  const [resetPinInput, setResetPinInput] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Verification State
  const [verificationCode, setVerificationCode] = useState("");
  const [generatedPin, setGeneratedPin] = useState("");

  // Temporary registered user data before code validation
  const [tempUserData, setTempUserData] = useState<UserProfileData | null>(null);

  // Load dynamic customizable professions
  const [professionsList, setProfessionsList] = useState<string[]>([]);

  React.useEffect(() => {
    initializeTaxonomyStore();
    const storedProfs = getStoredItem<string[]>("healthedia_professions", DEFAULT_PROFESSIONS);
    setProfessionsList(storedProfs);
    if (storedProfs.length > 0) {
      setSpecialty(storedProfs[0]);
    }
  }, []);

  React.useEffect(() => {
    if (initialMode === "register") {
      setMode("register");
    } else {
      setMode("login");
    }
  }, [initialMode]);

  // Handle Quick Login for Demo Roles
  const handleQuickLogin = (roleEmail: string) => {
    initializeTaxonomyStore();
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", DEMO_USERS);
    const matched = storedUsers.find(u => u.email.toLowerCase() === roleEmail.toLowerCase());
    if (matched) {
      onLoginSuccess(matched);
      setCurrentPage("profile");
    } else {
      alert(`User for ${roleEmail} not found. Re-initializing database.`);
      localStorage.removeItem("healthedia_users");
      initializeTaxonomyStore();
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Please fill in all details.");
      return;
    }

    initializeTaxonomyStore();
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", DEMO_USERS);
    const matchedUser = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (matchedUser) {
      if (matchedUser.status === "Suspended") {
        alert("This account is currently suspended by a System Administrator.");
        return;
      }
      onLoginSuccess(matchedUser);
      setCurrentPage("profile");
    } else if (email.toLowerCase() === "mabrouk@dr.com" || email.toLowerCase() === "user@healthedia.org") {
      const defaultUser: UserProfileData = {
        email: email.toLowerCase(),
        name: email.split("@")[0].toUpperCase(),
        title: "Dr.",
        specialty: "Cardiorespiratory Physiology",
        institution: "Healthedia Institute",
        country: "United Kingdom",
        degree: "M.D., Ph.D.",
        orcid: "0000-0002-1204-9844",
        bio: "Senior health performance and clinical medicine researcher.",
        qualifications: ["Ph.D. in Kinesiology", "Board Certification in Sports Cardiology"],
        researchInterests: ["Endurance physiology", "Myocardial strain dynamics"],
        publications: [],
        awards: ["Fellowship of Sports Science Society (2025)"],
        certifications: ["ACLS Expert"],
        verified: true,
        verificationSubmitted: true,
        role: "Researcher" as UserRole
      };
      onLoginSuccess(defaultUser);
      setCurrentPage("profile");
    } else {
      alert("Healthedia Security: No matching registered email credentials discovered in local sandbox store. Try Registering first!");
    }
  };

  // Handle Registration Submit (Triggers email verification code step)
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name || !password) {
      alert("Please populate all required parameters.");
      return;
    }

    const newUser: UserProfileData = {
      email: email.toLowerCase(),
      name,
      username: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
      role: "Member" as UserRole,
      joinedAt: new Date().toISOString().split("T")[0],
      profession: specialty,
      title,
      specialty: specialty || "General Medicine & Human Performance",
      institution: institution || "Unassigned Academy",
      country: country || "Global",
      degree: "B.S. / M.S. Candidate",
      orcid: orcid || "",
      bio: "Academic profile pending biological validation.",
      qualifications: [],
      researchInterests: specialty ? [specialty] : ["Human Performance"],
      publications: [],
      awards: [],
      certifications: [],
      verified: false,
      verificationSubmitted: false,
    };

    setTempUserData(newUser);

    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedPin(pin);
    setMode("verify");

    alert(`Healthedia Mailer: Secure authentication code dispatched to ${email}.\n\nYOUR CONFIRMATION PIN IS: ${pin}`);
  };

  // Verify PIN to finalize registration
  const handlePinVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === generatedPin) {
      if (tempUserData) {
        const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", DEMO_USERS);
        const filteredUsers = storedUsers.filter(u => u.email.toLowerCase() !== tempUserData.email.toLowerCase());
        filteredUsers.push(tempUserData);
        setStoredItem("healthedia_users", filteredUsers);

        onLoginSuccess(tempUserData);
        alert("Healthedia Verification: Email address authenticated! Welcome to the performance archive.");
        setCurrentPage("profile");
      }
    } else {
      alert("Verification PIN does not align. Please check and retry.");
    }
  };

  // Handle mock password recovery
  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert("Please provide your account email.");
      return;
    }
    initializeTaxonomyStore();
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", DEMO_USERS);
    const matchedUser = storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!matchedUser) {
      alert("Healthedia Security: This email address is not registered in our clinical sandbox database.");
      return;
    }

    const pin = Math.floor(100000 + Math.random() * 900000).toString();
    setRecoverySent(true);
    setRecoveryCode(pin);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (resetPinInput !== recoveryCode) {
      alert("Healthedia Security: The entered security reset PIN is incorrect.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      alert("Please provide a new secure password of at least 8 characters.");
      return;
    }

    initializeTaxonomyStore();
    const storedUsers = getStoredItem<UserProfileData[]>("healthedia_users", DEMO_USERS);
    const updatedUsers = storedUsers.map(u => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    setStoredItem("healthedia_users", updatedUsers);

    alert("Healthedia Security: Security credentials updated successfully in our database. Please Sign In with your new credentials.");
    setMode("login");
    setRecoverySent(false);
    setResetPinInput("");
    setNewPassword("");
    setEmail("");
  };

  return (
    <div className="flex-grow bg-white flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full border border-neutral-200 bg-white p-8 rounded-2xl animate-fadeIn shadow-none relative">
        
        {/* Unified Tab Switcher Header (only visible in main flows) */}
        {(mode === "login" || mode === "register") && (
          <div className="flex bg-neutral-50 p-1 rounded-xl border border-neutral-100 mb-8 select-none">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all duration-150 rounded-lg ${
                mode === "login"
                  ? "bg-white text-black border border-neutral-200/80 font-bold"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setMode("register")}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-wider font-semibold transition-all duration-150 rounded-lg ${
                mode === "register"
                  ? "bg-white text-black border border-neutral-200/80 font-bold"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Professional Section Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-bold tracking-tight text-black font-sans uppercase">
            {mode === "login" && "Login to Archive"}
            {mode === "register" && "Create Investigator Account"}
            {mode === "recovery" && "Recover Access Key"}
            {mode === "verify" && "Verify Clinical Identity"}
          </h2>
          <p className="text-[11px] text-neutral-400 mt-1 font-sans leading-normal">
            {mode === "login" && "Access global health, physiology, and sports biomechanics indices."}
            {mode === "register" && "Join our verified directory of active researchers and clinicians."}
            {mode === "recovery" && "Restore secure credentials via registered institutional email."}
            {mode === "verify" && `Confirmation code dispatched to: ${email}`}
          </p>
        </div>

        {/* Animated Form container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            {/* 1. LOGIN FORM */}
            {mode === "login" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Institutional Email Address"
                    className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-all duration-150"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password"
                      className="w-full h-11 pl-4 pr-10 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-all duration-150"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setMode("recovery")}
                    className="text-[10px] font-mono text-neutral-400 hover:text-black hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="w-full h-11 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                >
                  Sign In to Archive
                </button>

                {/* QUICK SANDBOX LOGIN SELECTOR */}
                <div className="pt-5 border-t border-dashed border-neutral-150 space-y-3">
                  <p className="text-[9px] font-mono uppercase tracking-wider font-bold text-neutral-400 text-center flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-black" />
                    Sandbox Quick-Entry Accounts
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin@healthedia.org")}
                      className="p-2.5 border border-neutral-200 hover:border-black text-[10px] font-mono text-left bg-neutral-50 hover:bg-white cursor-pointer rounded-xl transition-all duration-150"
                    >
                      <span className="block font-bold text-black">1. Administrator</span>
                      <span className="text-[8px] text-neutral-400 font-light truncate block">admin@healthedia.org</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("reviewer@healthedia.org")}
                      className="p-2.5 border border-neutral-200 hover:border-black text-[10px] font-mono text-left bg-neutral-50 hover:bg-white cursor-pointer rounded-xl transition-all duration-150"
                    >
                      <span className="block font-bold text-neutral-700">2. Review Board</span>
                      <span className="text-[8px] text-neutral-400 font-light truncate block">reviewer@healthedia.org</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("researcher@healthedia.org")}
                      className="p-2.5 border border-neutral-200 hover:border-black text-[10px] font-mono text-left bg-neutral-50 hover:bg-white cursor-pointer rounded-xl transition-all duration-150"
                    >
                      <span className="block font-bold text-neutral-700">3. Researcher</span>
                      <span className="text-[8px] text-neutral-400 font-light truncate block">researcher@healthedia.org</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("member@healthedia.org")}
                      className="p-2.5 border border-neutral-200 hover:border-black text-[10px] font-mono text-left bg-neutral-50 hover:bg-white cursor-pointer rounded-xl transition-all duration-150"
                    >
                      <span className="block font-bold text-neutral-700">4. Member</span>
                      <span className="text-[8px] text-neutral-400 font-light truncate block">member@healthedia.org</span>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* 2. REGISTRATION FORM */}
            {mode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <select
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full h-11 px-3 text-xs border border-neutral-200 focus:border-black focus:outline-none bg-white text-black rounded-xl cursor-pointer"
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Dr. med.">Dr. med.</option>
                      <option value="Researcher">Researcher</option>
                      <option value="M.S.">M.S.</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="Full Academic Name"
                      className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Institutional Email Address"
                    className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Password (Minimum 8 chars)"
                      className="w-full h-11 pl-4 pr-10 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                    </button>
                  </div>

                  {/* Specialty dropdown */}
                  <div className="relative">
                    <select
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      className="w-full h-11 px-3 text-xs border border-neutral-200 focus:border-black focus:outline-none bg-white text-black rounded-xl cursor-pointer"
                    >
                      <option value="" disabled>Select Specialty Area...</option>
                      {professionsList.map((prof) => (
                        <option key={prof} value={prof}>
                          {prof}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      placeholder="Institutional Affiliation"
                      className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                    />
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country of Origin"
                      className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                    />
                  </div>

                  <input
                    type="text"
                    value={orcid}
                    onChange={(e) => setOrcid(e.target.value)}
                    placeholder="ORCID Identifier iD (e.g. 0000-xxxx-xxxx-xxxx)"
                    className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-mono text-black placeholder-neutral-400 transition-colors"
                  />
                </div>

                <label className="flex items-start text-[10px] text-neutral-400 hover:text-black cursor-pointer pt-1 select-none">
                  <input
                    type="checkbox"
                    checked={isProfessional}
                    onChange={(e) => setIsProfessional(e.target.checked)}
                    className="mr-2 mt-0.5 border-neutral-300 text-black focus:ring-black accent-black rounded-md"
                  />
                  <span>I hold an active clinical practice, university research post, or laboratory affiliation.</span>
                </label>

                <button
                  type="submit"
                  className="w-full h-11 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                >
                  Verify Email & Register
                </button>
              </form>
            )}

            {/* 3. EMAIL VERIFICATION PIN CONFIRMATION */}
            {mode === "verify" && (
              <form onSubmit={handlePinVerification} className="space-y-4">
                <div className="p-4 bg-neutral-50 border border-neutral-200 text-xs text-neutral-600 space-y-2 rounded-xl">
                  <div className="flex items-center text-black font-semibold uppercase font-mono text-[9px] tracking-wider">
                    <AlertCircle className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Simulated SMTP Verification
                  </div>
                  <p className="text-[10px] text-neutral-400">Your secure clinical identity dispatch token bypasses external servers in the sandbox environment:</p>
                  <div className="font-mono text-center text-xl font-bold tracking-widest bg-white border border-neutral-200 p-2.5 text-black my-2 rounded-xl">
                    {generatedPin}
                  </div>
                </div>

                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  required
                  maxLength={4}
                  placeholder="Enter 4-Digit Security PIN"
                  className="w-full h-11 text-center text-sm font-mono border border-neutral-200 focus:border-black focus:outline-none bg-white text-black tracking-widest rounded-xl"
                />

                <button
                  type="submit"
                  className="w-full h-11 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                >
                  Verify PIN & Sign In
                </button>

                <button
                  type="button"
                  onClick={() => setMode("register")}
                  className="w-full text-center text-[10px] font-mono text-neutral-400 hover:text-black uppercase cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  ← Go Back
                </button>
              </form>
            )}

            {/* 4. CREDENTIAL RECOVERY */}
            {mode === "recovery" && (
              <form onSubmit={recoverySent ? handleResetPassword : handleRecoverySubmit} className="space-y-4">
                {!recoverySent ? (
                  <>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="Registered Institutional Email"
                      className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                    />

                    <button
                      type="submit"
                      className="w-full h-11 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                    >
                      Request Recovery Code
                    </button>
                  </>
                ) : (
                  <>
                    {(() => {
                      const savedTemplate = localStorage.getItem("healthedia_email_template_recovery") || DEFAULT_RECOVERY_TEMPLATE;
                      const parsedSubject = savedTemplate.split("\n")[0]?.replace("Subject:", "").trim() || "[Healthedia] Password Recovery Verification";
                      const bodyLines = savedTemplate.split("\n")[0]?.startsWith("Subject:") ? savedTemplate.split("\n").slice(1) : savedTemplate.split("\n");
                      const parsedBody = bodyLines.join("\n")
                        .replace(/\{\{EMAIL\}\}/g, email)
                        .replace(/\{\{OTP\}\}/g, recoveryCode)
                        .replace(/\{\{EXPIRY\}\}/g, "15 minutes");

                      return (
                        <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs bg-white text-xs flex flex-col mb-4">
                          {/* Browser Mock Header */}
                          <div className="bg-neutral-100 border-b border-neutral-200 px-3 py-1.5 flex items-center space-x-1.5 select-none">
                            <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
                            <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
                            <span className="w-2 h-2 rounded-full bg-neutral-300"></span>
                            <span className="text-[8px] font-mono text-neutral-400 pl-4">Simulated Institutional SMTP Inbox</span>
                          </div>

                          {/* Email Metadata */}
                          <div className="p-2.5 border-b border-neutral-100 bg-neutral-50/50 text-[9px] text-neutral-500 font-mono">
                            <p><span className="text-neutral-400 font-bold">From:</span> automated-dispatch@healthedia.org</p>
                            <p><span className="text-neutral-400 font-bold">To:</span> {email}</p>
                            <p className="truncate font-semibold text-black mt-0.5">
                              <span className="text-neutral-400 font-bold font-mono">Subject:</span> {parsedSubject}
                            </p>
                          </div>

                          {/* Email Body */}
                          <div className="p-3 max-h-48 overflow-y-auto bg-white font-sans text-[10px] text-neutral-600 leading-relaxed whitespace-pre-wrap select-text">
                            {parsedBody}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="space-y-3">
                      <input
                        type="text"
                        value={resetPinInput}
                        onChange={(e) => setResetPinInput(e.target.value)}
                        required
                        placeholder="Enter Simulated Reset PIN"
                        className="w-full h-11 px-4 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-mono text-black placeholder-neutral-400 transition-colors"
                      />

                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          required
                          placeholder="Enter New Secure Password"
                          className="w-full h-11 pl-4 pr-10 text-xs bg-white border border-neutral-200 focus:border-black focus:outline-none rounded-xl font-sans text-black placeholder-neutral-400 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black focus:outline-none cursor-pointer animate-fadeIn"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4 stroke-[1.5]" /> : <Eye className="w-4 h-4 stroke-[1.5]" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full h-11 bg-black text-white text-xs font-mono font-bold uppercase tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer rounded-xl"
                    >
                      Save New Password
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setRecoverySent(false);
                    setResetPinInput("");
                    setNewPassword("");
                  }}
                  className="w-full text-center text-[10px] font-mono text-neutral-400 hover:text-black uppercase cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                >
                  ← Back to Login
                </button>
              </form>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}
