# Project Charter - OptiNutri

## 1. Vision

To democratize access to optimized clinical nutrition by providing a tool that mathematically guarantees the best cost-benefit ratio for patients and institutions, without compromising clinical quality.

## 2. Objectives

- **Primary:** Deliver a functional MVP that accepts patient constraints and formula lists, returning an optimal prescription plan.
- **Secondary:** Ensure the system is secure, audit-ready, and user-friendly for clinical staff.

## 3. Scope

### In-Scope

- **Optimization Algorithm:** Implementation of a linear programming solver (e.g., using `scipy.optimize` or `GLPK`).
- **Constraint Management:** Handling of Min/Max constraints for Energy, Protein, Carbohydrates, Lipids, Volume, and Cost.
- **Prioritization Logic:** Preference for Enteral nutrition over Parenteral when clinically feasible.
- **Distance Metrics:** Handling "no feasible solution" scenarios by minimizing the distance to the target values.
- **Expiration Alerts:** Flagging formulas nearing their expiration date.

### Out-of-Scope (for MVP)

- Direct integration with Electronic Health Records (EHR/EMR).
- Real-time stock management (checking inventory levels is manual/batch for now).
- Mobile native app (Web Responsive only).

## 4. Technical Architecture

- **Frontend:** React/Next.js (Web-based).
- **Backend:** Python (FastAPI/Flask) for the optimization engine, or Node.js if using JS-based solvers. *Decision pending Optimization Sprints.*
- **Database:** PostgreSQL/SQLite for formula and strict audit logging.
- **Deployment:** Vercel (Frontend) + Cloud Run/Native (Backend).

## 5. Risks & Mitigation

- **Clinical Inaccuracy:** *Mitigation:* Extensive validation by Clinical SME; "Consult a Doctor" disclaimers.
- **Data Privacy (LGPD):** *Mitigation:* Anonymized patient data where possible; strict role-based access control.
- **Solver Performance:** *Mitigation:* Efficient formulation of matrix constraints; fallback to heuristic methods if exact solution times out.

## 6. Audit & Legal

- All inputs (patient data + constraints) and outputs (recommended prescription) must be logged immutably to serve as "evidence" of the rationale behind the suggestion.
