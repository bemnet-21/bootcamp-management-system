import { create } from 'zustand';

interface DivisionHead {
  name: string;
  avatar: string;
  role: string;
  bio: string;
}

interface DivisionStats {
  members: number;
  activeBootcamps: number;
  satisfaction: number;
  memberTrend: string;
}

export interface Division {
  id: string;
  name: string;
  description: string;
  image: string;
  head: DivisionHead;
  stats: DivisionStats;
}

interface DivisionState {
  activeDivision: Division | null;
  divisions: Division[];
  setActiveDivision: (division: Division | null) => void;
  getDivisionById: (id: string) => Division | undefined;
}

export const useDivisionStore = create<DivisionState>((set, get) => ({
  activeDivision: null,
  divisions: [
    {
      id: 'ds',
      name: 'Data Science',
      description: 'Driving institutional intelligence through advanced analytics, machine learning paths, and big data architecture cohorts.',
      image: 'https://picsum.photos/seed/datascience/800/600',
      head: {
        name: 'Prof. Marcus Thorne',
        role: 'Head of Data Science',
        avatar: 'https://picsum.photos/seed/marcus-head/400',
        bio: 'Expert in Large Language Models and Neural Architecture. Leading the Vanguard AI initiative for over 6 years.'
      },
      stats: {
        members: 438,
        activeBootcamps: 12,
        satisfaction: 96,
        memberTrend: '+18% vs last quarter'
      }
    },
    {
      id: 'dev',
      name: 'Development',
      description: 'Full-stack engineering excellence, focusing on modern frameworks, cloud-native architecture, and agile delivery systems.',
      image: 'https://picsum.photos/seed/dev/800/600',
      head: {
        name: 'Julia Vane',
        role: 'Engineering Lead',
        avatar: 'https://picsum.photos/seed/julia-head/400',
        bio: 'Full-stack architect specializing in high-scale React systems. Former Principal Engineer at major tech hubs.'
      },
      stats: {
        members: 612,
        activeBootcamps: 24,
        satisfaction: 94,
        memberTrend: '+12% vs last quarter'
      }
    },
    {
      id: 'cyber',
      name: 'Cybersecurity',
      description: 'Protecting the digital frontier with ethical hacking, defensive security operations, and regulatory compliance pathways.',
      image: 'https://picsum.photos/seed/cyber/800/600',
      head: {
        name: 'Dr. Sarah Chen',
        role: 'Security Director',
        avatar: 'https://picsum.photos/seed/sarah-head/400',
        bio: 'Renowned expert in Cryptography and Network Security. Overseeing defensive strategies for Vanguard Infrastructure.'
      },
      stats: {
        members: 285,
        activeBootcamps: 8,
        satisfaction: 98,
        memberTrend: '+5% vs last quarter'
      }
    },
    {
      id: 'cpd',
      name: 'CPD',
      description: 'Continuous Professional Development focusing on executive leadership, soft skills, and industry-specific certifications.',
      image: 'https://picsum.photos/seed/leadership/800/600',
      head: {
        name: 'David Thorne',
        role: 'Program Director',
        avatar: 'https://picsum.photos/seed/david-head/400',
        bio: 'Strategic leadership coach with 15 years of experience in executive education and corporate growth.'
      },
      stats: {
        members: 920,
        activeBootcamps: 42,
        satisfaction: 92,
        memberTrend: '+25% vs last quarter'
      }
    },
  ],
  setActiveDivision: (division) => set({ activeDivision: division }),
  getDivisionById: (id) => get().divisions.find(d => d.id === id),
}));
