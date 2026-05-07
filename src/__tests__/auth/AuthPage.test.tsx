/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import AuthPage from '../../pages/AuthPage';

// Mock useAuth — começa deslogado
const mockSignIn = vi.fn();
const mockSignUp = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    session: null,
    loading: false,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: vi.fn(),
  }),
}));

function renderLogin(mode: 'login' | 'register' = 'login') {
  return render(
    <MemoryRouter initialEntries={[mode === 'login' ? '/entrar' : '/cadastro']}>
      <Routes>
        <Route path="/entrar" element={<AuthPage mode="login" />} />
        <Route path="/cadastro" element={<AuthPage mode="register" />} />
        <Route path="/" element={<div>Home</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AuthPage — login', () => {
  it('renderiza campos de e-mail e senha', () => {
    renderLogin('login');
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('exibe erro quando e-mail está vazio', async () => {
    renderLogin('login');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/informe seu e-mail/i)).toBeInTheDocument();
  });

  it('exibe erro quando senha tem menos de 6 caracteres', async () => {
    renderLogin('login');
    await userEvent.type(screen.getByLabelText('E-mail'), 'test@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), '123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/pelo menos 6 caracteres/i)).toBeInTheDocument();
  });

  it('chama signIn com as credenciais corretas', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null });
    renderLogin('login');
    await userEvent.type(screen.getByLabelText('E-mail'), 'user@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    await waitFor(() =>
      expect(mockSignIn).toHaveBeenCalledWith('user@test.com', 'senha123'),
    );
  });

  it('exibe mensagem de erro quando signIn falha', async () => {
    mockSignIn.mockResolvedValueOnce({ error: 'Invalid login credentials' });
    renderLogin('login');
    await userEvent.type(screen.getByLabelText('E-mail'), 'wrong@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'wrongpass');
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }));
    expect(await screen.findByText(/e-mail ou senha incorretos/i)).toBeInTheDocument();
  });

  it('toggle mostra/esconde a senha', async () => {
    renderLogin('login');
    const input = screen.getByLabelText('Senha');
    expect(input).toHaveAttribute('type', 'password');
    await userEvent.click(screen.getByRole('button', { name: /mostrar senha/i }));
    expect(input).toHaveAttribute('type', 'text');
  });
});

describe('AuthPage — cadastro', () => {
  it('chama signUp e exibe mensagem de confirmação', async () => {
    mockSignUp.mockResolvedValueOnce({ error: null });
    renderLogin('register');
    await userEvent.type(screen.getByLabelText('E-mail'), 'novo@test.com');
    await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
    await userEvent.click(screen.getByRole('button', { name: /criar conta/i }));
    await waitFor(() =>
      expect(mockSignUp).toHaveBeenCalledWith('novo@test.com', 'senha123'),
    );
    expect(await screen.findByText(/confirme seu e-mail/i)).toBeInTheDocument();
  });
});
