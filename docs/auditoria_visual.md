# Auditoria visual do OptiNutri (item 1.1 do roadmap)

Data: 2026-11-13. Só observação: nenhum código foi alterado.
Onde: site publicado (https://optinutri.vercel.app) em 1440, 768 e 390 px (tablet e celular simulados), e app local (`npm run dev`, Firebase falso, sem gravação no banco real) para a tela de resultado.

## Contexto decidido pelo Haroldo (2026-11-13)

- O artigo existe para mostrar o **mecanismo de cálculo** da calculadora. Não é a especificação do app.
- O app pode combinar **até 2 tipos de fórmula, inclusive enteral + parenteral**. Com via "Todas", o motor já permite isso.
- As fórmulas do artigo são só algumas; **a base do app (109) é a completa**.

## Achados de dados (os mais importantes)

| # | Achado | Evidência |
|---|---|---|
| D1 | **"Smofkabiven Peripheral 500 mL e 1000 mL" estão com via "Enteral"**, mas são bolsas parenterais. Podem ser sugeridas como enteral. | `src/data/formulas.json` |
| D2 | **5 fórmulas com via "Parenteral"** (SMOF Lipid 500 e 100 mL; Aminoven Infant e Adult; Primene), valor que **não existe** no tipo `via` (`"Central" \| "Peripheral" \| "Enteral"` em `src/types/formula.ts:12`). É a causa do Painel mostrar 109 e a soma dos cartões 104. | 62 Enteral + 36 Central + 6 Peripheral + 5 Parenteral = 109 |
| D3 | ~~Suspeita de kcal por bolsa nas 5 "Parenteral"~~ **Descartada em 2026-11-14.** O motor usa kcal **por bolsa** (`kcal / volume_ml`, `optimizer.ts:145`) para todas as fórmulas, e as 5 seguem o padrão (SMOF Lipid 500 mL = 1000 kcal = 2 kcal/mL). | Conferido no código |
| D4 | ~~Acentos corrompidos~~ **Descartado.** Era só a codificação do terminal; o arquivo está correto em UTF-8. | formulas.json |

**Status (2026-11-14):** D1 e D2 corrigidos (ver `lessons.md`).

## Achados de interface

| # | Onde | Problema | Aparelho |
|---|---|---|---|
| 1 | Fórmulas | Tabela com 960 px numa área de 606 px: esconde Volume, Kcal, Proteína, Custo e Ações sem aviso de rolagem | Tablet |
| 2 | Calculadora, Fórmulas | Nomes truncados com "…" ("Diason Energy HP…" não distingue 500 de 1000 mL) | Todos |
| 3 | Guia | Texto diz só "Nutrição Parenteral"; promete exportar PDF (PDF é Fase 4) | Todos |
| 4 | Painel | Soma dos cartões (104) diferente do total (109): ver D2 | Todos |
| 5 | Fórmulas | Botões do topo cortados e rolagem horizontal | Celular |
| 6 | Todas | Navegação não destaca a página atual (roadmap 1.3) | Todos |
| 7 | Calculadora | "Mix máximo de fórmulas" confuso (limita tipos de fórmula); lista pequena com rolagem interna | Computador |
| 8 | Várias | Margens laterais diferentes entre telas | Computador |
| 9 | Fórmulas | Colunas Via e Tipo repetem "Enteral" | Computador |
| 10 | Painel | Selo "Sistema Operacional v1.2" fixo | Todos |

## Achados da tela de resultado (app local, 109 fórmulas, 1800–2400 kcal, 60–90 g, 2500 mL)

Resultado: Nutrison Energy 1000 mL × 1,2 = 1200 mL, 1800 kcal, 72 g, R$ 72,00. Está dentro das faixas.

| # | Problema |
|---|---|
| R1 | **Gráfico "Composição Nutricional":** kcal, proteína e volume dividem o mesmo eixo (0 a 2600). A faixa de proteína (60–90 g) fica invisível e só aparece um ponto colado à esquerda. Não dá para ver se a proteína está dentro da meta. |
| R2 | "Total de bolsas: 1.2 unid." e "1.2" na composição: a quantidade é contínua (mL), então "bolsas" fracionadas confundem o clínico. Melhor mostrar volume em mL. |
| R3 | "Max: 5" sob "Total de bolsas" sugere limite de bolsas, mas o limite é de tipos de fórmula. |
| R4 | Gráfico de custo mostra "Nutrison" (nome truncado), não "Nutrison Energy 1000 mL". |
| R5 | Histórico fica vazio localmente (esperado: Firebase falso). Não testado com Firebase real. |

## Não verificado

- Menu hambúrguer no celular real; modo escuro; tela de resultado no celular; histórico com Firebase real.
