
import { ParenteralNutritionOptimizer } from './src/lib/optimizer';
import formulasData from './src/data/formulas.json';
import { Formula, OptimizationConstraints } from './src/types/formula';

const formulas = formulasData.formulas as Formula[];
const optimizer = new ParenteralNutritionOptimizer(formulas);

// Scenario: Diason Energy HP (F005 500mL, F006 1000mL)
// Constraints from image:
// Kcal: 1700 - 2400
// Protein: 60 - 105
// Volume Max: 2500
// Max Components: 1

const constraints: OptimizationConstraints = {
    kcal_min: 1700,
    kcal_max: 2400,
    protein_min: 60,
    protein_max: 105,
    volume_max: 2500,
    max_bags: 1
};

const formulaIds = ["F005", "F006"]; // Diason Energy HP 500mL and 1000mL

console.log("=== Testing Diason Energy HP Infeasibility ===");
console.log("Constraints:", JSON.stringify(constraints));

const result = optimizer.optimize(constraints, formulaIds);

console.log("\nResult Status:", result.status);
if (result.status !== 'Optimal') {
    console.log("Message:", result.message);
    if (result.violation_details) {
        console.log("Violation Details:", JSON.stringify(result.violation_details, null, 2));
    } else {
        console.log("No structured violation details returned (expected for Big M infeasibility, but let's see)");
    }
} else {
    console.log("Unexpected Optimal Result:");
    console.log("Bags:", result.num_bags);
    console.log("Selection:", result.selected_bags.map(b => `${b.quantity}x ${b.name}`).join(', '));
}

// Manual Check of Permutations
console.log("\nManual Check:");
const formula500 = formulas.find(f => f.id === "F005")!;
const formula1000 = formulas.find(f => f.id === "F006")!;

function check(name: string, kcal: number, protein: number) {
    const kOk = kcal >= constraints.kcal_min && kcal <= constraints.kcal_max;
    const pOk = protein >= constraints.protein_min && protein <= constraints.protein_max;
    console.log(`${name}: ${kcal} kcal (${kOk ? 'OK' : 'FAIL'}), ${protein.toFixed(1)}g Protein (${pOk ? 'OK' : 'FAIL'})`);
}

// 1. Only 500mL bags
check("2x 500mL", formula500.kcal * 2, (formula500.protein_g_l * 0.5) * 2);
check("3x 500mL", formula500.kcal * 3, (formula500.protein_g_l * 0.5) * 3);

// 2. Only 1000mL bags
check("1x 1000mL", formula1000.kcal * 1, (formula1000.protein_g_l * 1.0) * 1);
check("2x 1000mL", formula1000.kcal * 2, (formula1000.protein_g_l * 1.0) * 2);

// 3. Mixed (1.5L) - WOULD FAIL MAX TYPES
check("1.5L (Mix)", formula1000.kcal + formula500.kcal, (formula1000.protein_g_l * 1) + (formula500.protein_g_l * 0.5));
