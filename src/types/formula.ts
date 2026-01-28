export interface Formula {
    id: string;
    name: string;
    manufacturer: string;
    volume_ml: number;
    kcal: number;
    protein_g_l: number;
    nitrogen_g_l: number;
    glucose_g_l: number;
    fat_g_l: number;
    emulsion_type: "Soja" | "TCM/TCL" | "SMOF" | "Oliva/TCL" | "Sem lipídio" | "Enteral" | string;
    via: "Central" | "Peripheral" | "Enteral";
    base_cost: number;
    current_cost?: number;
    osmolarity?: number;
    hidden?: boolean;
}

export interface OptimizationConstraints {
    kcal_min: number;
    kcal_max: number;
    protein_min: number;
    protein_max: number;
    volume_max: number;
    max_bags?: number;
    num_days?: number;
}

export interface SelectedBag {
    formula_id: string;
    name: string;
    quantity: number;
    unit_cost: number;
    total_cost: number;
    kcal_contribution: number;
    protein_contribution: number;
    volume_contribution: number;
    emulsion_type: string;
    via: string;
    manufacturer: string;
}

export interface OptimizationResult {
    status: "Optimal" | "Infeasible" | "Error";
    message?: string;
    total_cost: number | null;
    total_kcal: number;
    total_protein: number;
    total_volume: number;
    total_nitrogen: number;
    total_glucose: number;
    total_fat: number;
    selected_bags: SelectedBag[];
    constraints_met: {
        kcal_min: boolean;
        kcal_max: boolean;
        protein_min: boolean;
        protein_max: boolean;
        volume_max: boolean;
    };
    num_bags: number;
    violation_details?: {
        constraint: string;
        target: number;
        actual_min: number;
        actual_max: number;
        unit: string;
    }[];
}
