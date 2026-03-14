import { create } from 'zustand';
import type { User, Session } from '@supabase/supabase-js';

// =====================
// Auth Store — estado global de autenticação
// =====================
// isAuthReady: true após a primeira resolução do onAuthStateChange.
// Enquanto false, a app exibe um loading screen para evitar flash de conteúdo.

interface AuthStore {
  user:        User | null;
  session:     Session | null;
  isAuthReady: boolean;
  setSession:  (session: Session | null) => void;
  setAuthReady: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user:        null,
  session:     null,
  isAuthReady: false,

  setSession: (session) => set({ session, user: session?.user ?? null }),
  setAuthReady: () => set({ isAuthReady: true }),
}));
