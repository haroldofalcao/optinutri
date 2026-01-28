'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, Package } from "lucide-react";
import { OptimizationResult } from "@/types/formula";

interface CalculatorResultsProps {
    result: OptimizationResult | null;
    constraints: any;
}

export function CalculatorResults({ result, constraints }: CalculatorResultsProps) {
    if (!result) {
        return (
            <Card className="border-dashed border-border/80 bg-muted/5 shadow-sm">
                <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground text-center">
                    <div className="p-4 rounded-full bg-muted/20 mb-4">
                        <Package className="h-8 w-8 opacity-40" />
                    </div>
                    <p className="font-medium text-lg">Aguardando Otimização</p>
                    <p className="text-sm text-muted-foreground/80 max-w-xs mt-1">
                        Defina suas restrições e clique em calcular para ver a melhor combinação.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const infeasibilityData = result.violation_details;

    return (
        <Card className="border-border/60 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-xl">Resultado da Análise</CardTitle>
                        <CardDescription>
                            Resumo da otimização processada
                        </CardDescription>
                    </div>
                    {result.status === "Optimal" ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-3 py-1 gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Solução Ótima
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="px-3 py-1 gap-1">
                            <XCircle className="h-3.5 w-3.5" />
                            {result.status}
                        </Badge>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {result.status === "Optimal" ? (
                    <div className="space-y-8">
                        {/* KPI Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-card to-secondary/30 p-6 flex flex-col items-center text-center group transition-all hover:shadow-md hover:border-primary/20">
                                <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <TrendingUp className="h-12 w-12" />
                                </div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Custo Diário</p>
                                <div className="mt-2 flex items-baseline justify-center">
                                    <span className="text-4xl font-black tracking-tight text-primary">
                                        R$ {result.total_cost?.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            <div className="relative overflow-hidden rounded-xl border bg-card p-6 flex flex-col items-center text-center transition-all hover:shadow-md">
                                <div className="absolute top-0 right-0 p-3 opacity-5">
                                    <Package className="h-12 w-12" />
                                </div>
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Total de Bolsas</p>
                                <div className="mt-2 flex items-baseline justify-center">
                                    <span className="text-4xl font-black tracking-tight text-foreground">
                                        {result.num_bags}
                                    </span>
                                    <span className="ml-1 text-sm text-muted-foreground font-medium">unid.</span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 bg-muted px-2 py-0.5 rounded-full">
                                    Max: {constraints.max_bags}
                                </p>
                            </div>
                        </div>

                        {/* Summary Line */}
                        <div className="flex justify-around text-center text-sm py-4 bg-muted/30 rounded-lg border border-border/40">
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Volume Total</p>
                                <p className="font-bold text-base">{result.total_volume} mL</p>
                            </div>
                            <div className="w-px bg-border/40"></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Calorias</p>
                                <p className="font-bold text-base">{result.total_kcal.toFixed(0)} kcal</p>
                            </div>
                            <div className="w-px bg-border/40"></div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Proteínas</p>
                                <p className="font-bold text-base">{result.total_protein.toFixed(1)} g</p>
                            </div>
                        </div>

                        {/* Selected Formulas List */}
                        <div className="space-y-3">
                            <p className="text-sm font-bold text-foreground flex items-center gap-2">
                                <Package className="h-4 w-4 text-primary" />
                                Composição Sugerida
                            </p>
                            <div className="divide-y divide-border/40 border rounded-lg bg-card overflow-hidden">
                                {result.selected_bags.map((bag, idx) => (
                                    <div
                                        key={`${bag.formula_id}-${idx}`}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/20 transition-colors gap-3 sm:gap-0"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                                                {bag.quantity}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold leading-none mb-1">{bag.name}</p>
                                                <div className="flex gap-2">
                                                    <Badge variant="secondary" className="text-[10px] h-4 px-1 rounded-sm font-normal">
                                                        {bag.via}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">Vol: {bag.volume_contribution} mL</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right pl-11 sm:pl-0">
                                            <p className="text-sm font-bold text-foreground">R$ {bag.total_cost.toFixed(2)}</p>
                                            <p className="text-[10px] text-muted-foreground">R$ {bag.unit_cost.toFixed(2)} / un</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : result?.status === "Infeasible" && infeasibilityData ? (
                    <div className="space-y-6 py-2">
                        <div className="flex flex-col items-center text-center space-y-3 p-6 bg-destructive/5 rounded-xl border border-destructive/20">
                            <div className="p-3 bg-destructive/10 rounded-full">
                                <AlertCircle className="h-8 w-8 text-destructive" />
                            </div>
                            <div className="space-y-1">
                                <p className="font-bold text-lg text-destructive">Otimização Impossível</p>
                                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                                    Não foi possível encontrar uma combinação dentro da restrição de <span className="font-mono font-bold text-foreground">Max {constraints.max_bags} bolsas</span>.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-xs font-bold uppercase text-muted-foreground tracking-wider ml-1">Restrições Violadas</p>
                            {infeasibilityData.map((violation, idx) => (
                                <div key={idx} className="bg-card border border-border/60 rounded-lg p-4 shadow-sm relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive"></div>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-semibold text-sm">{violation.constraint}</span>
                                        <Badge variant="outline" className="text-xs font-mono">
                                            Alvo: {violation.target} {violation.unit}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                        <span>Intervalo alcançável com as fórmulas atuais:</span>
                                        <span className="font-mono font-medium text-foreground">{violation.actual_min.toFixed(0)} - {violation.actual_max.toFixed(0)} {violation.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="p-6 text-center text-destructive">
                        <p>{result.message}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
