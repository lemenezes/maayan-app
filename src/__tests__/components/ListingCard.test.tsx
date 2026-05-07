/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeAll } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListingCard from '../../components/ListingCard';
import type { Listing } from '../../types';

beforeAll(() => {
  Object.defineProperty(window, 'location', {
    value: { origin: 'https://maayan.leandrom.com.br' },
    writable: true,
  });
});

const mockListing: Listing = {
  id: '1',
  title: 'Sofá 3 lugares',
  description: 'Ótimo estado',
  category: 'venda',
  price: 850,
  whatsapp: '11999000001',
  images: [],
  authorName: 'Maria Oliveira',
  apartment: 'Apto 304',
  createdAt: '2026-04-28T10:00:00Z',
};

describe('ListingCard', () => {
  it('renderiza o título do anúncio', () => {
    render(
      <MemoryRouter>
        <ListingCard listing={mockListing} onSelect={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Sofá 3 lugares')).toBeInTheDocument();
  });

  it('renderiza o preço formatado', () => {
    render(
      <MemoryRouter>
        <ListingCard listing={mockListing} onSelect={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/R\$\s*850/)).toBeInTheDocument();
  });

  it('renderiza o nome do autor', () => {
    render(
      <MemoryRouter>
        <ListingCard listing={mockListing} onSelect={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText('Maria Oliveira')).toBeInTheDocument();
  });

  it('chama onSelect ao clicar no card', async () => {
    const onSelect = vi.fn();
    render(
      <MemoryRouter>
        <ListingCard listing={mockListing} onSelect={onSelect} />
      </MemoryRouter>,
    );
    await userEvent.click(screen.getByRole('article'));
    expect(onSelect).toHaveBeenCalledWith(mockListing);
  });

  it('exibe placeholder quando não há imagem', () => {
    render(
      <MemoryRouter>
        <ListingCard listing={{ ...mockListing, images: [] }} onSelect={vi.fn()} />
      </MemoryRouter>,
    );
    // sem imagem, o ícone ImageOff é renderizado
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('exibe img quando há imagem', () => {
    render(
      <MemoryRouter>
        <ListingCard
          listing={{ ...mockListing, images: ['https://picsum.photos/800/600'] }}
          onSelect={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('exibe preço por hora para categoria servicos', () => {
    render(
      <MemoryRouter>
        <ListingCard
          listing={{ ...mockListing, category: 'servicos', price: 120 }}
          onSelect={vi.fn()}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText(/\/h/)).toBeInTheDocument();
  });

  it('não exibe preço quando price é undefined', () => {
    render(
      <MemoryRouter>
        <ListingCard listing={{ ...mockListing, price: undefined }} onSelect={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.queryByText(/R\$/)).not.toBeInTheDocument();
  });
});
