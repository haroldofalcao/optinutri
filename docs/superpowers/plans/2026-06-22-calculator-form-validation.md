# Calculadora: tooltips clínicos + validação em tempo real Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O formulário da calculadora (Roadmap 2.1) mostra dicas clínicas (ASPEN/BRASPEN) nos campos de restrição e valida os valores em tempo real, desabilitando o botão de calcular enquanto houver erro — em vez de só validar depois de clicar em "Calcular Otimização".

**Architecture:** Extrai a lógica de validação de `useOptimizer.ts` para uma função pura testável (`validateConstraints`), liga essa validação a um `useEffect` em `Calculator.tsx` que roda a cada mudança de `constraints`, e propaga o resultado (`hasValidationErrors`) para desabilitar o botão em `CalculatorForm.tsx`. Tooltips clínicos são adicionados como JSX estático ao lado dos labels existentes, reaproveitando o componente `Tooltip` já usado em "Mix Máximo de Fórmulas".

**Tech Stack:** Next.js 16 / React 19, TypeScript, Vitest, shadcn/ui (`Tooltip`).

## Global Constraints

- Não modificar `src/lib/optimizer.ts` (motor LP).
- Não adicionar campo de peso do paciente nem calcular kcal/proteína automaticamente — tooltips são só texto informativo.
- Não tocar na seleção de fórmulas/busca nem no tooltip já existente de "Mix Máximo de Fórmulas".
- Seguir o padrão visual já usado no tooltip de "Mix Máximo de Fórmulas" (`Tooltip`/`TooltipTrigger`/`TooltipContent` do shadcn/ui, ícone "?" com classes `cursor-help text-muted-foreground text-[10px] border rounded-full w-4 h-4 flex items-center justify-center`).
- Imports sempre via alias `@/`, nunca `../../` (regra do projeto).

---

### Task 1: Extrair `validateConstraints` como função pura testável

**Files:**
- Modify: `src/hooks/useOptimizer.ts`
- Test: `src/tests/useOptimizer.test.ts` (criar)

**Interfaces:**
- Produces: `export function validateConstraints(constraints: OptimizationConstraints): ValidationError[]` — usada pelo `useOptimizer` internamente e testada isoladamente. `ValidationError` já existe em `useOptimizer.ts`: `{ path: string[]; message: string; field?: string }`.

- [ ] **Step 1: Escrever o teste que falha**

Criar `src/tests/useOptimizer.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { validateConstraints } from '../hooks/useOptimizer';
import { OptimizationConstraints } from '../types/formula';

const baseConstraints: OptimizationConstraints = {
    kcal_min: 1800,
    kcal_max: 2400,
    protein_min: 60,
    protein_max: 90,
    volume_max: 2500,
    max_bags: 5,
};

describe('validateConstraints', () => {
    it('returns no errors for valid constraints', () => {
        expect(validateConstraints(baseConstraints)).toEqual([]);
    });

    it('flags negative kcal_min', () => {
        const errors = validateConstraints({ ...baseConstraints, kcal_min: -1 });
        expect(errors.some(e => e.field === 'kcal_min')).toBe(true);
    });

    it('flags kcal_max smaller than kcal_min', () => {
        const errors = validateConstraints({ ...baseConstraints, kcal_min: 2000, kcal_max: 1000 });
        expect(errors.some(e => e.field === 'kcal_max')).toBe(true);
    });

    it('flags negative protein_min', () => {
        const errors = validateConstraints({ ...baseConstraints, protein_min: -5 });
        expect(errors.some(e => e.field === 'protein_min')).toBe(true);
    });

    it('flags protein_max smaller than protein_min', () => {
        const errors = validateConstraints({ ...baseConstraints, protein_min: 80, protein_max: 50 });
        expect(errors.some(e => e.field === 'protein_max')).toBe(true);
    });

    it('flags volume_max of zero or less', () => {
        const errors = validateConstraints({ ...baseConstraints, volume_max: 0 });
        expect(errors.some(e => e.field === 'volume_max')).toBe(true);
    });

    it('flags max_bags below 1', () => {
        const errors = validateConstraints({ ...baseConstraints, max_bags: 0 });
        expect(errors.some(e => e.field === 'max_bags')).toBe(true);
    });
});
```

- [ ] **Step 2: Rodar o teste e confirmar que falha**

Run: `npm run test -- src/tests/useOptimizer.test.ts`
Expected: FAIL — `validateConstraints` não é exportado por `src/hooks/useOptimizer.ts` (erro de import/undefined).

- [ ] **Step 3: Implementar `validateConstraints` e ligar o hook a ela**

Substituir o conteúdo de `src/hooks/useOptimizer.ts` por:

```typescript
import { useState, useCallback } from "react";
import { Formula, OptimizationConstraints, OptimizationResult } from "@/types/formula";
import { ParenteralNutritionOptimizer } from "@/lib/optimizer";

export interface ValidationError {
    path: string[];
    message: string;
    field?: string;
}

export function validateConstraints(constraints: OptimizationConstraints): ValidationError[] {
    const errors: ValidationError[] = [];

    if (constraints.kcal_min < 0) errors.push({ path: ["kcal_min"], message: "Valor não pode ser negativo", field: "kcal_min" });
    if (constraints.kcal_max < constraints.kcal_min) errors.push({ path: ["kcal_max"], message: "Máximo deve ser maior que mínimo", field: "kcal_max" });

    if (constraints.protein_min < 0) errors.push({ path: ["protein_min"], message: "Valor não pode ser negativo", field: "protein_min" });
    if (constraints.protein_max < constraints.protein_min) errors.push({ path: ["protein_max"], message: "Máximo deve ser maior que mínimo", field: "protein_max" });

    if (constraints.volume_max <= 0) errors.push({ path: ["volume_max"], message: "Volume deve ser maior que zero", field: "volume_max" });

    if (constraints.max_bags && constraints.max_bags < 1) errors.push({ path: ["max_bags"], message: "Mínimo 1 bolsa", field: "max_bags" });

    return errors;
}

export function useOptimizer(formulas: Formula[]) {
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

    const optimizer = new ParenteralNutritionOptimizer(formulas);

    const validate = useCallback((constraints: OptimizationConstraints) => {
        const errors = validateConstraints(constraints);
        setValidationErrors(errors);
        return errors.length === 0;
    }, []);

    const optimize = useCallback((
        constraints: OptimizationConstraints,
        selectedFormulaIds: string[],
        fixedFormulaIds: string[] | Record<string, number> = []
    ): OptimizationResult => {
        setIsOptimizing(true);
        setValidationErrors([]);

        // Validate inputs
        if (!validate(constraints)) {
            setIsOptimizing(false);
            return {
                status: "Error",
                message: "Erro de validação nos campos",
                total_costs: null,
                total_kcal: 0,
                total_protein: 0,
                total_volume: 0,
                total_nitrogen: 0,
                total_glucose: 0,
                total_fat: 0,
                selected_bags: [],
                constraints_met: {
                    kcal_min: false,
                    kcal_max: false,
                    protein_min: false,
                    protein_max: false,
                    volume_max: false
                },
                num_bags: 0
            } as any; // Type assertion mainly for lazy matching
        }

        try {
            // Run optimization synchronously for now (can be async if wrapped in worker)
            const result = optimizer.optimize(constraints, selectedFormulaIds, undefined, "All", "All", fixedFormulaIds);
            setIsOptimizing(false);
            return result;
        } catch (e: any) {
            setIsOptimizing(false);
            return {
                status: "Error",
                message: e.message || "Erro desconhecido na otimização",
                selected_bags: [],
                constraints_met: {},
            } as any;
        }
    }, [formulas, validate]);

    return {
        optimize,
        isOptimizing,
        validationErrors,
        validate,
    };
}
```

- [ ] **Step 4: Rodar o teste e confirmar que passa**

Run: `npm run test -- src/tests/useOptimizer.test.ts`
Expected: PASS (7 testes).

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useOptimizer.ts src/tests/useOptimizer.test.ts
git commit -m "refactor(optimizer): extract validateConstraints as pure testable function"
```

---

### Task 2: Validação em tempo real + botão desabilitado com erro

**Files:**
- Modify: `src/components/Calculator.tsx`
- Modify: `src/components/calculator/CalculatorForm.tsx`

**Interfaces:**
- Consumes: `validate` retornado por `useOptimizer(formulas)` (Task 1) — assinatura `(constraints: OptimizationConstraints) => boolean`, com efeito colateral de atualizar `validationErrors`.
- Produces: nova prop `hasValidationErrors: boolean` em `CalculatorForm`.

- [ ] **Step 1: Ligar a validação em tempo real em `Calculator.tsx`**

Em `src/components/Calculator.tsx`, linha 40, trocar:

OLD:
```typescript
    const { optimize, isOptimizing, validationErrors } = useOptimizer(formulas || []);

    const getFieldError = (field: string) => {
        return validationErrors.find((e) => e.field === field)?.message;
    };
```

NEW:
```typescript
    const { optimize, isOptimizing, validationErrors, validate } = useOptimizer(formulas || []);

    useEffect(() => {
        validate(constraints);
    }, [constraints, validate]);

    const getFieldError = (field: string) => {
        return validationErrors.find((e) => e.field === field)?.message;
    };
```

- [ ] **Step 2: Passar `hasValidationErrors` para `CalculatorForm` em `Calculator.tsx`**

Na mesma `src/components/Calculator.tsx`, dentro do JSX (linhas 156-172), trocar:

OLD:
```typescript
                    <CalculatorForm
                        formulas={formulas || []}
                        selectedFormulas={selectedFormulas}
                        fixedFormulas={fixedFormulas}
                        constraints={constraints}
                        setConstraints={setConstraints}
                        toggleFormula={toggleFormula}
                        toggleFixedFormula={toggleFixedFormula}
                        updateFixedQuantity={updateFixedQuantity}
                        selectAll={selectAll}
                        deselectAll={deselectAll}
                        handleOptimize={handleOptimize}
                        isOptimizing={isOptimizing}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        getFieldError={getFieldError}
                    />
```

NEW:
```typescript
                    <CalculatorForm
                        formulas={formulas || []}
                        selectedFormulas={selectedFormulas}
                        fixedFormulas={fixedFormulas}
                        constraints={constraints}
                        setConstraints={setConstraints}
                        toggleFormula={toggleFormula}
                        toggleFixedFormula={toggleFixedFormula}
                        updateFixedQuantity={updateFixedQuantity}
                        selectAll={selectAll}
                        deselectAll={deselectAll}
                        handleOptimize={handleOptimize}
                        isOptimizing={isOptimizing}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        getFieldError={getFieldError}
                        hasValidationErrors={validationErrors.length > 0}
                    />
```

- [ ] **Step 3: Adicionar a prop e desabilitar o botão em `CalculatorForm.tsx`**

Em `src/components/calculator/CalculatorForm.tsx`, na interface (linhas 14-37), trocar:

OLD:
```typescript
    handleOptimize: () => void;
    isOptimizing: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    getFieldError: (field: string) => string | undefined;
}
```

NEW:
```typescript
    handleOptimize: () => void;
    isOptimizing: boolean;
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    getFieldError: (field: string) => string | undefined;
    hasValidationErrors: boolean;
}
```

E na assinatura da função (linhas 39-55), trocar:

OLD:
```typescript
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
```

NEW:
```typescript
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
    hasValidationErrors,
}: CalculatorFormProps) {
```

E no botão (linha 274), trocar:

OLD:
```typescript
                            disabled={selectedFormulas.length === 0 || isOptimizing}
```

NEW:
```typescript
                            disabled={selectedFormulas.length === 0 || isOptimizing || hasValidationErrors}
```

- [ ] **Step 4: Verificar que o build/typecheck passa**

Run: `npm run build`
Expected: build completa sem erros de tipo (prop `hasValidationErrors` obrigatória e fornecida em todos os usos de `CalculatorForm`).

- [ ] **Step 5: Verificação manual no navegador**

Run: `npm run dev`, abrir `http://localhost:3000/calculator`.
1. Digitar um `kcal_min` maior que `kcal_max` (ex: min 3000, max 2000).
   Expected: mensagem de erro aparece abaixo do campo "Calorias (kcal)" imediatamente (sem clicar em Calcular), e o botão "Calcular Otimização" fica desabilitado.
2. Corrigir o valor (ex: min 1800).
   Expected: mensagem de erro desaparece e o botão volta a ficar habilitado (assumindo ao menos 1 fórmula selecionada).

- [ ] **Step 6: Rodar os testes existentes e confirmar que nada quebrou**

Run: `npm run test`
Expected: todos os testes passam, incluindo os novos de `src/tests/useOptimizer.test.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/components/Calculator.tsx src/components/calculator/CalculatorForm.tsx
git commit -m "feat(calculator): validate constraints in real time and disable submit on error"
```

---

### Task 3: Tooltips com referência clínica (ASPEN/BRASPEN)

**Files:**
- Modify: `src/components/calculator/CalculatorForm.tsx`

**Interfaces:**
- Consumes: `Tooltip`, `TooltipTrigger`, `TooltipContent` já importados em `CalculatorForm.tsx` (linha 10) e já usados no bloco de "Mix Máximo de Fórmulas" (linhas 250-256).

- [ ] **Step 1: Adicionar tooltip ao label "Calorias (kcal)"**

Em `src/components/calculator/CalculatorForm.tsx`, trocar:

OLD:
```typescript
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
```

NEW:
```typescript
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Calorias (kcal)</Label>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help text-muted-foreground text-[10px] border rounded-full w-4 h-4 flex items-center justify-center">?</TooltipTrigger>
                                            <TooltipContent>ASPEN/BRASPEN: 25–30 kcal/kg/dia — ajustar pelo peso e fase clínica do paciente</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={constraints.kcal_min}
                                            onChange={(e) => setConstraints({ ...constraints, kcal_min: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("kcal_min") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
```

- [ ] **Step 2: Adicionar tooltip ao label "Proteína (g)"**

Trocar:

OLD:
```typescript
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
```

NEW:
```typescript
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Proteína (g)</Label>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help text-muted-foreground text-[10px] border rounded-full w-4 h-4 flex items-center justify-center">?</TooltipTrigger>
                                            <TooltipContent>ASPEN/BRASPEN: 1.2–2.0 g/kg/dia em paciente crítico — ajustar pela função renal</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            type="number"
                                            placeholder="Min"
                                            value={constraints.protein_min}
                                            onChange={(e) => setConstraints({ ...constraints, protein_min: Number(e.target.value) })}
                                            className={`text-center ${getFieldError("protein_min") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                                        />
```

- [ ] **Step 3: Adicionar tooltip ao label "Volume Máx (mL)"**

Trocar:

OLD:
```typescript
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Volume Máx (mL)</Label>
                                    <Input
                                        type="number"
                                        value={constraints.volume_max}
                                        onChange={(e) => setConstraints({ ...constraints, volume_max: Number(e.target.value) })}
                                        className={getFieldError("volume_max") ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                </div>
```

NEW:
```typescript
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs uppercase text-muted-foreground font-bold tracking-wide">Volume Máx (mL)</Label>
                                        <Tooltip>
                                            <TooltipTrigger className="cursor-help text-muted-foreground text-[10px] border rounded-full w-4 h-4 flex items-center justify-center">?</TooltipTrigger>
                                            <TooltipContent>Volume total da prescrição — considerar restrição hídrica do paciente</TooltipContent>
                                        </Tooltip>
                                    </div>
                                    <Input
                                        type="number"
                                        value={constraints.volume_max}
                                        onChange={(e) => setConstraints({ ...constraints, volume_max: Number(e.target.value) })}
                                        className={getFieldError("volume_max") ? "border-destructive focus-visible:ring-destructive" : ""}
                                    />
                                </div>
```

- [ ] **Step 4: Verificar build**

Run: `npm run build`
Expected: build completa sem erros.

- [ ] **Step 5: Verificação manual no navegador**

Run: `npm run dev`, abrir `http://localhost:3000/calculator`.
Passar o mouse/focar no ícone "?" ao lado de "Calorias (kcal)", "Proteína (g)" e "Volume Máx (mL)".
Expected: cada um mostra o texto definido nos Steps 1-3 acima.

- [ ] **Step 6: Commit**

```bash
git add src/components/calculator/CalculatorForm.tsx
git commit -m "feat(calculator): add ASPEN/BRASPEN reference tooltips to constraint fields"
```

---

## Final verification

Run: `npm run test && npm run build`
Expected: todos os testes (incluindo os 7 novos de `validateConstraints`) passam e o build de produção completa sem erros de tipo.
