'use client';

import { useState, useMemo, useEffect } from "react";
import { useAtom } from "jotai";
import { activeFormulasAtom } from "@/store/formulas";
import { trackPageView, trackOptimizationStarted, trackOptimizationCompleted, trackOptimizationFailed } from "@/lib/analytics";
import { addOptimizationToHistoryAtom } from "@/store/optimizationHistory";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calculator as CalcIcon, CheckCircle2, XCircle, AlertCircle, Search, Pin, PinOff } from "lucide-react";
import { OptimizationResult } from "@/types/formula";
import { toast } from "sonner";
import { useOptimizer } from "@/hooks/useOptimizer";
import { OptimizationHistory } from "@/components/OptimizationHistory";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import { NutrientRange } from "./NutrientRange";

// Optimization calculator with history and validation
export default function Calculator() {
    // Safe default initialization of formulas if atom is empty
    const [formulas] = useAtom(activeFormulasAtom);
    const [, addToHistory] = useAtom(addOptimizationToHistoryAtom);
    const [result, setResult] = useState<OptimizationResult | null>(null);
    const [selectedFormulas, setSelectedFormulas] = useState<string[]>([]);
    const [fixedFormulas, setFixedFormulas] = useState<Record<string, number>>({});
    const [searchTerm, setSearchTerm] = useState("");

    // Track page view on mount
    useEffect(() => {
        trackPageView('calculator', 'Calculadora de Otimização');
    }, []);

    const [constraints, setConstraints] = useState({
        kcal_min: 1800,
        kcal_max: 2400,
        protein_min: 60,
        protein_max: 90,
        volume_max: 2500,
        max_bags: 5,
    });

    const { optimize, isOptimizing, validationErrors } = useOptimizer(formulas || []);

    const getFieldError = (field: string) => {
        return validationErrors.find((e) => e.field === field)?.message;
    };

    const filteredFormulas = useMemo(() => {
        if (!formulas) return [];
        if (!searchTerm.trim()) return formulas;

        const search = searchTerm.toLowerCase();
        return formulas.filter((f) =>
            f.name.toLowerCase().includes(search) ||
            f.manufacturer.toLowerCase().includes(search) ||
            f.id.toLowerCase().includes(search) ||
            f.via.toLowerCase().includes(search)
        );
    }, [formulas, searchTerm]);

    const toggleFormula = (id: string) => {
        setSelectedFormulas((prev) => {
            const isSelected = prev.includes(id);
            if (isSelected) {
                // If unselecting, also remove from fixed
                setFixedFormulas(prev => {
                    const newFixed = { ...prev };
                    delete newFixed[id];
                    return newFixed;
                });
                return prev.filter((fid) => fid !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const toggleFixedFormula = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setFixedFormulas((prev) => {
            const isFixed = !!prev[id];
            if (isFixed) {
                const newFixed = { ...prev };
                delete newFixed[id];
                return newFixed;
            } else {
                // If fixing, ensure it's also selected
                if (!selectedFormulas.includes(id)) {
                    setSelectedFormulas(s => [...s, id]);
                }
                return { ...prev, [id]: 1 }; // Default 1 bag
            }
        });
    };

    const updateFixedQuantity = (id: string, value: number) => {
        if (value < 1) return;
        setFixedFormulas(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const selectAll = () => {
        if (formulas) {
            setSelectedFormulas(formulas.map((f) => f.id));
        }
    };

    const deselectAll = () => {
        setSelectedFormulas([]);
    };

    const handleOptimize = () => {
        if (selectedFormulas.length === 0) {
            toast.error("Selecione ao menos uma fórmula para otimizar");
            return;
        }

        trackOptimizationStarted(
            selectedFormulas,
            constraints.volume_max,
            false
        );

        const startTime = performance.now();
        const optimizationResult = optimize(constraints, selectedFormulas, fixedFormulas);
        const executionTime = performance.now() - startTime;

        setResult(optimizationResult);

        // Add to history
        addToHistory({
            constraints,
            result: optimizationResult,
            selectedFormulas,
        });

        if (optimizationResult.status === "Optimal") {
            trackOptimizationCompleted(
                optimizationResult.num_bags,
                optimizationResult.total_cost || 0,
                executionTime,
                optimizationResult.total_volume
            );
            toast.success("Otimização concluída com sucesso!");
        } else {
            trackOptimizationFailed(
                optimizationResult.message || "Erro na otimização",
                constraints.volume_max
            );
            toast.error(optimizationResult.message || "Erro na otimização");
        }
    };

    const costData = result?.selected_bags.map((bag) => ({
        name: bag.name.split(" ")[0],
        cost: bag.total_cost,
    })) || [];

    const nutritionData = result ? [
        { name: "Calories", value: result.total_kcal, unit: "kcal", target: constraints.kcal_min },
        { name: "Protein", value: result.total_protein, unit: "g", target: constraints.protein_min },
        { name: "Volume", value: result.total_volume, unit: "mL", target: constraints.volume_max },
    ] : [];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-popover border border-border rounded-lg shadow-lg p-3">
                    <p className="font-semibold text-popover-foreground mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} className="text-sm text-popover-foreground">
                            <span style={{ color: entry.color }}>●</span> {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">

            {/* Formula Selection Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Seleção de Fórmulas</CardTitle>
                    <CardDescription>
                        Escolha quais fórmulas devem ser consideradas na otimização ({selectedFormulas.length} de {(formulas || []).length} selecionadas)
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por nome, fabricante, código ou via..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={selectAll}>
                                Selecionar Todas
                            </Button>
                            <Button variant="outline" size="sm" onClick={deselectAll}>
                                Desmarcar Todas
                            </Button>
                        </div>
                        {filteredFormulas.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>Nenhuma fórmula encontrada para "{searchTerm}"</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
                                {filteredFormulas.map((formula) => (
                                    <div
                                        key={formula.id}
                                        className="flex items-start space-x-2 rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                                    >
                                        <Checkbox
                                            id={formula.id}
                                            checked={selectedFormulas.includes(formula.id)}
                                            onCheckedChange={() => toggleFormula(formula.id)}
                                        />
                                        <label
                                            htmlFor={formula.id}
                                            className="flex-1 text-sm font-medium leading-none cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <span>{formula.name}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {formula.via}
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formula.manufacturer}
                                            </p>
                                        </label>
                                        {fixedFormulas[formula.id] && (
                                            <div onClick={(e) => e.preventDefault()} className="w-16 mr-2">
                                                <Label className="sr-only">Quantidade</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={fixedFormulas[formula.id]}
                                                    onChange={(e) => updateFixedQuantity(formula.id, parseInt(e.target.value) || 1)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="h-8 text-xs pr-1"
                                                />
                                            </div>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className={`h-8 w-8 ${fixedFormulas[formula.id] ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"}`}
                                            onClick={(e) => toggleFixedFormula(formula.id, e)}
                                            title={fixedFormulas[formula.id] ? "Desafixar fórmula" : "Fixar fórmula (Obrigatória)"}
                                        >
                                            {fixedFormulas[formula.id] ?
                                                <Pin className="h-4 w-4 fill-current" /> :
                                                <PinOff className="h-4 w-4" />
                                            }
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Input Form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Restrições Nutricionais</CardTitle>
                        <CardDescription>
                            Defina os requisitos mínimos e máximos para otimização
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <TooltipProvider>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Número Máximo de Bolsas</Label>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Input
                                                type="number"
                                                min="1"
                                                value={constraints.max_bags}
                                                onChange={(e) =>
                                                    setConstraints({ ...constraints, max_bags: Number(e.target.value) })
                                                }
                                                onFocus={(e) => e.target.select()}
                                                className={getFieldError("max_bags") ? "border-destructive" : ""}
                                            />
                                        </TooltipTrigger>
                                        {getFieldError("max_bags") && (
                                            <TooltipContent side="bottom" className="bg-destructive text-destructive-foreground">
                                                <p>{getFieldError("max_bags")}</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                    <p className="text-xs text-muted-foreground">
                                        Limite máximo de bolsas na solução
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label>Calorias (kcal) por dia</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Mínimo</Label>
                                            <Input
                                                type="number"
                                                value={constraints.kcal_min}
                                                onChange={(e) =>
                                                    setConstraints({ ...constraints, kcal_min: Number(e.target.value) })
                                                }
                                                onFocus={(e) => e.target.select()}
                                                className={getFieldError("kcal_min") ? "border-destructive" : ""}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Máximo</Label>
                                            <Input
                                                type="number"
                                                value={constraints.kcal_max}
                                                onChange={(e) =>
                                                    setConstraints({ ...constraints, kcal_max: Number(e.target.value) })
                                                }
                                                onFocus={(e) => e.target.select()}
                                                className={getFieldError("kcal_max") ? "border-destructive" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Proteína (g) por dia</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Mínimo</Label>
                                            <Input
                                                type="number"
                                                value={constraints.protein_min}
                                                onChange={(e) =>
                                                    setConstraints({ ...constraints, protein_min: Number(e.target.value) })
                                                }
                                                onFocus={(e) => e.target.select()}
                                                className={getFieldError("protein_min") ? "border-destructive" : ""}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-muted-foreground">Máximo</Label>
                                            <Input
                                                type="number"
                                                value={constraints.protein_max}
                                                onChange={(e) =>
                                                    setConstraints({ ...constraints, protein_max: Number(e.target.value) })
                                                }
                                                onFocus={(e) => e.target.select()}
                                                className={getFieldError("protein_max") ? "border-destructive" : ""}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Volume Máximo (mL) por dia</Label>
                                    <Input
                                        type="number"
                                        value={constraints.volume_max}
                                        onChange={(e) =>
                                            setConstraints({ ...constraints, volume_max: Number(e.target.value) })
                                        }
                                        onFocus={(e) => e.target.select()}
                                        className={getFieldError("volume_max") ? "border-destructive" : ""}
                                    />
                                </div>
                            </div>
                        </TooltipProvider>

                        <Button
                            onClick={handleOptimize}
                            className="w-full"
                            size="lg"
                            disabled={selectedFormulas.length === 0 || isOptimizing}
                        >
                            <CalcIcon className="mr-2 h-5 w-5" />
                            {isOptimizing ? "Otimizando..." : "Otimizar Combinação de Fórmulas"}
                        </Button>
                    </CardContent>
                </Card>

                {/* Results Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle>Resultados da Otimização</CardTitle>
                        <CardDescription>
                            {result ? (
                                <div className="flex items-center gap-2 mt-2">
                                    {result.status === "Optimal" ? (
                                        <>
                                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                                            <span className="text-green-600 font-medium">Solução ótima encontrada</span>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="h-4 w-4 text-destructive" />
                                            <span className="text-destructive font-medium">{result.message}</span>
                                        </>
                                    )}
                                </div>
                            ) : (
                                "Configure as restrições e execute a otimização"
                            )}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {result && result.status === "Optimal" ? (
                            <div className="space-y-8">
                                {/* KPI Cards */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Custo Total</p>
                                        <div className="mt-2 flex items-baseline justify-center">
                                            <span className="text-3xl font-bold tracking-tight text-primary">
                                                R$ {result.total_cost?.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col items-center text-center">
                                        <p className="text-sm font-medium text-muted-foreground">Total de Bolsas</p>
                                        <div className="mt-2 flex items-baseline justify-center">
                                            <span className="text-3xl font-bold tracking-tight">
                                                {result.num_bags}
                                            </span>
                                            <span className="ml-1 text-sm text-muted-foreground">unid.</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Max: {constraints.max_bags}
                                        </p>
                                    </div>
                                </div>

                                {/* Nutrient Ranges */}
                                <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
                                    <h4 className="text-sm font-semibold mb-3">Conformidade Nutricional</h4>
                                    <NutrientRange
                                        label="Calorias"
                                        value={result.total_kcal}
                                        min={constraints.kcal_min}
                                        max={constraints.kcal_max}
                                        unit="kcal"
                                    />
                                    <NutrientRange
                                        label="Proteína"
                                        value={result.total_protein}
                                        min={constraints.protein_min}
                                        max={constraints.protein_max}
                                        unit="g"
                                    />
                                    <NutrientRange
                                        label="Volume"
                                        value={result.total_volume}
                                        max={constraints.volume_max}
                                        unit="mL"
                                    />
                                </div>

                                {/* Selected Formulas */}
                                <div className="space-y-3">
                                    <p className="text-sm font-medium">Fórmulas Selecionadas</p>
                                    <div className="space-y-2">
                                        {result.selected_bags.map((bag) => (
                                            <div
                                                key={bag.formula_id}
                                                className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                                            >
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-primary/10 text-primary border-primary/20">
                                                            {bag.quantity}
                                                        </Badge>
                                                        <p className="text-sm font-medium">{bag.name}</p>
                                                    </div>
                                                    <div className="flex gap-2 pl-7">
                                                        <Badge variant="secondary" className="text-[10px] h-4">
                                                            {bag.via}
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-bold">R$ {bag.total_cost.toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center text-muted-foreground bg-muted/10 rounded-lg border border-dashed">
                                <div className="text-center p-6">
                                    <CalcIcon className="mx-auto h-12 w-12 mb-4 opacity-20" />
                                    <p className="font-medium">Nenhum resultado ainda</p>
                                    <p className="text-xs mt-1">Defina restrições e clique em Otimizar</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            {result && result.status === "Optimal" && (
                <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Distribuição de Custos</CardTitle>
                            <CardDescription>Distribuição de custos por fórmula</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={costData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="cost" fill="hsl(var(--primary))" name="Custo (R$)" />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Composição Nutricional</CardTitle>
                            <CardDescription>Valores alcançados vs valores alvo</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={nutritionData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Bar dataKey="value" fill="hsl(var(--primary))" name="Alcançado" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="target" fill="#94a3b8" name="Alvo" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Optimization History */}
            <OptimizationHistory />
        </div>
    );
}
