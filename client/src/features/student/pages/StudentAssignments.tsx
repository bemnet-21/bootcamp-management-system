import React from 'react';

const StudentAssignments = () => {
  const deadlines = [
    { title: 'Final Capstone Project', module: 'Web Dev', deadline: 'Oct 24, 11:59 PM', remaining: 'In 18 hours', type: 'urgent', color: 'border-tertiary', bgColor: 'bg-tertiary-fixed', textColor: 'text-on-tertiary-fixed-variant', icon: 'priority_high' },
    { title: 'Network Security Audit', module: 'Cyber Ops', deadline: 'Oct 26, 11:59 PM', remaining: 'In 2 days', type: 'warning', color: 'border-secondary', bgColor: 'bg-secondary-fixed', textColor: 'text-on-secondary-fixed-variant', icon: 'schedule' },
    { title: 'Weekly Group Check-in', module: 'Routine', deadline: 'Every Friday', remaining: 'Upcoming', type: 'normal', color: 'border-on-secondary-container', bgColor: 'bg-surface-container-high', textColor: 'text-on-secondary-container', icon: 'group' },
  ];

  return (
    <div className="grid grid-cols-12 gap-8 pb-12">
      {/* Deadlines Header Section */}
      <section className="col-span-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div>
            <span className="text-xs font-bold text-primary tracking-widest uppercase mb-2 block font-label">Focus Mode</span>
            <h1 className="text-4xl font-extrabold font-headline tracking-tight text-on-surface">Deadlines at a Glance</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        {/* Deadlines Slider */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {deadlines.map((item) => (
            <div key={item.title} className={`relative bg-surface-container-lowest p-6 rounded-3xl overflow-hidden border-l-4 ${item.color} shadow-sm group hover:shadow-md transition-all`}>
              <div className="flex justify-between items-start mb-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.bgColor} ${item.textColor} font-label`}>
                  {item.remaining}
                </span>
                <span className={`material-symbols-outlined ${item.type === 'urgent' ? 'text-tertiary' : item.type === 'warning' ? 'text-secondary' : 'text-on-secondary-container'}`} style={{ fontVariationSettings: item.type === 'urgent' ? "'FILL' 1" : undefined }}>
                  {item.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold font-headline mb-1 text-on-surface">{item.title}</h3>
              <p className="text-sm text-on-surface-variant font-medium mb-4 font-body">{item.module}</p>
              <div className={`flex items-center gap-2 text-xs font-bold ${item.type === 'urgent' ? 'text-tertiary' : item.type === 'warning' ? 'text-secondary' : 'text-on-secondary-container'} font-label`}>
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                {item.deadline}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Filter Bar */}
      <section className="col-span-12 mt-4">
        <div className="bg-surface-container-low rounded-2xl p-4 flex flex-wrap gap-4 items-center border border-outline-variant/10">
          <button className="flex items-center gap-2 bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm font-medium py-1.5 px-4 font-body">
            All Bootcamps <span className="material-symbols-outlined text-sm">keyboard_arrow_down</span>
          </button>
          <div className="flex items-center gap-2">
            <select className="bg-surface-container-lowest border border-outline-variant/10 rounded-xl text-sm font-medium py-1.5 px-4 focus:ring-2 ring-primary/20 font-body outline-none appearance-none pr-8 relative">
              <option>All Types</option>
              <option>Individual</option>
              <option>Group</option>
            </select>
          </div>
          <button className="ml-auto flex items-center gap-2 text-primary font-bold text-sm font-label uppercase tracking-widest">
            <span className="material-symbols-outlined">filter_list</span>
            Filters
          </button>
        </div>
      </section>

      {/* Task List and Main Content Columns */}
      <div className="col-span-12 lg:col-span-8 space-y-4">
        {/* Task 1: Revision Needed */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l-4 border-tertiary-container hover:shadow-md transition-all border border-outline-variant/5">
          <div className="w-12 h-12 bg-tertiary-fixed rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-tertiary-container animate-pulse">priority_high</span>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-lg text-on-surface font-headline">Database Design</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-tertiary-fixed text-on-tertiary-fixed-variant font-label">Needs Revision</span>
            </div>
            <p className="text-xs font-bold text-primary/80 mb-2 font-body">Web Dev • Cohort 7</p>
            <div className="flex gap-4 text-xs text-on-surface-variant font-medium font-body">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> Web Dev</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> Due Oct 24, 11:59 PM</span>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm transition-all active:scale-95 font-label uppercase tracking-widest w-full sm:w-auto">
            View Feedback
          </button>
        </div>

        {/* Task 2: Submitted */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l-4 border-secondary-container hover:shadow-md transition-all border border-outline-variant/5">
          <div className="w-12 h-12 bg-secondary-fixed rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-secondary-container">check_circle</span>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-lg text-on-surface font-headline">API Authentication</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-secondary-fixed text-on-secondary-fixed-variant font-label">Submitted</span>
            </div>
            <p className="text-xs font-bold text-primary/80 mb-2 font-body">Web Dev • Cohort 7</p>
            <div className="flex gap-4 text-xs text-on-surface-variant font-medium font-body">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> Web Dev</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> Due Oct 25, 6:00 PM</span>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-secondary-container rounded-xl font-bold text-sm transition-all active:scale-95 font-label uppercase tracking-widest w-full sm:w-auto">
            View Submission
          </button>
        </div>

        {/* Task 3: Graded */}
        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 border-l-4 border-on-secondary-container hover:shadow-md transition-all border border-outline-variant/5">
          <div className="w-12 h-12 bg-surface-container-high rounded-2xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-on-secondary-container" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          </div>
          <div className="flex-grow">
            <div className="flex items-center gap-3">
              <h4 className="font-bold text-lg text-on-surface font-headline">Intro to Linux</h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-surface-container-highest text-on-secondary-container font-label">Graded 95/100</span>
            </div>
            <p className="text-xs font-bold text-primary/80 mb-2 font-body">Cyber Ops • Division Alpha</p>
            <div className="flex gap-4 text-xs text-on-surface-variant font-medium font-body">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">school</span> Cyber Ops</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-sm">event</span> Completed Oct 22</span>
            </div>
          </div>
          <button className="px-6 py-2.5 bg-surface-container-high text-on-secondary-container rounded-xl font-bold text-sm transition-all active:scale-95 font-label uppercase tracking-widest w-full sm:w-auto">
            View Grades
          </button>
        </div>
      </div>

      {/* Sidebar / Feedback Panel */}
      <aside className="col-span-12 lg:col-span-4">
        <div className="sticky top-24 space-y-6">
          <div className="bg-surface-container-low rounded-3xl p-8 border-l-4 border-tertiary border border-outline-variant/10 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold font-headline">Instructor Feedback</h3>
              <span className="material-symbols-outlined text-tertiary">info</span>
            </div>
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-tertiary-fixed">
                <img 
                  alt="Instructor Sterling" 
                  className="w-full h-full object-cover" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCeCnl_se9wlApa5gnYjT1qsKliuJmXRVx5w1KtA7nS3O3JfuJiPgPcV1U2xhdQckRuAr9b3N-JkBB5SGqwlA0b6WA7rnErDByIhhwqWksDEV01TQluSdy4KtyoC3vsBBt1-B5MmbzN1BPg644dd0U8hf9pNGF86jZ2fymXV72Di55Zc1uyWarmHoJP8W35NnKEkuJTeEgJcyyT4LUtLYwhAc7hCSvDqfUpxRh0VSc8oY4rA2h4CJKo78_P-wi07IZE6Gx2DxusLRY" 
                />
              </div>
              <div>
                <p className="font-bold text-sm text-on-surface font-headline">Instructor Sterling</p>
                <p className="text-xs text-on-surface-variant font-medium font-body">Head of Web Development</p>
              </div>
            </div>
            <div className="bg-surface-container-lowest p-6 rounded-2xl mb-8 relative border border-outline-variant/10">
              <span className="material-symbols-outlined absolute -top-3 -left-2 text-tertiary text-4xl opacity-10">format_quote</span>
              <p className="text-sm leading-relaxed text-on-surface font-medium italic font-body">
                "Your normalization to 3NF is correct, but check the many-to-many relationship in the orders table. It lacks the appropriate join table structure for scaling."
              </p>
            </div>
            <div className="space-y-4 mb-8">
              <p className="text-xs font-bold text-outline uppercase tracking-wider font-label">Previous Submission</p>
              <div className="flex items-center gap-3 p-3 bg-surface-container-highest rounded-xl group hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/5">
                <span className="material-symbols-outlined text-tertiary">picture_as_pdf</span>
                <span className="text-xs font-bold truncate font-body">ERD_v1.pdf</span>
                <span className="material-symbols-outlined text-xs ml-auto opacity-40">download</span>
              </div>
            </div>
            <button className="w-full py-4 bg-tertiary text-on-tertiary rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg shadow-tertiary/20 font-label uppercase tracking-widest focus:ring-2 ring-tertiary/20">
              <span className="material-symbols-outlined">upload_file</span>
              Submit Revision
            </button>
          </div>
          
          {/* Progress Micro-Card */}
          <div className="bg-surface-variant/30 backdrop-blur-xl rounded-3xl p-6 border border-outline-variant/20 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-bold text-primary tracking-widest uppercase font-label">Academic Pulse</p>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse"></div>
                <span className="text-[10px] font-bold text-success font-label">LIVE</span>
              </div>
            </div>
            <div className="flex items-end justify-between mb-2">
              <h4 className="text-3xl font-black text-on-surface font-headline">92.4%</h4>
              <p className="text-xs font-bold text-on-surface-variant mb-1 font-label">Target: 95.0%</p>
            </div>
            <div className="w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: '92.4%' }}></div>
            </div>
            <p className="text-[10px] mt-4 font-medium text-on-surface-variant text-center font-body">Maintain current velocity to hit Honours distinction</p>
          </div>
        </div>
      </aside>

      {/* Contextual FAB */}
      <div className="fixed bottom-8 right-8 md:bottom-12 md:right-12 z-50">
        <button className="w-16 h-16 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all focus:ring-4 ring-primary/20">
          <span className="material-symbols-outlined text-3xl">add_task</span>
        </button>
      </div>
    </div>
  );
};

export default StudentAssignments;
