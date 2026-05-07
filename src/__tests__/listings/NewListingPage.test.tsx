/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NewListingPage from '../../pages/NewListingPage';

const mockCreateListing = vi.fn();

vi.mock('../../services/listingsService', () => ({
  createListing: (...args: unknown[]) => mockCreateListing(...args),
}));

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'user-1', email: 'user@test.com' }, loading: false }),
}));

vi.mock('../../context/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() }),
}));

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route path="/publicar" element={<NewListingPage />} />
        <Route path="/meus-anuncios" element={<div>Meus anúncios</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('NewListingPage — validação do formulário', () => {
  beforeEach(() => { mockCreateListing.mockClear(); });

  it('exibe erros obrigatórios ao submeter vazio', async () => {
    renderPage();
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
    // título, descrição, nome, whatsapp = 4 campos obrigatórios
    const errors = await screen.findAllByText(/campo obrigatório/i);
    expect(errors.length).toBeGreaterThanOrEqual(3);
  });

  it('exibe erro de WhatsApp quando campo está vazio', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/título/i), 'Meu anúncio');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição do item');
    await userEvent.type(screen.getByLabelText(/seu nome/i), 'João');
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
    expect(await screen.findByText(/campo obrigatório/i)).toBeInTheDocument();
  });

  it('exibe erro de WhatsApp com número inválido', async () => {
    renderPage();
    await userEvent.type(screen.getByLabelText(/título/i), 'Meu anúncio');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Descrição do item');
    await userEvent.type(screen.getByLabelText(/seu nome/i), 'João');
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '123');
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
    expect(await screen.findByText(/número inválido/i)).toBeInTheDocument();
  });

  it('chama createListing com dados corretos ao preencher formulário válido', async () => {
    mockCreateListing.mockResolvedValueOnce({ id: 'new-1' });
    renderPage();

    await userEvent.type(screen.getByLabelText(/título/i), 'Sofá 3 lugares');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Ótimo estado, usado 1 ano');
    await userEvent.type(screen.getByLabelText(/seu nome/i), 'Maria');
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '11999000001');

    await userEvent.click(screen.getByRole('button', { name: /publicar/i }));
    await waitFor(() => expect(mockCreateListing).toHaveBeenCalledOnce());

    const arg = mockCreateListing.mock.calls[0][0];
    expect(arg.title).toBe('Sofá 3 lugares');
    expect(arg.authorName).toBe('Maria');
  });

  it('exibe tela de sucesso após publicação', async () => {
    mockCreateListing.mockResolvedValueOnce({ id: 'new-1' });
    renderPage();

    await userEvent.type(screen.getByLabelText(/título/i), 'Sofá 3 lugares');
    await userEvent.type(screen.getByLabelText(/descrição/i), 'Ótimo estado');
    await userEvent.type(screen.getByLabelText(/seu nome/i), 'Maria');
    await userEvent.type(screen.getByLabelText(/whatsapp/i), '11999000001');
    await userEvent.click(screen.getByRole('button', { name: /publicar/i }));

    expect(await screen.findByText(/aguardando aprovação/i)).toBeInTheDocument();
  });
});

describe('NewListingPage — upload de imagens', () => {
  beforeEach(() => { mockCreateListing.mockClear(); });

  it('rejeita arquivo acima de 5MB', async () => {
    renderPage();
    const bigFile = new File(['x'.repeat(6 * 1024 * 1024)], 'grande.jpg', { type: 'image/jpeg' });
    Object.defineProperty(bigFile, 'size', { value: 6 * 1024 * 1024 });

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, bigFile);

    expect(await screen.findByText(/5\s*MB/i)).toBeInTheDocument();
  });

  it('rejeita arquivo com tipo inválido', async () => {
    renderPage();
    const badFile = new File(['conteúdo'], 'doc.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, badFile);

    expect(await screen.findByText(/jpeg|png|webp/i)).toBeInTheDocument();
  });

  it('aceita até 4 imagens', async () => {
    renderPage();
    const files = Array.from({ length: 4 }, (_, i) =>
      new File(['img'], `foto${i}.jpg`, { type: 'image/jpeg' }),
    );
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, files);

    // 4 previews renderizados
    await waitFor(() =>
      expect(screen.getAllByRole('img').length).toBeGreaterThanOrEqual(4),
    );
  });
});
