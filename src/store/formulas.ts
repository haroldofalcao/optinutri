import { atom } from "jotai";
import { Formula } from "@/types/formula";
import formulasData from "@/data/formulas.json";

// Initialize with data from JSON
export const formulasAtom = atom<Formula[]>(formulasData.formulas as Formula[]);

// Derived atoms can be added here (e.g., filtered formulas)
export const activeFormulasAtom = atom((get) => {
    const formulas = get(formulasAtom);
    return formulas; // Currently returns all, can filter active ones later
});
