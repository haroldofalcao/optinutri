# OptiNutri — Tech Stack

## Visão geral

O OptiNutri é uma aplicação **Next.js full-stack** sem backend separado. O motor de otimização roda no lado do cliente (browser), em TypeScript. O Firebase provê autenticação e persistência.

---

## Stack principal

| Camada | Tecnologia | Versão | Papel |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.1.4 | Roteamento, SSR, build |
| UI | React | 19 | Renderização de componentes |
| Linguagem | TypeScript | 5 | Tipagem estática em todo o código |
| Estilo | Tailwind CSS | 4 | Utilitários de CSS |
| Componentes | Radix UI + shadcn/ui | — | Primitivos acessíveis e componentes prontos |
| Gráficos | Recharts | 3 | Visualizações no dashboard |
| Estado global | Jotai | 2 | Átomos de estado compartilhados |
| Formulários | React Hook Form + Zod | — | Formulários com validação tipada |
| Solver LP | javascript-lp-solver | 1.0.1 | Motor de programação linear (MILP) |
| Banco de dados | Firebase Firestore | 12 | Histórico de otimizações e auditoria |
| Autenticação | Firebase Auth | 12 | Gerenciamento de sessão |
| Testes | Vitest | 4 | Testes unitários e de integração |
| Deploy | Vercel | — | Hospedagem e CI/CD automático |

---

## Decisões arquiteturais

### Solver no cliente (browser), não no servidor
O `javascript-lp-solver` roda inteiramente no browser. Isso significa:
- Não há chamada de API para calcular — a resposta é instantânea.
- Sem custos de servidor para cada cálculo.
- Limitação: problemas muito grandes (centenas de variáveis) podem ser lentos. Para o escopo atual (< 50 fórmulas), é adequado.

> **Nota**: O charter original previa Python (FastAPI/PuLP) como opção de backend. Essa opção foi descartada para o MVP. Caso o solver precise de mais poder no futuro, a migração para um Python server action seria avaliada então.

### Firebase como backend
- Firestore armazena histórico de otimizações e logs de auditoria por `userId`.
- Firebase Auth gerencia sessões — será o ponto de integração com o sistema de autenticação da SBNPE (fase futura).
- Fórmulas customizadas ainda usam localStorage; a migração para Firestore é parte do roadmap.

### Next.js App Router
- Todas as páginas usam o App Router (não o Pages Router).
- Sem `getServerSideProps` ou `getStaticProps` — usar Server Components e Server Actions quando necessário.

### Jotai para estado global
- Preferido sobre Context API e Zustand por sua simplicidade atômica.
- `atomWithStorage` para persistência automática em localStorage.
- Não usar Context API diretamente.

---

## Estrutura de arquivos relevante

```
src/
├── app/              # Páginas (App Router)
├── components/       # Componentes React
│   └── ui/           # shadcn/ui (não editar manualmente)
├── lib/
│   ├── optimizer.ts  # Motor LP — arquivo crítico
│   ├── firebase.ts   # Config Firebase (singleton)
│   └── utils.ts      # cn() e helpers
├── services/
│   └── db.ts         # Operações Firestore
├── store/            # Átomos Jotai
├── types/
│   └── formula.ts    # Interfaces centrais (Formula, OptimizationResult...)
└── data/
    └── formulas.json # Base de fórmulas padrão
```

---

## Padrões obrigatórios

- **Imports**: sempre usar alias `@/` (ex: `@/lib/optimizer`), nunca caminhos relativos `../../`.
- **Tipagem**: sem `any`. Tipar todas as interfaces explicitamente.
- **Classes Tailwind condicionais**: usar `cn()` de `@/lib/utils`.
- **Validação de formulários**: Zod schema + React Hook Form. Nunca validar inline no componente.
- **Erros do Firestore**: nunca bloquear o fluxo principal (ver padrão em `services/db.ts`).

---

## O que NÃO usar

| Item | Motivo |
|---|---|
| Python / FastAPI | Descartado para o MVP |
| Context API diretamente | Usar Jotai |
| Pages Router | Projeto usa App Router |
| `any` em TypeScript | Proibido |
| Caminhos relativos `../../` | Usar alias `@/` |

---

## Variáveis de ambiente necessárias

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

---

## Comandos

```bash
npm run dev    # desenvolvimento local
npm run build  # build de produção
npm run test   # vitest (testes unitários)
npm run lint   # eslint
```
