import { create } from 'zustand';

export interface Team {
  id: string;
  name: string;
  projectTitle: string;
  divisionId: string;
  memberCount: number;
  mentorName: string;
  progress: number;
  avatars: string[];
}

interface TeamState {
  teams: Team[];
  getTeamsByDivision: (divisionId: string) => Team[];
  addTeam: (team: Omit<Team, 'id' | 'avatars'>) => void;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  teams: [
    // Data Science (ds)
    { 
      id: 'team-ds-1', 
      name: 'Neural Pioneers', 
      projectTitle: 'Predictive Supply Chain Optimization', 
      divisionId: 'ds', 
      memberCount: 5, 
      mentorName: 'Prof. Marcus Thorne', 
      progress: 75,
      avatars: ['https://picsum.photos/seed/p1/100', 'https://picsum.photos/seed/p2/100', 'https://picsum.photos/seed/p3/100']
    },
    { 
      id: 'team-ds-2', 
      name: 'Data Wizards', 
      projectTitle: 'Real-time Sentiment Analysis Engine', 
      divisionId: 'ds', 
      memberCount: 4, 
      mentorName: 'Dr. Jane Smith', 
      progress: 42,
      avatars: ['https://picsum.photos/seed/w1/100', 'https://picsum.photos/seed/w2/100']
    },

    // Development (dev)
    { 
      id: 'team-dev-1', 
      name: 'React Rangers', 
      projectTitle: 'Vanguard Alpha Management v2', 
      divisionId: 'dev', 
      memberCount: 6, 
      mentorName: 'Sarah Jenkins', 
      progress: 88,
      avatars: ['https://picsum.photos/seed/r1/100', 'https://picsum.photos/seed/r2/100', 'https://picsum.photos/seed/r3/100', 'https://picsum.photos/seed/r4/100']
    },
    { 
      id: 'team-dev-2', 
      name: 'Cloud Burst', 
      projectTitle: 'Microservices Mesh Deployment', 
      divisionId: 'dev', 
      memberCount: 3, 
      mentorName: 'Marcus Jones', 
      progress: 15,
      avatars: ['https://picsum.photos/seed/c1/100', 'https://picsum.photos/seed/c2/100']
    },

    // Cybersecurity (cyber)
    { 
      id: 'team-cy-1', 
      name: 'Ghost Protocol', 
      projectTitle: 'Zero-Day Vulnerability Scanner', 
      divisionId: 'cyber', 
      memberCount: 4, 
      mentorName: 'Elena Rodriguez', 
      progress: 60,
      avatars: ['https://picsum.photos/seed/g1/100', 'https://picsum.photos/seed/g2/100', 'https://picsum.photos/seed/g3/100']
    },

    // CPD (cpd)
    { 
      id: 'team-cpd-1', 
      name: 'Exec Force', 
      projectTitle: 'Strategic Negotiation Framework', 
      divisionId: 'cpd', 
      memberCount: 8, 
      mentorName: 'David Thorne', 
      progress: 95,
      avatars: ['https://picsum.photos/seed/e1/100', 'https://picsum.photos/seed/e2/100', 'https://picsum.photos/seed/e3/100']
    },
  ],
  getTeamsByDivision: (divisionId) => get().teams.filter(t => t.divisionId === divisionId),
  addTeam: (newTeam) => set((state) => ({
    teams: [
      ...state.teams,
      {
        ...newTeam,
        id: Math.random().toString(36).substr(2, 9),
        avatars: Array.from({ length: 3 }).map((_, i) => `https://picsum.photos/seed/member-${Math.random()}/100`),
      }
    ]
  })),
}));
