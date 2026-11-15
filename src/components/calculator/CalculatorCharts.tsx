'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
    ComposedChart,
    Scatter,
} from "recharts";
import { OptimizationResult } from "@/types/formula";

interface CalculatorChartsProps {
    result: OptimizationResult;
    constraints: any; // Using exact type would be better if imported
}

export function CalculatorCharts({ result, constraints }: CalculatorChartsProps) {
    if (result.status !== "Optimal") return null;

    const costData = result.selected_bags.map((bag) => ({
        name: bag.name,
        cost: bag.total_cost,
        fullName: bag.name
    }));

    // Each row is drawn as % of its own maximum, so kcal, protein and volume share one readable axis.
    const toPct = (value: number, max: number) => (max > 0 ? (value / max) * 100 : 0);

    const rangeChartData = [
        {
            name: "Calorias (kcal)",
            achieved: result.total_kcal,
            min: constraints.kcal_min,
            max: constraints.kcal_max,
            achievedPct: toPct(result.total_kcal, constraints.kcal_max),
            rangeStart: toPct(constraints.kcal_min, constraints.kcal_max),
            rangeSize: 100 - toPct(constraints.kcal_min, constraints.kcal_max)
        },
        {
            name: "Proteína (g)",
            achieved: result.total_protein,
            min: constraints.protein_min,
            max: constraints.protein_max,
            achievedPct: toPct(result.total_protein, constraints.protein_max),
            rangeStart: toPct(constraints.protein_min, constraints.protein_max),
            rangeSize: 100 - toPct(constraints.protein_min, constraints.protein_max)
        },
        {
            name: "Volume (mL)",
            achieved: result.total_volume,
            min: 0,
            max: constraints.volume_max,
            achievedPct: toPct(result.total_volume, constraints.volume_max),
            rangeStart: 0,
            rangeSize: 100
        },
    ];

    // Custom Tooltip for Cost Chart
    const CustomCostTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border/50 rounded-lg shadow-xl p-3 text-sm">
                    <p className="font-semibold text-popover-foreground mb-1">{payload[0].payload.fullName}</p>
                    <p className="text-primary font-medium">
                        R$ {payload[0].value.toFixed(2)}
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="grid gap-6 lg:grid-cols-2 animate-in slide-in-from-bottom-5 duration-500 delay-200">
            <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Composição Nutricional</CardTitle>
                    <CardDescription>
                        Alvo (barra) vs atingido (ponto), em % da meta máxima
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart
                            layout="vertical"
                            data={rangeChartData}
                            margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis type="number" domain={[0, 110]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis dataKey="name" type="category" width={100} stroke="var(--foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <RechartsTooltip
                                cursor={{ fill: 'transparent' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        const data = payload[0].payload;
                                        return (
                                            <div className="bg-popover border border-border rounded-lg shadow-lg p-3 text-xs">
                                                <p className="font-bold text-base mb-1">{data.name}</p>
                                                <div className="space-y-1">
                                                    <div className="flex justify-between gap-4">
                                                        <span className="text-muted-foreground">Alvo:</span>
                                                        <span className="font-mono">{data.min} - {data.max}</span>
                                                    </div>
                                                    <div className="flex justify-between gap-4 text-primary font-bold">
                                                        <span>Atingido:</span>
                                                        <span className="font-mono">{data.achieved.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            {/* Range Background Bar (Min to Max) - Simulating via Stacked Bar trick or just separate bars if possible. 
                                Actually, standard bar with [min, max] works in recent Recharts, but let's stick to safe compositing.
                                We will use the 'Background' of the bar to show range? No.
                                
                                Let's try: Bar starting at 'min' with height 'max-min'.
                                Usage: stackId to offset?
                                No, simply: 
                                1. Invisible bar for 'min'
                                2. Visible bar for 'rangeSize' (which is max-min)
                                Stack them.
                            */}
                            <Bar dataKey="rangeStart" stackId="a" fill="transparent" barSize={12} isAnimationActive={false} />
                            <Bar dataKey="rangeSize" stackId="a" fill="var(--primary)" opacity={0.2} barSize={12} radius={[0, 4, 4, 0]} />

                            <Scatter name="Atingido" dataKey="achievedPct" fill="var(--primary)" shape="circle" strokeWidth={2} stroke="var(--background)" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-lg">Custo por Fórmula</CardTitle>
                    <CardDescription>Participação no custo total</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={costData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis dataKey="name" interval={0} angle={-20} textAnchor="end" height={80} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                            <RechartsTooltip content={<CustomCostTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.2 }} />
                            <Bar
                                dataKey="cost"
                                fill="var(--primary)"
                                radius={[6, 6, 0, 0]}
                                barSize={40}
                                activeBar={{ fill: 'var(--accent)' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
