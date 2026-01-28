// @ts-ignore
import solver from "javascript-lp-solver";
import { Formula, OptimizationConstraints, OptimizationResult, SelectedBag } from "@/types/formula";

/**
 * Parenteral Nutrition Optimization Engine
 * =============================================================
 * 
 * This module implements a linear programming optimization algorithm using
 * javascript-lp-solver to find the optimal combination of parenteral
 * nutrition formulas that minimizes cost while meeting all nutritional constraints.
 */
export class ParenteralNutritionOptimizer {
    private formulas: Formula[];
    private modelVariables: Record<string, any> = {};

    constructor(formulas: Formula[]) {
        this.formulas = formulas;
    }

    /**
     * Get available formulas based on filters.
     */
    private getAvailableFormulas(
        selectedIds?: string[],
        emulsionFilter: string = "All",
        viaFilter: string = "All"
    ): Formula[] {
        let filteredFormulas = [...this.formulas];

        if (selectedIds && selectedIds.length > 0) {
            filteredFormulas = filteredFormulas.filter((f) => selectedIds.includes(f.id));
        }

        if (emulsionFilter !== "All") {
            filteredFormulas = filteredFormulas.filter((f) => f.emulsion_type === emulsionFilter);
        }

        if (viaFilter !== "All") {
            filteredFormulas = filteredFormulas.filter((f) => f.via === viaFilter);
        }

        return filteredFormulas;
    }

    /**
     * Validate constraints
     */
    private validateConstraints(constraints: OptimizationConstraints): boolean {
        if (constraints.kcal_min < 0 || constraints.kcal_max < 0 || constraints.kcal_min > constraints.kcal_max) {
            return false;
        }
        if (constraints.protein_min < 0 || constraints.protein_max < 0 || constraints.protein_min > constraints.protein_max) {
            return false;
        }
        if (constraints.volume_max <= 0) {
            return false;
        }
        return true;
    }

    /**
     * Optimize parenteral nutrition formula combination using linear programming.
     */
    optimize(
        constraints: OptimizationConstraints,
        selectedFormulas?: string[],
        customCosts?: Record<string, number>,
        emulsionFilter: string = "All",
        viaFilter: string = "All",
        fixedFormulaIds: string[] | Record<string, number> = []
    ): OptimizationResult {
        // Validate constraints
        if (!this.validateConstraints(constraints)) {
            return this.errorResult("Restrições inválidas fornecidas");
        }

        // Get available formulas
        const availableFormulas = this.getAvailableFormulas(selectedFormulas, emulsionFilter, viaFilter);

        console.log(`[DEBUG] Available formulas: ${availableFormulas.length}`);
        console.log(`[DEBUG] Constraints:`, JSON.stringify(constraints));

        if (availableFormulas.length === 0) {
            return this.errorResult("Nenhuma fórmula disponível com os filtros atuais");
        }

        // Build model constraints
        const modelConstraints: any = {};

        if (constraints.kcal_min > 0 || constraints.kcal_max > 0) {
            modelConstraints.kcal = { min: constraints.kcal_min, max: constraints.kcal_max };
        }
        if (constraints.protein_min > 0 || constraints.protein_max > 0) {
            modelConstraints.protein = { min: constraints.protein_min, max: constraints.protein_max };
        }
        if (constraints.volume_max > 0) {
            modelConstraints.volume = { max: constraints.volume_max };
        }

        // max_bags constraint: limits the TOTAL QUANTITY of TYPES (Binary variables sum)
        if (constraints.max_bags && constraints.max_bags > 0) {
            modelConstraints.max_types = { max: constraints.max_bags };
        }

        // Fixed Formulas constraint
        let fixedMap: Record<string, number> = {};
        if (Array.isArray(fixedFormulaIds)) {
            fixedFormulaIds.forEach(id => fixedMap[id] = 1);
        } else {
            fixedMap = fixedFormulaIds;
        }

        const fixedKeys = Object.keys(fixedMap);
        if (fixedKeys.length > 0) {
            fixedKeys.forEach(id => {
                // For fixed formulas, we ensure they are USED (Binary = 1)
                // We don't force a specific volume unless specified, but usually "Fixed" means "Must be present"
                // If the user wants a specific volume, we'd need a different input.
                // Assuming "Fixed" means "At least 1 bag equivalent" or just "Included".
                // Let's implement as "Must be included in the mix" (Binary = 1).

                // If fixedMap has values > 1, it might imply "Min X bags". 
                // In continuous/mL world, let's interpret fixedMap[id] as "Min X Bags equivalent".
                if (availableFormulas.some(f => f.id === id)) {
                    if (fixedMap[id] > 0) {
                        modelConstraints[`fixed_${id}`] = { min: 1, max: 1 }; // Force binary usage to 1
                    }
                }
            });
        }

        // Build model variables
        this.modelVariables = {};
        const binaries: Record<string, 1> = {};
        const M_Vol = constraints.volume_max || 5000; // Big M for Volume

        for (const formula of availableFormulas) {
            const currentCost = customCosts?.[formula.id] ?? formula.base_cost;
            const useVar = `use_${formula.id}`;
            const linkConstraint = `link_${formula.id}`;

            // Calculate Per mL values
            const costPerMl = currentCost / formula.volume_ml;
            const kcalPerMl = formula.kcal / formula.volume_ml;
            const proteinPerMl = formula.protein_g_l / 1000;
            const nitrogenPerMl = formula.nitrogen_g_l / 1000;
            const glucosePerMl = formula.glucose_g_l / 1000;
            const fatPerMl = formula.fat_g_l / 1000;

            // Main Variable (Continuous Volume in mL)
            this.modelVariables[formula.id] = {
                cost: costPerMl,
                kcal: kcalPerMl,
                protein: proteinPerMl,
                volume: 1, // 1 unit = 1 mL
                nitrogen: nitrogenPerMl,
                glucose: glucosePerMl,
                fat: fatPerMl,
                [linkConstraint]: 1 // Contribution: +1 * Volume
            };

            // Binary Variable (Use Indicator)
            this.modelVariables[useVar] = {
                max_types: 1, // Counts as 1 type used
                [linkConstraint]: -M_Vol // Contribution: -M * Use
            };
            binaries[useVar] = 1;

            // Linking Constraint: Volume - M*Use <= 0
            modelConstraints[linkConstraint] = { max: 0 };

            // Handle Fixed Formulas (Binaries)
            if (fixedMap[formula.id]) {
                // Force the binary variable itself to be 1 if we added a constraint for it
                this.modelVariables[useVar][`fixed_${formula.id}`] = 1;
            }
        }

        // Build LP model (No Integers for Volume variables)
        const model: any = {
            optimize: "cost",
            opType: "min",
            constraints: modelConstraints,
            variables: this.modelVariables,
            binaries: binaries,
        };

        try {
            // Solve the model
            const result = solver.Solve(model) as any;

            // Debug Log
            console.log(`[DEBUG] Result Status: ${result.feasible ? 'Feasible' : 'Infeasible'}`);
            // console.log(`[DEBUG] Result:`, JSON.stringify(result));

            if (!result.feasible) {
                return this.analyzeInfeasibility(constraints, availableFormulas, fixedMap);
            }

            return this.extractResults(result, availableFormulas, constraints);
        } catch (error) {
            console.error(`Erro na otimização: ${error}`);
            return this.errorResult(`Erro na otimização: ${error}`);
        }
    }

    /**
     * Extract results from solver output
     */
    private extractResults(
        result: any,
        availableFormulas: Formula[],
        constraints: OptimizationConstraints
    ): OptimizationResult {
        const selectedBags: SelectedBag[] = [];
        let totalKcal = 0;
        let totalProtein = 0;
        let totalVolume = 0;
        let totalNitrogen = 0;
        let totalGlucose = 0;
        let totalFat = 0;
        let totalBagsQuantity = 0;

        for (const formula of availableFormulas) {
            // result[formula.id] is now the VOLUME in mL
            const volumeSelected = result[formula.id];

            if (volumeSelected && volumeSelected > 0.01) { // Tolerance for floating point
                const variables = this.modelVariables[formula.id];
                // variables here contains PER ML values now

                // Calculate fractional bags (e.g. 1.5 bags)
                const bagsCount = volumeSelected / formula.volume_ml;

                selectedBags.push({
                    formula_id: formula.id,
                    name: formula.name,
                    quantity: parseFloat(bagsCount.toFixed(2)), // Display as "1.2" bags
                    unit_cost: formula.base_cost, // Display original unit cost per bag for reference
                    // total_cost: volume * cost_per_ml
                    total_cost: parseFloat((volumeSelected * variables.cost).toFixed(2)),
                    kcal_contribution: parseFloat((volumeSelected * variables.kcal).toFixed(1)),
                    protein_contribution: parseFloat((volumeSelected * variables.protein).toFixed(2)),
                    volume_contribution: parseFloat(volumeSelected.toFixed(1)), // The exact mL
                    emulsion_type: formula.emulsion_type,
                    via: formula.via,
                    manufacturer: formula.manufacturer,
                });

                totalKcal += volumeSelected * variables.kcal;
                totalProtein += volumeSelected * variables.protein;
                totalVolume += volumeSelected * 1; // variables.volume is 1 (per ml)
                totalNitrogen += volumeSelected * variables.nitrogen;
                totalGlucose += volumeSelected * variables.glucose;
                totalFat += volumeSelected * variables.fat;

                // For "Total Bags", we sum the fractional bags (e.g. 1.5 + 2.0 = 3.5 bags total)
                // This gives an idea of physical volume in terms of units
                totalBagsQuantity += bagsCount;
            }
        }

        const constraintsMet = this.checkConstraintsSatisfaction(
            totalKcal,
            totalProtein,
            totalVolume,
            constraints
        );

        // Validate max_bags constraint (MAX FORMULA TYPES)
        // We count distinct formulas selected
        const distinctTypes = selectedBags.length;
        const maxBagsMet = !constraints.max_bags || distinctTypes <= constraints.max_bags;

        // Check if ALL constraints are satisfied
        const allConstraintsMet =
            maxBagsMet &&
            constraintsMet.kcal_min &&
            constraintsMet.kcal_max &&
            constraintsMet.protein_min &&
            constraintsMet.protein_max &&
            constraintsMet.volume_max;

        // Build error message for violated constraints
        let errorMessage: string | undefined;
        if (!allConstraintsMet) {
            const violations: string[] = [];
            if (!maxBagsMet) {
                violations.push(`tipos de fórmulas (${distinctTypes} > ${constraints.max_bags})`);
            }
            if (!constraintsMet.kcal_min) {
                violations.push(`calorias insuficientes (${totalKcal.toFixed(0)} < ${constraints.kcal_min})`);
            }
            if (!constraintsMet.kcal_max) {
                violations.push(`excesso de calorias (${totalKcal.toFixed(0)} > ${constraints.kcal_max})`);
            }
            if (!constraintsMet.protein_min) {
                violations.push(`proteína insuficiente (${totalProtein.toFixed(1)}g < ${constraints.protein_min}g)`);
            }
            if (!constraintsMet.protein_max) {
                violations.push(`excesso de proteína (${totalProtein.toFixed(1)}g > ${constraints.protein_max}g)`);
            }
            if (!constraintsMet.volume_max) {
                violations.push(`excesso de volume (${totalVolume.toFixed(0)}mL > ${constraints.volume_max}mL)`);
            }
            errorMessage = `Restrições violadas: ${violations.join(", ")}`;
        }

        return {
            status: allConstraintsMet ? "Optimal" : "Infeasible",
            message: errorMessage,
            total_cost: parseFloat((result.result).toFixed(2)),
            total_kcal: parseFloat(totalKcal.toFixed(1)),
            total_protein: parseFloat(totalProtein.toFixed(2)),
            total_volume: parseFloat(totalVolume.toFixed(1)),
            total_nitrogen: parseFloat(totalNitrogen.toFixed(2)),
            total_glucose: parseFloat(totalGlucose.toFixed(2)),
            total_fat: parseFloat(totalFat.toFixed(2)),
            selected_bags: selectedBags.sort((a, b) => b.total_cost - a.total_cost),
            constraints_met: constraintsMet,
            num_bags: parseFloat(totalBagsQuantity.toFixed(2)), // Display as float because it can be fractional
        };
    }

    /**
     * Check if constraints are satisfied
     */
    private checkConstraintsSatisfaction(
        totalKcal: number,
        totalProtein: number,
        totalVolume: number,
        constraints: OptimizationConstraints
    ): OptimizationResult["constraints_met"] {
        // Very small tolerance for rounding errors only (0.5 units)
        const tolerance = 0.5;

        const met = {
            kcal_min: totalKcal >= (constraints.kcal_min || 0) - tolerance,
            kcal_max: totalKcal <= (constraints.kcal_max || Infinity) + tolerance,
            protein_min: totalProtein >= (constraints.protein_min || 0) - tolerance,
            protein_max: totalProtein <= (constraints.protein_max || Infinity) + tolerance,
            volume_max: totalVolume <= (constraints.volume_max || Infinity) + tolerance,
        };

        // Debug log for constraint violations
        if (!met.volume_max) {
            console.log(`[OPTIMIZER] Volume constraint violated: ${totalVolume.toFixed(1)}mL > ${constraints.volume_max}mL (+ ${tolerance} tolerance)`);
        }
        if (!met.kcal_max) {
            console.log(`[OPTIMIZER] Calorie max constraint violated: ${totalKcal.toFixed(1)} > ${constraints.kcal_max} (+ ${tolerance} tolerance)`);
        }
        if (!met.protein_max) {
            console.log(`[OPTIMIZER] Protein max constraint violated: ${totalProtein.toFixed(1)}g > ${constraints.protein_max}g (+ ${tolerance} tolerance)`);
        }

        return met;
    }

    /**
     * Return error result
     */
    private errorResult(message: string): OptimizationResult {
        return {
            status: "Error",
            message,
            total_cost: null,
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
                volume_max: false,
            },
            num_bags: 0,
        };
    }

    /**
     * Return infeasible result
     */
    private infeasibleResult(): OptimizationResult {
        return {
            status: "Infeasible",
            message: "Problema inviável - restrições não podem ser satisfeitas",
            total_cost: null,
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
                volume_max: false,
            },
            num_bags: 0,
        };
    }
    /**
     * Analyze why the optimization is infeasible by calculating reachable ranges.
     */
    /**
     * Analyze why the optimization is infeasible by calculating reachable ranges.
     */
    private analyzeInfeasibility(
        constraints: OptimizationConstraints,
        availableFormulas: Formula[],
        fixedMap: Record<string, number>
    ): OptimizationResult {
        const violationDetails: NonNullable<OptimizationResult["violation_details"]> = [];
        const maxTypes = constraints.max_bags || 5; // Using max_bags input as max_types constraint
        const M_Vol = constraints.volume_max || 5000;

        // Helper to solve for a single objective (min or max)
        const solveObjective = (objective: string, opType: "min" | "max"): any => {
            const M = M_Vol;

            // 1. Initialize Model Structure
            const modelVariables: Record<string, any> = {};
            const modelBinaries: Record<string, 1> = {};

            // Constraints
            const modelConstraints: Record<string, any> = {
                max_types: { max: maxTypes }
            };

            // 2. Build Variables and Linking Constraints
            for (const formula of availableFormulas) {
                const bagVarName = formula.id;
                const useVarName = `use_${formula.id}`;
                const linkConstraintName = `link_${formula.id}`;

                // Calculate Per mL values
                const kcalPerMl = formula.kcal / formula.volume_ml;
                const proteinPerMl = formula.protein_g_l / 1000;

                // A. Main Volume Variable (Continuous)
                modelVariables[bagVarName] = {
                    kcal: kcalPerMl,
                    protein: proteinPerMl,
                    volume: 1, // 1 mL
                    // Objective:
                    [objective]: objective === "volume" ? 1 :
                        objective === "kcal" ? kcalPerMl :
                            proteinPerMl,
                    // Contribution to linking constraint: +1 * Volume
                    [linkConstraintName]: 1
                };

                // If fixed, add constraint (e.g. Min 1 Bag equivalent = Volume)
                // Use volume_ml as the minimum volume for a fixed formula
                if (fixedMap[formula.id]) {
                    modelConstraints[bagVarName] = { min: formula.volume_ml };
                    // Ensure variable tracks itself for the constraint to work
                    modelVariables[bagVarName][bagVarName] = 1;
                }

                // B. Binary Use Variable
                modelVariables[useVarName] = {
                    max_types: 1, // Counts towards the limit of types
                    // Contribution to linking constraint: -M * Use
                    [linkConstraintName]: -M
                };
                modelBinaries[useVarName] = 1;

                // C. Define the linking constraint bounds
                modelConstraints[linkConstraintName] = { max: 0 };
            }

            // Add Global Volume Constraint for feasibility bounds check
            if (constraints.volume_max) {
                modelConstraints.volume = { max: constraints.volume_max };
            }

            const model = {
                optimize: objective,
                opType: opType,
                constraints: modelConstraints,
                variables: modelVariables,
                binaries: modelBinaries
            };

            return solver.Solve(model);
        };

        // Check Kcal
        const minKcalRes = solveObjective("kcal", "min");
        const maxKcalRes = solveObjective("kcal", "max");

        if (minKcalRes.feasible && maxKcalRes.feasible) {
            const minPossible = minKcalRes.result;
            const maxPossible = maxKcalRes.result;

            if (constraints.kcal_min > maxPossible) {
                violationDetails.push({
                    constraint: "Calorias Mínimas",
                    target: constraints.kcal_min,
                    actual_min: minPossible,
                    actual_max: maxPossible,
                    unit: "kcal"
                });
            }
            if (constraints.kcal_max < minPossible) {
                violationDetails.push({
                    constraint: "Calorias Máximas",
                    target: constraints.kcal_max,
                    actual_min: minPossible,
                    actual_max: maxPossible,
                    unit: "kcal"
                });
            }
        }

        // Check Protein
        const minProteinRes = solveObjective("protein", "min");
        const maxProteinRes = solveObjective("protein", "max");

        if (minProteinRes.feasible && maxProteinRes.feasible) {
            const minPossible = minProteinRes.result;
            const maxPossible = maxProteinRes.result;

            if (constraints.protein_min > maxPossible) {
                violationDetails.push({
                    constraint: "Proteína Mínima",
                    target: constraints.protein_min,
                    actual_min: minPossible,
                    actual_max: maxPossible,
                    unit: "g"
                });
            }
            if (constraints.protein_max < minPossible) {
                violationDetails.push({
                    constraint: "Proteína Máxima",
                    target: constraints.protein_max,
                    actual_min: minPossible,
                    actual_max: maxPossible,
                    unit: "g"
                });
            }
        }

        // Check Volume
        // Since we constrained volume in the model, checking min volume is less relevant unless we have a min volume constraint.
        // But we can check if the MAX volume constraint makes other things impossible (already partly covered by bounds).
        // Let's check max volume achievable vs constraint?

        // Actually, if we couldn't satisfy regular constraints, volume might be the bottleneck.
        // Let's leave volume check simpler or omit if covered above.
        // For consistency with previous logic:
        const minVolumeRes = solveObjective("volume", "min");
        if (minVolumeRes.feasible) {
            const minPossible = minVolumeRes.result;
            if (constraints.volume_max < minPossible) {
                // This means even minimizing volume, we exceed max.
                // Usually happens if we have Fixed Formulas demanding volume.
                violationDetails.push({
                    constraint: "Volume Mínimo Required",
                    target: constraints.volume_max,
                    actual_min: minPossible,
                    actual_max: Infinity,
                    unit: "mL"
                });
            }
        }

        return {
            status: "Infeasible",
            message: "Não foi possível encontrar uma solução com as restrições atuais.",
            total_cost: null,
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
                volume_max: false,
            },
            num_bags: 0,
            violation_details: violationDetails.length > 0 ? violationDetails : undefined,
        };
    }
}
