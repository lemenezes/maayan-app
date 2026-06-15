/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RequestAccessPage from "../../pages/RequestAccessPage";

vi.mock("../../context/AuthContext", () => ({
  useAuth: vi.fn()
}));

import { useAuth } from "../../context/AuthContext";

const authBase = {
  user: null,
  session: null,
  loading: false,
  profile: null,
  profileLoading: false,
  profileError: null,
  refreshProfile: vi.fn(),
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn()
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/solicitar-acesso"]}>
      <RequestAccessPage />
    </MemoryRouter>
  );
}

describe("RequestAccessPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("logado: mostra mensagem e não renderiza formulário", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authBase,
      // @ts-expect-error mock parcial de user
      user: { id: "user-1", email: "user@test.com" }
    });

    renderPage();

    expect(
      screen.getByText("Você já está conectado ao Maayan Desapego.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /voltar para página inicial/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /enviar solicitação/i })
    ).not.toBeInTheDocument();
  });

  it("deslogado: renderiza formulário normal", () => {
    vi.mocked(useAuth).mockReturnValue({
      ...authBase,
      user: null,
      session: null,
      loading: false
    });

    renderPage();

    expect(
      screen.getByRole("button", { name: /enviar solicitação/i })
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Você já está conectado ao Maayan Desapego.")
    ).not.toBeInTheDocument();
  });
});
