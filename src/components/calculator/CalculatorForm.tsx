'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Pin, PinOff, Calculator as CalcIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Formula } from "@/types/formula"; // Verify import path
import { ScrollArea } from "@/components/ui/scroll-area";

interface CalculatorFormProps {
    formulas: Formula[];
    selectedFormulas: string[];
    fixedFormulas: Record<string, number>;
    constraints: {
        kcal_min: number;
        kcal_max: number;
        protein_min: number;
        protein_max: number;
        volume_max: number;
        max_bags: number;
    };
    setConstraints: (c: any) => void;
    toggleFormula: (id: string) => void;
    toggleFixedFormula: (id: string, e: React.MouseEvent) => void;
    updateFixedQuantity: (id: string, val: number) => void;
    selectAll: () => void;
    deselectAll: () => void;
    handleOptimize: () => void;
    isOptimizing: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    getFieldError: (field: string) => string | undefined;
}

export function CalculatorForm({
    formulas,
    selectedFormulas,
    fixedFormulas,
    constraints,
    setConstraints,
    toggleFormula,
    toggleFixedFormula,
    updateFixedQuantity,
    selectAll,
    deselectAll,
    handleOptimize,
    isOptimizing,
    searchTerm,
    setSearchTerm,
    getFieldError,
}: CalculatorFormProps) {

    const filteredFormulas = formulas.filter((f) => {
        if (!searchTerm.trim()) return true;
        const search = searchTerm.toLowerCase();
        return (
            f.name.toLowerCase().includes(search) ||
            f.manufacturer.toLowerCase().includes(search) ||
            f.id.toLowerCase().includes(search) ||
            f.via.toLowerCase().includes(search)
        );
    });

    return (
        <div className="space-y-6">
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center justify-between">
                        Seleção de Fórmulas
                        <Badge variant="secondary" className="font-mono text-xs">
                            {selectedFormulas.length} / {formulas.length}
                        </Badge>
                    </CardTitle>
                    <CardDescription>
                        Escolha as fórmulas disponíveis para o cálculo
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar fórmula..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 bg-muted/30 border-muted-foreground/20"
                                />
                            </div>
                            <Button variant="outline" size="sm" onClick={selectAll} className="hidden sm:flex">
                                Todos
                            </Button>
                            <Button variant="outline" size="sm" onClick={deselectAll} className="hidden sm:flex">
                                Nenhum
                            </Button>
                        </div>

                        <ScrollArea className="h-[280px] rounded-md border border-border/50 bg-muted/10 p-2">
                            {filteredFormulas.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4 text-center">
                                    <p className="text-sm">Nenhuma fórmula encontrada</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                    {filteredFormulas.map((formula) => (
                                        <div
                                            key={formula.id}
                                            className={`
                                                relative group flex flex-col p-3 rounded-lg border transition-all duration-200
                                                ${selectedFormulas.includes(formula.id)
                                                    ? "bg-card border-primary/40 shadow-sm"
                                                    : "bg-card/50 border-transparent hover:bg-card hover:border-border/60"
                                                }
                                            `}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Checkbox
                                                    id={formula.id}
                                                    checked={selectedFormulas.includes(formula.id)}
                                                    onCheckedChange={() => toggleFormula(formula.id)}
                                                    className="mt-1 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <label
                                                            htmlFor={formula.id}
                                                            className="text-sm font-semibold leading-none cursor-pointer hover:text-primary transition-colors line-clamp-1"
                                                            title={formula.name}
                                                        >
                                                            {formula.name}
                                                        </label>
                                                    </div>
                                                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                                                        <span>{formula.manufacturer}</span>
                                                        <Badge variant="outline" className="text-[10px] h-4 px-1 rounded-sm border-border/60 bg-muted/20">
                                                            {formula.via}
                                                        </Badge>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Toolbar for item actions */}
                                            <div className="flex items-center justify-end mt-2 pt-2 border-t border-border/30 gap-2">
                                                {fixedFormulas[formula.id] && (
                                                    <div className="flex items-center gap-1 animate-in fade-in zoom-in duration-200">
                                                        <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Qtd:</span>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={fixedFormulas[formula.id]}
                                                            onChange={(e) => updateFixedQuantity(formula.id, parseInt(e.target.value) || 1)}
                                                            className="h-6 w-12 text-xs p-1 text-center bg-background"
                                                        />
                                                    </div>
                                                )}

                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className={`h-6 w-6 rounded-full transition-colors ${fixedFormulas[formula.id] ? "text-primary bg-primary/10 hover:bg-primary/20" : "text-muted-foreground/40 hover:text-primary hover:bg-primary/5"}`}
                                                    onClick={(e) => toggleFixedFormula(formula.id, e)}
                                                    title={fixedFormulas[formula.id] ? "Desafixar" : "Fixar como obrigatória"}
                                                >
                                                    {fixedFormulas[formula.id] ?
                                                        <Pin className="h-3 w-3 fill-current" /> :
                                                        <Pin className="h-3 w-3" />
                                                    }
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl">Restrições Nutricionais</CardTitle>
                    <CardDescription>
                        Defina os limites para o paciente
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <TooltipProvider>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Calorias (kcal)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={constraints.kcal_min}
                                            onChange={(e) => setConstraints({ ...constraints, kcal_min: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("kcal_min") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
                                        <span className="text-muted-foreground font-light">-</span>
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={constraints.kcal_max}
                                            onChange={(e) => setConstraints({ ...constraints, kcal_max: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("kcal_max") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Proteína (g)</Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={constraints.protein_min}
                                            onChange={(e) => setConstraints({ ...constraints, protein_min: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("protein_min") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
                                        <span className="text-muted-foreground font-light">-</span>
                                        <Input
                                            type="number"
                                            placeholder="Max"
                                            value={constraints.protein_max}
                                            onChange={(e) => setConstraints({ ...constraints, protein_max: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("protein_max") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Volume Máx (mL)</Label>
                                    <Input
                                        type="number"
                                        value={constraints.volume_max}
                                        onChange={(e) => setConstraints({ ...constraints, volume_max: Number(e.target.value) })}
                                        className={getFieldError("volume_max") ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Mix Máximo de Fórmulas</Label>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help text-muted-foreground text-[10px] border rounded-full w-4 h-4 flex items-center justify-center">?</TooltipTrigger>
                                            <TooltipContent>Quantos tipos diferentes podem ser usados na mesma prescrição</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={constraints.max_bags}
                                        onChange={(e) => setConstraints({ ...constraints, max_bags: Number(e.target.value) })}
                                        className={getFieldError("max_bags") ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                </div>
                            </div>
                        </div>
                    </TooltipProvider>

                    <div className="mt-8">
                        <Button
                            onClick={handleOptimize}
                            size="lg"
                            className="w-full h-12 text-lg font-bold shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                            disabled={selectedFormulas.length === 0 || isOptimizing}
                        >
                            {isOptimizing ? (
                                <>Calculando...</>
                            ) : (
                                <>
                                    <CalcIcon className="mr-2 h-5 w-5" />
                                    Calcular Otimização
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
