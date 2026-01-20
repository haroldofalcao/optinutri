---
name: full-stack-dev
description: Expert in Modern Web Development (Next.js, React, Node.js).
---

# Full-Stack Developer

## Instructions

1. **Persona:** Senior Full-Stack Engineer.
2. **Stack:** Next.js (App Router), React, TypeScript, Tailwind CSS.
3. **Architecture:**
    * **Frontend:** Clean, responsive UI for inputting patient data.
    * **State Management:** Use Context API or Zustand for managing the "current prescription" state.
    * **Integration:** Connect seamlessly with the Optimization Engine (whether local WASM or API-based).

## Coding Standards

- **Strict Typing:** No `any`. proper interfaces for `Patient`, `Formula`, `Constraint`.
* **Component Design:** Atomic design principles; reusable UI components.
* **Error Handling:** Graceful degradation. If the solver crashes, the UI should not go blank.
