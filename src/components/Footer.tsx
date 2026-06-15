import { Link } from "react-router-dom";
import { Mail, Flag } from "lucide-react";

const CONTACT_EMAIL = "lemenezes@gmail.com";

export default function Footer() {
  return (
    <footer className="bg-[#0C5A86] border-t border-white/10 dark:border-white/5 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 text-white">
        {/* Corpo: brand + links */}
        <div className="flex flex-col sm:flex-row justify-between items-start gap-8">
          {/* Coluna esquerda: brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="inline-flex items-center group">
              <img
                src="/favicon.svg"
                alt="Logo Maayan"
                className="w-20 h-20 flex-shrink-0 group-hover:opacity-75 transition-opacity"
              />
              <div>
                <p className="font-['Cormorant_Garamond'] text-xl font-semibold text-white tracking-wide leading-tight">
                  Maayan
                </p>
                <p className="text-[9px] tracking-[0.2em] uppercase text-white/70">
                  Cidade Jardim
                </p>
              </div>
            </Link>
            <p className="text-sm text-white/70 leading-relaxed">
              Conectando moradores, anúncios e informações do Maayan Cidade
              Jardim.
            </p>
          </div>

          {/* Coluna direita: navegação */}
          <nav className="flex flex-col gap-2 pt-6">
            <p className="text-[11px] tracking-[0.18em] uppercase text-white/50 font-semibold mb-1">
              Navegação
            </p>
            <div className="flex items-center gap-6 pt-6 flex-wrap">
              <Link
                to="/anuncios"
                className="text-sm text-white/80 hover:text-white transition-colors">
                Anúncios
              </Link>
              <Link
                to="/publicar"
                className="text-sm text-white/80 hover:text-white transition-colors">
                Publicar
              </Link>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white transition-colors">
                <Mail size={13} />
                Contato
              </a>
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Reportar%20an%C3%BAncio`}
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-red-300 transition-colors">
                <Flag size={13} />
                Reportar
              </a>
              <Link
                to="/politica-de-privacidade"
                className="text-sm text-white/80 hover:text-white transition-colors">
                Privacidade
              </Link>
              <Link
                to="/termos-de-uso"
                className="text-sm text-white/80 hover:text-white transition-colors">
                Termos
              </Link>
            </div>
          </nav>
        </div>

        {/* Linha divisória */}
        <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} Maayan Cidade Jardim · Todos os
            direitos reservados
          </p>
          <p className="text-xs text-white/60 sm:text-right">
            Desenvolvido por{" "}
            <a
              href="https://leandrom.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/80 underline hover:text-white font-semibold transition-colors">
              Leandro M.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
