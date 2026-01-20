# OptiNutri

**OptiNutri** is a clinical decision support system designed to optimize enteral and parenteral nutrition therapy. It uses linear programming to calculate the most cost-effective combination of nutritional formulas while meeting specific clinical constraints.

## Project Goal

To develop a Minimum Viable Product (MVP) that assists healthcare professionals in prescribing optimal nutritional regimens, balancing clinical needs (calories, proteins, lipids, etc.) with cost efficiency.

## Key Features

- **Optimization Engine:** Calculates the best formula combination using Simplex/GLPK algorithms.
- **Clinical Constraints:** Respects patient requirements for volume, macro/micronutrients, and administration routes (Enteral vs. Parenteral).
- **Audit Trail:** "Black box" logging for all inputs and outputs to ensure legal compliance.
- **Data Ingestion:** Supports importing formula data via Excel/CSV.

## Team Structure

The project is driven by a cross-functional team of AI agents and human experts:

- **Clinical Admin (SME):** Defines clinical rules and validates nutritional logic.
- **Data Scientist:** Implements the core optimization algorithms.
- **Full-Stack Developer:** Builds the web application and API.
- **Security Engineer:** Ensures LGPD compliance and system security.
- **UI/UX Designer:** Crafts the user interface and data visualization.

## Getting Started

See the `docs/` directory for detailed project documentation and `skills/` for agent role definitions.
