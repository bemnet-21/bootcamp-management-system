import { create } from 'zustand';
import { useAuthStore } from '@/src/store/useAuthStore';
import { canPerform } from '@/src/lib/permissions';

export interface Bootcamp {
  id: string;
  name: string;
  divisionId: string;
  batch: string;
  students: number;
  progress: number;
  status: 'active' | 'upcoming' | 'completed';
  duration: string;
  cohort: string;
}

export interface BootcampStudent {
  id: string;
  name: string;
  bootcampId: string;
  email?: string;
}

export interface BootcampSession {
  id: string;
  title: string;
  bootcampId: string;
  date: string;
  time: string;
  location: string;
  description?: string;
  attendanceRate: number;
  status: 'upcoming' | 'completed';
}

export interface BootcampAssignment {
  id: string;
  title: string;
  bootcampId: string;
  dueDate: string;
  status: 'active' | 'review' | 'completed';
}

export interface BootcampResource {
  id: string;
  title: string;
  description?: string;
  kind: 'File' | 'Link';
  url: string;
  createdAt: string;
}

export interface BootcampHelper {
  id: string;
  name: string;
  email: string;
  role: 'Lead' | 'Helper';
  permissions: string[];
  addedAt: string;
}

interface BootcampState {
  bootcamps: Bootcamp[];
  students: BootcampStudent[];
  sessions: BootcampSession[];
  assignments: BootcampAssignment[];
  resources: BootcampResource[];
  helpers: BootcampHelper[];
  attendanceBySession: Record<string, Record<string, 'present' | 'absent'>>;
  getBootcampsByDivision: (divisionId: string) => Bootcamp[];
  addSession: (payload: Omit<BootcampSession, 'id' | 'attendanceRate' | 'status'> & { status?: BootcampSession['status'] }) => void;
  updateSession: (id: string, updates: Partial<Omit<BootcampSession, 'id'>>) => void;
  addStudent: (payload: Omit<BootcampStudent, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Omit<BootcampStudent, 'id'>>) => void;
  removeStudent: (id: string) => void;
  addResource: (payload: Omit<BootcampResource, 'id' | 'createdAt'>) => void;
  removeResource: (id: string) => void;
  addHelper: (payload: Omit<BootcampHelper, 'id' | 'permissions' | 'addedAt'> & { permissions?: string[] }) => void;
  updateHelperPermissions: (id: string, permissions: string[]) => void;
  removeHelper: (id: string) => void;
  saveAttendance: (sessionId: string, attendance: Record<string, 'present' | 'absent'>) => void;
  getAttendance: (sessionId: string) => Record<string, 'present' | 'absent'> | undefined;
  addAssignment: (payload: Omit<BootcampAssignment, 'id'>) => void;
}

const createId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - randomUUID may not exist in older lib defs
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(16).slice(2)}${Date.now().toString(16)}`;
};

const can = (permission: string) => {
  const { role, permissions } = useAuthStore.getState();
  return canPerform({ role, permissions }, permission);
};

export const useBootcampStore = create<BootcampState>((set, get) => ({
  bootcamps: [
    // Data Science (ds)
    { id: 'ds-1', name: 'Advanced ML & Neural Nets', divisionId: 'ds', batch: 'DS-09', students: 24, progress: 68, status: 'active', duration: '16 Weeks', cohort: '2024.B' },
    { id: 'ds-2', name: 'Data Engineering Foundations', divisionId: 'ds', batch: 'DE-04', students: 18, progress: 42, status: 'active', duration: '14 Weeks', cohort: '2024.A' },
    { id: 'ds-3', name: 'Applied Statistics', divisionId: 'ds', batch: 'AS-12', students: 32, progress: 15, status: 'upcoming', duration: '12 Weeks', cohort: '2024.C' },
    { id: 'ds-4', name: 'NLP & Text Analytics', divisionId: 'ds', batch: 'NLP-02', students: 20, progress: 100, status: 'completed', duration: '10 Weeks', cohort: '2023.D' },
    
    // Development (dev)
    { id: 'fs-react', name: 'Full-Stack React Engineer', divisionId: 'dev', batch: 'FS-22', students: 320, progress: 85, status: 'active', duration: '24 Weeks', cohort: '2024.B' },
    { id: 'backend', name: 'Node.js Backend Masterclass', divisionId: 'dev', batch: 'BK-10', students: 185, progress: 0, status: 'upcoming', duration: '18 Weeks', cohort: '2024.A' },
    { id: 'cloud', name: 'Cloud Systems Engineering', divisionId: 'dev', batch: 'CS-05', students: 412, progress: 100, status: 'completed', duration: '16 Weeks', cohort: '2023.D' },
    { id: 'mobile', name: 'Mobile App Development', divisionId: 'dev', batch: 'MA-08', students: 267, progress: 20, status: 'active', duration: '20 Weeks', cohort: '2024.B' },
    
    // Cybersecurity (cyber)
    { id: 'cy-1', name: 'Ethical Hacking & PenTesting', divisionId: 'cyber', batch: 'EH-15', students: 45, progress: 75, status: 'active', duration: '20 Weeks', cohort: '2024.B' },
    { id: 'cy-2', name: 'Security Operations (SOC)', divisionId: 'cyber', batch: 'SOC-03', students: 28, progress: 10, status: 'active', duration: '12 Weeks', cohort: '2024.C' },
    { id: 'cy-3', name: 'Network Defense', divisionId: 'cyber', batch: 'ND-11', students: 50, progress: 0, status: 'upcoming', duration: '16 Weeks', cohort: '2024.A' },
    
    // CPD (cpd)
    { id: 'cpd-1', name: 'Executive Leadership', divisionId: 'cpd', batch: 'EL-01', students: 120, progress: 50, status: 'active', duration: '8 Weeks', cohort: '2024.B' },
    { id: 'cpd-2', name: 'Product Management Plus', divisionId: 'cpd', batch: 'PM-09', students: 85, progress: 90, status: 'active', duration: '12 Weeks', cohort: '2024.A' },
    { id: 'cpd-3', name: 'Strategic Negotiation', divisionId: 'cpd', batch: 'SN-04', students: 210, progress: 0, status: 'upcoming', duration: '4 Weeks', cohort: '2024.C' },
  ],
  students: [
    { id: 'st-1', name: 'Mekdes Alemu', bootcampId: 'fs-react' },
    { id: 'st-2', name: 'Nahom Tadesse', bootcampId: 'fs-react' },
    { id: 'st-3', name: 'Blen Tesfaye', bootcampId: 'backend' },
    { id: 'st-4', name: 'Samuel Bekele', bootcampId: 'mobile' },
    { id: 'st-5', name: 'Ruth Fekadu', bootcampId: 'fs-react' },
    { id: 'st-6', name: 'Henok Abate', bootcampId: 'backend' },
  ],
  sessions: [
    { id: 'se-1', title: 'React State Patterns', bootcampId: 'fs-react', date: '2026-04-24', time: '09:00 AM', location: 'Lab 2', attendanceRate: 92, status: 'upcoming' },
    { id: 'se-2', title: 'API Design Clinic', bootcampId: 'backend', date: '2026-04-25', time: '11:30 AM', location: 'Room B1', attendanceRate: 88, status: 'upcoming' },
    { id: 'se-3', title: 'Mobile UI Sprint Review', bootcampId: 'mobile', date: '2026-04-26', time: '02:00 PM', location: 'Studio 4', attendanceRate: 95, status: 'upcoming' },
    { id: 'se-4', title: 'Database Modeling Workshop', bootcampId: 'backend', date: '2026-04-18', time: '10:00 AM', location: 'Room B1', attendanceRate: 84, status: 'completed' },
  ],
  assignments: [
    { id: 'as-1', title: 'Component Architecture Review', bootcampId: 'fs-react', dueDate: '2026-04-27', status: 'active' },
    { id: 'as-2', title: 'REST API Capstone', bootcampId: 'backend', dueDate: '2026-04-29', status: 'active' },
    { id: 'as-3', title: 'Testing Strategy Write-up', bootcampId: 'mobile', dueDate: '2026-04-30', status: 'review' },
    { id: 'as-4', title: 'Schema Refactor Challenge', bootcampId: 'backend', dueDate: '2026-04-20', status: 'completed' },
  ],
  getBootcampsByDivision: (divisionId) => get().bootcamps.filter(b => b.divisionId === divisionId),

  resources: [
    { id: 'r-1', title: 'Frontend Sprint Deck', kind: 'Link', url: 'https://example.com/deck', createdAt: '2026-04-21', description: 'Slides for the sprint kickoff.' },
    { id: 'r-2', title: 'API Design Reference', kind: 'Link', url: 'https://example.com/api-design', createdAt: '2026-04-20', description: 'PDF link for API best practices.' },
  ],
  helpers: [
    {
      id: 'h-1',
      name: 'Helper Instructor',
      email: 'helper@bootcamp.dev',
      role: 'Helper',
      permissions: ['upload_resource'],
      addedAt: '2026-04-18',
    },
  ],
  attendanceBySession: {},

  addSession: (payload) => {
    if (!can('create_session')) return;
    const session: BootcampSession = {
      id: createId('se'),
      title: payload.title,
      bootcampId: payload.bootcampId,
      date: payload.date,
      time: payload.time,
      location: payload.location,
      description: payload.description,
      attendanceRate: 0,
      status: payload.status || 'upcoming',
    };
    set((state) => ({ sessions: [session, ...state.sessions] }));
  },

  updateSession: (id, updates) => {
    if (!can('create_session')) return;
    set((state) => ({
      sessions: state.sessions.map((session) => (session.id === id ? { ...session, ...updates } : session)),
    }));
  },

  addStudent: (payload) => {
    if (!can('add_student')) return;
    const student: BootcampStudent = { id: createId('st'), ...payload };
    set((state) => ({ students: [student, ...state.students] }));
  },

  updateStudent: (id, updates) => {
    if (!can('add_student')) return;
    set((state) => ({
      students: state.students.map((student) => (student.id === id ? { ...student, ...updates } : student)),
    }));
  },

  removeStudent: (id) => {
    if (!can('add_student')) return;
    set((state) => ({ students: state.students.filter((student) => student.id !== id) }));
  },

  addResource: (payload) => {
    if (!can('upload_resource')) return;
    const resource: BootcampResource = {
      id: createId('r'),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    set((state) => ({ resources: [resource, ...state.resources] }));
  },

  removeResource: (id) => {
    if (!can('upload_resource')) return;
    set((state) => ({ resources: state.resources.filter((resource) => resource.id !== id) }));
  },

  addHelper: (payload) => {
    if (!can('manage_groups')) return;
    const helper: BootcampHelper = {
      id: createId('h'),
      permissions: payload.permissions || [],
      addedAt: new Date().toISOString(),
      name: payload.name,
      email: payload.email,
      role: payload.role,
    };
    set((state) => ({ helpers: [helper, ...state.helpers] }));
  },

  updateHelperPermissions: (id, permissions) => {
    if (!can('manage_groups')) return;
    set((state) => ({
      helpers: state.helpers.map((helper) => (helper.id === id ? { ...helper, permissions } : helper)),
    }));
  },

  removeHelper: (id) => {
    if (!can('manage_groups')) return;
    set((state) => ({ helpers: state.helpers.filter((helper) => helper.id !== id) }));
  },

  saveAttendance: (sessionId, attendance) => {
    if (!can('mark_attendance')) return;
    set((state) => ({
      attendanceBySession: {
        ...state.attendanceBySession,
        [sessionId]: attendance,
      },
      sessions: state.sessions.map((s) => {
        if (s.id !== sessionId) return s;
        const entries = Object.values(attendance);
        const presentCount = entries.filter((status) => status === 'present').length;
        const attendanceRate = entries.length ? Math.round((presentCount / entries.length) * 100) : 0;
        return { ...s, attendanceRate };
      }),
    }));
  },

  getAttendance: (sessionId) => get().attendanceBySession[sessionId],

  addAssignment: (payload) => {
    if (!can('manage_groups')) return;
    const assignment: BootcampAssignment = { id: createId('as'), ...payload };
    set((state) => ({ assignments: [assignment, ...state.assignments] }));
  },
}));
