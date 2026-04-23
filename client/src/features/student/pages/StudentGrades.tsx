import React from 'react';

const StudentGrades = () => {
  const categories = [
    { name: 'Full Stack Web Dev', score: '94%', color: 'bg-primary', icon: 'code', detail: 'Advanced Distinction' },
    { name: 'Data Science', score: '88%', color: 'bg-secondary', icon: 'analytics', detail: 'High Distinction' },
    { name: 'Cyber Security', score: '91%', color: 'bg-tertiary', icon: 'security', detail: 'Advanced Distinction' },
  ];

  const recentGrades = [
    { title: 'System Architecture Design', module: 'Web Development', grade: '96/100', status: 'Graded', date: 'Oct 24, 2023' },
    { title: 'API Authentication Layer', module: 'Web Development', grade: '92/100', status: 'Graded', date: 'Oct 22, 2023' },
    { title: 'Database Optimization', module: 'Data Systems', grade: '89/100', status: 'Graded', date: 'Oct 18, 2023' },
  ];

  return (
    <div className="pb-12">
      {/* Header Section */}
      <div className="mb-12">
        <span className="text-xs font-headline font-bold text-primary tracking-[0.2em] uppercase font-label">Results & Performance</span>
        <h2 className="text-5xl font-black font-headline tracking-tighter mt-4 text-on-surface">Academic Grades</h2>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
        {/* Overall GPA Card */}
        <div className="lg:col-span-4 bg-surface-container-highest rounded-3xl p-8 flex flex-col justify-between border border-outline-variant/10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 scale-150">
             <span className="material-symbols-outlined text-[100px]">military_tech</span>
          </div>
          <div className="relative z-10">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label">Aggregate Mastery</p>
            <div className="mt-6 flex items-baseline gap-2">
              <span className="text-7xl font-black text-on-surface font-headline tracking-tighter">91.4</span>
              <span className="text-2xl font-bold text-on-surface-variant font-headline">%</span>
            </div>
          </div>
          <p className="text-sm font-medium text-on-surface-variant mt-8 font-body">Current academic velocity is consistent with Honours distinction standards.</p>
        </div>

        {/* Categories Grid */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.name} className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/10 shadow-sm hover:shadow-md transition-all group cursor-pointer">
              <div className={`w-12 h-12 ${cat.color} rounded-2xl flex items-center justify-center text-on-primary mb-6 shadow-sm group-hover:scale-110 transition-transform`}>
                <span className="material-symbols-outlined">{cat.icon}</span>
              </div>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest font-label">{cat.name}</p>
              <h3 className="text-3xl font-black text-on-surface mt-2 font-headline">{cat.score}</h3>
              <p className="text-[10px] font-bold text-success mt-4 uppercase font-label">{cat.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Grades Table */}
      <section className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h3 className="text-2xl font-black font-headline text-on-surface">Recent Assessments</h3>
          <button className="px-6 py-2 bg-surface-container-highest text-primary rounded-xl font-bold text-xs font-label uppercase tracking-widest hover:brightness-95 transition-all shadow-sm">View Curriculum Map</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold font-label">
                <th className="px-6 py-2">Assessment Title</th>
                <th className="px-6 py-2">Module</th>
                <th className="px-6 py-2">Grade</th>
                <th className="px-6 py-2 text-right pr-8">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium font-body">
              {recentGrades.map((grade, i) => (
                <tr key={i} className="bg-surface-container-lowest hover:bg-surface-container transition-all group cursor-pointer border border-outline-variant/5">
                  <td className="px-6 py-6 rounded-l-2xl">
                    <p className="font-bold text-on-surface text-lg">{grade.title}</p>
                    <p className="text-[10px] text-on-surface-variant font-bold font-label mt-1 lowercase italic">Completed {grade.date}</p>
                  </td>
                  <td className="px-6 py-6 text-on-surface-variant">{grade.module}</td>
                  <td className="px-6 py-6">
                    <span className="text-2xl font-black text-primary font-headline">{grade.grade}</span>
                  </td>
                  <td className="px-6 py-6 rounded-r-2xl text-right pr-8">
                    <span className="bg-secondary-container/20 text-on-secondary-container px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest font-label shadow-sm">
                      {grade.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* GPA Projection Chart Placeholder */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-surface-container-highest p-8 rounded-3xl border border-outline-variant/10 shadow-sm flex flex-col justify-between">
           <div>
              <h4 className="text-xl font-black font-headline text-on-surface mb-2">Academic Velocity</h4>
              <p className="text-sm text-on-surface-variant font-body">Performance trends across current active bootcamps.</p>
           </div>
           <div className="mt-8 h-40 w-full flex items-end gap-3 px-4">
              {[60, 85, 95, 78, 88, 92, 94].map((h, i) => (
                <div key={i} className="flex-1 bg-primary rounded-t-lg transition-all duration-1000 hover:brightness-110 shadow-sm" style={{ height: `${h}%` }}></div>
              ))}
           </div>
        </div>
        <div className="bg-primary p-8 rounded-3xl text-on-primary shadow-xl border border-primary-container flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-10">
              <span className="material-symbols-outlined text-[120px]">workspace_premium</span>
           </div>
           <p className="text-xs font-bold uppercase tracking-[0.2em] font-label opacity-80">Honours Eligibility</p>
           <h3 className="text-3xl font-black font-headline mt-4">Candidate for Technical Distinction</h3>
           <p className="mt-8 text-sm font-medium opacity-90 font-body leading-relaxed max-w-sm">
              Your results are currently within the top tier. Maintaining this velocity through final project evaluation is critical.
           </p>
           <button className="mt-8 w-fit px-8 py-3 bg-surface-container-lowest text-primary rounded-xl font-bold text-xs font-label uppercase tracking-widest shadow-lg hover:brightness-105 transition-all">Download Transcript</button>
        </div>
      </section>
    </div>
  );
};

export default StudentGrades;
