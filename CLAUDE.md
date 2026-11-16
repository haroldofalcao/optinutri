# OptiNutri — Guia para Sessões de IA

## O que é este projeto

**OptiNutri** é um sistema de suporte à decisão clínica para terapia nutricional, oferecido gratuitamente a **médicos e farmacêuticos associados adimplentes da SBNPE**. Usa programação linear para encontrar a combinação de menor custo de fórmulas nutricionais que satisfaça as restrições clínicas do paciente.

- **Acesso**: pelo portal do sócio do site da SBNPE (fase futura — integração pendente).
- **URL atual**: https://optinutri.vercel.app
- **Estado**: MVP em desenvolvimento ativo. Motor de otimização funcional e validado.
- **Foco atual**: melhorias de interface e UX (Fase 1 do roadmap), **desktop-first**: tablet e celular estão adiados por decisão do dono (2026-11-15). Estado e próximos passos: ver `lessons.md` e a seção "Estado" do roadmap.

## Documentação completa

| Documento | Caminho | Conteúdo |
|---|---|---|
| Missão e visão | `docs/specs/mission.md` | Propósito, público-alvo, métricas |
| Stack técnica | `docs/specs/tech-stack.md` | Tecnologias, padrões, decisões arquiteturais |
| Roadmap | `docs/specs/roadmap.md` | Fases detalhadas de implementação |
| Charter original | `docs/project_charter.md` | Escopo e riscos do MVP |
| One pager | `docs/one_pager.md` | Resumo executivo |
| Skills de IA | `skills/SKILL.md` | Personas disponíveis (Clinical SME, Dev, etc.) |
| Memória do projeto | `lessons.md` | Decisões, lições e pendências. **Ler no início de toda sessão.** |
| Auditoria visual | `docs/auditoria_visual.md` | Achados da auditoria de 2026-11-13 e o que já foi corrigido |

---

## Estrutura do projeto

```
OptiNutri/                          ← raiz (npm run dev aqui)
├── package.json
├── CLAUDE.md                       ← este arquivo
├── docs/specs/                     ← especificações do produto
├── skills/                         ← personas de IA
└── src/                            ← código-fonte Next.js
    ├── app/                        ← páginas (App Router)
    │   ├── page.tsx                ← home → <Dashboard>
    │   ├── calculator/page.tsx     ← otimizador
    │   ├── formulas/page.tsx       ← gestão de fórmulas
    │   └── guide/page.tsx          ← guia clínico
    ├── components/                 ← componentes React
    │   └── ui/                     ← shadcn/ui (não editar manualmente)
    ├── lib/
    │   ├── optimizer.ts            ← ⚠️ motor LP — NÃO TOCAR sem revisão
    │   ├── firebase.ts             ← config Firebase (singleton)
    │   └── utils.ts                ← cn() e helpers
    ├── services/db.ts              ← operações Firestore
    ├── store/                      ← átomos Jotai
    ├── types/formula.ts            ← interfaces centrais — não duplicar
    └── data/formulas.json          ← base de fórmulas padrão
```

> `src/node_modules/` é um artefato de migração antiga — ignorar. Os node_modules reais estão na raiz.  
> O alias `@/` aponta para `src/`.

---

## Modelo de domínio (referência rápida)

Tipos em `src/types/formula.ts` — nunca reimplementar.

```
Formula          → id, name, manufacturer, volume_ml, kcal, protein_g_l,
                   nitrogen_g_l, glucose_g_l, fat_g_l, emulsion_type,
                   via ("Central"|"Peripheral"|"Enteral"|"Parenteral"), base_cost, hidden?
                   ⚠ kcal e base_cost são POR BOLSA (volume_ml); protein_g_l, glucose_g_l,
                   fat_g_l e nitrogen_g_l são POR LITRO. "Parenteral" = componente isolado
                   (lipídio ou aminoácidos), combinável com as outras vias.

OptimizationConstraints → kcal_min/max, protein_min/max, volume_max, max_bags?

OptimizationResult      → status ("Optimal"|"Infeasible"|"Error"),
                          total_cost/kcal/protein/volume,
                          selected_bags[], constraints_met{}, violation_details?
```

---

## Regras inegociáveis

### Clínicas
1. **A prioridade entre as vias é livre**, escolhida pelo prescritor. O motor não impõe ordem entre enteral e parenteral.
2. **Nunca usar fórmula enteral por via venosa** — fórmula enteral jamais pode ser sugerida para uso intravenoso. (Combinar enteral e parenteral na mesma prescrição é permitido.)
3. **Restrições são hard constraints** — qualquer violação retorna `"Infeasible"`, nunca `"Optimal"`.

### Privacidade (LGPD)
- Zero dados pessoais de pacientes. Só números nutricionais + `userId` (UUID Firebase).
- Nenhum campo de nome, CPF, prontuário pode ser adicionado sem avaliação legal.

### Código
- Sem `any` em TypeScript.
- Imports sempre com alias `@/`, nunca caminhos relativos `../../`.
- Formulários: Zod schema + React Hook Form. Nunca validar inline no componente.
- Estado global: Jotai. Não usar Context API diretamente.
- Erros do Firestore não bloqueiam o fluxo principal (ver padrão em `services/db.ts`).

---

## Persistência

| Dado | Onde | Observação |
|---|---|---|
| Fórmulas base | `src/data/formulas.json` | Global, imutável pelo usuário |
| Fórmulas do usuário e ajustes de custo | localStorage (`optinutri_user_formulas`) | Override por `id`, vale só naquele navegador; migrar para Firestore (Fase 5) |
| Histórico de otimizações | Firestore `optimizations` | Por `userId` |
| Audit logs | Firestore `audit_logs` | Por `userId` |

Estado de fórmulas via Jotai (`src/store/formulas.ts`): `baseFormulasAtom` + `localFormulasAtom` → `allFormulasAtom` → `activeFormulasAtom` (filtra `hidden`).

---

## Desenvolvimento local

```bash
npm run dev    # servidor local
npm run test   # vitest
npm run build  # build de produção
```

Variáveis necessárias em `.env.local`:
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

**Não existe `.env.local` neste computador.** Sem ele o app e o `npm run build` falham (`auth/invalid-api-key`). Para testar localmente **sem tocar no banco real**, defina valores falsos só na sessão do PowerShell (nunca em arquivo) e rode `npm run dev` ou `npm run build`:

```powershell
$env:NEXT_PUBLIC_FIREBASE_API_KEY="fake-local-test-key"; $env:NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="localhost"
$env:NEXT_PUBLIC_FIREBASE_PROJECT_ID="fake-local-test"; $env:NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="fake-local-test.appspot.com"
$env:NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="0"; $env:NEXT_PUBLIC_FIREBASE_APP_ID="1:0:web:0"
```

Com isso o histórico fica vazio ("usuário não autenticado"), o que é esperado. Depois do teste, encerre o servidor (processo `node` do `next dev`) e rode `git checkout next-env.d.ts`, que o Next altera sozinho.

---

## Instruções para sessões de IA

1. **O usuário não é programador** — explicar termos técnicos em linguagem simples, um passo de cada vez.
2. **Planejar antes de codar** — nenhuma implementação começa sem aprovação explícita do plano.
3. **`optimizer.ts` é sagrado** — qualquer mudança exige justificativa clínica além da técnica.
4. **Roadmap define prioridades** — consultar `docs/specs/roadmap.md` antes de propor features novas.
5. **SBNPE auth é fase futura** — não priorizar ou discutir integração de autenticação até que o produto atual esteja polido.
6. **Desktop-first** — o cálculo é feito diante de um computador. Não gastar tempo com tablet/celular sem pedido (decisão de 2026-11-15).
7. **Prioridade entre vias é do prescritor** — não codificar "enteral primeiro" no motor (decisão de 2026-11-16).
8. **Publicação:** o repositório é **público** e o push em `main` publica na Vercel automaticamente. Antes de qualquer push, listar ao dono os dados sensíveis e esperar o OK. Mensagem de commit: gravar em arquivo UTF-8 **sem BOM** (`git commit -F`), com a linha `Co-Authored-By` exigida.
9. **Teste em navegador de verdade** (aba do Chrome) antes de dar qualquer mudança de interface como pronta, além de `npm run build`. Os 2 testes de `src/tests/infeasibility.test.ts` já falhavam antes de 2026-11-13; não confundir com regressão.
10. **Skills disponíveis** em `skills/` — usar o perfil correto: `clinical_sme.md` para regras nutricionais, `full_stack_dev.md` para UI/API, `data_scientist.md` para o solver.
