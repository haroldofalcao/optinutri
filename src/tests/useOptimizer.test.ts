import { describe, it, expect } from 'vitest';
import { validateConstraints } from '../hooks/useOptimizer';
import { OptimizationConstraints } from '../types/formula';

const baseConstraints: OptimizationConstraints = {
    kcal_min: 1800,
    kcal_max: 2400,
    protein_min: 60,
    protein_max: 90,
    volume_max: 2500,
    max_bags: 5,
};

describe('validateConstraints', () => {
    it('returns no errors for valid constraints', () => {
        expect(validateConstraints(baseConstraints)).toEqual([]);
    });

    it('flags negative kcal_min', () => {
        const errors = validateConstraints({ ...baseConstraints, kcal_min: -1 });
        expect(errors.some(e => e.field === 'kcal_min')).toBe(true);
    });

    it('flags kcal_max smaller than kcal_min', () => {
        const errors = validateConstraints({ ...baseConstraints, kcal_min: 2000, kcal_max: 1000 });
        expect(errors.some(e => e.field === 'kcal_max')).toBe(true);
    });

    it('flags negative protein_min', () => {
        const errors = validateConstraints({ ...baseConstraints, protein_min: -5 });
        expect(errors.some(e => e.field === 'protein_min')).toBe(true);
    });

    it('flags protein_max smaller than protein_min', () => {
        const errors = validateConstraints({ ...baseConstraints, protein_min: 80, protein_max: 50 });
        expect(errors.some(e => e.field === 'protein_max')).toBe(true);
    });

    it('flags volume_max of zero or less', () => {
        const errors = validateConstraints({ ...baseConstraints, volume_max: 0 });
        expect(errors.some(e => e.field === 'volume_max')).toBe(true);
    });

    it('flags max_bags below 1', () => {
        const errors = validateConstraints({ ...baseConstraints, max_bags: 0 });
        expect(errors.some(e => e.field === 'max_bags')).toBe(true);
    });
});
