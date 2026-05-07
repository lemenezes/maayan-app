/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { buildWhatsAppUrl, buildListingUrl } from '../../utils/whatsapp';
import type { Listing } from '../../types';

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://maayan.leandrom.com.br' },
    writable: true,
  });
});

const base: Listing = {
  id: '42',
  title: 'Sofá 3 lugares',
  description: 'Ótimo estado',
  category: 'venda',
  price: 850,
  whatsapp: '11999000001',
  images: [],
  authorName: 'Maria',
  apartment: 'Apto 304',
  createdAt: '2026-04-28T10:00:00Z',
};

describe('buildListingUrl', () => {
  it('inclui o origin e o id', () => {
    expect(buildListingUrl(base)).toBe('https://maayan.leandrom.com.br/anuncios/42');
  });
});

describe('buildWhatsAppUrl', () => {
  it('formata o número sem caracteres especiais', () => {
    const url = buildWhatsAppUrl(base);
    expect(url).toMatch(/^https:\/\/wa\.me\/5511999000001/);
  });

  it('categoria venda: inclui link e pergunta de disponibilidade', () => {
    const url = buildWhatsAppUrl(base);
    expect(decodeURIComponent(url)).toContain('Ainda está disponível?');
    expect(decodeURIComponent(url)).toContain('/anuncios/42');
  });

  it('categoria imoveis: mesmo comportamento que venda', () => {
    const url = buildWhatsAppUrl({ ...base, category: 'imoveis' });
    expect(decodeURIComponent(url)).toContain('Ainda está disponível?');
  });

  it('categoria servicos: mensagem simples de contato', () => {
    const url = buildWhatsAppUrl({ ...base, category: 'servicos' });
    expect(decodeURIComponent(url)).toContain('gostaria de mais informações');
    expect(decodeURIComponent(url)).not.toContain('Ainda está disponível?');
  });

  it('remove caracteres não numéricos do whatsapp', () => {
    const url = buildWhatsAppUrl({ ...base, whatsapp: '(11) 99900-0001' });
    expect(url).toMatch(/wa\.me\/5511999000001/);
  });
});
