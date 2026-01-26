import { db } from "@/lib/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    getDocs,
    serverTimestamp,
    limit
} from "firebase/firestore";
import { OptimizationResult } from "@/types/formula";

export interface SavedOptimization {
    id?: string;
    userId: string;
    timestamp: any;
    constraints: any;
    result: OptimizationResult;
    selectedFormulas: string[];
}

export interface AuditLog {
    userId: string;
    action: string;
    details: any;
    timestamp: any;
}

const OPTIMIZATIONS_COLLECTION = "optimizations";
const AUDIT_LOGS_COLLECTION = "audit_logs";

export const dbService = {
    // Optimization History
    async saveOptimization(data: Omit<SavedOptimization, "id" | "timestamp">) {
        try {
            const docRef = await addDoc(collection(db, OPTIMIZATIONS_COLLECTION), {
                ...data,
                timestamp: serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error saving optimization:", error);
            throw error;
        }
    },

    async getUserHistory(userId: string, maxResults = 50) {
        try {
            const q = query(
                collection(db, OPTIMIZATIONS_COLLECTION),
                where("userId", "==", userId),
                orderBy("timestamp", "desc"),
                limit(maxResults)
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as SavedOptimization[];
        } catch (error) {
            console.error("Error fetching history:", error);
            throw error;
        }
    },

    // Audit Logging
    async logAction(userId: string, action: string, details: any = {}) {
        try {
            await addDoc(collection(db, AUDIT_LOGS_COLLECTION), {
                userId,
                action,
                details,
                timestamp: serverTimestamp()
            });
        } catch (error) {
            console.error("Error logging action:", error);
            // Don't throw for audit logs to prevent blocking main flow
        }
    }
};
