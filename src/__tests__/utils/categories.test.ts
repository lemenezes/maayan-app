/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { CATEGORIES } from '../../types';

describe('CATEGORIES config', () => {
  it('tem exatamente 5 categorias', () => {
    expect(CATEGORIES).toHaveLength(5);
  });

  it('contém todas as categorias esperadas', () => {
    const values = CATEGORIES.map((c) => c.value);
    expect(values).toEqual(
      expect.arrayContaining(['venda', 'servicos', 'indicacoes', 'doacao', 'imoveis']),
    );
  });

  it('cada categoria tem label, icon, badgeClass e pillActiveClass', () => {
    for (const cat of CATEGORIES) {
      expect(cat.label).toBeTruthy();
      expect(cat.icon).toBeTruthy();
      expect(cat.badgeClass).toBeTruthy();
      expect(cat.pillActiveClass).toBeTruthy();
    }
  });
});
