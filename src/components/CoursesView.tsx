import React, { useState, useEffect } from "react";
import { 
  Search, Clock, Award, CheckCircle, Sparkles, User, Sliders, X, 
  ArrowUpRight, ArrowLeft, Plus, Trash, Edit, Check, Lock, Play, 
  BookOpen, AlertCircle, CreditCard, ChevronDown, ChevronUp, FileText, 
  GraduationCap, Briefcase, PlusCircle, CheckSquare, ShieldCheck
} from "lucide-react";
import { Course, UserProfileData } from "../types";
import { INITIAL_COURSES } from "../data";

interface ExtendedCourse extends Course {
  price?: number; // 0 for Free
  status?: "Draft" | "Published" | "Archived";
  learningObjectives?: string[];
  requirements?: string[];
  targetAudience?: string[];
  curriculum?: { title: string; duration: string; lessons: string[] }[];
  faqs?: { question: string; answer: string }[];
  enrolledCount?: number;
}

interface CoursesViewProps {
  currentUser: UserProfileData | null;
  setCurrentPage: (page: string) => void;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export default function CoursesView({ currentUser, setCurrentPage, showToast }: CoursesViewProps) {
  // --- Core State ---
  const [courses, setCourses] = useState<ExtendedCourse[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<ExtendedCourse | null>(null);
  
  // --- Filter State ---
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("All");

  // --- UI View States ---
  const [isInstructorWorkspace, setIsInstructorWorkspace] = useState<boolean>(false);
  const [isCreatingEditing, setIsCreatingEditing] = useState<boolean>(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);

  // --- Form States for Course Publishing ---
  const [formTitle, setFormTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Sports Science & Physiology");
  const [formDuration, setFormDuration] = useState("");
  const [formDifficulty, setFormDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [formCoverImage, setFormCoverImage] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<"Draft" | "Published" | "Archived">("Published");
  const [formObjectives, setFormObjectives] = useState<string[]>([""]);
  const [formRequirements, setFormRequirements] = useState<string[]>([""]);
  const [formAudience, setFormAudience] = useState<string[]>([""]);
  const [formCurriculum, setFormCurriculum] = useState<{ title: string; duration: string; lessons: string[] }[]>([
    { title: "Introduction", duration: "1 week", lessons: ["Overview", "Initial Assessment"] }
  ]);

  // --- Enrollment & Checkout States ---
  const [checkoutCourse, setCheckoutCourse] = useState<ExtendedCourse | null>(null);
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccessCourse, setPaymentSuccessCourse] = useState<ExtendedCourse | null>(null);

  // --- Curriculum Accordion States ---
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({ 0: true });
  // --- FAQs Accordion States ---
  const [expandedFaqs, setExpandedFaqs] = useState<Record<number, boolean>>({});

  // --- Load and Seed Database on Mount ---
  useEffect(() => {
    // 1. Enrolled courses
    const savedEnrollments = localStorage.getItem("healthedia_enrolled_courses");
    if (savedEnrollments) {
      try {
        setEnrolledCourseIds(JSON.parse(savedEnrollments));
      } catch (e) {
        console.error(e);
      }
    }

    // 2. Courses
    const savedCourses = localStorage.getItem("healthedia_courses");
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Seed rich courses with detailed objectives, curriculum, FAQs, and pricing
      const seeded: ExtendedCourse[] = INITIAL_COURSES.map((c, idx) => {
        const prices = [149, 99, 199, 0, 79, 0];
        const price = prices[idx % prices.length];
        return {
          ...c,
          price,
          status: "Published",
          enrolledCount: Math.floor(12 + Math.random() * 85),
          learningObjectives: [
            `Understand high-level clinical frameworks of ${c.category}.`,
            `Master practical protocols and diagnostic evaluations in clinical settings.`,
            `Synthesize peer-reviewed research parameters to optimize physiological adaptation.`,
            `Design customized load, rehabilitation, or training schemes backed by evidence.`
          ],
          requirements: [
            "Basic understanding of clinical health, medicine, or physiology.",
            "Professional interest in evidence-backed rehabilitation and research methodologies."
          ],
          targetAudience: [
            "Physiotherapists and Clinical Rehabilitation Coaches",
            "Sports Scientists, Cardiologists, and Academic Researchers",
            "Advanced Students in Kinesiology or Human Performance"
          ],
          curriculum: [
            {
              title: "Module 1: Fundamental Concepts & Paradigms",
              duration: "Week 1-2",
              lessons: [
                "1.1 Academic Literature Review & Conceptual Baseline",
                "1.2 High-Precision Equipment & Clinical Diagnostics Setup",
                "1.3 Interactive Case Studies and Historical Datasets"
              ]
            },
            {
              title: "Module 2: Practical Protocol Application",
              duration: "Week 3-4",
              lessons: [
                "2.1 Interactive Load, Dosing, or Machine Learning Modeling",
                "2.2 Diagnostic Assessments and Variance Tracing",
                "2.3 Mitigating Adaptation Degradation & Endocrine Failure"
              ]
            },
            {
              title: "Module 3: Advanced Integrative Syntheses",
              duration: "Week 5+",
              lessons: [
                "3.1 ACC/AHA Clinical Guideline Mergers",
                "3.2 Advanced Lab Reports and Graduation Examination Preparation",
                "3.3 Academic Board Peer-Review Case Defense"
              ]
            }
          ],
          faqs: [
            {
              question: "Will I receive a certified credential upon course completion?",
              answer: "Yes. All courses finished in the Healthedia Academy dispatch a high-security digital certification badge which can be embedded in your global ORCID portfolio, clinical resumes, and academic accounts."
            },
            {
              question: "Is there active support or live laboratory office hours?",
              answer: "Absolutely. The course instructor hosts bi-weekly live review rounds in our integrated Support Center. You can submit questions or actual biomechanical/clinical telemetry reports directly for expert board feedback."
            }
          ]
        };
      });
      setCourses(seeded);
      localStorage.setItem("healthedia_courses", JSON.stringify(seeded));
    }
  }, []);

  const saveToLocalStorage = (updatedCourses: ExtendedCourse[]) => {
    setCourses(updatedCourses);
    localStorage.setItem("healthedia_courses", JSON.stringify(updatedCourses));
  };

  // --- Enrollment & Payments Mechanics ---
  const triggerEnrollmentFlow = (course: ExtendedCourse) => {
    if (!currentUser) {
      showToast("Please sign in or register to enroll in professional courses", "error");
      setCurrentPage("login");
      return;
    }

    if (enrolledCourseIds.includes(course.id)) {
      showToast("You are already enrolled in this course.", "info");
      return;
    }

    if (course.price && course.price > 0) {
      // Open Simulated Payment Modal
      setCheckoutCourse(course);
      setCardName(currentUser.name || "");
      setCardNumber("");
      setCardExpiry("");
      setCardCvv("");
    } else {
      // Free Course: Enroll instantly
      confirmEnrollment(course.id);
    }
  };

  const confirmEnrollment = (courseId: string) => {
    const nextEnrolled = [...enrolledCourseIds];
    if (!nextEnrolled.includes(courseId)) {
      nextEnrolled.push(courseId);
      setEnrolledCourseIds(nextEnrolled);
      localStorage.setItem("healthedia_enrolled_courses", JSON.stringify(nextEnrolled));
      
      // Update enrolled count for course
      const updated = courses.map(c => {
        if (c.id === courseId) {
          return { ...c, enrolledCount: (c.enrolledCount || 0) + 1 };
        }
        return c;
      });
      saveToLocalStorage(updated);

      const enrolledCourseObj = courses.find(c => c.id === courseId);
      if (enrolledCourseObj) {
        setPaymentSuccessCourse(enrolledCourseObj);
      }
    }
  };

  const handleSimulatedPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutCourse) return;

    if (!cardNumber || !cardExpiry || !cardCvv) {
      showToast("Please complete all payment fields.", "error");
      return;
    }

    setIsProcessingPayment(true);

    // Simulate bank/acquiring delay
    setTimeout(() => {
      setIsProcessingPayment(false);
      const targetCourse = checkoutCourse;
      setCheckoutCourse(null);
      confirmEnrollment(targetCourse.id);
      showToast(`Simulated transaction approved! Enrolled in ${targetCourse.title}.`, "success");
    }, 1500);
  };

  // --- Course Publishing Mechanics ---
  const isInstructor = currentUser && (
    currentUser.verified && (
      currentUser.role === "Researcher" || 
      currentUser.role === "Reviewer" || 
      currentUser.role === "Admin"
    )
  );

  const instructorCourses = courses.filter(c => c.instructorId === currentUser?.email);

  const startCreateCourse = () => {
    setEditingCourseId(null);
    setFormTitle("");
    setFormCategory("Sports Science & Physiology");
    setFormDuration("");
    setFormDifficulty("Intermediate");
    setFormCoverImage("");
    setFormDescription("");
    setFormPrice(0);
    setFormStatus("Published");
    setFormObjectives([""]);
    setFormRequirements([""]);
    setFormAudience([""]);
    setFormCurriculum([
      { title: "Module 1: Concepts", duration: "1 week", lessons: ["Syllabus introduction", "Topic foundation"] }
    ]);
    setIsCreatingEditing(true);
  };

  const startEditCourse = (course: ExtendedCourse) => {
    setEditingCourseId(course.id);
    setFormTitle(course.title);
    setFormCategory(course.category);
    setFormDuration(course.duration);
    setFormDifficulty(course.difficulty);
    setFormCoverImage(course.coverImage);
    setFormDescription(course.description);
    setFormPrice(course.price || 0);
    setFormStatus(course.status || "Published");
    setFormObjectives(course.learningObjectives?.length ? course.learningObjectives : [""]);
    setFormRequirements(course.requirements?.length ? course.requirements : [""]);
    setFormAudience(course.targetAudience?.length ? course.targetAudience : [""]);
    setFormCurriculum(course.curriculum?.length ? course.curriculum : [
      { title: "Module 1: Concepts", duration: "1 week", lessons: ["Syllabus introduction"] }
    ]);
    setIsCreatingEditing(true);
  };

  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) {
      showToast("Please fill in the title and description.", "error");
      return;
    }

    const defaultCovers = [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=600"
    ];
    const finalCover = formCoverImage.trim() || defaultCovers[Math.floor(Math.random() * defaultCovers.length)];

    const cleanedObjectives = formObjectives.filter(o => o.trim() !== "");
    const cleanedRequirements = formRequirements.filter(r => r.trim() !== "");
    const cleanedAudience = formAudience.filter(a => a.trim() !== "");

    if (editingCourseId) {
      // Editing existing
      const updated = courses.map(c => {
        if (c.id === editingCourseId) {
          return {
            ...c,
            title: formTitle,
            category: formCategory,
            duration: formDuration || "Self-Paced",
            difficulty: formDifficulty,
            coverImage: finalCover,
            description: formDescription,
            price: formPrice,
            status: formStatus,
            learningObjectives: cleanedObjectives.length ? cleanedObjectives : ["Acquire key field credentials."],
            requirements: cleanedRequirements.length ? cleanedRequirements : ["Interest in the domain."],
            targetAudience: cleanedAudience.length ? cleanedAudience : ["Professionals and students."],
            curriculum: formCurriculum
          };
        }
        return c;
      });
      saveToLocalStorage(updated);
      showToast(`Successfully updated course "${formTitle}"`, "success");
    } else {
      // Creating new
      const newC: ExtendedCourse = {
        id: `course-custom-${Date.now()}`,
        title: formTitle,
        instructorId: currentUser?.email || "unknown",
        instructorName: currentUser?.name || "Verified Academic",
        category: formCategory,
        duration: formDuration || "Self-Paced",
        difficulty: formDifficulty,
        coverImage: finalCover,
        description: formDescription,
        price: formPrice,
        status: formStatus,
        learningObjectives: cleanedObjectives.length ? cleanedObjectives : ["Acquire key field credentials."],
        requirements: cleanedRequirements.length ? cleanedRequirements : ["Interest in the domain."],
        targetAudience: cleanedAudience.length ? cleanedAudience : ["Professionals and students."],
        curriculum: formCurriculum,
        faqs: [
          { question: "Is this course certified?", answer: "Yes, this course awards certified digital credentials upon completion of lessons." },
          { question: "How long do I have access?", answer: "You have lifetime, unrestricted digital access to all lessons, curriculum files, and direct developer workspace updates." }
        ],
        enrolledCount: 0
      };
      saveToLocalStorage([newC, ...courses]);
      showToast(`Successfully created and published course "${formTitle}"`, "success");
    }

    setIsCreatingEditing(false);
    setEditingCourseId(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    if (confirm("Are you sure you want to permanently delete this course? This action is irreversible.")) {
      const updated = courses.filter(c => c.id !== courseId);
      saveToLocalStorage(updated);
      showToast("Course deleted successfully.", "success");
    }
  };

  const handleToggleStatus = (courseId: string, currentStatus: "Draft" | "Published" | "Archived") => {
    const nextStatusMap: Record<string, "Draft" | "Published" | "Archived"> = {
      Draft: "Published",
      Published: "Archived",
      Archived: "Draft"
    };
    const nextStatus = nextStatusMap[currentStatus] || "Published";
    
    const updated = courses.map(c => {
      if (c.id === courseId) {
        return { ...c, status: nextStatus };
      }
      return c;
    });
    saveToLocalStorage(updated);
    showToast(`Course status updated to ${nextStatus}`, "success");
  };

  // --- Dynamic Accordions Helper ---
  const toggleSection = (idx: number) => {
    setExpandedSections(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleFaq = (idx: number) => {
    setExpandedFaqs(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // --- Dynamic Categories for Filtering ---
  const categoriesList = ["All", ...Array.from(new Set(courses.map((c) => c.category)))];
  const difficultiesList = ["All", "Beginner", "Intermediate", "Advanced"];

  // --- Filter and Search logic ---
  const filteredCourses = courses.filter((course) => {
    // Standard users only see "Published" courses
    const isOwner = currentUser && course.instructorId === currentUser.email;
    const isSystemAdmin = currentUser?.role === "Admin";
    if (course.status !== "Published" && !isOwner && !isSystemAdmin) {
      return false;
    }

    const matchesSearch =
      course.title.toLowerCase().includes(query.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(query.toLowerCase()) ||
      course.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === "All" || course.difficulty === selectedDifficulty;
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="flex-grow bg-white py-10 animate-fadeIn font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ==================== VIEW: COURES DETAIL (LANDING PAGE) ==================== */}
        {selectedCourse ? (
          <div className="space-y-10 animate-fadeIn select-none">
            {/* Contextual System Administrator Controls */}
            {currentUser?.role === "Admin" && (
              <div className="bg-red-950 text-white border border-red-800 rounded-2xl p-3.5 mb-2 flex flex-wrap items-center justify-between gap-3 shadow-sm animate-fadeIn">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-red-300 shrink-0 stroke-[2]" />
                  <div>
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-100 block leading-none">
                      Administrator Contextual Controls
                    </span>
                    <span className="text-[10px] font-mono text-red-300">
                      Live Management • Course ID: {selectedCourse.id}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEditCourse(selectedCourse)}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                  >
                    Edit Syllabus
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = selectedCourse.status === "Published" ? "Archived" : "Published";
                      const updated = { ...selectedCourse, status: newStatus as "Draft" | "Published" | "Archived" };
                      setSelectedCourse(updated);
                      setCourses(courses.map(c => c.id === selectedCourse.id ? updated : c));
                      showToast(newStatus === "Archived" ? "Course hidden and unlisted." : "Course published live.", "success");
                    }}
                    className="px-3 py-1.5 bg-red-900 hover:bg-red-850 text-white text-[11px] font-mono font-bold rounded-xl border border-red-750 transition-colors cursor-pointer"
                  >
                    {selectedCourse.status === "Published" ? "Unpublish / Hide" : "Publish Live"}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Permanently delete course module "${selectedCourse.title}"?`)) {
                        setCourses(courses.filter(c => c.id !== selectedCourse.id));
                        setSelectedCourse(null);
                        showToast("Course deleted from catalog.", "success");
                      }
                    }}
                    className="px-3 py-1.5 bg-red-800 hover:bg-red-700 text-red-100 text-[11px] font-mono font-bold rounded-xl border border-red-600 transition-colors cursor-pointer"
                  >
                    Delete Course
                  </button>
                </div>
              </div>
            )}

            {/* Back Button */}
            <button
              onClick={() => setSelectedCourse(null)}
              className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              <span>Back to Courses Catalog</span>
            </button>

            {/* Course Landing Hero Banner */}
            <div className="border border-neutral-200/90 rounded-3xl overflow-hidden bg-neutral-50 flex flex-col lg:flex-row">
              {/* Cover Image */}
              <div className="lg:w-1/2 relative min-h-[300px] bg-neutral-100">
                <img
                  src={selectedCourse.coverImage}
                  alt={selectedCourse.title}
                  referrerPolicy="no-referrer"
                  className="object-cover w-full h-full"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="text-[10px] font-mono font-bold bg-black text-white px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">
                    {selectedCourse.difficulty}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white text-black px-2.5 py-1 rounded-full border border-neutral-200 uppercase tracking-wider shadow-sm">
                    {selectedCourse.duration}
                  </span>
                </div>
              </div>

              {/* Course Title & Primary Meta */}
              <div className="lg:w-1/2 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">
                    {selectedCourse.category}
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black uppercase tracking-tight leading-tight">
                    {selectedCourse.title}
                  </h1>
                  <p className="text-sm text-neutral-500 font-light leading-relaxed">
                    {selectedCourse.description}
                  </p>

                  {/* Instructor Meta */}
                  <div className="flex items-center space-x-3 pt-2">
                    <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center font-bold text-black font-sans shrink-0">
                      {selectedCourse.instructorName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-black">{selectedCourse.instructorName}</p>
                      <p className="text-[10px] text-neutral-400 uppercase font-mono">Course Author & Verified Scientist</p>
                    </div>
                  </div>
                </div>

                {/* Pricing & Checkout Block */}
                <div className="border-t border-neutral-200/80 pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono text-neutral-400 uppercase">Tuition Fee</p>
                    <div className="flex items-baseline space-x-1.5">
                      <span className="text-2xl font-bold font-sans text-black">
                        {selectedCourse.price && selectedCourse.price > 0 ? `$${selectedCourse.price}` : "Free"}
                      </span>
                      {selectedCourse.price && selectedCourse.price > 0 && (
                        <span className="text-[10px] font-mono text-neutral-400 uppercase">USD / full access</span>
                      )}
                    </div>
                  </div>

                  {enrolledCourseIds.includes(selectedCourse.id) ? (
                    <div className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-neutral-100 border border-neutral-300 text-neutral-500 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      <span>Enrolled & Active</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => triggerEnrollmentFlow(selectedCourse)}
                      className="w-full sm:w-auto bg-black text-white hover:bg-neutral-800 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm cursor-pointer inline-flex items-center justify-center space-x-2"
                    >
                      <span>Enroll in Course</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Syllabus 2-Column Landing Page Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              
              {/* Left Side: Overview, Objectives, Curriculum, FAQs */}
              <div className="lg:col-span-2 space-y-10">
                {/* Objectives */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-black uppercase tracking-wider font-sans flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <CheckSquare className="w-4 h-4 text-neutral-400" />
                    <span>Learning Objectives</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {(selectedCourse.learningObjectives || [
                      "Acquire core credential frameworks.",
                      "Master clinical practical testing protocols.",
                      "Evaluate critical physiological data.",
                      "Integrate literature-backed health designs."
                    ]).map((obj, i) => (
                      <div key={i} className="flex items-start space-x-3 text-xs">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-neutral-600 leading-relaxed font-light">{obj}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Curriculum / Lessons List */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-black uppercase tracking-wider font-sans flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <BookOpen className="w-4 h-4 text-neutral-400" />
                    <span>Course Curriculum & Lessons</span>
                  </h2>
                  <div className="space-y-3">
                    {(selectedCourse.curriculum || [
                      { title: "Module 1: Concepts", duration: "1 week", lessons: ["Overview", "Topic Foundation"] }
                    ]).map((section, idx) => {
                      const isExpanded = !!expandedSections[idx];
                      return (
                        <div key={idx} className="border border-neutral-200 rounded-xl overflow-hidden bg-white">
                          <button
                            onClick={() => toggleSection(idx)}
                            className="w-full p-4 flex items-center justify-between bg-neutral-50/50 hover:bg-neutral-50 transition-colors text-left"
                          >
                            <div className="flex-1 pr-4">
                              <h3 className="text-xs sm:text-sm font-semibold text-black">{section.title}</h3>
                              <span className="text-[10px] font-mono text-neutral-400 uppercase block mt-0.5">{section.duration}</span>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-500 shrink-0" />}
                          </button>
                          
                          {isExpanded && (
                            <div className="border-t border-neutral-200 p-4 bg-white divide-y divide-neutral-100">
                              {section.lessons.map((lesson, lIdx) => (
                                <div key={lIdx} className="py-2.5 flex items-center justify-between text-xs text-neutral-600">
                                  <div className="flex items-center space-x-2">
                                    <Play className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                                    <span className="font-light">{lesson}</span>
                                  </div>
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase shrink-0">Academic Lecture</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* FAQs Accordion */}
                <div className="space-y-4">
                  <h2 className="text-base font-bold text-black uppercase tracking-wider font-sans flex items-center space-x-2 pb-2 border-b border-neutral-100">
                    <FileText className="w-4 h-4 text-neutral-400" />
                    <span>Frequently Asked Questions</span>
                  </h2>
                  <div className="space-y-3">
                    {(selectedCourse.faqs || [
                      { question: "Is this certified?", answer: "Yes." }
                    ]).map((faq, idx) => {
                      const isExpanded = !!expandedFaqs[idx];
                      return (
                        <div key={idx} className="border border-neutral-100 rounded-xl bg-white p-4">
                          <button
                            onClick={() => toggleFaq(idx)}
                            className="w-full flex items-center justify-between text-left text-xs sm:text-sm font-semibold text-black"
                          >
                            <span>{faq.question}</span>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                          </button>
                          {isExpanded && (
                            <p className="text-xs text-neutral-500 font-light leading-relaxed mt-2 pt-2 border-t border-neutral-100">
                              {faq.answer}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Right Side Column: Meta Summary Panel & Requirements */}
              <div className="space-y-8">
                {/* Quick Info Box */}
                <div className="border border-neutral-200 p-6 rounded-2xl bg-neutral-50/50 space-y-4">
                  <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">Course Specifications</h3>
                  <div className="space-y-3.5 divide-y divide-neutral-200/80">
                    <div className="flex justify-between items-center text-xs pt-1">
                      <span className="text-neutral-500 font-light">Difficulty Level</span>
                      <strong className="text-black font-semibold">{selectedCourse.difficulty}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2.5">
                      <span className="text-neutral-500 font-light">Duration</span>
                      <strong className="text-black font-semibold">{selectedCourse.duration}</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2.5">
                      <span className="text-neutral-500 font-light">Verified Enrollees</span>
                      <strong className="text-black font-semibold">{selectedCourse.enrolledCount || 24} active students</strong>
                    </div>
                    <div className="flex justify-between items-center text-xs pt-2.5">
                      <span className="text-neutral-500 font-light">Credential Award</span>
                      <strong className="text-black font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-black shrink-0" /> Yes
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Target Audience */}
                <div className="border border-neutral-200 p-6 rounded-2xl space-y-4 bg-white">
                  <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">Target Audience</h3>
                  <div className="space-y-2">
                    {(selectedCourse.targetAudience || [
                      "Rehabilitation specialists", "Kinesiologists"
                    ]).map((aud, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-black shrink-0 mt-1.5" />
                        <span className="text-neutral-600 leading-normal font-light">{aud}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Requirements */}
                <div className="border border-neutral-200 p-6 rounded-2xl space-y-4 bg-white">
                  <h3 className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider">Prerequisites</h3>
                  <div className="space-y-2">
                    {(selectedCourse.requirements || [
                      "Familiarity with clinical medicine terminology"
                    ]).map((req, i) => (
                      <div key={i} className="flex items-start space-x-2 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 text-neutral-400 shrink-0 mt-0.5" />
                        <span className="text-neutral-600 leading-normal font-light">{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        ) : isInstructorWorkspace ? (
          
          // ==================== VIEW: INSTRUCTOR WORKSPACE ====================
          <div className="space-y-8 animate-fadeIn">
            {/* Header / Back Action */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-neutral-100">
              <div>
                <button
                  onClick={() => {
                    setIsInstructorWorkspace(false);
                    setIsCreatingEditing(false);
                  }}
                  className="inline-flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-black transition-colors mb-3 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Catalog</span>
                </button>
                <h1 className="text-2xl font-bold text-black uppercase tracking-tight flex items-center gap-2">
                  <GraduationCap className="w-7 h-7 text-black stroke-[1.5]" />
                  <span>Instructor Workspace</span>
                </h1>
                <p className="text-xs text-neutral-500 font-light mt-0.5">
                  Publish, author, and manage academic curriculum, pricing, and enrollments for your courses.
                </p>
              </div>

              {!isCreatingEditing && (
                <button
                  onClick={startCreateCourse}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer self-start sm:self-auto"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Course Draft</span>
                </button>
              )}
            </div>

            {/* CREATING / EDITING FORM */}
            {isCreatingEditing ? (
              <form onSubmit={handleSaveCourse} className="border border-neutral-200 p-6 sm:p-8 rounded-2xl bg-neutral-50/40 space-y-6 max-w-4xl mx-auto">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                  <h3 className="font-bold text-black uppercase text-sm">
                    {editingCourseId ? "Edit Course Syllabus" : "Publish New Academic Course"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsCreatingEditing(false)}
                    className="text-neutral-400 hover:text-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Standard Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Course Title</label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Advanced Cardiorespiratory Physiology"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Specialty Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black cursor-pointer"
                    >
                      <option value="Sports Science & Physiology">Sports Science & Physiology</option>
                      <option value="Physical Therapy & Rehabilitation">Physical Therapy & Rehabilitation</option>
                      <option value="Molecular Medicine & Endocrinology">Molecular Medicine & Endocrinology</option>
                      <option value="Biomechanics & Kinesiology">Biomechanics & Kinesiology</option>
                      <option value="Sleep Science & Sports Nutrition">Sleep Science & Sports Nutrition</option>
                      <option value="Cardiology & Sports Medicine">Cardiology & Sports Medicine</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Duration (e.g., 6 weeks (30 hours))</label>
                    <input
                      type="text"
                      required
                      value={formDuration}
                      onChange={(e) => setFormDuration(e.target.value)}
                      placeholder="e.g. 6 weeks (32 hours)"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Difficulty Level</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black cursor-pointer"
                    >
                      <option value="Beginner">Beginner Level</option>
                      <option value="Intermediate">Intermediate Level</option>
                      <option value="Advanced">Advanced Level</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Tuition Price (USD) — Set to 0 for Free course</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={formPrice}
                      onChange={(e) => setFormPrice(parseInt(e.target.value) || 0)}
                      placeholder="e.g. 149"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-semibold text-neutral-700">Cover Image URL (Optional)</label>
                    <input
                      type="text"
                      value={formCoverImage}
                      onChange={(e) => setFormCoverImage(e.target.value)}
                      placeholder="https://images.unsplash.com/... or leave blank for preset"
                      className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-semibold text-neutral-700">Course Summary Overview</label>
                  <textarea
                    required
                    rows={4}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide a comprehensive academic summary of this course including key highlights..."
                    className="w-full p-3.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black leading-relaxed font-light"
                  />
                </div>

                {/* Syllabus Structure & Status */}
                <div className="border-t border-neutral-200 pt-5 text-xs space-y-4">
                  <h4 className="font-bold text-neutral-800 uppercase text-xs">Syllabus Details</h4>
                  
                  {/* Objectives Editor */}
                  <div className="space-y-2">
                    <label className="font-semibold text-neutral-700 block">Learning Objectives (Add at least one)</label>
                    {formObjectives.map((obj, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => {
                            const cloned = [...formObjectives];
                            cloned[i] = e.target.value;
                            setFormObjectives(cloned);
                          }}
                          placeholder="Understand specific physiology, biomechanics, etc."
                          className="flex-1 px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                        />
                        {formObjectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setFormObjectives(formObjectives.filter((_, idx) => idx !== i))}
                            className="text-neutral-400 hover:text-black p-2"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setFormObjectives([...formObjectives, ""])}
                      className="inline-flex items-center space-x-1 text-black font-semibold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Objective</span>
                    </button>
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="border-t border-neutral-200 pt-6 flex justify-end space-x-3 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setIsCreatingEditing(false)}
                    className="px-5 py-2.5 bg-neutral-200/80 text-neutral-700 hover:bg-neutral-200 rounded-xl transition-all"
                  >
                    Cancel Edit
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-black text-white hover:bg-neutral-800 rounded-xl transition-all uppercase tracking-wider text-xs shadow-sm"
                  >
                    Save Course Publishing
                  </button>
                </div>
              </form>
            ) : (
              
              // Owned Courses Catalog
              <div className="space-y-4">
                <h3 className="text-sm font-mono font-bold text-neutral-400 uppercase tracking-wider">Your Registered Course Curriculums ({instructorCourses.length})</h3>
                {instructorCourses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {instructorCourses.map(course => (
                      <div key={course.id} className="border border-neutral-200 bg-white p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-black transition-all">
                        <div className="flex gap-4">
                          {/* Small cover thumbnail */}
                          <div className="w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                            <img src={course.coverImage} alt={course.title} className="object-cover w-full h-full" />
                          </div>
                          <div className="space-y-1 min-w-0">
                            <span className="text-[9px] font-mono font-bold bg-neutral-100 border border-neutral-200 px-1.5 py-0.5 rounded uppercase tracking-wider text-neutral-500">
                              {course.status || "Published"}
                            </span>
                            <h4 className="font-bold text-sm text-black truncate">{course.title}</h4>
                            <p className="text-[10px] text-neutral-400 font-mono uppercase">{course.category}</p>
                            <p className="text-xs text-neutral-600 font-sans">
                              Price: <strong>{course.price && course.price > 0 ? `$${course.price}` : "Free"}</strong> • {course.enrolledCount || 0} students
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 text-xs">
                          <button
                            onClick={() => handleToggleStatus(course.id, course.status || "Published")}
                            className="text-neutral-500 hover:text-black font-semibold font-mono uppercase text-[10px]"
                          >
                            Status: <span className="underline">{course.status || "Published"}</span>
                          </button>

                          <div className="flex items-center space-x-3 font-semibold">
                            <button
                              onClick={() => startEditCourse(course)}
                              className="text-neutral-600 hover:text-black flex items-center space-x-1"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>Edit Syllabus</span>
                            </button>
                            <button
                              onClick={() => handleDeleteCourse(course.id)}
                              className="text-neutral-400 hover:text-rose-600 flex items-center space-x-1"
                            >
                              <Trash className="w-3.5 h-3.5" />
                              <span>Purge</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-neutral-200 border-dashed rounded-2xl p-10 text-center bg-neutral-50/50">
                    <p className="text-xs font-mono text-neutral-400 uppercase mb-2">No active published courses</p>
                    <h4 className="font-sans font-bold text-neutral-800 text-sm">Create your first academy syllabus today</h4>
                    <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed font-light">
                       verified instructors can post and configure comprehensive lessons, pricing structures, and learning objectives for Healthedia enrollees.
                    </p>
                    <button
                      onClick={startCreateCourse}
                      className="mt-4 px-4 py-2 bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all inline-flex items-center space-x-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Start Draft</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        ) : (
          
          // ==================== VIEW: GENERAL CATALOG ====================
          <div className="space-y-10">
            {/* Page Header */}
            <div className="border-b border-neutral-100 pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-neutral-50 border border-neutral-200/80 rounded-full text-[10px] font-mono text-neutral-500 uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-black" />
                  <span>Healthedia Academy Registry</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-sans font-bold text-black tracking-tight uppercase">
                  Professional Education Registry
                </h1>
                <p className="text-xs sm:text-sm text-neutral-500 font-sans mt-1.5 font-light max-w-2xl">
                  Acquire advanced clinical credentials. Take intensive scientific lectures structured by top sports physiologists, kinesiologists, and molecular endocrine researchers.
                </p>
              </div>

              {isInstructor && (
                <button
                  onClick={() => setIsInstructorWorkspace(true)}
                  className="bg-black hover:bg-neutral-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer self-stretch sm:self-auto"
                >
                  <GraduationCap className="w-4.5 h-4.5 text-white" />
                  <span>Instructor Workspace</span>
                </button>
              )}
            </div>

            {/* Search & Filters */}
            <div className="bg-neutral-50 border border-neutral-200/80 p-5 rounded-2xl space-y-4 select-none">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-grow relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                    <Search className="w-4 h-4 stroke-[1.5]" />
                  </div>
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search courses, instructors, specialties..."
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-sans placeholder-neutral-400 transition-colors"
                  />
                </div>

                {/* Category filter */}
                <div className="w-full md:w-64 text-xs">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black cursor-pointer"
                  >
                    <option value="All">All Specialties</option>
                    {categoriesList.filter(c => c !== "All").map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Level filter */}
                <div className="w-full md:w-48 text-xs">
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black cursor-pointer"
                  >
                    <option value="All">All Difficulty Levels</option>
                    {difficultiesList.filter(d => d !== "All").map((diff) => (
                      <option key={diff} value={diff}>{diff} Level</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reset active filters */}
              <div className="flex items-center justify-between text-xs font-mono text-neutral-400">
                <span>Showing {filteredCourses.length} professional courses</span>
                {(query || selectedCategory !== "All" || selectedDifficulty !== "All") && (
                  <button
                    onClick={() => {
                      setQuery("");
                      setSelectedCategory("All");
                      setSelectedDifficulty("All");
                    }}
                    className="text-neutral-500 hover:text-black underline cursor-pointer"
                  >
                    Reset Filter Parameters
                  </button>
                )}
              </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course) => {
                  const isEnrolled = enrolledCourseIds.includes(course.id);
                  return (
                    <div
                      key={course.id}
                      className="bg-white border border-neutral-200/90 rounded-2xl overflow-hidden hover:border-black hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                      onClick={() => setSelectedCourse(course)}
                    >
                      <div>
                        {/* Cover Image */}
                        <div className="relative aspect-video w-full overflow-hidden bg-neutral-100 border-b border-neutral-200">
                          <img
                            src={course.coverImage}
                            alt={course.title}
                            referrerPolicy="no-referrer"
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                            <span className="text-[9px] font-mono font-bold bg-black text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                              {course.difficulty}
                            </span>
                            <span className="text-[9px] font-mono font-bold bg-white text-black px-2 py-0.5 rounded-full border border-neutral-200 uppercase tracking-wider shadow-sm">
                              {course.duration}
                            </span>
                          </div>
                        </div>

                        {/* Text Metadata */}
                        <div className="p-5 space-y-3">
                          <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                            {course.category}
                          </span>
                          <h3 className="font-sans font-bold text-base text-black group-hover:text-neutral-800 leading-snug">
                            {course.title}
                          </h3>
                          <div className="flex items-center space-x-2 text-xs text-neutral-600 font-sans">
                            <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center border border-neutral-200 font-bold text-[10px] text-neutral-500">
                              {course.instructorName.slice(0, 2).toUpperCase()}
                            </div>
                            <span className="font-medium text-black">{course.instructorName}</span>
                          </div>
                          <p className="text-xs text-neutral-500 leading-relaxed font-light line-clamp-2">
                            {course.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer & CTA Button */}
                      <div className="px-5 pb-5 pt-3 border-t border-neutral-50 flex items-center justify-between bg-neutral-50/50" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-mono text-neutral-400 uppercase">Tuition Fee</span>
                          <span className="text-xs font-bold text-black font-sans">
                            {course.price && course.price > 0 ? `$${course.price}` : "Free Course"}
                          </span>
                        </div>

                        <button
                          onClick={() => triggerEnrollmentFlow(course)}
                          disabled={isEnrolled}
                          className={`text-xs font-sans font-semibold py-2 px-4 rounded-xl transition-all duration-200 shadow-sm flex items-center ${
                            isEnrolled
                              ? "bg-neutral-100 border border-neutral-300 text-neutral-400 cursor-not-allowed"
                              : "bg-black text-white border border-black hover:bg-neutral-800 cursor-pointer"
                          }`}
                        >
                          {isEnrolled ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5 mr-1.5 text-neutral-500" />
                              Enrolled
                            </>
                          ) : (
                            <>
                              Enroll
                              <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="border border-neutral-200 p-12 text-center bg-neutral-50/40 rounded-2xl select-none">
                <p className="text-xs font-mono text-neutral-400 uppercase mb-2">No Courses Found</p>
                <h3 className="text-base font-sans font-semibold text-black">No courses matched your query</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-2 leading-relaxed font-light">
                  Adjust filters or search parameters to view cardiovascular, kinesiologic, or rehabilitation courses.
                </p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* ==================== DIALOG: SIMULATED SECURE PAYMENT CHECKOUT ==================== */}
      {checkoutCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-white border border-neutral-200 shadow-2xl max-w-md w-full p-6 rounded-2xl relative space-y-4">
            <button
              onClick={() => setCheckoutCourse(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-center space-x-3 text-black">
              <div className="p-2.5 bg-neutral-100 rounded-full border border-neutral-200 shrink-0">
                <CreditCard className="w-5 h-5 text-black stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-base text-black">Secure Payment Checkout</h3>
                <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
                  Simulated Bank Gateway
                </p>
              </div>
            </div>

            {/* Course Summary */}
            <div className="bg-neutral-50 border border-neutral-200/80 p-3.5 rounded-xl space-y-1 text-xs">
              <p className="text-[10px] font-mono text-neutral-400 uppercase">Selected Course Syllabus</p>
              <p className="font-sans font-bold text-black">{checkoutCourse.title}</p>
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-neutral-200/60 font-semibold text-black">
                <span>Tuition Total:</span>
                <span className="font-bold text-sm">${checkoutCourse.price} USD</span>
              </div>
            </div>

            {/* Payment Inputs Form */}
            <form onSubmit={handleSimulatedPayment} className="space-y-4 text-xs font-sans">
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Cardholder Full Name</label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  placeholder="e.g. Dr. Evelyn Thorne"
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-700">Credit Card Number</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={19}
                    value={cardNumber}
                    onChange={(e) => {
                      // format spaces every 4 digits
                      const val = e.target.value.replace(/\D/g, "");
                      const formatted = val.match(/.{1,4}/g)?.join(" ") || val;
                      setCardNumber(formatted);
                    }}
                    placeholder="4000 1234 5678 9010"
                    className="w-full pl-3 pr-10 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-mono tracking-widest text-xs"
                  />
                  <CreditCard className="w-4 h-4 text-neutral-400 absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700">Expiration Date</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={cardExpiry}
                    onChange={(e) => {
                      let val = e.target.value.replace(/\D/g, "");
                      if (val.length > 2) {
                        val = val.slice(0, 2) + "/" + val.slice(2, 4);
                      }
                      setCardExpiry(val);
                    }}
                    placeholder="MM/YY"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-mono text-center text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-neutral-700">CVV / Security Code</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                    placeholder="123"
                    className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-black font-mono text-center text-xs"
                  />
                </div>
              </div>

              {/* Security Warning */}
              <div className="flex items-start space-x-2 text-[10px] text-neutral-500 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100">
                <ShieldCheck className="w-4 h-4 text-neutral-400 shrink-0" />
                <p className="leading-normal font-light">
                  This transaction is fully simulated. No actual financial operations are executed and your session credentials are not stored outside local cache.
                </p>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isProcessingPayment}
                className="w-full py-3 bg-black hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed text-white font-sans text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2"
              >
                {isProcessingPayment ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span>Processing Secure Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Approve & Complete Payment</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DIALOG: ENROLLMENT CONFIRMATION / SUCCESS ==================== */}
      {paymentSuccessCourse && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn select-none">
          <div className="bg-white border border-neutral-200 shadow-2xl max-w-md w-full p-6 rounded-2xl relative space-y-4">
            <button
              onClick={() => setPaymentSuccessCourse(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 text-black">
              <div className="p-2.5 bg-neutral-100 rounded-full border border-emerald-500 shrink-0">
                <CheckCircle className="w-6 h-6 text-emerald-600 stroke-[1.5]" />
              </div>
              <div>
                <h3 className="font-sans font-bold text-lg text-black">Enrollment Confirmed</h3>
                <p className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider mt-0.5">
                  Healthedia Academic Academy
                </p>
              </div>
            </div>
            
            <div className="border-t border-b border-neutral-100 py-4 space-y-2 text-xs">
              <p className="text-neutral-500">You are successfully registered for the syllabus:</p>
              <p className="font-sans font-extrabold text-black text-sm">{paymentSuccessCourse.title}</p>
              <p className="text-neutral-600 flex items-center">
                <User className="w-3.5 h-3.5 mr-1.5 text-neutral-400" />
                Instructor: {paymentSuccessCourse.instructorName}
              </p>
            </div>

            <p className="text-xs text-neutral-500 leading-relaxed font-light">
              This course and all related lecture files, syllabi downloads, and digital credentials have been added to your academic profile dashboard database.
            </p>

            <button
              onClick={() => setPaymentSuccessCourse(null)}
              className="w-full py-2.5 bg-black hover:bg-neutral-800 text-white font-sans text-xs font-semibold rounded-xl uppercase tracking-wider transition-all"
            >
              Continue Learning
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
