import { Link } from 'react-router-dom';
import { Mail, Flag } from 'lucide-react';

const CONTACT_EMAIL = 'lemenezes@gmail.com';

export default function Footer() {
  return (
    <footer className="bg-[#FCFCFB] dark:bg-[#071520] border-t border-[#EEF2F7] dark:border-white/5 mt-20 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Main row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-8">

          {/* Brand */}
          <Link to="/" className="inline-flex items-center gap-3 group">
            <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9 flex-shrink-0" aria-hidden="true">
              <defs>
                <linearGradient id="fg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0C5A86" />
                  <stop offset="100%" stopColor="#1DAFD9" />
                </linearGradient>
              </defs>
              <circle cx="20" cy="18" r="14" stroke="url(#fg)" strokeWidth="1.5" fill="none" opacity="0.4" />
              <ellipse cx="20" cy="29" rx="8" ry="2.2" stroke="url(#fg)" strokeWidth="1.2" fill="none" />
              <ellipse cx="20" cy="29" rx="4.5" ry="1.3" stroke="url(#fg)" strokeWidth="0.8" fill="none" />
              <line x1="20" y1="29" x2="20" y2="19" stroke="url(#fg)" strokeWidth="2" strokeLinecap="round" />
              <path d="M20 19 C17 15.5 14 13.5 13.5 10" stroke="url(#fg)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M20 19 C23 15.5 26 13.5 26.5 10" stroke="url(#fg)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
              <path d="M20 19 C18.8 15 18 12.5 20 10" stroke="url(#fg)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
              <path d="M20 8 C19 10 18.2 11.2 18.2 12C18.2 12.88 19 13.6 20 13.6C21 13.6 21.8 12.88 21.8 12C21.8 11.2 21 10 20 8Z" fill="url(#fg)" />
            </svg>
            <div>
              <p className="font-['Cormorant_Garamond'] text-lg font-semibold text-[#0C5A86] dark:text-white tracking-wide group-hover:opacity-75 transition-opacity">
                Maayan
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">
                Cidade Jardim
              </p>
            </div>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
            <Link to="/anuncios" className="hover:text-[#0C5A86] dark:hover:text-sky-400 transition-colors">
              Anúncios
            </Link>
            <Link to="/publicar" className="hover:text-[#0C5A86] dark:hover:text-sky-400 transition-colors">
              Publicar
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 hover:text-[#0C5A86] dark:hover:text-sky-400 transition-colors"
            >
              <Mail size={13} />
              Contato
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Reportar%20an%C3%BAncio`}
              className="inline-flex items-center gap-1.5 hover:text-red-400 transition-colors"
            >
              <Flag size={13} />
              Reportar
            </a>
          </nav>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-[#EEF2F7] dark:border-white/5">
          <p className="text-xs text-slate-400 dark:text-slate-600">
            © {new Date().getFullYear()} Maayan Cidade Jardim · Todos os direitos reservados
          </p>
        </div>

      </div>
    </footer>
  );
}
