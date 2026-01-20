import { atom } from "jotai";
import { OptimizationResult } from "@/types/formula";

export interface OptimizationHistoryEntry {
    id: string;
    timestamp: number; // Changed from date string to timestamp for consistency with legacy
    constraints: any;
    result: OptimizationResult;
    selectedFormulas: string[];
}

// Persist in localStorage could be added here
export const optimizationHistoryAtom = atom<OptimizationHistoryEntry[]>([]);

export const addOptimizationToHistoryAtom = atom(
    null,
    (get, set, newItem: Omit<OptimizationHistoryEntry, "id" | "timestamp">) => {
        const history = get(optimizationHistoryAtom);
        const item: OptimizationHistoryEntry = {
            ...newItem,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
        };
        // Keep only last 50 items
        const newHistory = [item, ...history].slice(0, 50);
        set(optimizationHistoryAtom, newHistory);
    }
);

export const deleteOptimizationEntryAtom = atom(
    null,
    (get, set, id: string) => {
        const history = get(optimizationHistoryAtom);
        set(optimizationHistoryAtom, history.filter((item) => item.id !== id));
    }
);

export const clearOptimizationHistoryAtom = atom(
    null,
    (get, set) => {
        set(optimizationHistoryAtom, []);
    }
);
