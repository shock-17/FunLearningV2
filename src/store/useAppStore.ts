import { create } from 'zustand';

export type ChildAvatar = 'fox' | 'bear' | 'rabbit' | 'owl' | 'turtle';
export type Subject = 'Math' | 'English' | 'Mandarin';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface KidProfile {
  id: string;
  name: string;
  avatar: ChildAvatar;
}

export interface ScoreHistory {
  id: string;
  kid_id: string;
  subject: Subject;
  difficulty: Difficulty;
  score: number;
  total: number;
  date: string;
}

export interface StoryProgressRow {
  kid_id: string;
  subject: Subject;
  unlocked_level: number;
  last_completed_level: number;
  total_stars: number;
  updated_at: string | null;
}

export type StoryProgressBySubject = Record<Subject, StoryProgressRow>;

interface AppState {
  isParentAuthenticated: boolean;
  profiles: KidProfile[];
  scoreHistory: ScoreHistory[];
  activeKidId: string | null;
  parentEmail: string | null;
  storyProgress: Partial<StoryProgressBySubject>;
  soundEnabled: boolean;

  // Actions
  checkAuth: () => Promise<void>;
  setAuth: (authenticated: boolean, email?: string) => void;
  fetchData: () => Promise<void>;
  logout: () => Promise<void>;
  addProfile: (name: string, avatar: ChildAvatar) => Promise<void>;
  deleteProfile: (id: string) => Promise<void>;
  setActiveKid: (id: string | null) => void;
  addScore: (scoreData: { kidId: string, subject: Subject, difficulty: Difficulty, score: number, total: number }) => Promise<void>;
  fetchStoryProgress: (kidId: string) => Promise<void>;
  completeStoryLevel: (args: { kidId: string; subject: Subject; level: number; stars: number }) => Promise<StoryProgressRow | null>;
  setSoundEnabled: (enabled: boolean) => void;
}

const STORY_SUBJECTS: Subject[] = ['Math', 'English', 'Mandarin'];

function defaultStoryRow(kidId: string, subject: Subject): StoryProgressRow {
  return {
    kid_id: kidId,
    subject,
    unlocked_level: 1,
    last_completed_level: 0,
    total_stars: 0,
    updated_at: null,
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  isParentAuthenticated: false,
  profiles: [],
  scoreHistory: [],
  activeKidId: null,
  parentEmail: null,
  storyProgress: {},
  soundEnabled: (() => {
    try {
      const v = localStorage.getItem('soundEnabled');
      return v === null ? true : v === 'true';
    } catch {
      return true;
    }
  })(),

  setAuth: (auth, email) => {
    set({ isParentAuthenticated: auth, parentEmail: email || null });
    if (!auth) {
      set({ profiles: [], scoreHistory: [], activeKidId: null, storyProgress: {} });
    }
  },

  checkAuth: async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) {
        const user = await res.json();
        set({ isParentAuthenticated: true, parentEmail: user.email });
        await get().fetchData();
      } else {
        get().setAuth(false);
      }
    } catch {
      get().setAuth(false);
    }
  },

  fetchData: async () => {
    try {
      const [kidsRes, scoresRes] = await Promise.all([
        fetch('/api/kids'),
        fetch('/api/scores')
      ]);
      if (kidsRes.ok && scoresRes.ok) {
        const kids = await kidsRes.json();
        const scores = await scoresRes.json();
        set({ profiles: kids, scoreHistory: scores });
      }
    } catch (e) {
      console.error(e);
    }
  },

  logout: async () => {
    await fetch('/api/logout', { method: 'POST' });
    get().setAuth(false);
  },

  addProfile: async (name, avatar) => {
    const res = await fetch('/api/kids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, avatar })
    });
    if (res.ok) {
      const kid = await res.json();
      set(state => ({ profiles: [...state.profiles, kid] }));
    } else {
      const err = await res.json();
      alert(err.error || 'Failed to create profile');
    }
  },

  deleteProfile: async (id) => {
    const res = await fetch(`/api/kids/${id}`, { method: 'DELETE' });
    if (res.ok) {
      set(state => ({
        profiles: state.profiles.filter((p) => p.id !== id),
        scoreHistory: state.scoreHistory.filter((s) => s.kid_id !== id),
        activeKidId: state.activeKidId === id ? null : state.activeKidId,
        storyProgress: state.activeKidId === id ? {} : state.storyProgress,
      }));
    }
  },

  setActiveKid: (id) => {
    set({ activeKidId: id, storyProgress: {} });
    if (id) {
      get().fetchStoryProgress(id);
    }
  },

  addScore: async (scoreData) => {
    const res = await fetch('/api/scores', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreData)
    });
    if (res.ok) {
      const newScore = await res.json();
      set(state => ({
        scoreHistory: [newScore, ...state.scoreHistory]
      }));
    }
  },

  fetchStoryProgress: async (kidId) => {
    try {
      const res = await fetch(`/api/story/progress?kidId=${encodeURIComponent(kidId)}`);
      if (!res.ok) {
        set({ storyProgress: {} });
        return;
      }
      const rows = (await res.json()) as StoryProgressRow[];
      const bySubject: Partial<StoryProgressBySubject> = {};
      for (const subj of STORY_SUBJECTS) {
        bySubject[subj] = defaultStoryRow(kidId, subj);
      }
      for (const row of rows) {
        bySubject[row.subject] = row;
      }
      set({ storyProgress: bySubject });
    } catch (e) {
      console.error(e);
      set({ storyProgress: {} });
    }
  },

  completeStoryLevel: async ({ kidId, subject, level, stars }) => {
    try {
      const res = await fetch('/api/story/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kidId, subject, level, stars })
      });
      if (!res.ok) return null;
      const row = (await res.json()) as StoryProgressRow;
      set(state => ({
        storyProgress: { ...state.storyProgress, [subject]: row }
      }));
      return row;
    } catch (e) {
      console.error(e);
      return null;
    }
  },

  setSoundEnabled: (enabled) => {
    set({ soundEnabled: enabled });
    try {
      localStorage.setItem('soundEnabled', String(enabled));
    } catch {
      // ignore
    }
  },
}));
