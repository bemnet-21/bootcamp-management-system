import axiosInstance from './axiosInstance';
import { ENDPOINTS } from './endpoints';

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  divisions: any[];
}

export interface Session {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  status: string;
  instructor: {
    firstName: string;
    lastName: string;
  };
}

export interface AttendanceRecord {
  sessionTitle: string;
  sessionStart: string;
  sessionEnd: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  note: string;
}

export interface Resource {
  _id: string;
  title: string;
  type: 'PDF' | 'Image' | 'ZIP' | 'Link';
  url: string;
  createdAt: string;
}

export const studentService = {
  getProfile: async () => {
    const response = await axiosInstance.get<{ user: UserProfile }>(ENDPOINTS.AUTH.ME);
    return response.data.user;
  },

  getSessions: async (divisionId?: string) => {
    const params = divisionId ? { division: divisionId } : {};
    const response = await axiosInstance.get<{ sessions: Session[] }>(ENDPOINTS.SESSIONS.BASE, { params });
    return response.data.sessions;
  },

  getAttendance: async (bootcampId: string) => {
    const response = await axiosInstance.get<{ attendance: AttendanceRecord[] }>(ENDPOINTS.BOOTCAMPS.ATTENDANCE(bootcampId));
    return response.data.attendance;
  },

  getAttendanceStats: async (bootcampId: string) => {
    const response = await axiosInstance.get<{ attendancePercentage: string }>(ENDPOINTS.BOOTCAMPS.ATTENDANCE_STATS(bootcampId));
    return response.data.attendancePercentage;
  },

  getResources: async (bootcampId: string) => {
    const response = await axiosInstance.get<{ data: Resource[] }>(ENDPOINTS.BOOTCAMPS.RESOURCES(bootcampId));
    return response.data.data;
  },
  
  // Since Task routes are missing, I'll add a placeholder that logs a warning
  getTasks: async () => {
    console.warn('Backend routes for Tasks are not yet implemented.');
    return [];
  },

  getGrades: async () => {
    console.warn('Backend routes for Grades are not yet implemented.');
    return [];
  }
};
