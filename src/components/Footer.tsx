import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';

const CONTACT_EMAIL = 'lemenezes@gmail.com';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">Maayan</span>
            </Link>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <p className="text-sm text-slate-400 dark:text-slate-500">
              Classificados exclusivos para a comunidade do Condomínio Maayan.
            </p>
          </div>
          <nav className="flex items-center gap-6 text-sm text-slate-400 dark:text-slate-500">
            <Link to="/anuncios" className="hover:text-sky-500 transition-colors">
              Anúncios
            </Link>
            <Link to="/publicar" className="hover:text-sky-500 transition-colors">
              Publicar
            </Link>
          </nav>
        </div>

        {/* Contact row */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-300 dark:text-slate-600">
            © {new Date().getFullYear()} Maayan · Todos os direitos reservados
          </p>
          <div className="flex items-center gap-4 text-xs">
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex items-center gap-1.5 text-slate-400 dark:text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
            >
              <Mail size={13} />
              Dúvidas ou sugestões
            </a>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Reportar%20an%C3%BAncio`}
              className="text-slate-400 dark:text-slate-500 hover:text-red-400 dark:hover:text-red-400 transition-colors"
            >
              Reportar anúncio
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
