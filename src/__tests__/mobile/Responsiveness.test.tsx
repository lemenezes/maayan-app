/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// ─── Mock de contextos ────────────────────────────────────────────────────────

vi.mock('../../context/ThemeContext', () => ({
  useTheme: () => ({ theme: 'light', toggle: vi.fn() }),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null, session: null, loading: false, signOut: vi.fn() }),
}));

vi.mock('../../hooks/useIsAdmin', () => ({
  useIsAdmin: () => false,
}));

const { default: Header } = await import('../../components/Header');
const { default: ListingModal } = await import('../../components/ListingModal');

import type { Listing } from '../../types';

const mockListing: Listing = {
  id: '1',
  title: 'Sofá 3 lugares',
  description: 'Ótimo estado',
  category: 'venda',
  price: 850,
  whatsapp: '11999000001',
  images: ['https://picsum.photos/800/600'],
  authorName: 'Maria',
  apartment: 'Apto 304',
  createdAt: '2026-04-28T10:00:00Z',
};

function renderHeader() {
  return render(
    <MemoryRouter>
      <Header />
    </MemoryRouter>,
  );
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

describe('Header — mobile menu', () => {
  it('menu hamburger existe no DOM', () => {
    renderHeader();
    const menuButton = screen.getByRole('button', { name: /abrir menu|menu/i });
    expect(menuButton).toBeInTheDocument();
  });

  it('clicar no hamburger abre o menu mobile', async () => {
    renderHeader();
    const menuButton = screen.getByRole('button', { name: /abrir menu|menu/i });
    await userEvent.click(menuButton);

    // Nav mobile deve aparecer
    const nav = screen.getByRole('navigation', { hidden: false });
    expect(nav).toBeInTheDocument();
  });

  it('clicar no X fecha o menu mobile', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /abrir menu|menu/i }));
    const closeButton = screen.getByRole('button', { name: /fechar menu/i });
    await userEvent.click(closeButton);

    // Botão de fechar some
    expect(screen.queryByRole('button', { name: /fechar menu/i })).not.toBeInTheDocument();
  });

  it('links de navegação são acessíveis no menu mobile', async () => {
    renderHeader();
    await userEvent.click(screen.getByRole('button', { name: /abrir menu|menu/i }));
    expect(screen.getAllByRole('link', { name: /anúncios/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /publicar/i }).length).toBeGreaterThan(0);
  });
});

// ─── ListingModal ─────────────────────────────────────────────────────────────

describe('ListingModal', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: { origin: 'https://maayan.leandrom.com.br' },
      writable: true,
    });
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('renderiza o título do anúncio', () => {
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getAllByText('Sofá 3 lugares').length).toBeGreaterThan(0);
  });

  it('renderiza link para WhatsApp', () => {
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    const waLink = screen.getByRole('link', { name: /whatsapp/i });
    expect(waLink).toHaveAttribute('href', expect.stringContaining('wa.me'));
  });

  it('Escape fecha o modal', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={onClose} />
      </MemoryRouter>,
    );
    await userEvent.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('clicar no overlay fecha o modal', async () => {
    const onClose = vi.fn();
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={onClose} />
      </MemoryRouter>,
    );
    const dialog = screen.getByRole('dialog');
    await userEvent.click(dialog);
    expect(onClose).toHaveBeenCalled();
  });

  it('body.overflow fica "hidden" enquanto modal está aberto', () => {
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(document.body.style.overflow).toBe('hidden');
  });

  it('exibe galeria de imagens quando há imagens', () => {
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('exibe preço formatado', () => {
    render(
      <MemoryRouter>
        <ListingModal listing={mockListing} onClose={vi.fn()} />
      </MemoryRouter>,
    );
    expect(screen.getByText(/R\$\s*850/)).toBeInTheDocument();
  });
});
