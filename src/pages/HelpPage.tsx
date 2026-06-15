import { useState } from "react";
import {
  ChevronDown,
  ClipboardList,
  FileText,
  MessageCircle,
  Rocket,
  Shield,
  type LucideIcon
} from "lucide-react";

type HelpArticle = {
  title: string;
  body: string;
};

type HelpCategory = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  articles: HelpArticle[];
};

const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: "primeiros-passos",
    title: "Primeiros Passos",
    description: "Comece a usar o portal com segurança e rapidez.",
    icon: Rocket,
    articles: [
      {
        title: "Como acessar o portal",
        body: "Use o mesmo e-mail aprovado no condomínio. Se ainda não tem acesso, clique em Solicitar acesso na tela inicial e aguarde a liberação."
      },
      {
        title: "Como editar meu perfil",
        body: "Entre em Minha conta no menu e atualize seus dados. Salve as alterações para manter suas informações sempre corretas."
      },
      {
        title: "Como alterar meu WhatsApp",
        body: "Na página Minha conta, altere o número de WhatsApp no campo correspondente e confirme para que ele apareça nos seus anúncios."
      }
    ]
  },
  {
    id: "anuncios",
    title: "Anúncios",
    description: "Publique, atualize e finalize seus anúncios sem complicação.",
    icon: FileText,
    articles: [
      {
        title: "⭐ Como publicar meu primeiro anúncio",
        body: "Clique em Publicar, preencha título, preço, categoria e descrição. Depois, adicione fotos e conclua a publicação para aparecer para os moradores."
      },
      {
        title: "Como criar um anúncio",
        body: "Clique em Publicar, preencha título, preço, categoria e descrição. Depois, adicione fotos e conclua a publicação para aparecer para os moradores."
      },
      {
        title: "Como editar um anúncio",
        body: "Abra Meus anúncios, selecione o anúncio e clique em Editar. Ajuste as informações necessárias e salve."
      },
      {
        title: "Como marcar como vendido",
        body: "No detalhe do anúncio ou em Meus anúncios, use a ação Marcar como vendido para sinalizar que o item não está mais disponível."
      },
      {
        title: "Como excluir um anúncio",
        body: "Em Meus anúncios, abra o anúncio e escolha Excluir. Essa ação marca o anúncio como excluído e remove da listagem para os outros moradores."
      }
    ]
  },
  {
    id: "contato",
    title: "Contato",
    description: "Fale com anunciantes de forma rápida e direta.",
    icon: MessageCircle,
    articles: [
      {
        title: "Como falar com um anunciante",
        body: "Nos detalhes do anúncio, use o botão de contato para abrir uma conversa direta com quem publicou."
      },
      {
        title: "Como funciona o WhatsApp",
        body: "O portal usa o número informado pelo anunciante para iniciar a conversa. Verifique se seu WhatsApp está atualizado na Minha conta."
      }
    ]
  },
  {
    id: "conta",
    title: "Conta",
    description: "Acesse e proteja sua conta com tranquilidade.",
    icon: Shield,
    articles: [
      {
        title: "Esqueci minha senha, o que faço",
        body: "Entre em contato com o administrador do portal para receber ajuda com o acesso à sua conta."
      },
      {
        title: "O que fazer se não consigo entrar",
        body: "Confira e-mail e senha e verifique se seu cadastro está aprovado. Se continuar com problema, entre em contato com o administrador do portal."
      }
    ]
  },
  {
    id: "regras",
    title: "Regras",
    description: "Mantenha os anúncios claros e as negociações seguras.",
    icon: ClipboardList,
    articles: [
      {
        title: "Quem pode anunciar",
        body: "Somente usuários autenticados e aprovados no portal podem publicar anúncios para a comunidade."
      },
      {
        title: "Boas práticas",
        body: "Use fotos reais, descrição objetiva, preço atualizado e responda as mensagens com educação e agilidade."
      },
      {
        title: "Segurança nas negociações",
        body: "Prefira combinar entrega em locais seguros do condomínio e confirme detalhes antes de fechar qualquer negociação."
      }
    ]
  }
];

export default function HelpPage() {
  const [openByCategory, setOpenByCategory] = useState<
    Record<string, string | null>
  >({});

  const toggleArticle = (categoryId: string, articleTitle: string) => {
    setOpenByCategory(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] === articleTitle ? null : articleTitle
    }));
  };

  const formatQuestion = (title: string) =>
    title.trim().endsWith("?") ? title.trim() : `${title.trim()}?`;

  return (
    <>
      <section className="relative overflow-hidden bg-[#0A3D62]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0A3D62] via-[#0C5A86] to-[#1DAFD9] opacity-95" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[760px] h-[320px] bg-[#1DAFD9]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[520px] h-[260px] bg-[#0C5A86]/35 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
          <span className="inline-block text-white/70 text-xs sm:text-sm font-medium tracking-widest uppercase px-5 py-1.5 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm mb-7">
            Central de ajuda
          </span>

          <h1 className="font-['Cormorant_Garamond'] text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight tracking-tight mb-4">
            Como podemos te ajudar?
          </h1>

          <p className="text-white/70 text-sm sm:text-base max-w-2xl mx-auto">
            Guias rápidos para moradores sobre acesso, anúncios, contato, conta
            e regras da comunidade.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 right-0 translate-y-[1px]">
          <svg
            viewBox="0 0 1440 56"
            className="w-full text-[#FCFCFB] dark:text-[#071a28]"
            preserveAspectRatio="none">
            <path
              fill="currentColor"
              d="M0,56 C360,0 720,56 1080,28 C1260,14 1380,0 1440,0 L1440,56 Z"
            />
          </svg>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {HELP_CATEGORIES.map(category => {
            const Icon = category.icon;

            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="group rounded-2xl border border-slate-200/80 dark:border-slate-700/70 bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm p-5 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/50 text-[#0C5A86] dark:text-sky-300 mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  {category.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {category.description}
                </p>
              </a>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="space-y-8">
          {HELP_CATEGORIES.map(category => (
            <article
              key={category.id}
              id={category.id}
              className="scroll-mt-28 rounded-3xl border border-slate-200/80 dark:border-slate-700/70 bg-white dark:bg-slate-900 p-5 sm:p-7 shadow-sm">
              <div className="mb-5">
                <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 leading-none mb-2">
                  {category.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {category.description}
                </p>
              </div>

              <div className="space-y-3">
                {category.articles.map(article => {
                  const isOpen = openByCategory[category.id] === article.title;

                  return (
                    <div
                      key={article.title}
                      className="rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 overflow-hidden">
                      <button
                        type="button"
                        onClick={() =>
                          toggleArticle(category.id, article.title)
                        }
                        aria-expanded={isOpen}
                        className="w-full px-4 py-4 sm:px-5 sm:py-4 text-left flex items-center justify-between gap-3 hover:bg-slate-100/70 dark:hover:bg-slate-800/40 transition-colors">
                        <span className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100">
                          {formatQuestion(article.title)}
                        </span>
                        <ChevronDown
                          className={`h-4 w-4 text-slate-500 dark:text-slate-400 transition-transform ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
                          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200/70 dark:border-slate-700/70 pt-3">
                            {article.body}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          ))}

          <article className="rounded-3xl border border-sky-200/80 dark:border-sky-800/60 bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/30 dark:to-slate-900 p-5 sm:p-7 shadow-sm">
            <h3 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-slate-800 dark:text-slate-100 leading-none mb-2">
              Não encontrou sua resposta?
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed mb-5">
              Fale com o responsável pelo portal.
            </p>
            <a
              href="mailto:lemenezes@gmail.com"
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#0C5A86] hover:bg-[#09476B] text-white text-sm font-semibold transition-colors">
              Falar com o responsável
            </a>
          </article>
        </div>
      </section>
    </>
  );
}
