import { create } from 'zustand';

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

interface BootcampState {
  bootcamps: Bootcamp[];
  getBootcampsByDivision: (divisionId: string) => Bootcamp[];
}

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
  getBootcampsByDivision: (divisionId) => get().bootcamps.filter(b => b.divisionId === divisionId),
}));
