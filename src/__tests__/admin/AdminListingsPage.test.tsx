/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import AdminListingsPage from '../../pages/AdminListingsPage';
import type { Listing } from '../../types';

const mockSetListingStatus = vi.fn();
const mockDeleteListing = vi.fn();
const mockFetchAllListingsAdmin = vi.fn();

vi.mock('../../services/listingsService', () => ({
  fetchAllListingsAdmin: (...args: unknown[]) => mockFetchAllListingsAdmin(...args),
  setListingStatus: (...args: unknown[]) => mockSetListingStatus(...args),
  deleteListing: (...args: unknown[]) => mockDeleteListing(...args),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

type AdminListing = Listing & { status: string; userId: string };

const pending: AdminListing = {
  id: '1',
  title: 'Mesa de escritório',
  description: 'Em ótimo estado',
  category: 'venda',
  price: 300,
  whatsapp: '11999000001',
  images: [],
  authorName: 'João Silva',
  apartment: '201',
  createdAt: '2026-05-01T10:00:00Z',
  status: 'pending',
  userId: 'user-1',
};

const active: AdminListing = {
  ...pending,
  id: '2',
  title: 'Bicicleta aro 29',
  status: 'active',
};

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminListingsPage />
    </MemoryRouter>,
  );
}

describe('AdminListingsPage', () => {
  beforeEach(() => {
    mockFetchAllListingsAdmin.mockResolvedValue([pending, active]);
    mockSetListingStatus.mockResolvedValue(undefined);
    mockDeleteListing.mockResolvedValue(undefined);
  });

  it('carrega e exibe os anúncios', async () => {
    renderPage();
    // filtro padrão é "pending", então só Mesa aparece
    expect(await screen.findByText('Mesa de escritório')).toBeInTheDocument();
    // muda para "todos" para ver ambos
    await userEvent.click(screen.getByRole('button', { name: /^todos$/i }));
    expect(await screen.findByText('Bicicleta aro 29')).toBeInTheDocument();
  });

  it('botão Aprovar chama setListingStatus com "active"', async () => {
    renderPage();
    // Filtra por "todos" para ver ambos
    const todoBtn = await screen.findByRole('button', { name: /^todos$/i });
    await userEvent.click(todoBtn);

    const approveButtons = await screen.findAllByTitle('Aprovar');
    await userEvent.click(approveButtons[0]);

    await waitFor(() =>
      expect(mockSetListingStatus).toHaveBeenCalledWith(pending.id, 'active'),
    );
  });

  it('botão Rejeitar chama setListingStatus com "rejected"', async () => {
    renderPage();
    const todoBtn = await screen.findByRole('button', { name: /^todos$/i });
    await userEvent.click(todoBtn);

    const rejectButtons = await screen.findAllByTitle('Rejeitar');
    await userEvent.click(rejectButtons[0]);

    await waitFor(() =>
      expect(mockSetListingStatus).toHaveBeenCalledWith(pending.id, 'rejected'),
    );
  });

  it('anúncio aprovado atualiza badge de status visualmente', async () => {
    renderPage();
    const todoBtn = await screen.findByRole('button', { name: /^todos$/i });
    await userEvent.click(todoBtn);

    const approveButtons = await screen.findAllByTitle('Aprovar');
    await userEvent.click(approveButtons[0]);

    await waitFor(() =>
      expect(screen.getAllByText('Ativo').length).toBeGreaterThan(1),
    );
  });

  it('filtro Pendentes exibe só anúncios pendentes', async () => {
    renderPage();
    await screen.findByText('Mesa de escritório'); // aguarda load

    await userEvent.click(screen.getByRole('button', { name: /pendentes/i }));

    expect(screen.getByText('Mesa de escritório')).toBeInTheDocument();
    expect(screen.queryByText('Bicicleta aro 29')).not.toBeInTheDocument();
  });

  it('filtro Ativos exibe só anúncios ativos', async () => {
    renderPage();
    await screen.findByText('Mesa de escritório');

    await userEvent.click(screen.getByRole('button', { name: /^ativos/i }));

    expect(screen.getByText('Bicicleta aro 29')).toBeInTheDocument();
    expect(screen.queryByText('Mesa de escritório')).not.toBeInTheDocument();
  });

  it('exibe contador total de anúncios', async () => {
    renderPage();
    expect(await screen.findByText(/2 anúncios/i)).toBeInTheDocument();
  });
});
