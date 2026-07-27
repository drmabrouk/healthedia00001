import React, { useState, useEffect } from "react";
import { HelpCircle, FileText, Settings, ShieldAlert, CheckCircle, Clock, Send, Search, RefreshCw } from "lucide-react";
import { FAQ_DATA } from "../data";
import { SupportTicket, UserProfileData } from "../types";
import { db } from "../lib/db";

interface SupportViewProps {
  currentUser: UserProfileData | null;
}

export default function SupportView({ currentUser }: SupportViewProps) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [faqQuery, setFaqQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Ticket Form state
  const [ticketTitle, setTicketTitle] = useState("");
  const [ticketCategory, setTicketCategory] = useState("Account Assistance");
  const [ticketDescription, setTicketDescription] = useState("");
  const [ticketEmail, setTicketEmail] = useState(currentUser?.email || "");

  useEffect(() => {
    // Sync current user email to form
    if (currentUser) {
      setTicketEmail(currentUser.email);
    }
  }, [currentUser]);

  // Load tickets from local storage on mount
  useEffect(() => {
    const storedTickets = db.read<SupportTicket[]>("tickets", []);
    if (storedTickets && storedTickets.length > 0) {
      setTickets(storedTickets);
    } else {
      // Seed some default status tracking tickets
      const initialTickets: SupportTicket[] = [
        {
          id: "TKT-4921",
          category: "Publication Support",
          title: "Orcid claim discrepancy on Achilles Tendinopathy RCT",
          description: "I am co-author Marc Dubois but the automated search lists me without my verified badge. Please assist in manual mapping.",
          status: "Resolved",
          createdAt: "2026-07-12T14:32:00Z",
          userEmail: "m.dubois@sorbonne-universite.fr"
        },
        {
          id: "TKT-8812",
          category: "Account Assistance",
          title: "Administrative review status for clinic validation",
          description: "Submitted state physical therapy credentials. Requesting rapid audit for research grant applications.",
          status: "In Progress",
          createdAt: "2026-07-14T09:15:00Z",
          userEmail: currentUser?.email || "mabrouk@dr.com"
        }
      ];
      db.write("tickets", initialTickets);
      setTickets(initialTickets);
    }
  }, [currentUser]);

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle || !ticketDescription || !ticketEmail) {
      alert("Please populate all support parameters.");
      return;
    }

    const newTicket: SupportTicket = {
      id: `TKT-${Math.floor(1000 + Math.random() * 9000)}`,
      category: ticketCategory,
      title: ticketTitle,
      description: ticketDescription,
      status: "Pending",
      createdAt: new Date().toISOString(),
      userEmail: ticketEmail.toLowerCase()
    };

    const updated = [newTicket, ...tickets];
    db.write("tickets", updated);
    setTickets(updated);

    // Reset Form
    setTicketTitle("");
    setTicketDescription("");
    alert(`Healthedia Support: Ticket ${newTicket.id} created successfully! Our operations desk will analyze your report and respond.`);
  };

  const getStatusBadge = (status: "Pending" | "In Progress" | "Resolved") => {
    if (status === "Resolved") {
      return (
        <span className="inline-flex items-center text-[10px] font-mono bg-black text-white px-2.5 py-1 font-bold uppercase rounded-lg">
          <CheckCircle className="w-3 h-3 mr-1" />
          Resolved
        </span>
      );
    }
    if (status === "In Progress") {
      return (
        <span className="inline-flex items-center text-[10px] font-mono bg-neutral-100 text-neutral-800 px-2.5 py-1 border border-neutral-200 rounded-lg">
          <Clock className="w-3 h-3 mr-1" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center text-[10px] font-mono bg-white text-neutral-400 px-2.5 py-1 border border-neutral-200 rounded-lg">
        <Clock className="w-3 h-3 mr-1" />
        Pending Review
      </span>
    );
  };

  // Filter FAQs based on query and selected category
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = selectedCategory === "All" || faq.category === selectedCategory;
    const matchesQuery =
      faq.question.toLowerCase().includes(faqQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(faqQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const categories = ["All", "Search & Database", "Professional Verification", "Scientific Journal", "Support & CV Management", "Publication Policies"];

  return (
    <div className="flex-grow bg-white py-10 font-sans animate-fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Title */}
        <div className="mb-8 border-b border-neutral-200/70 pb-6 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-sans font-black text-black tracking-tight">
            Support & Help Desk
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 font-light">
            Browse our Frequently Asked Questions or log a ticket directly with our academic administrative staff.
          </p>
        </div>

        {/* Support Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQ Column (Left-Centered) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl">
              <h2 className="text-base font-bold text-black mb-4 flex items-center">
                <HelpCircle className="w-4 h-4 mr-2 text-black stroke-[1.5]" /> FAQ Directory
              </h2>

              {/* FAQ Search */}
              <div className="flex border border-neutral-200 focus-within:border-black transition-colors mb-4 rounded-xl overflow-hidden">
                <div className="flex items-center pl-3.5 text-neutral-400 bg-white">
                  <Search className="w-3.5 h-3.5 stroke-[1.5]" />
                </div>
                <input
                  type="text"
                  value={faqQuery}
                  onChange={(e) => setFaqQuery(e.target.value)}
                  placeholder="Filter frequently asked questions..."
                  className="w-full py-2.5 pl-2.5 pr-4 text-xs text-black bg-white focus:outline-none"
                />
              </div>

              {/* Category Chips */}
              <div className="flex flex-wrap gap-1.5 mb-6">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`text-[9px] font-mono uppercase tracking-wider px-2.5 py-1.5 border transition-all cursor-pointer rounded-lg ${
                      selectedCategory === cat
                        ? "bg-black text-white border-black"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-black hover:text-black"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* FAQ Items */}
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq, idx) => (
                    <details
                      key={idx}
                      className="group border border-neutral-200 bg-neutral-50/50 p-4 transition-all hover:bg-neutral-50 hover:border-neutral-300 duration-150 rounded-xl"
                    >
                      <summary className="list-none flex justify-between items-center cursor-pointer font-sans font-semibold text-xs sm:text-sm text-black">
                        <span>{faq.question}</span>
                        <span className="font-mono text-xs text-neutral-400 transition-transform group-open:rotate-180">
                          ▼
                        </span>
                      </summary>
                      <p className="mt-2.5 text-xs sm:text-sm text-neutral-600 leading-relaxed font-sans pt-2.5 border-t border-neutral-200/50">
                        {faq.answer}
                      </p>
                    </details>
                  ))
                ) : (
                  <p className="text-xs text-neutral-400 italic">No corresponding FAQ documents mapped in storage.</p>
                )}
              </div>
            </div>

            {/* Support Requests Tracker Dashboard */}
            <div className="border border-neutral-200/70 p-6 bg-white rounded-2xl">
              <h2 className="text-base font-bold text-black mb-1 flex items-center">
                <RefreshCw className="w-4 h-4 mr-2 text-black stroke-[1.5]" /> Track Support Statuses
              </h2>
              <p className="text-xs text-neutral-500 mb-4 font-sans">
                Track administrative updates or clinical claims in real-time.
              </p>

              {tickets.length > 0 ? (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-neutral-200 p-4 bg-white hover:border-black transition-colors rounded-xl"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-1.5 sm:space-y-0 pb-2 border-b border-neutral-100">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-black">{ticket.id}</span>
                          <span className="text-[10px] font-mono uppercase bg-neutral-50 border border-neutral-200 text-neutral-500 px-1.5 py-0.2 rounded-lg">
                            {ticket.category}
                          </span>
                        </div>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <h3 className="text-xs sm:text-sm font-sans font-bold text-black mt-2">
                        {ticket.title}
                      </h3>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed font-sans">
                        {ticket.description}
                      </p>
                      <div className="mt-3 text-[10px] font-mono text-neutral-400 flex justify-between">
                        <span>Submitted: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                        <span>Logged by: {ticket.userEmail}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-neutral-400 italic">No tickets filed by this session yet.</p>
              )}
            </div>
          </div>

          {/* Ticket Submission Column (Right-Centered) */}
          <div className="lg:col-span-1">
            <div className="border border-neutral-200/70 p-6 bg-white sticky top-20 rounded-2xl">
              <h2 className="text-sm font-bold text-black uppercase tracking-wider font-sans mb-3 border-b border-neutral-100 pb-2">
                Submit Support Request
              </h2>
              <p className="text-xs text-neutral-400 mb-4 font-sans">
                Our clinical engineers and peer coordinators answer inquiries directly.
              </p>

              <form onSubmit={handleTicketSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Inquiry Category</label>
                  <select
                    value={ticketCategory}
                    onChange={(e) => setTicketCategory(e.target.value)}
                    className="w-full text-xs border border-neutral-200 py-2.5 px-3 text-black focus:outline-none focus:border-black bg-white rounded-xl"
                  >
                    <option value="Technical Issue Reporting">Technical Issue Reporting</option>
                    <option value="Account Assistance">Account Assistance</option>
                    <option value="Publication Support">Publication Support</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Contact Email</label>
                  <input
                    type="email"
                    value={ticketEmail}
                    onChange={(e) => setTicketEmail(e.target.value)}
                    required
                    placeholder="physician@university.edu"
                    className="w-full text-xs border border-neutral-200 py-2.5 px-3 text-black focus:outline-none focus:border-black bg-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Inquiry Subject</label>
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    required
                    placeholder="e.g. License verification issue"
                    className="w-full text-xs border border-neutral-200 py-2.5 px-3 text-black focus:outline-none focus:border-black bg-white rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase font-bold text-neutral-500">Detailed Description</label>
                  <textarea
                    value={ticketDescription}
                    onChange={(e) => setTicketDescription(e.target.value)}
                    required
                    rows={5}
                    placeholder="Detail steps, or supply academic credentials for manual registration review..."
                    className="w-full text-xs border border-neutral-200 py-2.5 px-3 text-black focus:outline-none focus:border-black bg-white resize-y rounded-xl"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-black text-white text-xs font-mono font-bold uppercase py-3 tracking-widest hover:bg-neutral-800 transition-colors cursor-pointer flex items-center justify-center rounded-xl"
                >
                  <Send className="w-3.5 h-3.5 mr-2" />
                  Log Support Ticket
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
