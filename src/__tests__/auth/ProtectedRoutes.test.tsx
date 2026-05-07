/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../../components/ProtectedRoute';
import AdminRoute from '../../components/AdminRoute';

// ─── ProtectedRoute ───────────────────────────────────────────────────────────

vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: vi.fn(),
}));

import { useAuth } from '../../context/AuthContext';
import { useIsAdmin } from '../../hooks/useIsAdmin';

function renderProtected(children = <div>Conteúdo protegido</div>) {
  return render(
    <MemoryRouter initialEntries={['/protegido']}>
      <Routes>
        <Route path="/protegido" element={<ProtectedRoute>{children}</ProtectedRoute>} />
        <Route path="/entrar" element={<div>Página de login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

function renderAdmin(children = <div>Painel admin</div>) {
  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route path="/admin" element={<AdminRoute>{children}</AdminRoute>} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  it('redireciona para /entrar quando usuário não está logado', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, session: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });

    renderProtected();
    expect(screen.getByText('Página de login')).toBeInTheDocument();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo quando usuário está logado', () => {
    vi.mocked(useAuth).mockReturnValue({
      // @ts-expect-error mock parcial
      user: { id: 'abc', email: 'user@test.com' },
      session: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });

    renderProtected();
    expect(screen.getByText('Conteúdo protegido')).toBeInTheDocument();
  });

  it('exibe spinner enquanto carregando', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, session: null, loading: true,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });

    renderProtected();
    expect(screen.queryByText('Conteúdo protegido')).not.toBeInTheDocument();
    expect(screen.queryByText('Página de login')).not.toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('redireciona para / quando usuário não é admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      // @ts-expect-error mock parcial
      user: { id: 'abc' }, session: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useIsAdmin).mockReturnValue(false);

    renderAdmin();
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument();
  });

  it('renderiza conteúdo quando usuário é admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      // @ts-expect-error mock parcial
      user: { id: 'abc' }, session: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useIsAdmin).mockReturnValue(true);

    renderAdmin();
    expect(screen.getByText('Painel admin')).toBeInTheDocument();
  });

  it('usuário comum (não admin) não vê o painel admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      // @ts-expect-error mock parcial
      user: { id: 'xyz' }, session: null, loading: false,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useIsAdmin).mockReturnValue(false);

    renderAdmin();
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument();
  });

  it('exibe spinner enquanto carregando auth', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, session: null, loading: true,
      signIn: vi.fn(), signUp: vi.fn(), signOut: vi.fn(),
    });
    vi.mocked(useIsAdmin).mockReturnValue(null);

    renderAdmin();
    expect(screen.queryByText('Painel admin')).not.toBeInTheDocument();
  });
});
