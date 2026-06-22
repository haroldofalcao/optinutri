# Design — Calculadora: tooltips clínicos + validação em tempo real (Roadmap 2.1)

## Contexto

Roadmap Fase 2.1 (`docs/specs/roadmap.md`) pede três melhorias no formulário de entrada da calculadora (`src/components/calculator/CalculatorForm.tsx`):

1. Revisar labels/tooltips dos campos de restrição (kcal, proteína, volume)
2. Adicionar referências clínicas como dica (ex: ASPEN)
3. Validação em tempo real com feedback imediato (hoje só valida ao clicar em "Calcular Otimização")

## Estado atual

- `CalculatorForm.tsx` já tem um tooltip (ícone "?") no campo "Mix Máximo de Fórmulas". Os campos de kcal, proteína e volume não têm tooltip.
- `useOptimizer.ts` define `validate(constraints)` internamente, mas só é chamado dentro de `optimize()` — ou seja, erros de validação só aparecem depois que o usuário clica em "Calcular Otimização".
- `Calculator.tsx` mantém o estado de `constraints` e passa `getFieldError` para o formulário exibir mensagens de erro por campo (`border-destructive` + mensagem).
- O botão "Calcular Otimização" hoje só desabilita quando `selectedFormulas.length === 0` ou `isOptimizing`.

## Mudanças propostas

### 1. Tooltips com referência clínica

Mesmo padrão visual do tooltip já existente em "Mix Máximo de Fórmulas" (ícone "?" + `Tooltip`/`TooltipContent` do shadcn/ui). Conteúdo apenas informativo — não calcula nada, não adiciona campo de peso.

| Campo | Texto do tooltip |
|---|---|
| Calorias (kcal) | "ASPEN/BRASPEN: 25–30 kcal/kg/dia — ajustar pelo peso e fase clínica do paciente" |
| Proteína (g) | "ASPEN/BRASPEN: 1.2–2.0 g/kg/dia em paciente crítico — ajustar pela função renal" |
| Volume Máx (mL) | "Volume total da prescrição — considerar restrição hídrica do paciente" |

Fonte das faixas clínicas: `skills/clinical_sme.md` (ASPEN/ESPEN/BRASPEN como guidelines de referência do projeto).

### 2. Validação em tempo real

- `useOptimizer.ts`: expor `validate` no objeto retornado pelo hook (a função já existe, só precisa ser incluída no `return`).
- `Calculator.tsx`: adicionar `useEffect` que chama `validate(constraints)` sempre que `constraints` mudar. Isso popula `validationErrors` continuamente, não só dentro de `optimize()`.
- Resultado: a mensagem de erro abaixo de cada campo (via `getFieldError`, já implementado) passa a aparecer enquanto o usuário digita, antes de clicar em "Calcular".

### 3. Botão "Calcular Otimização" desabilitado com erro

- `CalculatorForm` recebe nova prop `hasValidationErrors: boolean`.
- Condição de `disabled` passa de `selectedFormulas.length === 0 || isOptimizing` para `selectedFormulas.length === 0 || isOptimizing || hasValidationErrors`.
- `Calculator.tsx` passa `hasValidationErrors={validationErrors.length > 0}`.

## Fora de escopo (explicitamente)

- Campo de peso do paciente ou cálculo automático de kcal/proteína por kg — decisão tomada: só tooltip informativo.
- Qualquer mudança em `src/lib/optimizer.ts` (motor LP).
- Mudanças nos campos "Mix Máximo de Fórmulas" (tooltip já existe) ou na seleção de fórmulas/busca.

## Arquivos tocados

- `src/hooks/useOptimizer.ts`
- `src/components/Calculator.tsx`
- `src/components/calculator/CalculatorForm.tsx`

## Critério de sucesso

- Digitar um valor inválido (ex: `kcal_max` menor que `kcal_min`) mostra a mensagem de erro abaixo do campo imediatamente, sem precisar clicar em "Calcular".
- Nessa condição, o botão "Calcular Otimização" fica desabilitado.
- Corrigir o valor remove o erro e reabilita o botão (se houver fórmulas selecionadas).
- Tooltips de kcal, proteína e volume aparecem ao passar o mouse/focar no ícone "?", com o texto definido acima.
- `npm run test` e `npm run build` continuam passando.
