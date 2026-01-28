
import { describe, it, expect } from 'vitest';
import { ParenteralNutritionOptimizer } from '../lib/optimizer';
import { Formula, OptimizationConstraints } from '../types/formula';

const mockFormulas: Formula[] = [
    {
        id: "f1",
        name: "Formula A",
        manufacturer: "Man A",
        volume_ml: 500,
        kcal: 500,
        protein_g_l: 50, // 25g per bag
        nitrogen_g_l: 8,
        glucose_g_l: 50,
        fat_g_l: 20,
        emulsion_type: "TCM/TCL",
        via: "Central",
        base_cost: 100
    },
    {
        id: "f2",
        name: "Formula B",
        manufacturer: "Man B",
        volume_ml: 1000,
        kcal: 800,
        protein_g_l: 40, // 40g per bag
        nitrogen_g_l: 6,
        glucose_g_l: 80,
        fat_g_l: 30,
        emulsion_type: "soja",
        via: "Central",
        base_cost: 150
    }
];

describe('Infeasibility Analysis', () => {
    const optimizer = new ParenteralNutritionOptimizer(mockFormulas);

    it('should identify impossible minimum calories given bag limit', () => {
        // With 1 bag max:
        // Max Kcal possible is 800 (Formula B)
        // We request Min 2000
        const constraints: OptimizationConstraints = {
            kcal_min: 2000,
            kcal_max: 3000,
            protein_min: 0,
            protein_max: 1000,
            volume_max: 5000,
            max_bags: 1
        };

        const result = optimizer.optimize(constraints, ["f1", "f2"]);

        expect(result.status).toBe("Infeasible");
        expect(result.violation_details).toBeDefined();
        expect(result.violation_details?.some(v => v.constraint === "Calorias Mínimas")).toBe(true);
        // Should show that max feasible is 800
        const violation = result.violation_details?.find(v => v.constraint === "Calorias Mínimas");
        expect(violation?.actual_max).toBe(800);
    });

    it('should identify impossible minimum protein given bag limit', () => {
        // Max Protein with 1 bag is 40g (Formula B).
        // Requests 50g.
        const constraints: OptimizationConstraints = {
            kcal_min: 0,
            kcal_max: 5000,
            protein_min: 50,
            protein_max: 1000,
            volume_max: 5000,
            max_bags: 1
        };

        const result = optimizer.optimize(constraints, ["f1", "f2"]);

        expect(result.status).toBe("Infeasible");
        expect(result.violation_details?.some(v => v.constraint === "Proteína Mínima")).toBe(true);

        const violation = result.violation_details?.find(v => v.constraint === "Proteína Mínima");
        expect(violation?.actual_max).toBe(40);
    });
});
