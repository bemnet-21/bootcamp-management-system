import React, { useState } from 'react';
import { cn } from '@/src/lib/utils';

const StudentFeedback = () => {
  // State for form selections
  const [subject, setSubject] = useState('🎓 This Bootcamp');
  const [satisfaction, setSatisfaction] = useState(4);
  const [clarity, setClarity] = useState(3);
  const [anonymous, setAnonymous] = useState(true);

  const subjects = [
    { id: 'bootcamp', label: '🎓 This Bootcamp', icon: 'school' },
    { id: 'instructor', label: '👨‍🏫 Instructor/Helper', icon: 'person' },
    { id: 'assignments', label: '📝 Assignments/Tasks', icon: 'description' },
    { id: 'division', label: '🏢 Division Level', icon: 'corporate_fare' },
  ];

  return (
    <div className="flex justify-center w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full max-w-4xl space-y-12">
        {/* Main Feedback Card */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(13,28,46,0.08)] relative overflow-hidden border border-outline-variant/10">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary-container"></div>
          
          <header className="mb-12 text-center">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-3 block font-label opacity-70">CSEC ASTU Student Voice</span>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-on-surface mb-4 tracking-tighter leading-none">Continuous Improvement Hub</h2>
            <p className="text-on-surface-variant text-base font-medium max-w-xl mx-auto leading-relaxed">
              Your perspective is the primary engine of our academic evolution. Help us architect a superior learning experience.
            </p>
          </header>
          
          <form className="space-y-12" onSubmit={(e) => e.preventDefault()}>
            {/* 1. Feedback Subject Selection */}
            <section>
              <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-outline mb-4 font-label">Select Feedback Vector</label>
              <div className="flex flex-wrap gap-3">
                {subjects.map((s) => (
                  <button 
                    key={s.id}
                    type="button"
                    onClick={() => setSubject(s.label)}
                    className={cn(
                      "px-6 py-3 rounded-2xl font-bold text-sm transition-all duration-300 flex items-center gap-3 border",
                      subject === s.label 
                        ? "bg-primary text-on-primary border-primary shadow-lg shadow-primary/20 scale-[1.02]" 
                        : "bg-surface-container-low text-on-surface-variant border-outline-variant/10 hover:bg-surface-container hover:border-outline-variant/30"
                    )}
                  >
                    <span className={cn("material-symbols-outlined text-xl", subject === s.label ? "fill-1" : "")}>{s.icon}</span>
                    {s.label}
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 2. Dynamic Context Selector */}
              <div className="space-y-3">
                <label className="block text-[10px] uppercase tracking-[0.2em] font-bold text-outline font-label">Program Context</label>
                <div className="relative group">
                  <select className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl py-4 px-6 text-on-surface font-bold appearance-none focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all text-sm outline-none cursor-pointer">
                    <option>Select specific context...</option>
                    <option>Full-Stack Web Development Immersion</option>
                    <option>Data Science & AI Advanced Track</option>
                    <option>Cloud Infrastructure Specialist</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-outline group-focus-within:text-primary transition-colors">expand_more</span>
                </div>
              </div>

              <div className="bg-surface-container-low border border-outline-variant/5 rounded-2xl p-4 flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                  <span className="material-symbols-outlined text-2xl fill-1">verified</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest">Currently Active</p>
                  <p className="font-headline font-extrabold text-on-surface text-base">Advanced System Architectures</p>
                </div>
              </div>
            </div>

            {/* 3. Metrics Section */}
            <section className="bg-surface-container-low/50 border border-outline-variant/10 rounded-[2rem] p-8 grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="space-y-4">
                <label className="block text-xs font-bold text-on-surface tracking-tight font-label uppercase">Overall Satisfaction</label>
                <div className="flex gap-2 text-primary">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setSatisfaction(star)}
                      className={cn(
                        "material-symbols-outlined text-3xl transition-all duration-300 hover:scale-125 active:scale-95",
                        star <= satisfaction ? "fill-1" : "opacity-30"
                      )}
                    >
                      star
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-on-surface tracking-tight font-label uppercase">Clarity & Flow</label>
                <div className="flex gap-2 text-secondary">
                  {[1, 2, 3, 4, 5].map((dot) => (
                    <button
                      key={dot}
                      type="button"
                      onClick={() => setClarity(dot)}
                      className={cn(
                        "material-symbols-outlined text-3xl transition-all duration-300",
                        dot <= clarity ? "fill-1" : "opacity-30"
                      )}
                    >
                      {dot <= clarity ? 'radio_button_checked' : 'radio_button_unchecked'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-on-surface tracking-tight font-label uppercase">One Word Vibe</label>
                <input 
                  className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-xl py-3 px-4 text-sm font-bold focus:ring-4 focus:ring-primary/10 focus:border-primary/30 outline-none transition-all placeholder:text-outline/40" 
                  placeholder="e.g. Rigorous" 
                  type="text"
                />
              </div>
            </section>

            {/* 4. Qualitative Commentary */}
            <section className="space-y-4">
              <div className="flex justify-between items-end px-1">
                <label className="text-base font-bold text-on-surface font-headline">Qualitative Commentary</label>
                <span className="text-[10px] font-bold text-outline font-label uppercase tracking-widest">0 / 1,000 characters</span>
              </div>
              <textarea 
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-2xl p-6 text-on-surface text-sm font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary/30 placeholder:text-outline/40 transition-all resize-none outline-none min-h-[160px]" 
                placeholder="Share your detailed synthesis of the current curriculum or mentorship experience..." 
              ></textarea>
            </section>

            {/* 5. Privacy & Transmission */}
            <section className="pt-10 border-t border-outline-variant/20 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-start gap-5 max-w-md">
                <button 
                  type="button"
                  onClick={() => setAnonymous(!anonymous)}
                  className="relative inline-flex items-center cursor-pointer mt-1 group"
                >
                  <div className={cn(
                    "w-12 h-7 rounded-full transition-all duration-500 flex items-center px-1",
                    anonymous ? "bg-primary" : "bg-outline/20"
                  )}>
                    <div className={cn(
                      "w-5 h-5 bg-white rounded-full transition-all duration-500 shadow-sm",
                      anonymous ? "translate-x-5" : "translate-x-0"
                    )}></div>
                  </div>
                </button>
                <div>
                  <p className="text-sm font-bold text-on-surface">Protected Identity Mode</p>
                  <div className="flex items-center gap-2 mt-1 text-tertiary">
                    <span className="material-symbols-outlined text-[14px]">info</span>
                    <p className="text-[10px] font-bold uppercase tracking-wider">
                      Personal issues cannot be resolved in anonymous mode
                    </p>
                  </div>
                </div>
              </div>
              <button 
                className="bg-primary text-on-primary px-12 py-4 rounded-2xl font-black font-label text-sm uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.03] hover:shadow-2xl active:scale-95 transition-all" 
                type="submit"
              >
                Transmit Feedback
              </button>
            </section>
          </form>
        </div>

        {/* History Ledger */}
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="font-headline font-black text-2xl tracking-tighter text-on-surface flex items-center gap-4">
              <span className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined fill-1">history_edu</span>
              </span>
              Academic Feedback Ledger
            </h3>
            <button className="text-primary font-black text-xs font-label uppercase tracking-widest flex items-center gap-2 hover:translate-x-1 transition-transform group">
              View Comprehensive History 
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {/* History Item 1 */}
            <div className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/10 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:bg-surface-primary/10 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-secondary shadow-sm transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined fill-1 text-2xl">description</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-base">SQL Masterclass Assignment</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">Submitted Oct 24, 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Reviewed</span>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_drop_down_circle</span>
              </div>
            </div>

            {/* History Item 2 */}
            <div className="bg-surface-container-low/50 backdrop-blur-sm border border-outline-variant/10 rounded-2xl p-5 flex items-center justify-between group cursor-pointer hover:bg-surface-primary/10 hover:border-primary/20 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined fill-1 text-2xl">school</span>
                </div>
                <div>
                  <p className="font-bold text-on-surface text-base">Bootcamp Operations Feedback</p>
                  <p className="text-[10px] font-bold text-outline uppercase tracking-widest mt-1">Submitted Oct 12, 2023</p>
                </div>
              </div>
              <div className="flex items-center gap-8">
                <div className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-full bg-outline/10 text-outline border border-outline/10">
                  <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                  <span className="text-[10px] font-black uppercase tracking-widest">Received</span>
                </div>
                <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">arrow_drop_down_circle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Pull Quote */}
        <div className="py-12 border-t border-outline-variant/10">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <span className="material-symbols-outlined text-5xl text-primary/10 select-none">format_quote</span>
            <h4 className="font-headline text-2xl font-bold text-on-surface leading-tight italic tracking-tight">
              "True excellence is a moving target. We reach it only through the shared insights of our scholarly community. Your voice is the catalyst for our progress."
            </h4>
            <div className="flex flex-col items-center gap-1">
              <div className="h-0.5 w-12 bg-primary/20 rounded-full mb-2"></div>
              <p className="text-[10px] uppercase tracking-[0.3em] font-black text-primary opacity-60">CSEC ASTU Academic Council</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentFeedback;
