
import toast from 'react-hot-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DraftState {
  drafts: Record<string, any>;
  saveDraft: (key: string, data: any) => void;
  getDraft: (key: string) => any;
  deleteDraft: (key: string) => void;
  getAllDrafts: () => Record<string, any>;
  clearAllDrafts: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},

      saveDraft: (key: string, data: any) => {
        set((state) => ({
          drafts: {
            ...state.drafts,
            [key]: {
              ...data,
              savedAt: new Date().toISOString(),
            },
          },
        }));
        toast.success('Draft saved successfully!');
      },

      getDraft: (key: string) => {
        return get().drafts[key];
      },

      deleteDraft: (key: string) => {
        set((state) => {
          const { [key]: _, ...remainingDrafts } = state.drafts;
          return { drafts: remainingDrafts };
        });
        toast.success('Draft deleted');
      },

      getAllDrafts: () => {
        return get().drafts;
      },

      clearAllDrafts: () => {
        set({ drafts: {} });
        toast.success('All drafts cleared');
      },
    }),
    {
      name: 'product-drafts-storage',
    }
  )
);