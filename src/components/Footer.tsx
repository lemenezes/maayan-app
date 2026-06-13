import { Link } from "react-router-dom";
import { Mail, Flag } from "lucide-react";

const CONTACT_EMAIL = "lemenezes@gmail.com";

export default function Footer() {
  return (
    <footer className="bg-[#0C5A86] border-t border-[#EEF2F7] dark:border-white/5 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 text-white">
        {/* Linha 1: marca + navegação */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-6">
          {/* Brand */}
          <Link to="/" className="inline-flex items-center group">
            <img
              src="/favicon.svg"
              alt="Logo Maayan"
              className="w-30 h-30 flex-shrink-0 group-hover:opacity-75 transition-opacity"
            />
            <div>
              <p className="font-['Cormorant_Garamond'] text-lg font-semibold text-white tracking-wide">
                Maayan
              </p>
              <p className="text-[9px] tracking-[0.2em] uppercase text-white/70">
                Cidade Jardim
              </p>
            </div>
          </Link>

          {/* Links */}
          <nav className="flex items-center gap-4 sm:gap-5 text-sm text-white/80 flex-wrap sm:justify-end">
            <Link
              to="/anuncios"
              className="hover:text-sky-400 transition-colors">
              Anúncios
            </Link>
            <Link
              to="/publicar"
              className="hover:text-sky-400 transition-colors">
              Publicar
            </Link>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 hover:text-sky-400 transition-colors">
              <Mail size={13} />
              Contato
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Reportar%20an%C3%BAncio`}
              className="inline-flex items-center gap-1.5 hover:text-red-400 transition-colors">
              <Flag size={13} />
              Reportar
            </a>
          </nav>
        </div>

        {/* Linha 2: créditos */}
        <div className="pt-1.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-xs text-white/90">
            © {new Date().getFullYear()} Maayan Cidade Jardim · Todos os
            direitos reservados
          </p>
          <p className="text-xs text-white/90 sm:text-right w-full sm:w-auto">
            Desenvolvido por{" "}
            <a
              href="https://leandrom.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:text-sky-200 font-semibold">
              Leandro M.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
