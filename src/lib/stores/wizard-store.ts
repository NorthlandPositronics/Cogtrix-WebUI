import { create } from "zustand";
import type { WizardStepOut } from "@/lib/api/types/config";

export type WizardState = "idle" | "active" | "complete" | "error";

/**
 * Setup-wizard progress.
 *
 * The wizard lives inside a Radix TabsContent that unmounts when the admin
 * switches Settings tabs. Holding progress in local useState therefore lost the
 * whole run (and orphaned the server-side wizard, whose id lives in `step`) on
 * any tab switch. Keeping it in a store lets progress survive the remount —
 * same fix pattern as log-viewer-store's `userDisconnected`. Transient bits
 * (slowHint) and re-derivable bits (the step-0 llmForm) stay local to the
 * component.
 */
interface WizardStore {
  wizardState: WizardState;
  step: WizardStepOut | null;
  answer: string;
  errorMessage: string | null;
  setWizardState: (state: WizardState) => void;
  setStep: (step: WizardStepOut | null) => void;
  setAnswer: (answer: string) => void;
  setErrorMessage: (message: string | null) => void;
}

export const useWizardStore = create<WizardStore>((set) => ({
  wizardState: "idle",
  step: null,
  answer: "",
  errorMessage: null,
  setWizardState: (wizardState) => set({ wizardState }),
  setStep: (step) => set({ step }),
  setAnswer: (answer) => set({ answer }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
}));
