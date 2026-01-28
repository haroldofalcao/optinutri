
import { ParenteralNutritionOptimizer } from './src/lib/optimizer';
import formulasData from './src/data/formulas.json';
import { Formula, OptimizationConstraints } from './src/types/formula';

const formulas = formulasData.formulas as Formula[];
const optimizer = new ParenteralNutritionOptimizer(formulas);

const constraints: OptimizationConstraints = {
    kcal_min: 1700,
    kcal_max: 2000,
    protein_min: 60,
    protein_max: 105,
    volume_max: 2500,
    max_bags: 1
};

// Test Diason Energy HP (1.5 kcal/mL)
const formulaId = "F005"; // Diason Energy HP 500mL (but we ignore bag size logic now for continuous volume)
const specificFormulaIds = [formulaId];

console.log("=== Testing Continuous Volume Optimization ===");
console.log("Scenario: Diason Energy HP (1.5kcal/ml)");
console.log("Target: 1700 kcal");
console.log("Expected Volume: ~1133.33 mL");

const result = optimizer.optimize(constraints, specificFormulaIds);

console.log("Status:", result.status);
if (result.status === 'Optimal') {
    console.log("Total Volume:", result.total_volume);
    console.log("Total Kcal:", result.total_kcal);
    console.log("Total Protein:", result.total_protein);
    console.log("Total Bags (Derived):", result.num_bags);
    console.log("Selected:", JSON.stringify(result.selected_bags, null, 2));

    const vol = result.total_volume;
    if (Math.abs(vol - 1133.3) < 5) {
        console.log("RESULT: PASSED (Volume correct)");
    } else {
        console.log("RESULT: WARNING (Volume deviation)");
    }
} else {
    console.log("RESULT: FAILED (Infeasible)");
    console.log("Message:", result.message);
}
