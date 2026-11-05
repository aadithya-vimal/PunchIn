import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [activeFaq, setActiveFaq] = useState(null);

  const features = [
    {
      icon: "fa-bullseye",
      title: "Precision Attendance Engine",
      description: "Directly adjust percentages, calculate classes needed for 75% or 85% eligibility, and project exactly how many classes you can afford to bunk."
    },
    {
      icon: "fa-users",
      title: "Collaborative Study Pods",
      description: "Sync timetables with friends in a single click. Share schedules, compete on merit leaderboards, and coordinate group bunk windows effortlessly."
    },
    {
      icon: "fa-bolt-lightning",
      title: "Smart Auto-Punch",
      description: "Background timetable automation marks scheduled periods without manual daily hassle. Configurable period intervals align to any college bell schedule."
    },
    {
      icon: "fa-calendar-day",
      title: "Daily Schedule & Substitutions",
      description: "Visual period tracker with one-tap class status, instant undo, and seamless professor/period substitution tracking for disrupted days."
    },
    {
      icon: "fa-brain",
      title: "AI Attendance Advisor",
      description: "Integrated AI strategist models risk factors, examination eligibility thresholds, and custom weekly recovery gameplans."
    },
    {
      icon: "fa-shield-halved",
      title: "Zero-Knowledge Control",
      description: "Your academic records stay completely yours. Instant export, selective aggregate filtering, and complete one-click permanent data wipe capabilities."
    }
  ];

  const faqs = [
    {
      q: "Can I set or edit my attendance percentage directly?",
      a: "Yes! You can adjust your target percentage directly from the Subjects panel or Attendance Overview. Punch.In will automatically calibrate your attended and total class counts to reflect your exact percentage."
    },
    {
      q: "How do Pods work?",
      a: "Pods let you create or join a group with classmates using a unique Pod Code. Once joined, you can import an entire semester's course catalog and timetable in one tap, see group attendance standings, and run collaborative bunk simulations."
    },
    {
      q: "Is Punch.In free to use for students?",
      a: "Punch.In is 100% open source, free to use, and contains zero intrusive advertisements or paywalled academic tools."
    },
    {
      q: "Can I delete all my data permanently?",
      a: "Yes. From Account & Settings > Danger Zone, you can choose to reset your timetable only, or execute a complete purge that permanently removes all records, subjects, punches, and timestamps."
    }
  ];

  return (
    <div className="gradient-bg min-h-screen text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-white">
      
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#07090e]/70 border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-b from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <i className="fas fa-check-double text-sm"></i>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">Punch<span className="text-sky-400">.In</span></span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-white/70">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pods" className="hover:text-white transition-colors">Study Pods</a>
            <a href="#calculator" className="hover:text-white transition-colors">Bunk Engine</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              to="/login" 
              className="apple-btn-secondary text-xs px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              to="/login" 
              className="apple-btn-primary text-xs px-4 py-2 hidden sm:inline-flex"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 px-6 overflow-hidden text-center">
        {/* Apple subtle radial glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
        
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/10 text-xs font-medium text-sky-300 mb-8 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping"></span>
            Next-Gen Academic Precision for Scholars & Engineers
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-gradient mb-6 leading-[1.08]">
            Master your attendance.<br />Bunk with mathematical certainty.
          </h1>

          <p className="text-base sm:text-xl text-white/60 max-w-2xl mx-auto mb-10 font-normal leading-relaxed">
            Eliminate exam eligibility anxiety with real-time class tracking, instant timetable synchronization, multi-student collaborative pods, and proactive bunk forecasting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link 
              to="/login" 
              className="apple-btn-primary text-sm px-7 py-3.5 w-full sm:w-auto shadow-xl shadow-white/10 flex items-center justify-center gap-2"
            >
              <span>Launch Companion</span>
              <i className="fas fa-arrow-right text-xs"></i>
            </Link>
            <a 
              href="#features" 
              className="apple-btn-secondary text-sm px-6 py-3.5 w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <span>Explore Capabilities</span>
            </a>
          </div>

          {/* Social Proof Badges */}
          <div className="mt-14 pt-8 border-t border-white/[0.06] flex flex-wrap items-center justify-center gap-8 text-xs text-white/40">
            <div className="flex items-center gap-2">
              <i className="fas fa-bolt text-sky-400"></i>
              <span>Zero-latency local cache & Cloud sync</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-lock text-emerald-400"></i>
              <span>Full privacy control & permanent wipe</span>
            </div>
            <div className="flex items-center gap-2">
              <i className="fas fa-mobile-screen text-amber-400"></i>
              <span>PWA-ready mobile experience</span>
            </div>
          </div>
        </div>
      </section>

      {/* App Preview Showcase UI Mockup */}
      <section className="px-6 pb-24 -mt-10">
        <div className="max-w-5xl mx-auto">
          <div className="apple-card p-3 sm:p-5 rounded-3xl border border-white/15 shadow-2xl relative">
            <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 mb-4 text-xs text-white/40">
              <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
              <span className="ml-2 font-mono text-[11px] text-white/50">punch-in.pages.dev/dashboard</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 sm:p-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Overall Status</span>
                <div className="text-3xl font-extrabold text-white mt-1">87.5%</div>
                <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                  <i className="fas fa-circle-check"></i> 8 classes safe to bunk
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 text-left">
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Today's Schedule</span>
                <div className="text-sm font-semibold text-white mt-1">4 Periods Scheduled</div>
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
      <section id="features" className="py-24 px-6 border-t border-white/[0.06] bg-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="apple-badge mb-3">Enterprise Grade For Students</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
              Engineered for academic sanity.
            </h2>
            <p className="text-sm sm:text-base text-white/50 mt-3">
              Everything you need to maintain pristine college attendance criteria without sacrificing campus life.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div 
                key={i} 
                className="apple-card apple-card-interactive p-7 flex flex-col justify-between"
              >
                <div>
                  <div className="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 text-sky-400 flex items-center justify-center mb-5 text-base">
                    <i className={`fas ${f.icon}`}></i>
                  </div>
                  <h3 className="text-lg font-bold text-white tracking-tight mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-white/60 leading-relaxed">{f.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pods Deep Dive */}
      <section id="pods" className="py-24 px-6 border-t border-white/[0.06]">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="apple-badge mb-4">Collaborative Synergy</span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 leading-tight">
              Timetable setup in 3 seconds.<br />Not 30 minutes.
            </h2>
            <p className="text-sm text-white/60 leading-relaxed mb-6">
              Stop re-entering 40 weekly subject slots every semester. Join your class's Study Pod, click <strong>"Copy Timetable"</strong>, and have every course name, timing, and classroom slot cloned right into your dashboard.
            </p>

            <ul className="space-y-3 text-xs sm:text-sm text-white/70">
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-sky-400"></i>
                <span>One-click timetable & course catalog replication</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-sky-400"></i>
                <span>Group Bunk Simulator coordinates zero-penalty off-days</span>
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-sky-400"></i>
                <span>Pod Leaderboard with discipline & participation badges</span>
              </li>
            </ul>

            <div className="mt-8">
              <Link to="/login" className="apple-btn-primary text-xs px-6 py-3 inline-flex items-center gap-2">
                <span>Start or Join a Pod</span>
                <i className="fas fa-arrow-right text-[10px]"></i>
              </Link>
            </div>
          </div>

          <div className="apple-card p-6 border border-white/10 bg-white/[0.02]">
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div className="text-xs font-semibold text-white">Pod Standings — CSE Section A</div>
              <span className="apple-badge text-[10px]">Live</span>
            </div>
            
            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">#1</span>
                  <span className="text-white">Alex Rivera</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-bold">92.4%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300">Ace</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">#2</span>
                  <span className="text-sky-300 font-bold">You</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sky-300 font-bold">87.5%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300">Active</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-white/60">#3</span>
                  <span className="text-white">Sarah Chen</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-400 font-bold">78.1%</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">Safe</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-white/[0.06] bg-black/20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="apple-badge mb-3">Answers</span>
            <h2 className="text-3xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div 
                key={i}
                className="apple-card p-5 cursor-pointer"
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
              >
                <div className="flex justify-between items-center text-sm font-semibold text-white">
                  <span>{faq.q}</span>
                  <i className={`fas fa-chevron-down text-xs transition-transform duration-200 text-white/50 ${activeFaq === i ? 'rotate-180 text-white' : ''}`}></i>
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
      <section className="py-24 px-6 text-center border-t border-white/[0.06] relative">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl sm:text-5xl font-extrabold text-gradient mb-4">
            Ready to punch in?
          </h2>
          <p className="text-sm sm:text-base text-white/60 mb-8">
            Join thousands of scholars taking control of their semester attendance right now.
          </p>
          <Link to="/login" className="apple-btn-primary text-sm px-8 py-3.5 inline-flex items-center gap-2">
            <span>Get Started with Punch.In</span>
            <i className="fas fa-arrow-right text-xs"></i>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/[0.06] bg-[#07090e] py-10 px-6 text-xs text-white/40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white/80">Punch.In Scholar Companion</span>
            <span>&copy; {new Date().getFullYear()} Aadithya Vimal</span>
          </div>

          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <a href="mailto:aadithyavimal.work@gmail.com" className="hover:text-white transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
