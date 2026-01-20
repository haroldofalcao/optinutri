import { describe, it, expect } from 'vitest';
import { ParenteralNutritionOptimizer } from './optimizer';
import formulasData from '../data/formulas.json';
import { Formula, OptimizationConstraints } from '../types/formula';

describe('ParenteralNutritionOptimizer', () => {
    const formulas = formulasData.formulas as Formula[];
    const optimizer = new ParenteralNutritionOptimizer(formulas);

    it('should find an optimal solution for standard constraints', () => {
        const constraints: OptimizationConstraints = {
            kcal_min: 1000,
            kcal_max: 2500,
            protein_min: 40,
            protein_max: 150,
            volume_max: 3000,
            max_bags: 3
        };

        const result = optimizer.optimize(constraints);

        expect(result.status).toBe('Optimal');
        expect(result.total_cost).toBeGreaterThan(0);
        expect(result.total_kcal).toBeGreaterThanOrEqual(1000);
        expect(result.total_kcal).toBeLessThanOrEqual(2500);
        expect(result.total_protein).toBeGreaterThanOrEqual(40);
        expect(result.total_protein).toBeLessThanOrEqual(150);
        expect(result.selected_bags.length).toBeGreaterThan(0);
    });

    it('should return Infeasible for impossible constraints', () => {
        const constraints: OptimizationConstraints = {
            kcal_min: 5000, // Impossible with volume limit
            kcal_max: 6000,
            protein_min: 200,
            protein_max: 300,
            volume_max: 1000,
            max_bags: 3
        };

        const result = optimizer.optimize(constraints);

        expect(result.status).toBe('Infeasible');
    });
});
