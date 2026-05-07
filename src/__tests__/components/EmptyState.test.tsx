/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EmptyState, { EmptyListings } from '../../components/EmptyState';

describe('EmptyState', () => {
  it('renderiza o título', () => {
    render(<EmptyState title="Nenhum resultado" />);
    expect(screen.getByText('Nenhum resultado')).toBeInTheDocument();
  });

  it('renderiza descrição quando fornecida', () => {
    render(<EmptyState title="Vazio" description="Não há itens aqui" />);
    expect(screen.getByText('Não há itens aqui')).toBeInTheDocument();
  });

  it('não renderiza descrição quando omitida', () => {
    render(<EmptyState title="Vazio" />);
    expect(screen.queryByRole('paragraph')).not.toBeInTheDocument();
  });

  it('renderiza ações quando fornecidas', () => {
    render(
      <EmptyState
        title="Vazio"
        actions={<button>Publicar</button>}
      />,
    );
    expect(screen.getByRole('button', { name: /publicar/i })).toBeInTheDocument();
  });
});

describe('EmptyListings', () => {
  it('renderiza CTA para publicar anúncio', () => {
    render(
      <MemoryRouter>
        <EmptyListings />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link', { name: /publicar/i })).toBeInTheDocument();
  });
});
