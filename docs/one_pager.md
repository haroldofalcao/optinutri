# OptiNutri - One Pager

## The Problem

Clinical nutrition is complex. Dietitians must manually balance dozens of nutritional factors against cost and stock availability. This process is time-consuming, prone to calculation errors, and often results in sub-optimal cost efficiency.

## The Solution

**OptiNutri** is an automated optimization engine. It accepts:

1. **Patient Needs:** (e.g., 2000kcal, 80g Protein, Max 1500ml Volume).
2. **Available Formulas:** (List of products with nutritional composition and price).
3. **Constraints:** (Clinical limits, preferred administration route).

It returns:

- The **exact combination** of formulas to use.
- The **total cost**.
- The **nutritional gap** (if any).

## Unique Value Proposition

- **Mathematical Precision:** Uses Linear Programming to guarantee the *mathematically optimal* solution.
- **Cost Savings:** Directly minimizes the objective function $Z = \sum (Price_i \times Volume_i)$.
- **Clinical Safety:** Built-in hard constraints prevent unsafe prescriptions.

## Success Metrics

- **Accuracy:** 100% match with manual validation for standard cases.
- **Speed:** Calculation time < 2 seconds.
- **Usability:** System Usability Scale (SUS) > 80.
