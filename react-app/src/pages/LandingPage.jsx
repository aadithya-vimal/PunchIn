import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  // SEO configuration with rich keywords and schema
  useSEO({
    title: "Punch.In — College Attendance Tracker, 75% Bunk Calculator & Timetable Planner",
    description: "Master college attendance and bunk with mathematical certainty. Calculate safe skips for 75% or 85% criteria, sync semester timetables in study pods, and avoid detention.",
    keywords: "college attendance tracker, bunk calculator, 75 percent attendance calculator, university attendance manager, how many classes can i bunk, college attendance percentage, semester timetable planner, study pods, student attendance app, condonation calculator",
    canonicalUrl: "https://punchin.pages.dev/",
    schema: {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "Punch.In",
      "applicationCategory": "EducationalApplication",
      "operatingSystem": "Web, iOS, Android",
      "offers": { "@type": "Offer", "price": "0" },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.9",
        "reviewCount": "1240"
      }
    }
  });

  const features = [
    {
      icon: "fa-bullseye",
      title: "Precision Attendance Engine",
      description: "Directly adjust percentages, calculate classes needed for 75% or 85% eligibility, and project exactly how many classes you can afford to bunk."
    },
    {
      icon: "fa-calculator",
      title: "Algorithmic Bunk Engine",
      description: "Mathematically forecast the exact fallout of skipping upcoming lectures. Boundary-condition analysis keeps you safely above detention criteria."
    },
    {
      icon: "fa-users-viewfinder",
      title: "Collaborative Study Pods",
      description: "Sync timetables with friends in a single click. Share schedules, compete on merit leaderboards, and coordinate group bunk windows effortlessly."
    },
    {
      icon: "fa-bolt-lightning",
      title: "Smart Auto-Punch",
      description: "Background timetable automation marks scheduled periods without manual daily hassle. Configurable period intervals align to any college bell schedule."
    },
    {
      icon: "fa-mug-hot",
      title: "Free Periods & Substitutions",
      description: "Full support for leisure/no period slots, instant professor substitutions, and custom elective period assignments on disrupted college days."
    },
    {
      icon: "fa-shield-halved",
      title: "Zero-Knowledge Control",
      description: "Your academic records stay completely yours. Instant export, selective aggregate filtering, and complete one-click permanent data wipe capabilities."
    }
  ];

  const enrichedFaqs = [
    {
      q: "Can I set or edit my attendance percentage directly?",
      a: "Yes! You can adjust your target percentage directly from the Subjects panel or Attendance Overview by clicking the pen icon. Punch.In will automatically calibrate your attended and total class counts to reflect your exact percentage."
    },
    {
      q: "How does the Bunk Engine calculate safe skips?",
      a: "The Bunk Engine uses the inequality: Attended / (Total + B) >= Required%. It solves for B (safe bunks) by calculating floor((Attended - Req% * Total) / Req%). This gives you the maximum consecutive classes you can miss right now without dropping below your target percentage."
    },
    {
      q: "How do Study Pods work and how do I import a timetable?",
      a: "Pods let you create or join a group with classmates using a unique Pod Code. Once joined, you can import an entire semester's course catalog and weekly timetable in one tap by clicking 'Copy Timetable'. Your attendance counters begin fresh at 0/0 while your entire week is scheduled."
    },
    {
      q: "Can I configure free periods or leisure hours?",
      a: "Absolutely. In the weekly timetable editor, every period dropdown allows you to choose 'Free / No Period'. Free periods are automatically excluded from auto-punching and bunk requirements. You can also substitute a class into a free period at any time."
    },
    {
      q: "How does Auto-Punch work with my college bell schedule?",
      a: "Auto-Punch compares the current clock time with your custom period timings. Once a period has passed its start time on the day's timetable, Punch.In automatically logs your attendance without manual daily interaction. Free periods are automatically skipped."
    },
    {
      q: "Is Punch.In free and open source?",
      a: "Punch.In is 100% open source, free to use, and contains zero intrusive advertisements, trackers, or paywalled academic tools. Built by students, for students."
    },
    {
      q: "Can I delete all my data permanently?",
      a: "Yes. From Account & Settings > Danger Zone, you can choose to reset your timetable only, or execute a complete purge that permanently removes all records, subjects, punches, timings, and timestamps from cloud servers and local storage."
    },
    {
      q: "What is the difference between Official Overall and Custom Aggregate?",
      a: "Official Overall calculates the cumulative attendance across all registered courses. Custom Aggregate allows you to filter out specific non-credit, audit, or optional courses from the aggregate calculation to view your exact core requirement percentage."
    }
  ];

  return (
    <div className="gradient-bg min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white overflow-x-hidden">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/75 border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img 
              src="/AttendanceApplication.ico" 
              alt="Punch.In College Attendance Logo" 
              className="w-8 h-8 object-contain drop-shadow" 
            />
            <span className="text-base sm:text-lg font-bold tracking-tight text-white">Punch<span className="text-sky-400">.In</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-medium text-white/70">
            <Link to="/calculator" className="hover:text-white transition-colors">Free Calculator</Link>
            <Link to="/bunk-engine" className="hover:text-white transition-colors">Bunk Engine</Link>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pods" className="hover:text-white transition-colors">Study Pods</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <Link 
              to="/calculator" 
              className="apple-btn-secondary text-xs px-3 sm:px-4 py-1.5 sm:py-2"
            >
              Calculator
            </Link>
            <Link 
              to="/login" 
              className="apple-btn-primary text-xs px-3 sm:px-4 py-1.5 sm:py-2"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 sm:pt-28 sm:pb-32 px-4 sm:px-6 overflow-hidden text-center">
        {/* Subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] h-[300px] bg-sky-500/10 blur-[100px] sm:blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] sm:text-xs font-medium text-sky-300 mb-6 sm:mb-8 backdrop-blur-md">
            <img 
              src="/AttendanceApplication.ico" 
              alt="Punch.In Icon" 
              className="w-3.5 h-3.5 object-contain" 
            />
            <span>Next-Gen Academic Companion for Scholars & Engineers</span>
          </div>

          {/* Metal shimmering title */}
          <h1 className="text-3xl sm:text-6xl md:text-7xl font-extrabold tracking-tight metal-shimmer mb-6 leading-[1.12]">
            Master your attendance.<br />Bunk with mathematical certainty.
          </h1>

          <p className="text-sm sm:text-lg text-white/60 max-w-2xl mx-auto mb-8 sm:mb-10 font-normal leading-relaxed px-2">
            Eliminate exam eligibility anxiety with real-time class tracking, instant timetable synchronization, multi-student collaborative pods, free period scheduling, and algorithmic bunk forecasting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm sm:max-w-none mx-auto">
            <Link 
              to="/login" 
              className="apple-btn-primary text-xs sm:text-sm px-6 py-3 w-full sm:w-auto shadow-xl shadow-white/10 flex items-center justify-center gap-2"
            >
              <span>Launch Companion</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
            <Link 
              to="/bunk-engine" 
              className="apple-btn-secondary text-xs sm:text-sm px-5 py-3 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <i className="fas fa-calculator text-xs text-sky-400"></i>
              <span>Open Bunk Engine</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-12 sm:mt-14 pt-6 sm:pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[11px] sm:text-xs text-white/40">
            <div className="flex items-center gap-2">
              <i className="fas fa-bolt text-sky-400"></i>
              <span>Zero-latency local cache & Cloud sync</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-lock text-emerald-400"></i>
              <span>Permanent wipe & full privacy</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-mobile-screen text-amber-400"></i>
              <span>Mobile-optimized PWA experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Showcase UI Mockup */}
      <section className="px-4 sm:px-6 pb-20 -mt-6">
        <div className="max-w-5xl mx-auto">
          <div className="apple-card p-3 sm:p-5 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 mb-4 text-xs text-white/40">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-mono text-[11px] text-white/50 truncate">punchin-scholar.pages.dev/dashboard</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-1 sm:p-3">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Overall Status</span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">87.5%</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <i className="fas fa-circle-check"></i> 8 classes safe to bunk
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Today's Schedule</span>
                <div className="text-sm font-semibold text-white mt-1">4 Periods &bull; 1 Free Slot</div>
                <div className="text-xs text-white/50 mt-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> P-1 Data Structures Attended
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider">Active Study Pod</span>
                <div className="text-sm font-semibold text-white mt-1">Section B Tech Squad</div>
                <div className="text-xs text-sky-300 mt-1 flex items-center gap-1">
                  <i className="fas fa-user-group text-[10px]"></i> 6 Classmates synced
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid Section */}
      <section id="features" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="apple-badge mb-3">Enterprise Grade For Students</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for academic sanity.
            </h2>
            <p className="text-xs sm:text-sm text-white/50 mt-2">
              Everything you need to maintain pristine college attendance criteria without sacrificing campus life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="apple-card apple-card-interactive p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 text-sky-400 flex items-center justify-center mb-4 text-base">
                    <i className={`fas ${f.icon}`}></i>
                  </div>
                  <h3 className="text-base font-bold text-white tracking-tight mb-1.5">{f.title}</h3>
                  <p className="text-xs text-white/60 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Study Pods Section */}
      <section id="pods" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <span className="apple-badge mb-3">Collaborative Synergy</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight mb-3 leading-tight">
              Timetable setup in 3 seconds.<br />Not 30 minutes.
            </h2>
            <p className="text-xs sm:text-sm text-white/60 leading-relaxed mb-6">
              Stop re-entering 40 weekly subject slots every semester. Join your class's Study Pod, click <strong>"Copy Timetable"</strong>, and have every course name, timing, and classroom slot cloned right into your dashboard.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-white/70 mb-6">
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-sky-400 text-xs"></i>
                <span>One-click timetable & course catalog replication</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-sky-400 text-xs"></i>
                <span>Group Bunk Simulator coordinates zero-penalty off-days</span>
              </li>
              <li className="flex items-center gap-2.5">
                <i className="fas fa-check-circle text-sky-400 text-xs"></i>
                <span>Pod Leaderboard with discipline & participation badges</span>
              </li>
            </ul>

            <Link to="/login" className="apple-btn-primary text-xs px-5 py-2.5 inline-flex items-center gap-2">
              <span>Start or Join a Pod</span>
              <i className="fas fa-arrow-right text-[10px]"></i>
            </Link>
          </div>

          <div className="apple-card p-5 sm:p-6 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="text-xs font-semibold text-white">Pod Standings &bull; CSE Section A</div>
              <span className="apple-badge text-[10px]">Live</span>
            </div>
            
            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">#1</span>
                  <span className="text-white">Alex Rivera</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-emerald-400 font-bold">92.4%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Ace</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">#2</span>
                  <span className="text-sky-300 font-bold">You</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-sky-300 font-bold">87.5%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">Active</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">#3</span>
                  <span className="text-white">Sarah Chen</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-amber-400 font-bold">78.1%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Deep SEO Educational Keywords Section */}
      <section className="py-16 px-4 sm:px-6 border-t border-white/[0.06] bg-black/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="apple-badge mb-2">University Regulations & Academic Survival</span>
            <h2 className="text-xl sm:text-3xl font-bold text-white tracking-tight">
              Why Attendance Percentage Matters in University
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-white/60 leading-relaxed">
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <i className="fas fa-scale-balanced text-sky-400"></i> The Mandatory 75% Rule
              </h3>
              <p>
                Universities, autonomous engineering colleges, and medical institutes typically mandate a minimum of 75% attendance per subject to qualify for end-semester exams. Dropping below triggers condonation fines or detention.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <i className="fas fa-stethoscope text-emerald-400"></i> Medical Condonations
              </h3>
              <p>
                Most colleges allow an exemption buffer (usually down to 65%) with valid medical certificates or sanctioned university club duty. Punch.In lets you simulate both normal and condoned percentage thresholds.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <i className="fas fa-brain text-amber-400"></i> Strategic Class Skipping
              </h3>
              <p>
                Engineering students frequently juggle hackathons, internships, competitive coding, and campus placements. Algorithmic bunk forecasting allows scholars to prioritize career sprints while keeping attendance clean.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enriched FAQ Section */}
      <section id="faq" className="py-20 sm:py-24 px-4 sm:px-6 border-t border-white/[0.06] bg-black/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <span className="apple-badge mb-3">Academic Knowledge Base</span>
            <h2 className="text-2xl sm:text-4xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs sm:text-sm text-white/50 mt-2">
              Everything you need to know about attendance mathematics, study pods, and data sovereignty.
            </p>
          </div>

          <div className="space-y-3">
            {enrichedFaqs.map((faq, i) => (
              <div 
                key={i}
                className="apple-card p-4 sm:p-5 cursor-pointer transition-all"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center text-xs sm:text-sm font-semibold text-white gap-3">
                  <span>{faq.q}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-200 text-white/50 shrink-0 ${activeFaq === i ? 'rotate-180 text-white' : ''}`}></i>
                </div>
                {activeFaq === i && (
                  <p className="mt-3 text-xs sm:text-sm text-white/60 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 sm:py-24 px-4 sm:px-6 text-center border-t border-white/[0.06] relative">
        <div className="max-w-2xl mx-auto">
          <img 
            src="/AttendanceApplication.ico" 
            alt="Punch.In Logo" 
            className="w-12 h-12 object-contain mx-auto mb-4 drop-shadow" 
          />
          <h2 className="text-2xl sm:text-5xl font-extrabold text-gradient mb-3">
            Ready to take control?
          </h2>
          <p className="text-xs sm:text-base text-white/60 mb-6 max-w-md mx-auto">
            Join thousands of scholars taking control of their semester attendance right now.
          </p>
          <Link to="/login" className="apple-btn-primary text-xs sm:text-sm px-7 py-3 inline-flex items-center gap-2">
            <span>Get Started with Punch.In</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07090e] py-8 px-4 sm:px-8 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img 
              src="/AttendanceApplication.ico" 
              alt="Punch.In Logo" 
              className="w-5 h-5 object-contain" 
            />
            <span className="font-semibold text-white/80">Punch.In Scholar Platform</span>
            <span>&bull; &copy; {new Date().getFullYear()} Aadithya Vimal</span>
          </div>

          <div className="flex items-center gap-5">
            <Link to="/calculator" className="hover:text-white transition-colors">Calculator</Link>
            <Link to="/bunk-engine" className="hover:text-white transition-colors">Bunk Engine</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <a href="mailto:aadithyavimal.work@gmail.com" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
