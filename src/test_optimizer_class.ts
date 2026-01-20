
import { ParenteralNutritionOptimizer } from './lib/optimizer';
import formulasData from './data/formulas.json';
import { Formula, OptimizationConstraints } from './types/formula';

const formulas = formulasData.formulas as Formula[];
const optimizer = new ParenteralNutritionOptimizer(formulas);

const constraints: OptimizationConstraints = {
    kcal_min: 1000,
    kcal_max: 2500,
    protein_min: 40,
    protein_max: 150,
    volume_max: 3000,
    max_bags: 3
};

console.log("Running optimization...");
const result = optimizer.optimize(constraints);
console.log("Status:", result.status);
console.log("Cost:", result.total_cost);
console.log("Bags:", result.selected_bags.length);
console.log("Result obj:", JSON.stringify(result, null, 2));

if (result.status === 'Optimal') {
    console.log("TEST PASSED");
} else {
    console.log("TEST FAILED");
    process.exit(1);
}
