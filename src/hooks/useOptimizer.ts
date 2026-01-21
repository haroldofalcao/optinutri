import { useState, useCallback } from "react";
import { Formula, OptimizationConstraints, OptimizationResult } from "@/types/formula";
import { ParenteralNutritionOptimizer } from "@/lib/optimizer";

export interface ValidationError {
    path: string[];
    message: string;
    field?: string;
}

export function useOptimizer(formulas: Formula[]) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

    const optimizer = new ParenteralNutritionOptimizer(formulas);

    const validate = (constraints: OptimizationConstraints) => {
        const errors: ValidationError[] = [];

        if (constraints.kcal_min < 0) errors.push({ path: ["kcal_min"], message: "Valor não pode ser negativo", field: "kcal_min" });
        if (constraints.kcal_max < constraints.kcal_min) errors.push({ path: ["kcal_max"], message: "Máximo deve ser maior que mínimo", field: "kcal_max" });

        if (constraints.protein_min < 0) errors.push({ path: ["protein_min"], message: "Valor não pode ser negativo", field: "protein_min" });
        if (constraints.protein_max < constraints.protein_min) errors.push({ path: ["protein_max"], message: "Máximo deve ser maior que mínimo", field: "protein_max" });

        if (constraints.volume_max <= 0) errors.push({ path: ["volume_max"], message: "Volume deve ser maior que zero", field: "volume_max" });

        if (constraints.max_bags && constraints.max_bags < 1) errors.push({ path: ["max_bags"], message: "Mínimo 1 bolsa", field: "max_bags" });

        setValidationErrors(errors);
        return errors.length === 0;
    };

    const optimize = useCallback((
        constraints: OptimizationConstraints,
        selectedFormulaIds: string[],
        fixedFormulaIds: string[] | Record<string, number> = []
    ): OptimizationResult => {
        setIsOptimizing(true);
        setValidationErrors([]);

        // Validate inputs
        if (!validate(constraints)) {
            setIsOptimizing(false);
            return {
                status: "Error",
                message: "Erro de validação nos campos",
                total_costs: null,
                total_kcal: 0,
                total_protein: 0,
                total_volume: 0,
                total_nitrogen: 0,
                total_glucose: 0,
                total_fat: 0,
                selected_bags: [],
                constraints_met: {
                    kcal_min: false,
                    kcal_max: false,
                    protein_min: false,
                    protein_max: false,
                    volume_max: false
                },
                num_bags: 0
            } as any; // Type assertion mainly for lazy matching
        }

        try {
            // Run optimization synchronously for now (can be async if wrapped in worker)
            const result = optimizer.optimize(constraints, selectedFormulaIds, undefined, "All", "All", fixedFormulaIds);
            setIsOptimizing(false);
            return result;
        } catch (e: any) {
            setIsOptimizing(false);
            return {
                status: "Error",
                message: e.message || "Erro desconhecido na otimização",
                selected_bags: [],
                constraints_met: {},
            } as any;
        }
    }, [formulas]);

    return {
        optimize,
        isOptimizing,
        validationErrors,
    };
}
