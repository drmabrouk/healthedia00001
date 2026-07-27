import React from "react";
import { 
  Search, User, BookOpen, HelpCircle, ShieldCheck, LogIn, Menu, X, GraduationCap, Building2,
  Bell, Settings as SettingsIcon, CheckCircle, AlertTriangle, FileText, MessageSquare, Info, ShieldAlert, LogOut,
  FlaskConical, Keyboard
} from "lucide-react";
import { UserProfileData, NotificationItem } from "../types";

interface NavbarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  currentUser: UserProfileData | null;
  onLogout: () => void;
  notifications?: NotificationItem[];
  onNotificationClick?: (id: string) => void;
  onMarkAllNotificationsRead?: () => void;
  setProfileActiveTab?: (tab: "profile" | "settings" | "manuscripts" | "requests" | "impact") => void;
}

const getNotifIcon = (type: string) => {
  switch (type) {
    case "verification_approved":
    case "research_approved":
    case "institution_approved":
      return CheckCircle;
    case "verification_rejected":
    case "research_rejected":
    case "institution_rejected":
      return AlertTriangle;
    case "revision_requested":
    case "reviewer_comments":
      return FileText;
    case "role_changed":
      return ShieldCheck;
    case "support_update":
      return MessageSquare;
    case "security":
      return ShieldAlert;
    default:
      return Info;
  }
};

export default function Navbar({
  currentPage,
  setCurrentPage,
  currentUser,
  onLogout,
  notifications = [],
  onNotificationClick,
  onMarkAllNotificationsRead,
  setProfileActiveTab,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isNotifOpen, setIsNotifOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [expandedNotifId, setExpandedNotifId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const handleClose = () => {
      setIsOpen(false);
      setIsNotifOpen(false);
      setIsProfileOpen(false);
    };
    window.addEventListener("healthedia:close-modals", handleClose);
    return () => window.removeEventListener("healthedia:close-modals", handleClose);
  }, []);

  const navItems = [
    { id: "home", label: "Archive Search" },
    { id: "researchers", label: "Researchers" },
    { id: "institutions", label: "Institutions" },
    { id: "journal", label: "Scientific Journal" },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 w-full pt-6 px-4 sm:px-6 lg:px-8 bg-transparent">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-md border border-neutral-200/70 rounded-2xl">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center flex-1">
              {/* Logo */}
              <button
                onClick={() => {
                  setCurrentPage("home");
                  setIsOpen(false);
                  setIsNotifOpen(false);
                  setIsProfileOpen(false);
                }}
                className="flex-shrink-0 flex flex-col items-start text-black cursor-pointer group leading-none pt-1"
              >
                <span className="font-sans font-black tracking-tight text-xl text-black leading-none">
                  Healthedia
                </span>
                <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest mt-1 leading-none font-semibold">
                  Global Health Archive
                </span>
              </button>

              {/* Desktop Navigation */}
              <div className="hidden lg:ml-8 lg:flex lg:space-x-1">
                {navItems.map((item) => {
                  const isActive = currentPage === item.id || (item.id === "home" && currentPage === "search-results");
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setIsOpen(false);
                        setIsNotifOpen(false);
                        setIsProfileOpen(false);
                      }}
                      className={`inline-flex items-center px-3 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer rounded-xl ${
                        isActive
                          ? "bg-black text-white"
                          : "text-neutral-500 hover:text-black hover:bg-neutral-50"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Desktop Right items */}
            <div className="hidden lg:flex lg:items-center lg:space-x-2">
              {currentUser ? (
                <div className="flex items-center space-x-2">
                  {/* Administration Shortcut Button */}
                  {(currentUser.role === "Admin" || currentUser.role === "Reviewer") && (
                    <button
                      onClick={() => {
                        setCurrentPage("dashboard");
                        setIsProfileOpen(false);
                        setIsNotifOpen(false);
                      }}
                      className={`h-9 px-3 border border-red-900/25 bg-red-950 text-white hover:bg-red-900 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5 shadow-sm ${
                        currentPage === "dashboard" ? "bg-red-800 border-red-750" : ""
                      }`}
                      title={`${currentUser.role} Workspace`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-red-200 stroke-[2]" />
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider">Workspace</span>
                    </button>
                  )}

                  {/* Keyboard Shortcuts Trigger Button */}
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent("healthedia:open-shortcuts"))}
                    className="p-2 border border-neutral-200 hover:border-black hover:bg-neutral-50 text-neutral-600 hover:text-black rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center bg-white relative gap-1 group"
                    title="Keyboard Shortcuts (?)"
                  >
                    <Keyboard className="w-4 h-4 stroke-[1.5]" />
                    <span className="hidden xl:inline-block text-[10px] font-mono font-bold px-1 py-0.5 bg-neutral-100 border border-neutral-200 rounded text-neutral-500 group-hover:text-black">/</span>
                  </button>

                  {/* Research Workspace Button */}
                  {currentUser && ["Member", "Researcher", "Reviewer"].includes(currentUser.role || "") && (
                    <button
                      onClick={() => {
                        setCurrentPage("research-workspace");
                        setIsProfileOpen(false);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2 border border-neutral-200 hover:border-black hover:bg-neutral-50 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center bg-white relative ${
                        currentPage === "research-workspace" ? "bg-neutral-50 border-black text-black" : "text-neutral-600 hover:text-black"
                      }`}
                      title="Research Workspace"
                    >
                      <FlaskConical className="w-4 h-4 stroke-[1.5]" />
                    </button>
                  )}

                  {/* Profile Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsProfileOpen(!isProfileOpen);
                        setIsNotifOpen(false);
                      }}
                      className={`p-2 border border-neutral-200 hover:border-black hover:bg-neutral-50 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center bg-white relative ${
                        isProfileOpen ? "bg-neutral-50 border-black text-black" : "text-neutral-600 hover:text-black"
                      }`}
                      title="Profile Menu"
                    >
                      <User className="w-4 h-4 stroke-[1.5]" />
                      {currentUser.verified && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-black rounded-full shrink-0" />
                      )}
                    </button>

                    {isProfileOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                        <div className="absolute right-0 mt-2 w-60 bg-white border border-neutral-200 rounded-2xl z-50 p-2 animate-fadeIn shadow-xl">
                          <div className="px-3 py-2 border-b border-neutral-100 mb-1.5">
                            <p className="text-xs font-bold text-black truncate">{currentUser.name}</p>
                            <p className="text-[10px] text-neutral-400 truncate">{currentUser.email}</p>
                            <span className="inline-block text-[8px] font-mono bg-neutral-100 text-neutral-500 px-1.5 py-0.5 border border-neutral-200 uppercase tracking-widest rounded mt-1 font-bold">
                              {currentUser.role}
                            </span>
                          </div>
                          
                          <div className="space-y-0.5">
                            {/* My Profile */}
                            <button
                              onClick={() => {
                                setProfileActiveTab?.("profile");
                                setCurrentPage("profile");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors block cursor-pointer font-medium"
                            >
                              My Profile
                            </button>

                            {/* Account Settings */}
                            <button
                              onClick={() => {
                                setProfileActiveTab?.("settings");
                                setCurrentPage("profile");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors block cursor-pointer font-medium"
                            >
                              Account Settings
                            </button>

                            {/* Saved Research */}
                            <button
                              onClick={() => {
                                setProfileActiveTab?.("manuscripts");
                                setCurrentPage("profile");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors block cursor-pointer font-medium"
                            >
                              Saved Research
                            </button>

                            {/* My Requests */}
                            <button
                              onClick={() => {
                                setProfileActiveTab?.("requests");
                                setCurrentPage("profile");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors block cursor-pointer font-medium"
                            >
                                My Requests
                            </button>

                            {/* Submission Portal */}
                            <button
                              onClick={() => {
                                setCurrentPage("submission-portal");
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-600 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors block cursor-pointer font-medium flex items-center justify-between"
                            >
                              <span>Submission Portal</span>
                              <span className="text-[8px] font-mono bg-black text-white px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">New</span>
                            </button>
                          </div>

                          <div className="border-t border-neutral-100 mt-1.5 pt-1.5">
                            <button
                              onClick={() => {
                                onLogout();
                                setIsProfileOpen(false);
                              }}
                              className="w-full text-left px-3 py-1.5 text-xs text-neutral-400 hover:text-black hover:bg-neutral-50 rounded-lg transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
                            >
                              <LogOut className="w-3.5 h-3.5 stroke-[1.5]" />
                              <span>Logout</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notifications icon only */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setIsNotifOpen(!isNotifOpen);
                        setIsProfileOpen(false);
                      }}
                      className={`p-2 border border-neutral-200 hover:border-black hover:bg-neutral-50 rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center bg-white relative ${
                        isNotifOpen ? "bg-neutral-50 border-black text-black font-semibold" : "text-neutral-600 hover:text-black"
                      }`}
                      title="Notifications"
                    >
                      <Bell className="w-4 h-4 stroke-[1.5]" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-mono font-bold bg-black text-white rounded-full">
                          {unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsNotifOpen(false)} />
                        <div className="absolute right-0 mt-2 w-80 max-w-sm bg-white border border-neutral-200 rounded-2xl z-50 p-3 animate-fadeIn select-none shadow-xl">
                          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider font-sans text-black">Notifications</span>
                            {unreadCount > 0 && (
                              <button
                                onClick={() => {
                                  onMarkAllNotificationsRead?.();
                                }}
                                className="text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer font-semibold underline decoration-dotted"
                              >
                                Mark all read
                              </button>
                            )}
                          </div>
                          
                          <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                            {notifications && notifications.length > 0 ? (
                              notifications.slice(0, 6).map((notif) => {
                                const Icon = getNotifIcon(notif.type);
                                const isExpanded = expandedNotifId === notif.id;
                                return (
                                  <div
                                    key={notif.id}
                                    className={`p-2 rounded-lg border transition-all text-left ${
                                      !notif.read ? "bg-neutral-50/70 border-neutral-200" : "bg-white border-neutral-100 hover:border-neutral-200"
                                    }`}
                                  >
                                    <div className="flex items-start space-x-2 cursor-pointer" onClick={() => setExpandedNotifId(isExpanded ? null : notif.id)}>
                                      <div className={`p-1 rounded-md shrink-0 ${!notif.read ? "bg-black text-white" : "bg-neutral-100 text-neutral-500"}`}>
                                        <Icon className="w-3 h-3 stroke-[1.5]" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                          <span className={`text-[11px] font-sans block truncate ${!notif.read ? "font-bold text-black" : "text-neutral-700"}`}>
                                            {notif.title}
                                          </span>
                                          {!notif.read && (
                                            <span className="w-1.5 h-1.5 bg-black rounded-full shrink-0 ml-1.5" />
                                          )}
                                        </div>
                                        <p className={`text-[10px] text-neutral-400 mt-0.5 leading-normal ${isExpanded ? "" : "line-clamp-2"}`}>
                                          {notif.description}
                                        </p>
                                        <div className="flex items-center justify-between mt-0.5">
                                          <span className="text-[8px] font-mono text-neutral-400">
                                            {notif.timestamp}
                                          </span>
                                          <span className="text-[8px] font-mono text-black font-bold uppercase tracking-wider hover:underline">
                                            {isExpanded ? "Less" : "More"}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    {isExpanded && (
                                      <div className="mt-1.5 pt-1.5 border-t border-neutral-100 flex items-center justify-end">
                                        <button
                                          onClick={() => {
                                            onNotificationClick?.(notif.id);
                                            setIsNotifOpen(false);
                                          }}
                                          className="bg-black text-white text-[9px] font-mono uppercase font-bold px-2.5 py-1 rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
                                        >
                                          View Details
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className="text-center py-6 text-neutral-400 text-xs font-mono font-light uppercase">
                                No recent activities
                              </div>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Logout icon only */}
                  <button
                    onClick={onLogout}
                    className="p-2 border border-neutral-200 hover:border-black hover:bg-neutral-50 text-neutral-600 hover:text-black rounded-xl transition-all duration-150 cursor-pointer flex items-center justify-center bg-white"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage("login")}
                    className="text-xs font-mono uppercase tracking-wider font-bold px-4 py-2 bg-black text-white border border-black hover:bg-white hover:text-black transition-colors duration-150 rounded-xl cursor-pointer"
                  >
                    Login
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 text-neutral-400 hover:text-black hover:bg-neutral-50 focus:outline-none rounded-xl"
              >
                {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden border-t border-neutral-100 bg-white rounded-b-2xl animate-fadeIn">
            <div className="pt-2 pb-3 space-y-1 px-4">
              {navItems.map((item) => {
                const isActive = currentPage === item.id || (item.id === "home" && currentPage === "search-results");
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentPage(item.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 text-sm font-medium transition-colors rounded-xl ${
                      isActive
                        ? "bg-black text-white"
                        : "text-neutral-500 hover:bg-neutral-50 hover:text-black"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}

               {/* Profile / Auth on Mobile */}
              <div className="pt-4 pb-2 border-t border-neutral-100">
                {currentUser ? (
                  <div className="space-y-3">
                    {currentUser.role === "Admin" && (
                      <button
                        onClick={() => {
                          setCurrentPage("dashboard");
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-left text-sm font-bold bg-[#7f1d1d] text-white rounded-xl hover:bg-[#991b1b] transition-all border border-[#7f1d1d] uppercase tracking-wider text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 mr-3 stroke-[2]" />
                        <span>Admin Panel</span>
                      </button>
                    )}
                    {currentUser.role === "Reviewer" && (
                      <button
                        onClick={() => {
                          setCurrentPage("dashboard");
                          setIsOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-left text-sm font-bold bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all border border-neutral-900 uppercase tracking-wider text-xs"
                      >
                        <ShieldCheck className="w-4 h-4 mr-3 stroke-[2]" />
                        <span>Reviewer Panel</span>
                      </button>
                    )}
                    
                    {/* Mobile Research Workspace */}
                    {["Member", "Researcher", "Reviewer"].includes(currentUser.role || "") && (
                      <button
                        onClick={() => {
                          setCurrentPage("research-workspace");
                          setIsOpen(false);
                        }}
                        className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-xl transition-all ${
                          currentPage === "research-workspace" ? "text-black bg-neutral-50 font-bold border border-neutral-200" : "text-neutral-600 hover:bg-neutral-50"
                        }`}
                      >
                        <FlaskConical className="w-4 h-4 mr-3 stroke-[1.5]" />
                        <span>Research Workspace</span>
                      </button>
                    )}

                    {/* Mobile Account */}
                    <button
                      onClick={() => {
                        setProfileActiveTab?.("profile");
                        setCurrentPage("profile");
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-xl transition-all ${
                        currentPage === "profile" ? "text-black bg-neutral-50 font-bold border border-neutral-200" : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <User className="w-4 h-4 mr-3 stroke-[1.5]" />
                      <span>Account</span>
                      {currentUser.verified && (
                        <span className="inline-flex items-center text-[8px] font-mono bg-black text-white px-1.5 py-0.5 rounded-lg ml-2 font-bold uppercase tracking-wider">
                          ✓ Verified
                        </span>
                      )}
                    </button>

                    {/* Mobile Settings */}
                    <button
                      onClick={() => {
                        setProfileActiveTab?.("settings");
                        setCurrentPage("profile");
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-xl transition-all ${
                        currentPage === "profile" ? "text-black bg-neutral-50 font-bold border border-neutral-200" : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <SettingsIcon className="w-4 h-4 mr-3 stroke-[1.5]" />
                      <span>Settings</span>
                    </button>

                    {/* Mobile Submission Portal */}
                    <button
                      onClick={() => {
                        setCurrentPage("submission-portal");
                        setIsOpen(false);
                      }}
                      className={`flex items-center w-full px-3 py-2 text-left text-sm font-medium rounded-xl transition-all ${
                        currentPage === "submission-portal" ? "text-black bg-neutral-50 font-bold border border-neutral-200" : "text-neutral-600 hover:bg-neutral-50"
                      }`}
                    >
                      <FileText className="w-4 h-4 mr-3 stroke-[1.5]" />
                      <span>Submission Portal</span>
                    </button>

                    {/* Mobile Notifications list */}
                    <div className="border-t border-neutral-100 pt-3 px-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center text-xs font-bold uppercase tracking-wider font-sans text-neutral-800">
                          <Bell className="w-3.5 h-3.5 mr-2 stroke-[1.5]" />
                          <span>Notifications</span>
                          {unreadCount > 0 && (
                            <span className="ml-2 bg-black text-white text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                              {unreadCount}
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={onMarkAllNotificationsRead}
                            className="text-[10px] font-mono text-neutral-400 hover:text-black cursor-pointer underline decoration-dotted"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                        {notifications && notifications.length > 0 ? (
                          notifications.slice(0, 5).map((notif) => {
                            const Icon = getNotifIcon(notif.type);
                            return (
                              <div
                                key={notif.id}
                                onClick={() => {
                                  onNotificationClick?.(notif.id);
                                  setIsOpen(false);
                                }}
                                className={`p-2 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-all cursor-pointer text-left flex items-start space-x-2.5 ${
                                  !notif.read ? "bg-neutral-50/70" : "bg-white"
                                }`}
                              >
                                <div className="p-1 rounded-lg shrink-0 bg-neutral-100 text-neutral-500">
                                  <Icon className="w-3 h-3 stroke-[1.5]" />
                                </div>
                                <div className="flex-grow min-w-0">
                                  <span className={`text-[10px] font-sans block truncate ${!notif.read ? "font-bold text-black" : "text-neutral-600"}`}>
                                    {notif.title}
                                  </span>
                                  <span className="text-[8px] font-mono text-neutral-400 block">{notif.timestamp}</span>
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="text-center py-4 text-neutral-400 text-[10px] font-mono font-light uppercase">
                            No recent notifications
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile Sign Out */}
                    <button
                      onClick={() => {
                        onLogout();
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-left text-sm font-medium text-neutral-400 hover:bg-neutral-50 hover:text-black rounded-xl border-t border-neutral-100 pt-3"
                    >
                      <LogIn className="w-4 h-4 mr-3 stroke-[1.5] rotate-180" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setCurrentPage("login");
                        setIsOpen(false);
                      }}
                      className="w-full text-center py-2.5 text-xs font-mono font-bold uppercase tracking-wider bg-black text-white border border-black rounded-xl"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
