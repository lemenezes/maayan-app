/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryFilter from '../../components/CategoryFilter';

describe('CategoryFilter', () => {
  it('renderiza botão "Todos" e todas as categorias', () => {
    render(<CategoryFilter active={null} onChange={() => {}} />);
    expect(screen.getByRole('button', { name: /todos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /venda/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /serviços/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /indicações/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /doação/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /imóveis/i })).toBeInTheDocument();
  });

  it('chama onChange com null ao clicar em "Todos"', async () => {
    const onChange = vi.fn();
    render(<CategoryFilter active="venda" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /todos/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });

  it('chama onChange com a categoria ao clicar nela', async () => {
    const onChange = vi.fn();
    render(<CategoryFilter active={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /venda/i }));
    expect(onChange).toHaveBeenCalledWith('venda');
  });

  it('clicar na categoria ativa chama onChange com null (deselect)', async () => {
    const onChange = vi.fn();
    render(<CategoryFilter active="venda" onChange={onChange} />);
    await userEvent.click(screen.getByRole('button', { name: /venda/i }));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
