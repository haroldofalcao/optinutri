import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from "lucide-react";

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
    // Default limit fallback to avoid division by zero
    const limit = max ? max * 1.4 : (min ? min * 2 : (value > 0 ? value * 1.5 : 100));
    const percentage = Math.min(100, Math.max(0, (value / limit) * 100));

    // Calculate reference markers positions (as percentages)
    const minPos = min ? (min / limit) * 100 : 0;
    const maxPos = max ? (max / limit) * 100 : 0;

    const getStatusColor = () => {
        switch (status) {
            case "low": return "bg-amber-500";
            case "high": return "bg-rose-500";
            case "good": return "bg-emerald-500";
            default: return "bg-primary";
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case "low": return <AlertTriangle className="h-3 w-3 text-amber-500" />;
            case "high": return <AlertTriangle className="h-3 w-3 text-rose-500" />; // Or specific icon for high
            case "good": return <CheckCircle2 className="h-3 w-3 text-emerald-500" />;
            default: return null;
        }
    };

    const getStatusText = () => {
        if (status === "low") return `Abaixo (Min: ${min})`;
        if (status === "high") return `Acima (Max: ${max})`;
        if (status === "good") return "Adequado";
        return "";
    };

    return (
        <div className="space-y-2 group">
            <div className="flex justify-between items-end text-sm">
                <div className="flex flex-col">
                    <span className="font-semibold text-foreground/80 text-xs uppercase tracking-wide">{label}</span>
                    <div className="flex items-center gap-1.5 mt-0.5 h-5">
                        {getStatusIcon()}
                        <span className={cn("text-xs font-medium transition-colors", {
                            "text-amber-600 dark:text-amber-400": status === "low",
                            "text-rose-600 dark:text-rose-400": status === "high",
                            "text-emerald-600 dark:text-emerald-400": status === "good",
                            "text-muted-foreground": status === "neutral"
                        })}>
                            {status === "neutral" ? "Monitorar" : getStatusText()}
                        </span>
                    </div>
                </div>
                <div className="text-right">
                    <span className={cn("text-lg font-black tracking-tight transition-all", {
                        "text-amber-600 dark:text-amber-400": status === "low",
                        "text-rose-600 dark:text-rose-400": status === "high",
                        "text-emerald-600 dark:text-emerald-400": status === "good",
                        "text-foreground": status === "neutral"
                    })}>
                        {value.toFixed(1)} <span className="text-xs font-bold text-muted-foreground ml-0.5">{unit}</span>
                    </span>
                </div>
            </div>

            <div className="relative pt-1 pb-1">
                <Progress
                    value={percentage}
                    className="h-2.5 bg-secondary/50 border border-border/20"
                    indicatorClassName={getStatusColor()}
                />

                {/* Visual Indicators for Min/Max Range on the Bar */}
                {/* Min Marker */}
                {min && (
                    <div
                        className="absolute top-1 bottom-1 w-0.5 bg-foreground/30 z-10 transition-all group-hover:bg-foreground/60"
                        style={{ left: `${minPos}%` }}
                        title={`Min: ${min}`}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/30"></div>
                    </div>
                )}
                {/* Max Marker */}
                {max && (
                    <div
                        className="absolute top-1 bottom-1 w-0.5 bg-foreground/30 z-10 transition-all group-hover:bg-foreground/60"
                        style={{ left: `${maxPos}%` }}
                        title={`Max: ${max}`}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-foreground/30"></div>
                    </div>
                )}
            </div>

            <div className="flex justify-between text-[10px] text-muted-foreground/60 font-mono">
                <span>0</span>
                <span>{limit.toFixed(0)}</span>
            </div>
        </div>
    );
}
