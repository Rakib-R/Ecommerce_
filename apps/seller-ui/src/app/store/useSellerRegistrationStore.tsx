import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Step1Values {
  name: string;
  email: string;
  country: string;
  phone_number: string;
  password: string;
  avatar: string;
}

export interface Step2Values {
  name: string;
  bio: string;
  address: string;
  opening_hours: string;
  website: string;
  category: string;
  shopCover: string;
}

interface SellerRegistrationState {
  activeStep: number;
  sellerId: string | null;
  step1Values: Partial<Step1Values>;
  step2Values: Partial<Step2Values>;

  /**
   * Becomes true once Zustand has finished reading from localStorage.
   * NEVER persisted — it's purely a runtime flag.
   * Use this in your component to block rendering until the real
   * activeStep is known, preventing the "always shows step 1" flash.
   **/
  _hasHydrated: boolean;

  setHasHydrated: (state: boolean) => void;
  setActiveStep: (step: number) => void;
  setSellerId: (id: string) => void;
  saveStep1Values: (values: Partial<Step1Values>) => void;
  saveStep2Values: (values: Partial<Step2Values>) => void;
  resetRegistration: () => void;
}

const defaultState = {
  activeStep: 1,
  sellerId: null,
  step1Values: {},
  step2Values: {},
  _hasHydrated: false,       // always starts false — intentional
};

export const useSellerRegistrationStore = create<SellerRegistrationState>()(
  persist(
    (set) => ({
      ...defaultState,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      setActiveStep: (step) => set({ activeStep: step }),
      setSellerId: (id) => set({ sellerId: id }),
      saveStep1Values: (values) =>
        set((s) => ({ step1Values: { ...s.step1Values, ...values } })),
      saveStep2Values: (values) =>
        set((s) => ({ step2Values: { ...s.step2Values, ...values } })),
      resetRegistration: () => set(defaultState),
    }),
    {
      name: "seller-registration",

      // Called automatically by Zustand localStorage has been read
      // and merged into the store. We flip _hasHydrated here so components// know
      //  the real persisted values are now available.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },

      // Don't persist the runtime flag itself — it must always start false
      partialize: (state) => ({
        activeStep: state.activeStep,
        sellerId: state.sellerId,
        step1Values: state.step1Values,
        step2Values: state.step2Values,
      }),
    }
  )
);