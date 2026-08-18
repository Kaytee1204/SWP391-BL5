import { describe, it, expect } from 'vitest';
import { vocabularyCategoryApi } from './vocabularyCategoryApi';

describe('VocabularyCategoryApi - API Integration Tests', () => {
    it('should have getAll method', () => {
        expect(typeof vocabularyCategoryApi.getAll).toBe('function');
    });

    it('should have create method', () => {
        expect(typeof vocabularyCategoryApi.create).toBe('function');
    });

    it('should have update method', () => {
        expect(typeof vocabularyCategoryApi.update).toBe('function');
    });

    it('should have delete method', () => {
        expect(typeof vocabularyCategoryApi.delete).toBe('function');
    });

    it('should have getById method', () => {
        expect(typeof vocabularyCategoryApi.getById).toBe('function');
    });
});
