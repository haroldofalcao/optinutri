import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface NutrientRangeProps {
    label: string;
    value: number;
    min?: number;
    max?: number;
    unit: string;
}

export function NutrientRange({ label, value, min, max, unit }: NutrientRangeProps) {
    // Determine status and color
    let status: "low" | "good" | "high" | "neutral" = "neutral";
    if (min !== undefined && value < min) status = "low";
    else if (max !== undefined && value > max) status = "high";
    else if ((min !== undefined && value >= min) && (max === undefined || value <= max)) status = "good";

    // Calculate percentage for progress bar
    // If we have a max, let's make the bar scale to max * 1.25 to show overflow
    // If no max, but min, scale to min * 1.5
    const limit = max ? max * 1.25 : (min ? min * 2 : value * 1.5);
    const percentage = Math.min(100, Math.max(0, (value / limit) * 100));

    const getStatusColor = () => {
        switch (status) {
            case "low": return "bg-yellow-500";
            case "high": return "bg-red-500";
            case "good": return "bg-green-500";
            default: return "bg-primary";
        }
    };

    const getStatusText = () => {
        if (status === "low") return `Abaixo (Mín: ${min})`;
        if (status === "high") return `Acima (Máx: ${max})`;
        if (status === "good") return "Adequado";
        return "";
    };

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
                <span className="font-medium text-muted-foreground">{label}</span>
                <div className="text-right">
                    <span className={cn("font-bold", {
                        "text-yellow-600": status === "low",
                        "text-red-600": status === "high",
                        "text-green-600": status === "good"
                    })}>
                        {value.toFixed(1)} <span className="text-xs font-normal text-muted-foreground">{unit}</span>
                    </span>
                </div>
            </div>

            <Progress value={percentage} className="h-2" indicatorClassName={getStatusColor()} />

            <div className="flex justify-between text-xs text-muted-foreground">
                <span>0</span>
                <span>{getStatusText()}</span>
                <span>{limit.toFixed(0)}</span>
            </div>
        </div>
    );
}
