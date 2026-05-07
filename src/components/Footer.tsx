import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 mt-16 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <Link to="/" className="inline-flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xs font-bold">M</span>
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-100">Maayan</span>
            </Link>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
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
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-300 dark:text-slate-600">
          © {new Date().getFullYear()} Maayan · Todos os direitos reservados
        </div>
      </div>
    </footer>
  );
}
