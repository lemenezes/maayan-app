import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Tag, PlusCircle } from 'lucide-react';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" onClick={close} className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">M</span>
            </div>
            <div className="leading-tight">
              <span className="block text-base font-bold bg-gradient-to-r from-sky-500 to-purple-600 bg-clip-text text-transparent">
                Maayan
              </span>
              <span className="hidden sm:block text-xs text-slate-400 font-medium">
                Classificados do Condomínio
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              Início
            </NavLink>
            <NavLink
              to="/anuncios"
              className={({ isActive }) =>
                `px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-sky-50 text-sky-600'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Tag size={14} />
              Anúncios
            </NavLink>
          </nav>

          {/* CTA */}
          <div className="hidden md:block">
            <Link
              to="/publicar"
              className="flex items-center gap-2 bg-gradient-to-r from-sky-500 to-purple-600 text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
            >
              <PlusCircle size={15} />
              Publicar Anúncio
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen((v) => !v)}
            aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 py-4 flex flex-col gap-2">
          <NavLink
            to="/"
            end
            onClick={close}
            className={({ isActive }) =>
              `px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            Início
          </NavLink>
          <NavLink
            to="/anuncios"
            onClick={close}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-sky-50 text-sky-600' : 'text-slate-600 hover:bg-slate-50'
              }`
            }
          >
            <Tag size={16} />
            Anúncios
          </NavLink>
          <Link
            to="/publicar"
            onClick={close}
            className="flex items-center justify-center gap-2 mt-1 bg-gradient-to-r from-sky-500 to-purple-600 text-white px-4 py-3 rounded-xl text-sm font-semibold"
          >
            <PlusCircle size={16} />
            Publicar Anúncio
          </Link>
        </div>
      )}
    </header>
  );
}
