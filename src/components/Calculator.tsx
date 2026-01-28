'use client';

import { useState, useMemo, useEffect } from "react";
import { useAtom } from "jotai";
import { activeFormulasAtom } from "@/store/formulas";
import { trackPageView, trackOptimizationStarted, trackOptimizationCompleted, trackOptimizationFailed } from "@/lib/analytics";
import { addOptimizationToHistoryAtom } from "@/store/optimizationHistory";
import { OptimizationResult } from "@/types/formula";
import { toast } from "sonner";
import { useOptimizer } from "@/hooks/useOptimizer";
import { useHistory } from "@/hooks/useHistory";
import { OptimizationHistory } from "@/components/OptimizationHistory";
import { CalculatorForm } from "./calculator/CalculatorForm";
import { CalculatorResults } from "./calculator/CalculatorResults";
import { CalculatorCharts } from "./calculator/CalculatorCharts";

export default function Calculator() {
    // Safe default initialization of formulas if atom is empty
    const [formulas] = useAtom(activeFormulasAtom);
    const [, addToHistory] = useAtom(addOptimizationToHistoryAtom);
    const [result, setResult] = useState<OptimizationResult | null>(null);
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
    const [fixedFormulas, setFixedFormulas] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState("");

    // Track page view on mount
    useEffect(() => {
        trackPageView('calculator', 'Calculadora de Otimização');
    }, []);

    const [constraints, setConstraints] = useState({
        kcal_min: 1800,
        kcal_max: 2400,
        protein_min: 60,
        protein_max: 90,
        volume_max: 2500,
        max_bags: 5,
    });

    const { optimize, isOptimizing, validationErrors } = useOptimizer(formulas || []);

    const getFieldError = (field: string) => {
        return validationErrors.find((e) => e.field === field)?.message;
    };

    const toggleFormula = (id: string) => {
        setSelectedFormulas((prev) => {
            const isSelected = prev.includes(id);
            if (isSelected) {
                // If unselecting, also remove from fixed
                setFixedFormulas(prev => {
                    const newFixed = { ...prev };
                    delete newFixed[id];
                    return newFixed;
                });
                return prev.filter((fid) => fid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleFixedFormula = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setFixedFormulas((prev) => {
            const isFixed = !!prev[id];
            if (isFixed) {
                const newFixed = { ...prev };
                delete newFixed[id];
                return newFixed;
            } else {
                // If fixing, ensure it's also selected
                if (!selectedFormulas.includes(id)) {
                    setSelectedFormulas(s => [...s, id]);
                }
                return { ...prev, [id]: 1 }; // Default 1 bag
            }
        });
    };

    const updateFixedQuantity = (id: string, value: number) => {
        if (value < 1) return;
        setFixedFormulas(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const selectAll = () => {
        if (formulas) {
            setSelectedFormulas(formulas.map((f) => f.id));
        }
    };

    const deselectAll = () => {
        setSelectedFormulas([]);
        setFixedFormulas({});
    };

    const { saveResult } = useHistory();

    const handleOptimize = async () => {
        if (selectedFormulas.length === 0) {
            toast.error("Selecione ao menos uma fórmula para otimizar");
            return;
        }

        trackOptimizationStarted(
            selectedFormulas,
            constraints.volume_max,
            false
        );

        const startTime = performance.now();
        const optimizationResult = optimize(constraints, selectedFormulas, fixedFormulas);
        const executionTime = performance.now() - startTime;

        setResult(optimizationResult);

        if (optimizationResult.status === "Optimal") {
            // Save to Persistence (Firestore)
            saveResult({
                constraints: constraints,
                result: optimizationResult,
                selectedFormulas,
            });

            // Add to legacy local atom (optional, keeping for now)
            addToHistory({
                constraints,
                result: optimizationResult,
                selectedFormulas,
            });

            trackOptimizationCompleted(
                optimizationResult.num_bags,
                optimizationResult.total_cost || 0,
                executionTime,
                optimizationResult.total_volume
            );
        } else {
            trackOptimizationFailed(
                optimizationResult.message || "Erro na otimização",
                constraints.volume_max
            );
            toast.error(optimizationResult.message || "Erro na otimização");
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <div className="space-y-6">
                    <CalculatorForm
                        formulas={formulas || []}
                        selectedFormulas={selectedFormulas}
                        fixedFormulas={fixedFormulas}
                        constraints={constraints}
                        setConstraints={setConstraints}
                        toggleFormula={toggleFormula}
                        toggleFixedFormula={toggleFixedFormula}
                        updateFixedQuantity={updateFixedQuantity}
                        selectAll={selectAll}
                        deselectAll={deselectAll}
                        handleOptimize={handleOptimize}
                        isOptimizing={isOptimizing}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        getFieldError={getFieldError}
                    />
                </div>

                <div className="space-y-6">
                    <CalculatorResults result={result} constraints={constraints} />
                </div>
            </div>

            {result && result.status === "Optimal" && (
                <CalculatorCharts result={result} constraints={constraints} />
            )}

            <OptimizationHistory />
        </div>
    );
}
