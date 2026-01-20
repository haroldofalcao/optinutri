
const solver = require('javascript-lp-solver');

const model = {
    "optimize": "capacity",
    "opType": "max",
    "constraints": {
        "plane": { "max": 44 },
        "person": { "max": 512 },
        "cost": { "max": 300000 }
    },
    "variables": {
        "brit": {
            "capacity": 20000,
            "plane": 1,
            "person": 8,
            "cost": 5000
        },
        "yank": {
            "capacity": 30000,
            "plane": 1,
            "person": 16,
            "cost": 9000
        }
    },
    "ints": { "brit": 1, "yank": 1 }
};

const result_obj = solver.Solve(model);
console.log("Result with ints object:", result_obj);

const model_arr = JSON.parse(JSON.stringify(model));
model_arr.ints = ["brit", "yank"];

const result_arr = solver.Solve(model_arr);
console.log("Result with ints array:", result_arr);
