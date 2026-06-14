import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { ChevronUp } from "lucide-react";
import Header from "./Header";
import Footer from "./Footer";

export default function Layout() {
  const { pathname, search } = useLocation();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname, search]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 320);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleBackToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />

      {showBackToTop && (
        <button
          type="button"
          onClick={handleBackToTop}
          aria-label="Voltar ao topo"
          className="fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-[#0C5A86] bg-sky-100 text-[#0C5A86] transition-all hover:bg-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:ring-offset-2 focus:ring-offset-white dark:border-sky-400 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-900/50 dark:focus:ring-offset-slate-900">
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}
