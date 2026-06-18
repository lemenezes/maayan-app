import type { ReactElement } from "react";
import { CircleHelp, Home, Megaphone, UserCog } from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon?: ReactElement;
  end?: boolean;
  requiresAuth?: boolean;
  requiresAdmin?: boolean;
  adminVariant?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Início", icon: <Home size={16} />, end: true },
  {
    to: "/anuncios",
    label: "Anúncios",
    icon: <Megaphone size={16} />,
    requiresAuth: true
  },
  {
    to: "/ajuda",
    label: "Ajuda",
    icon: <CircleHelp size={15} />
  },
  {
    to: "/meus-anuncios",
    label: "Meus anúncios",
    icon: <LayoutList size={14} />,
    requiresAuth: true
  },
  {
    to: "/admin/anuncios",
    label: "Moderação",
    icon: <ShieldCheck size={14} />,
    requiresAuth: true,
    requiresAdmin: true,
    adminVariant: true
  },
  {
    to: "/admin/moradores",
    label: "Residentes",
    icon: <UserCog size={14} />,
    requiresAuth: true,
    requiresAdmin: true,
    adminVariant: true
  }
];

const navClass = (isActive: boolean, admin = false) =>
  `px-3 py-2 text-[13px] transition-colors flex items-center gap-1.5 ${
    isActive
      ? admin
        ? "text-indigo-600 dark:text-indigo-400 font-semibold"
        : "text-[#0C5A86] dark:text-sky-400 font-semibold"
      : "font-normal text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
  }`;
import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Menu,
  X,
  PlusCircle,
  Sun,
  Moon,
  LogOut,
  LogIn,
  User,
  Loader2,
  LayoutList,
  ShieldCheck
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useIsAdmin } from "../hooks/useIsAdmin";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const { user, signOut, authOperation } = useAuth();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const isSigningOut = authOperation === "sign-out";

  const close = () => setIsOpen(false);
  const handleLogoClick = () => {
    close();
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(e.target as Node)
      ) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    if (isSigningOut) return;

    close();
    setIsAccountOpen(false);

    try {
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao sair:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-[#FCFCFB]/92 dark:bg-[#0a1f2e]/90 backdrop-blur-xl border-b border-[#EEF2F7] dark:border-white/5 shadow-[0_1px_12px_rgba(12,90,134,0.04)] transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center flex-shrink-0">
            {/* Logo imagem */}
            <img
              src="/favicon.svg"
              alt="Logo Maayan"
              className="w-[110px] h-[110px] object-contain flex-shrink-0"
            />
            <div className="leading-tight">
              <span className="block text-2xl font-['Cormorant_Garamond'] font-extrabold tracking-[0.08em] text-[#0C5A86] dark:text-white">
                Maayan
              </span>
              <span className="hidden sm:block text-xs text-slate-600 dark:text-slate-300 font-semibold tracking-[0.25em] uppercase mt-0.5">
                Cidade Jardim
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 ml-8">
            {NAV_ITEMS.filter(item => {
              if (item.requiresAdmin && !isAdmin) return false;
              if (item.requiresAuth && !user) return false;
              return true;
            }).map(item => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  navClass(isActive, item.adminVariant)
                }>
                {item.icon}
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {user ? (
              <>
                {/* Publish CTA (desktop) */}
                <div className="hidden md:block mr-1">
                  <Link
                    to="/publicar"
                    className="flex items-center gap-2 bg-[#0C5A86] hover:bg-[#09476B] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <PlusCircle size={15} />
                    Publicar
                  </Link>
                </div>
                {/* Separator (desktop) */}
                <div className="hidden md:block w-px h-5 bg-slate-200 dark:bg-slate-700/60 mx-1" />
                {/* Theme toggle */}
                <button
                  data-testid="theme-toggle"
                  onClick={toggle}
                  aria-label={
                    theme === "dark"
                      ? "Ativar modo claro"
                      : "Ativar modo escuro"
                  }
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                {/* Avatar dropdown (desktop) */}
                <div ref={accountRef} className="relative hidden md:block">
                  <button
                    onClick={() => setIsAccountOpen(v => !v)}
                    aria-label="Menu da conta"
                    aria-expanded={isAccountOpen}
                    className="w-7 h-7 rounded-full bg-gradient-to-br from-[#0C5A86] to-[#1DAFD9] flex items-center justify-center flex-shrink-0 hover:opacity-75 transition-opacity">
                    <User size={13} className="text-white" />
                  </button>
                  {isAccountOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-100 dark:border-slate-800 py-1 z-50">
                      <Link
                        to="/minha-conta"
                        onClick={() => setIsAccountOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <User size={14} />
                        Minha conta
                      </Link>
                      <button
                        disabled={isSigningOut}
                        onClick={() => {
                          setIsAccountOpen(false);
                          handleSignOut();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {isSigningOut ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <LogOut size={14} />
                        )}
                        {isSigningOut ? "Saindo..." : "Sair da conta"}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Theme toggle */}
                <button
                  data-testid="theme-toggle"
                  onClick={toggle}
                  aria-label={
                    theme === "dark"
                      ? "Ativar modo claro"
                      : "Ativar modo escuro"
                  }
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                {/* Login (desktop) */}
                <div className="hidden md:block">
                  <Link
                    to="/entrar"
                    className="flex items-center gap-2 bg-[#0C5A86] hover:bg-[#09476B] text-white px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                    <LogIn size={15} />
                    Entrar
                  </Link>
                </div>
                {/* Solicitar acesso (desktop) */}
                <Link
                  to="/solicitar-acesso"
                  className="hidden md:flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-sm font-medium px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                  Solicitar acesso
                </Link>
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
          {NAV_ITEMS.filter(item => {
            if (item.requiresAdmin && !isAdmin) return false;
            if (item.requiresAuth && !user) return false;
            return true;
          }).map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={close}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? item.adminVariant
                      ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
                      : "bg-sky-50 dark:bg-sky-950/60 text-[#0C5A86] dark:text-sky-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`
              }>
              {item.icon}
              {item.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <Link
                to="/publicar"
                onClick={close}
                className="flex items-center justify-center gap-2 mt-1 bg-[#0C5A86] hover:bg-[#09476B] text-white px-4 py-3.5 rounded-xl text-sm font-semibold transition-colors">
                <PlusCircle size={16} />
                Publicar Anúncio
              </Link>
              <Link
                to="/minha-conta"
                onClick={close}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <User size={16} />
                Minha conta
              </Link>
              <button
                disabled={isSigningOut}
                onClick={handleSignOut}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {isSigningOut ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LogOut size={16} />
                )}
                {isSigningOut ? "Saindo..." : "Sair da conta"}
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
