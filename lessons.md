# lessons.md — OptiNutri

Decisões e aprendizados do projeto. Mais recente no topo.

## 2026-11-15 — Tela de resultado (passos 3 e 4 da auditoria)

- O campo `max_bags` do motor limita **tipos de fórmula**, não bolsas (`optimizer.ts:101-103`). Na interface passou a se chamar "Máx. de tipos de fórmula"; o nome interno `max_bags` foi mantido (renomear exige mexer no motor, nos testes e no histórico). O padrão (5) não mudou: decisão do Haroldo, "livre, à escolha do usuário".
- Resultado: cartão "Tipos de Fórmula" no lugar de "Total de Bolsas"; cada linha mostra o volume em mL e "equivale a N bolsa(s)" em segundo plano (a quantidade de bolsas é só volume ÷ tamanho da bolsa, `optimizer.ts:234`).
- Gráfico de composição: cada linha em % da meta máxima, para a faixa de proteína (60–90 g) aparecer; o balão mostra os valores reais.
- Fora do escopo, ainda dizem "bolsas": `OptimizationHistory.tsx` (coluna "Bolsas", "N un") e `useOptimizer.ts` ("Mínimo 1 bolsa").

## 2026-11-14 — Vias das fórmulas e mistura NE + NPT

**Decisões do Haroldo**
- O artigo (Trabalho.docx) serve para mostrar o **mecanismo de cálculo**; não é a especificação do app. A base do app (109 fórmulas) é a completa.
- O app pode combinar fórmulas de vias diferentes, **inclusive enteral + parenteral**. Com via "Todas", o motor já permite isso.
- "Mix máximo de fórmulas" fica **livre, à escolha do usuário** (padrão não foi alterado).
- As 5 fórmulas isoladas (SMOF Lipid 500/100 mL, Aminoven Infant/Adult, Primene) ficam numa **quarta via, "Parenteral"** (componentes que se combinam com outras).

**O que foi feito**
- `src/data/formulas.json`: Smofkabiven Peripheral 500 e 1000 mL (F097, F098) estavam como via "Enteral"; passaram a `via: "Peripheral"` e `emulsion_type: "SMOF"`. Bolsa parenteral nunca pode aparecer como enteral.
- `src/types/formula.ts`, `FormulaDialog.tsx`, `FormulasManager.tsx`: valor "Parenteral" passa a existir no tipo, no formulário e no filtro.
- `Dashboard.tsx`: cartão "Total" explica a diferença de contagem ("Inclui N componentes parenterais isolados"). Painel: 109 = 36 + 8 + 60 + 5.

**Lições**
- Antes de suspeitar de dado errado, conferir como o motor o usa. Eu suspeitei que o kcal das 5 "Parenteral" fosse por bolsa; o motor usa kcal por bolsa para todas (`optimizer.ts:145`), então estava certo.
- Acento "quebrado" no terminal do Windows pode ser só a exibição. Conferir o arquivo antes de apontar defeito.
- Rodar o app local exige Firebase: sem `.env.local`, usar valores falsos pela linha de comando (não grava no banco real). Nunca criar `.env.local` com chaves reais sem pedir.
- `npm run build` sem Firebase falha no pré-render de `/calculator`; não é defeito do código.

**Em aberto**
- 2 testes de `src/tests/infeasibility.test.ts` já falhavam antes (anteriores a esta mudança): "impossible minimum calories/protein given bag limit". Precisam de revisão (mexe com `optimizer.ts`: exige justificativa clínica).
- Na tela de edição, `emulsion_type` das 5 "Parenteral" ("Parenteral (Lipídica)", "Parenteral (Aminoácidos)") não existe na lista do formulário.
- Plano de correções de interface: ver `docs/auditoria_visual.md` (passos 3 a 7).
