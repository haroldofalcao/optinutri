# lessons.md — OptiNutri

Decisões e aprendizados do projeto. Mais recente no topo.

## PRÓXIMA SESSÃO — comece por aqui (atualizado em 2026-11-16)

**Estado:** o site (https://optinutri.vercel.app) está atualizado até o commit `89eb135` (mais o commit de documentação desta preparação, se já enviado). Auditoria visual feita; correções de dados, resultado, Guia e nomes de fórmula estão no ar. Motor validado em 2026-11-12 (39/39 casos do artigo, sem erro).

**Decisões vigentes:** desktop-first (tablet/celular adiados); prioridade entre vias livre (prescritor escolhe); artigo = mecanismo; base de 109 fórmulas é a completa.

**Pendências, em ordem sugerida (o dono escolhe):**
1. Acabamento de interface (todos baixos): destacar página atual na barra (`src/components/layout/Navbar.tsx`, item 1.3 do roadmap); coluna "Tipo" repetida na tabela de Fórmulas (`FormulasManager.tsx`); margens laterais desiguais entre telas; selo "Sistema Operacional v1.2" fixo no Painel (`Dashboard.tsx`).
2. "Bolsas" ainda aparece em `OptimizationHistory.tsx` (coluna "Bolsas", "N un") e em `useOptimizer.ts` ("Mínimo 1 bolsa").
3. Opção B de custo: campo rápido de custo na calculadora (motor já aceita `customCosts`; `useOptimizer.ts:69` passa `undefined`). Só com pedido do dono.
4. 2 testes antigos falham em `src/tests/infeasibility.test.ts` (limite de bolsas). Revisão exige justificativa clínica (mexe com `optimizer.ts`).
5. Tela de resultado nunca testada com Firebase real (histórico), nem o menu hambúrguer em celular real nem o modo escuro.
6. `docs/resumo_para_agentes.md` e `AGENTS.md` (não rastreados, fora do GitHub) e `Trabalho.docx` (artigo) ficaram fora dos commits de propósito. Perguntar ao dono antes de incluí-los (o repositório é público).
7. `DEPLOY.md` está desatualizado (diz que não há Firebase/login).

**Como trabalhar aqui (resumo):** plano com linhas exatas e aprovação antes de editar; um passo por vez; build + teste em navegador de verdade; commit com mensagem em arquivo sem BOM; listar dados sensíveis e esperar OK antes de `git push`. Receita de teste local sem Firebase: ver `CLAUDE.md`, seção "Desenvolvimento local".

## 2026-11-16 — Prioridade entre vias: livre, do prescritor

- **Decisão do Haroldo:** a prioridade entre nutrição enteral e parenteral é **livre, escolhida pelo prescritor**. O motor **não** terá regra de prioridade da enteral.
- Como o prescritor exerce isso hoje: escolhe quais fórmulas entram na seleção e pode **fixar uma fórmula como obrigatória** (alfinete). O Guia (FAQ "Posso combinar nutrição enteral e parenteral?") foi ajustado para dizer isso, em vez de afirmar que a enteral "tem prioridade".
- Isso **substitui** a pendência clínica anotada abaixo (motor sem prioridade da enteral) e a regra 1 do `CLAUDE.md` do projeto ("Enteral tem prioridade"), que fica desatualizada; a alteração do `CLAUDE.md` depende de confirmação do Haroldo.
- Nunca misturar vias no sentido de usar fórmula enteral por via venosa continua valendo; o que muda é que combinar enteral + parenteral na mesma prescrição é permitido.

## 2026-11-16 — Guia atualizado (enteral + parenteral, custos, sem PDF)

- O Guia dizia "Nutrição Parenteral" e prometia exportar o resultado em Excel/PDF (não existe; é a Fase 4). Também citava "custos personalizados nas opções avançadas" (não há tela) e um botão com nome errado. Tudo corrigido em `Guide.tsx`, com FAQ novo sobre combinar enteral e parenteral e duas entradas novas no glossário.
- **Ajuste de custo já existe:** página Fórmulas → lápis → "Custo Base (R$)" grava um override no `localStorage` (`optinutri_user_formulas`) e a calculadora usa o valor novo. Testado: Nutrison Energy 1000 mL de R$ 60 para R$ 30 → custo diário de R$ 72,00 para R$ 36,00. Limitação: vale só naquele navegador/computador até a Fase 5 (Firestore).
- Decisão do Haroldo: **opção A** (só explicar no Guia o que já existe). Um campo rápido de custo dentro da calculadora (opção B) ficou como possibilidade: o motor já aceita `customCosts`, mas `useOptimizer.ts:69` passa `undefined`.
- **Pendência clínica:** o motor **não dá prioridade à nutrição enteral** (regra 1 do projeto não está no código). O Guia avisa para usar o julgamento clínico. Decidir se isso vira regra do motor ou só aviso.

## 2026-11-15 — Prioridade de dispositivo: computador primeiro

- **Decisão do Haroldo:** tablets não são usados à beira do leito na maioria dos hospitais brasileiros, e o cálculo é uma tarefa fina, feita **diante de um computador**, não de um celular. Portanto o OptiNutri é **desktop-first**.
- Consequência: a auditoria de tablet e celular (tabela de Fórmulas cortada a 768 px, botões cortados a 390 px; causas em `FormulasManager.tsx` linhas 250, 335 e 372) fica **adiada**, sem prazo. O roadmap, que cita o tablet como dispositivo clínico principal, precisa ser revisto.
- O layout de cartões para celular já existente (commit `bea9bea`) permanece como está.

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
