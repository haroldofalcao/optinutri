import { useState, useEffect, useCallback } from "react";
import { dbService, SavedOptimization } from "@/services/db";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { toast } from "sonner";

export function useHistory() {
    const [history, setHistory] = useState<SavedOptimization[]>([]);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    // Auth listener to get current user
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                fetchHistory(currentUser.uid);
            } else {
                setHistory([]);
            }
        });
        return () => unsubscribe();
    }, []);

    const fetchHistory = useCallback(async (userId: string) => {
        setLoading(true);
        try {
            const data = await dbService.getUserHistory(userId);
            setHistory(data);
        } catch (error) {
            console.error("Failed to load history", error);
            toast.error("Erro ao carregar histórico");
        } finally {
            setLoading(false);
        }
    }, []);

    const saveResult = useCallback(async (data: Omit<SavedOptimization, "id" | "userId" | "timestamp">) => {
        if (!user) {
            // If no user, we could save to local storage or just warn
            // For MVP let's warn, or maybe allows anonymous if we implement anon auth
            toast.warning("Usuário não autenticado. O resultado não será salvo no banco de dados.");
            return;
        }

        try {
            await dbService.saveOptimization({
                ...data,
                userId: user.uid
            });
            await dbService.logAction(user.uid, "OPTIMIZATION_RUN", { cost: data.result.total_cost });

            // Refresh history
            await fetchHistory(user.uid);
            toast.success("Resultado salvo com sucesso!");
        } catch (error) {
            console.error("Failed to save result", error);
            toast.error("Erro ao salvar resultado");
        }
    }, [user, fetchHistory]);

    return {
        history,
        loading,
        saveResult,
        user
    };
}
