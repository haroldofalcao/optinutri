# OptiNutri — Guia para Sessões de IA

## O que é este projeto

**OptiNutri** é um sistema de suporte à decisão clínica para terapia nutricional, oferecido gratuitamente a **médicos e farmacêuticos associados adimplentes da SBNPE**. Usa programação linear para encontrar a combinação de menor custo de fórmulas nutricionais que satisfaça as restrições clínicas do paciente.

- **Acesso**: pelo portal do sócio do site da SBNPE (fase futura — integração pendente).
- **URL atual**: https://optinutri.vercel.app
- **Estado**: MVP em desenvolvimento ativo. Motor de otimização funcional e validado.
- **Foco atual**: melhorias de interface e UX (Fase 1 do roadmap).

## Documentação completa

| Documento | Caminho | Conteúdo |
|---|---|---|
| Missão e visão | `docs/specs/mission.md` | Propósito, público-alvo, métricas |
| Stack técnica | `docs/specs/tech-stack.md` | Tecnologias, padrões, decisões arquiteturais |
| Roadmap | `docs/specs/roadmap.md` | Fases detalhadas de implementação |
| Charter original | `docs/project_charter.md` | Escopo e riscos do MVP |
| One pager | `docs/one_pager.md` | Resumo executivo |
| Skills de IA | `skills/SKILL.md` | Personas disponíveis (Clinical SME, Dev, etc.) |

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
                   via ("Central"|"Peripheral"|"Enteral"), base_cost, hidden?

OptimizationConstraints → kcal_min/max, protein_min/max, volume_max, max_bags?

OptimizationResult      → status ("Optimal"|"Infeasible"|"Error"),
                          total_cost/kcal/protein/volume,
                          selected_bags[], constraints_met{}, violation_details?
```

---

## Regras inegociáveis

### Clínicas
1. **A prioridade entre as vias é livre**, escolhida pelo prescritor. O motor não impõe ordem entre enteral e parenteral.
2. **Nunca misturar vias** — fórmula enteral jamais pode ser sugerida para uso intravenoso.
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
| Fórmulas do usuário | localStorage (`optinutri_user_formulas`) | Migrar para Firestore (Fase 5) |
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

---

## Instruções para sessões de IA

1. **O usuário não é programador** — explicar termos técnicos em linguagem simples, um passo de cada vez.
2. **Planejar antes de codar** — nenhuma implementação começa sem aprovação explícita do plano.
3. **`optimizer.ts` é sagrado** — qualquer mudança exige justificativa clínica além da técnica.
4. **Roadmap define prioridades** — consultar `docs/specs/roadmap.md` antes de propor features novas.
5. **SBNPE auth é fase futura** — não priorizar ou discutir integração de autenticação até que o produto atual esteja polido.
6. **Skills disponíveis** em `skills/` — usar o perfil correto: `clinical_sme.md` para regras nutricionais, `full_stack_dev.md` para UI/API, `data_scientist.md` para o solver.
