
const solver = require('javascript-lp-solver');
const fs = require('fs');
const path = require('path');

const formulasData = JSON.parse(fs.readFileSync(path.join(__dirname, 'data/formulas.json'), 'utf8'));
const formulas = formulasData.formulas;

const constraints = {
    kcal_min: 1000,
    kcal_max: 2500,
    protein_min: 40,
    protein_max: 150,
    volume_max: 3000,
    max_bags: 3
};

const modelConstraints = {
    kcal: { min: constraints.kcal_min, max: constraints.kcal_max },
    protein: { min: constraints.protein_min, max: constraints.protein_max },
    volume: { max: constraints.volume_max },
    total_bags: { max: constraints.max_bags }
};

const modelVariables = {};
const ints = {};

formulas.forEach(f => {
    modelVariables[f.id] = {
        cost: f.base_cost,
        kcal: f.kcal,
        protein: (f.protein_g_l * f.volume_ml) / 1000,
        volume: f.volume_ml,
        nitrogen: (f.nitrogen_g_l * f.volume_ml) / 1000,
        glucose: (f.glucose_g_l * f.volume_ml) / 1000,
        fat: (f.fat_g_l * f.volume_ml) / 1000,
        total_bags: 1
    };
    ints[f.id] = 1;
});

const model = {
    optimize: "cost",
    opType: "min",
    constraints: modelConstraints,
    variables: modelVariables,
    ints: ints
};

console.log("Solving full model...");
const startTime = Date.now();
const result = solver.Solve(model);
console.log(`Solved in ${Date.now() - startTime}ms`);
console.log("Result:", result);
