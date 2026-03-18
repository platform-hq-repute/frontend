import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  googlePlaceId?: string;
  averageRating: number;
  totalReviews: number;
  pendingResponses: number;
}

export interface Review {
  id: string;
  locationId: string;
  locationName: string;
  platform: 'google' | 'trustpilot';
  authorName: string;
  authorAvatar?: string;
  rating: number;
  content: string;
  createdAt: string;
  status: 'pending' | 'ai_generated' | 'responded';
  aiResponse?: string;
  publishedResponse?: string;
  respondedAt?: string;
}

export interface AISettings {
  tone: 'professional' | 'friendly' | 'casual';
  autoPublish: boolean;
  includeBusinessName: boolean;
  maxLength: number;
}

// Auth Store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  setUser: (user: User | null) => void;
  setOnboarded: (value: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setOnboarded: (value) => set({ isOnboarded: value }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Business Store
interface BusinessState {
  locations: Location[];
  selectedLocationId: string | null;
  aiSettings: AISettings;
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Location) => void;
  selectLocation: (id: string | null) => void;
  updateAISettings: (settings: Partial<AISettings>) => void;
  clearBusinessData: () => void;
}

export const useBusinessStore = create<BusinessState>()(
  persist(
    (set) => ({
      locations: [],
      selectedLocationId: null,
      aiSettings: {
        tone: 'professional',
        autoPublish: false,
        includeBusinessName: true,
        maxLength: 300,
      },
      setLocations: (locations) => set({ locations }),
      addLocation: (location) => set((state) => ({
        locations: [...state.locations, location]
      })),
      selectLocation: (id) => set({ selectedLocationId: id }),
      updateAISettings: (settings) => set((state) => ({
        aiSettings: { ...state.aiSettings, ...settings }
      })),
      clearBusinessData: () => set({
        locations: [],
        selectedLocationId: null,
      }),
    }),
    {
      name: 'business-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Reviews Store (not persisted - fetched from API)
interface ReviewsState {
  reviews: Review[];
  setReviews: (reviews: Review[]) => void;
  updateReview: (id: string, updates: Partial<Review>) => void;
}

export const useReviewsStore = create<ReviewsState>((set) => ({
  reviews: [],
  setReviews: (reviews) => set({ reviews }),
  updateReview: (id, updates) => set((state) => ({
    reviews: state.reviews.map((r) =>
      r.id === id ? { ...r, ...updates } : r
    )
  })),
}));

// Admin Auth Store
interface AdminAuthState {
  admin: AdminUser | null;
  isAdminAuthenticated: boolean;
  setAdmin: (admin: AdminUser | null) => void;
  adminLogout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      admin: null,
      isAdminAuthenticated: false,
      setAdmin: (admin) => set({ admin, isAdminAuthenticated: !!admin }),
      adminLogout: () => set({ admin: null, isAdminAuthenticated: false }),
    }),
    {
      name: 'admin-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
