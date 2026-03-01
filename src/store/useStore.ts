import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Repository, User } from "../lib/github";
import { DEFAULT_SYSTEM_PROMPT, type AIReviewResponse } from "../lib/ai";

export interface SavedAnalysis extends AIReviewResponse {
  timestamp: number;
}

interface AppState {
  token: string;
  systemPrompt: string;
  fontSize: number;
  user: User | null;
  repositories: Repository[];
  selectedRepo: Repository | null;
  isLoading: boolean;
  error: string | null;
  savedAnalyses: Record<string, AIReviewResponse>;
  aiFileCountThreshold: number;
  aiChangesThreshold: number;

  setToken: (token: string) => void;
  setSystemPrompt: (prompt: string) => void;
  setFontSize: (size: number) => void;
  setUser: (user: User | null) => void;
  setSelectedRepo: (repo: Repository | null) => void;
  saveAnalysis: (key: string, analysis: AIReviewResponse) => void;
  setAiFileCountThreshold: (count: number) => void;
  setAiChangesThreshold: (count: number) => void;
  clearStorage: () => void;
}

const initialState = {
  token: import.meta.env.VITE_GITHUB_TOKEN || "",
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  fontSize: 14,
  user: null,
  repositories: [],
  selectedRepo: null,
  isLoading: false,
  error: null,
  savedAnalyses: {},
  aiFileCountThreshold: 12,
  aiChangesThreshold: 100,
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      setToken: (token) => set({ token }),
      setSystemPrompt: (systemPrompt) => set({ systemPrompt }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAiFileCountThreshold: (aiFileCountThreshold) =>
        set({ aiFileCountThreshold }),
      setAiChangesThreshold: (aiChangesThreshold) =>
        set({ aiChangesThreshold }),
      setUser: (user) => set({ user }),
      setRepositories: (repositories: Repository[]) => set({ repositories }),
      setSelectedRepo: (selectedRepo: Repository | null) =>
        set({ selectedRepo }),
      setIsLoading: (isLoading: boolean) => set({ isLoading }),
      setError: (error: string | null) => set({ error }),
      saveAnalysis: (key, analysis) =>
        set((state) => ({
          savedAnalyses: {
            ...state.savedAnalyses,
            [key]: { ...analysis, timestamp: Date.now() },
          },
        })),
      clearStorage: () => set(initialState),
    }),
    {
      name: "pr-buddy-storage-secure",
      partialize: (state) => ({
        token: state.token,
        systemPrompt: state.systemPrompt,
        fontSize: state.fontSize,
        savedAnalyses: state.savedAnalyses,
        user: state.user,
        aiFileCountThreshold: state.aiFileCountThreshold,
        aiChangesThreshold: state.aiChangesThreshold,
      }),
    },
  ),
);
