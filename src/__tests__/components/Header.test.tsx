/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, signOut: vi.fn() }),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: () => false,
}));

// Import depois dos mocks
const { default: Header } = await import('../../components/Header');

describe('Header', () => {
  it('renderiza o logo com o nome Maayan', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getByText('Maayan')).toBeInTheDocument();
  });

  it('renderiza link para Anúncios', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link', { name: /anúncios/i }).length).toBeGreaterThan(0);
  });

  it('renderiza link para Entrar quando não logado', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link', { name: /entrar/i }).length).toBeGreaterThan(0);
  });

  it('renderiza botão de toggle de tema', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    // botão de sol/lua
    const themeButton = screen.getAllByRole('button').find(
      (btn) => btn.getAttribute('aria-label')?.toLowerCase().includes('tema') ||
               btn.querySelector('svg') !== null,
    );
    expect(themeButton).toBeDefined();
  });

  it('sem usuário logado: mostra link de Entrar', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    );
    expect(screen.getAllByRole('link', { name: /entrar/i }).length).toBeGreaterThan(0);
  });
});
