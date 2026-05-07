/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';

// ─── Mocks de infraestrutura ─────────────────────────────────────────────────

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: () => false,
}));

vi.mock('../../hooks/useListings', () => ({
  useListings: vi.fn(),
}));

// ─── Imports após mocks ──────────────────────────────────────────────────────

import { useAuth } from '../../context/AuthContext';
import { useListings } from '../../hooks/useListings';
import HomePage from '../../pages/HomePage';

import type { Listing } from '../../types';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const mockListing: Listing = {
  id: '1',
  title: 'Mesa de escritório',
  description: 'Ótima mesa',
  category: 'venda',
  price: 500,
  whatsapp: '11999000001',
  images: [],
  authorName: 'João',
  apartment: 'Apto 201',
  createdAt: '2026-01-01T00:00:00Z',
};

const mockUser = { id: 'u1', email: 'test@test.com' } as unknown as User;

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe('HomePage — visitante (sem login)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, session: null, loading: false,
      profile: null, profileLoading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useListings).mockReturnValue({
      listings: [],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it('mostra o título hero', () => {
    renderHome();
    expect(screen.getByTestId('hero-title')).toBeInTheDocument();
  });

  it('exibe "—" nos anúncios ativos quando não logado', () => {
    renderHome();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('mostra GuestWall em vez de grid de anúncios', () => {
    renderHome();
    // GuestWall renderiza o título "Exclusivo para moradores"
    expect(screen.getByText(/exclusivo para moradores/i)).toBeInTheDocument();
  });

  it('não renderiza listagem de cards', () => {
    renderHome();
    expect(screen.queryByTestId('listings-grid')).not.toBeInTheDocument();
  });

  it('mostra seção de categorias para visitantes', () => {
    renderHome();
    expect(screen.getByTestId('category-section')).toBeInTheDocument();
  });
});

describe('HomePage — usuário autenticado', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, session: null, loading: false,
      profile: { id: 'u1', full_name: 'Test', email: 'test@test.com', block: 'A', apartment: '101', role: 'resident', status: 'approved', created_at: '2026-01-01T00:00:00Z' },
      profileLoading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useListings).mockReturnValue({
      listings: [mockListing],
      loading: false,
      error: null,
      reload: vi.fn(),
    });
  });

  it('não mostra GuestWall', () => {
    renderHome();
    expect(screen.queryByText(/exclusivo para moradores/i)).not.toBeInTheDocument();
  });

  it('renderiza o grid de anúncios', () => {
    renderHome();
    expect(screen.getByTestId('listings-grid')).toBeInTheDocument();
  });

  it('exibe o título do anúncio mockado', () => {
    renderHome();
    expect(screen.getByText('Mesa de escritório')).toBeInTheDocument();
  });

  it('mostra o botão "Ver todos"', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /ver todos/i })).toBeInTheDocument();
  });
});

describe('HomePage — usuário autenticado (loading)', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, session: null, loading: false,
      profile: { id: 'u1', full_name: 'Test', email: 'test@test.com', block: 'A', apartment: '101', role: 'resident', status: 'approved', created_at: '2026-01-01T00:00:00Z' },
      profileLoading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useListings).mockReturnValue({
      listings: [],
      loading: true,
      error: null,
      reload: vi.fn(),
    });
  });

  it('não mostra GuestWall durante loading', () => {
    renderHome();
    expect(screen.queryByText(/exclusivo para moradores/i)).not.toBeInTheDocument();
  });
});
