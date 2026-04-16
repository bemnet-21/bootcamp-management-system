import { create } from 'zustand';

export interface Member {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Instructor' | 'Student';
  divisionId: string;
  joinedDate: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  avatar: string;
  specialization?: string;
  rating?: number;
  experience?: number;
  temporaryPassword?: string;
  mustResetPassword?: boolean;
}

interface UserState {
  members: Member[];
  addMember: (member: Omit<Member, 'id' | 'joinedDate' | 'avatar' | 'status'>) => Member;
  updateMember: (id: string, member: Partial<Member>) => void;
  deleteMember: (id: string) => void;
  toggleStatus: (id: string) => void;
  getMembersByDivision: (divisionId: string) => Member[];
}

export const useUserStore = create<UserState>((set, get) => ({
  members: [
    // Development
    { id: 'dev-1', name: 'Sarah Jenkins', email: 'sarah.j@vanguard.edu', role: 'Instructor', divisionId: 'dev', joinedDate: 'Mar 12, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/sarah/200', specialization: 'Senior DevOps Engineer', rating: 4.9, experience: 8 },
    { id: 'dev-2', name: 'Marcus Jones', email: 'mjones@vanguard.edu', role: 'Student', divisionId: 'dev', joinedDate: 'Apr 01, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/marcusj/200' },
    { id: 'dev-3', name: 'Liam Chen', email: 'liam@vanguard.edu', role: 'Instructor', divisionId: 'dev', joinedDate: 'Jan 22, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/liam/200', specialization: 'React Architecture Specialist', rating: 4.7, experience: 6 },
    
    // Data Science
    { id: 'ds-1', name: 'Marcus Thorne', email: 'm.thorne@vanguard.edu', role: 'Admin', divisionId: 'ds', joinedDate: 'Jan 05, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/marcus/200' },
    { id: 'ds-2', name: 'Dr. Jane Smith', email: 'jsmith@vanguard.edu', role: 'Instructor', divisionId: 'ds', joinedDate: 'Feb 15, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/jane/200', specialization: 'Neural Network Architect', rating: 5.0, experience: 12 },
    { id: 'ds-3', name: 'Sophia Wu', email: 'sophia@vanguard.edu', role: 'Instructor', divisionId: 'ds', joinedDate: 'Jul 10, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/sophia/200', specialization: 'NLP & LLM Expert', rating: 4.8, experience: 7 },
    
    // Cybersecurity
    { id: 'cy-1', name: 'Elena Rodriguez', email: 'elena.r@vanguard.edu', role: 'Instructor', divisionId: 'cyber', joinedDate: 'Feb 20, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/elena/200', specialization: 'Ethical Hacking Director', rating: 4.9, experience: 10 },
    { id: 'cy-2', name: 'Kevin Mitnick', email: 'kevin@vanguard.edu', role: 'Admin', divisionId: 'cyber', joinedDate: 'Mar 10, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/kevin/200' },
    { id: 'cy-3', name: 'Alex Volkov', email: 'alex@vanguard.edu', role: 'Instructor', divisionId: 'cyber', joinedDate: 'Dec 05, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/alex/200', specialization: 'Infrastructure Defensive Lead', rating: 4.6, experience: 5 },
    
    // CPD
    { id: 'cpd-1', name: 'David Thorne', email: 'david@vanguard.edu', role: 'Admin', divisionId: 'cpd', joinedDate: 'Nov 12, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/davidt/200' },
    { id: 'cpd-2', name: 'Emma Wilson', email: 'emma@vanguard.edu', role: 'Student', divisionId: 'cpd', joinedDate: 'May 01, 2024', status: 'Active', avatar: 'https://picsum.photos/seed/emma/200' },
    { id: 'cpd-3', name: 'Michael Grant', email: 'grant@vanguard.edu', role: 'Instructor', divisionId: 'cpd', joinedDate: 'Aug 14, 2023', status: 'Active', avatar: 'https://picsum.photos/seed/grant/200', specialization: 'Executive Leadership Coach', rating: 4.9, experience: 15 },
  ],
  addMember: (newMember) => {
    const createdMember: Member = {
      ...newMember,
      id: Math.random().toString(36).slice(2, 11),
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
      status: 'Active',
      avatar: `https://picsum.photos/seed/${newMember.name}/200`,
      mustResetPassword: true,
    };

    set((state) => ({
      members: [createdMember, ...state.members],
    }));

    return createdMember;
  },
  updateMember: (id, updatedFields) => set((state) => ({
    members: state.members.map((m) => m.id === id ? { ...m, ...updatedFields } : m),
  })),
  deleteMember: (id) => set((state) => ({
    members: state.members.filter((m) => m.id !== id),
  })),
  toggleStatus: (id) => set((state) => ({
    members: state.members.map((m) => {
      if (m.id === id) {
        const nextStatus = m.status === 'Suspended' ? 'Active' : 'Suspended';
        return { ...m, status: nextStatus };
      }
      return m;
    }),
  })),
  getMembersByDivision: (divisionId) => get().members.filter(m => m.divisionId === divisionId),
}));
