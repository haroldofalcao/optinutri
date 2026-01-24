import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils"; // Requires jotai/utils
import { Formula } from "@/types/formula";
import formulasData from "@/data/formulas.json";

// Key for localStorage
const STORAGE_KEY = "optinutri_user_formulas";

// Base formulas from JSON
export const baseFormulasAtom = atom<Formula[]>(formulasData.formulas as Formula[]);

// Local formulas (overrides and additions) handled automatically by atomWithStorage
// The storage is initialized on client, default is empty array
export const localFormulasAtom = atomWithStorage<Formula[]>(STORAGE_KEY, []);

// Combined/Merged formulas
export const allFormulasAtom = atom((get) => {
    const base = get(baseFormulasAtom);
    const local = get(localFormulasAtom);

    // Create a map by ID for easy merging
    const formulaMap = new Map<string, Formula>();

    // Add base formulas
    base.forEach(f => formulaMap.set(f.id, f));

    // Apply local overrides (add or overwrite)
    local.forEach(f => {
        formulaMap.set(f.id, f);
    });

    return Array.from(formulaMap.values());
});

// Active formulas (non-hidden)
export const activeFormulasAtom = atom((get) => {
    const all = get(allFormulasAtom);
    return all.filter(f => !f.hidden);
});

// Actions
export const saveFormulaAtom = atom(
    null,
    (get, set, formula: Formula) => {
        const currentLocal = get(localFormulasAtom);
        const index = currentLocal.findIndex(f => f.id === formula.id);

        let newLocal;
        if (index >= 0) {
            newLocal = [...currentLocal];
            newLocal[index] = formula;
        } else {
            newLocal = [...currentLocal, formula];
        }

        set(localFormulasAtom, newLocal);
    }
);

export const toggleFormulaVisibilityAtom = atom(
    null,
    (get, set, formulaId: string) => {
        const all = get(allFormulasAtom);
        const target = all.find(f => f.id === formulaId);

        if (!target) return;

        // Clone and toggle
        const updated = { ...target, hidden: !target.hidden };

        // Save using the save mechanism which handles basic overrides
        set(saveFormulaAtom, updated);
    }
);

export const resetLocalFormulasAtom = atom(
    null,
    (get, set) => {
        set(localFormulasAtom, []);
    }
);

// High-level Actions for UI
export const updateFormulaAtom = atom(
    null,
    (get, set, formula: Formula) => {
        set(saveFormulaAtom, formula);
    }
);

export const deleteFormulaAtom = atom(
    null,
    (get, set, formulaId: string) => {
        const all = get(allFormulasAtom);
        const formula = all.find(f => f.id === formulaId);

        if (!formula) return;

        // Soft delete by marking as hidden
        // This works for both base (hides it) and local (updates it to be hidden)
        // Ideally for local-only we might want to hard delete, but soft delete is safer/simpler for now
        // and consistent with the "hidden" flag strategy.
        const updated = { ...formula, hidden: true };
        set(saveFormulaAtom, updated);
    }
);
