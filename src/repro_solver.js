
const solver = require('javascript-lp-solver');

const model = {
    "optimize": "cost",
    "opType": "min",
    "constraints": {
        "kcal": { "min": 1000, "max": 2500 },
        "protein": { "min": 40, "max": 150 },
        "volume": { "max": 3000 },
        "total_bags": { "max": 3 }
    },
    "variables": {
        "PN029": {
            "cost": 14.8,
            "kcal": 1000,
            "protein": 0,
            "volume": 500,
            "total_bags": 1
        },
        "PN027": {
            "cost": 52.3,
            "kcal": 320,
            "protein": 100,
            "volume": 1000,
            "total_bags": 1
        }
    },
    "ints": { "PN029": 1, "PN027": 1 }
};

console.log("Solving minimal model...");
const result = solver.Solve(model);
console.log("Result:", result);
