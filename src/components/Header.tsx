import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  Tag,
  PlusCircle,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User,
  LayoutList,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { user, signOut } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const close = () => setIsOpen(false);

  const handleSignOut = async () => {
    close();
    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
      showToast("Erro ao sair. Tente novamente.", "error");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FCFCFB]/92 dark:bg-[#0a1f2e]/90 backdrop-blur-xl border-b border-[#EEF2F7] dark:border-white/5 shadow-[0_1px_12px_rgba(12,90,134,0.04)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link
            to="/"
            onClick={close}
            className="flex items-center gap-4 min-w-0">
            {/* Logo imagem */}
            <img
              src="/favicon.svg"
              alt="Logo Maayan"
              className="w-16 h-16 object-contain flex-shrink-0"
            />
            <div className="leading-tight min-w-0 pl-1">
              <span className="block text-3xl font-['Cormorant_Garamond'] font-extrabold tracking-[0.08em] text-[#0C5A86] dark:text-white">
                Maayan
              </span>
              <span className="hidden sm:block text-base text-slate-300 dark:text-slate-400 font-semibold tracking-[0.25em] uppercase truncate mt-0.5">
                Cidade Jardim
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`
              }>
              Início
            </NavLink>
            <NavLink
              to="/anuncios"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`
              }>
              <Tag size={14} />
              Anúncios
            </NavLink>
            {user && (
              <NavLink
                to="/meus-anuncios"
                className={({ isActive }) =>
                  `px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`
                }>
                <LayoutList size={14} />
                Meus anúncios
              </NavLink>
            )}
            {isAdmin && (
              <>
                <NavLink
                  to="/admin/anuncios"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`
                  }>
                  <ShieldCheck size={14} />
                  Moderação
                </NavLink>
                <NavLink
                  to="/admin/moradores"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`
                  }>
                  <User size={14} />
                  Moradores
                </NavLink>
              </>
            )}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              data-testid="theme-toggle"
              onClick={toggle}
              aria-label={
                theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"
              }
              className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                {/* User avatar (desktop) */}
                <div className="hidden md:flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 px-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0C5A86] to-[#1DAFD9] flex items-center justify-center flex-shrink-0">
                    <User size={13} className="text-white" />
                  </div>
                  <span className="truncate max-w-[120px] text-xs font-medium">
                    {user.email?.split("@")[0]}
                  </span>
                </div>
                {/* Sign out (desktop) */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 text-sm font-medium px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                  aria-label="Sair">
                  <LogOut size={15} />
                  Sair
                </button>
                {/* Publish CTA (desktop) */}
                <div className="hidden md:block">
                  <Link
                    to="/publicar"
                    className="flex items-center gap-2 bg-[#0C5A86] hover:bg-[#09476B] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <PlusCircle size={15} />
                    Publicar
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Solicitar acesso (desktop) */}
                <Link
                  to="/solicitar-acesso"
                  className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Solicitar acesso
                </Link>
                {/* Login (desktop) */}
                <div className="hidden md:block">
                  <Link
                    to="/entrar"
                    className="flex items-center gap-2 bg-[#0C5A86] hover:bg-[#09476B] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <LogIn size={15} />
                    Entrar
                  </Link>
                </div>
              </>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => setIsOpen(v => !v)}
              aria-label={isOpen ? "Fechar menu" : "Abrir menu"}>
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-4 flex flex-col gap-1 animate-fade-in">
          <NavLink
            to="/"
            end
            onClick={close}
            className={({ isActive }) =>
              `px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`
            }>
            Início
          </NavLink>
          <NavLink
            to="/anuncios"
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              }`
            }>
            <Tag size={16} />
            Anúncios
          </NavLink>

          {user ? (
            <>
              <div className="px-4 py-3 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                <User size={13} />
                {user.email}
              </div>
              <NavLink
                to="/meus-anuncios"
                onClick={close}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`
                }>
                <LayoutList size={16} />
                Meus anúncios
              </NavLink>
              {isAdmin && (
                <>
                  <NavLink
                    to="/admin/anuncios"
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`
                    }>
                    <ShieldCheck size={16} />
                    Moderação
                  </NavLink>
                  <NavLink
                    to="/admin/moradores"
                    onClick={close}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                          : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`
                    }>
                    <User size={16} />
                    Moradores
                  </NavLink>
                </>
              )}
              <Link
                to="/publicar"
                onClick={close}
                className="flex items-center justify-center gap-2 mt-1 bg-[#0C5A86] hover:bg-[#09476B] text-white px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors">
                <PlusCircle size={16} />
                Publicar Anúncio
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors mt-1">
                <LogOut size={16} />
                Sair da conta
              </button>
            </>
          ) : (
            <>
              <Link
                to="/entrar"
                onClick={close}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <LogIn size={16} />
                Entrar
              </Link>
              <Link
                to="/solicitar-acesso"
                onClick={close}
                className="flex items-center justify-center gap-2 mt-1 bg-[#0C5A86] hover:bg-[#09476B] text-white px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors">
                Solicitar acesso
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
