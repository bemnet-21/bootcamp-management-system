import { create } from 'zustand';

interface UIState {
  sidebarCollapsed: boolean;
  activeNavItem: string;
  isModalOpen: boolean;
  modalType: string | null;
  searchQuery: string;
  toggleSidebar: () => void;
  setActiveNavItem: (item: string) => void;
  openModal: (type: string) => void;
  closeModal: () => void;
  setSearchQuery: (query: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  activeNavItem: 'Dashboard',
  isModalOpen: false,
  modalType: null,
  searchQuery: '',
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setActiveNavItem: (item) => set({ activeNavItem: item }),
  openModal: (type) => set({ isModalOpen: true, modalType: type }),
  closeModal: () => set({ isModalOpen: false, modalType: null }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}));
