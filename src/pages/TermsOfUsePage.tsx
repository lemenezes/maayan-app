import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      {/* Header com volta */}
      <div className="border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors">
            <ArrowLeft size={18} />
            Voltar
          </Link>
        </div>
      </div>

      {/* Conteúdo */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {/* Título */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Termos de Uso
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Última atualização: 15 de junho de 2026
            </p>
          </div>

          {/* Introdução */}
          <p className="text-slate-700 dark:text-slate-300 mb-8">
            Ao acessar e usar o portal Maayan, você concorda com estes termos.
            Se não concorda, por favor não use o portal.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-900 dark:text-blue-100 font-medium m-0">
              <strong>Independência do Portal:</strong> Este portal é uma
              iniciativa independente criada para facilitar anúncios e serviços
              entre moradores. Não possui vínculo oficial com o síndico,
              administração condominial ou comissão de moradores.
            </p>
          </div>

          {/* Seções */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. Responsabilidade pelo conteúdo
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Você é totalmente responsável por qualquer conteúdo que publica no
              portal, incluindo:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Descrições e informações sobre produtos/serviços</li>
              <li>Fotos e imagens compartilhadas</li>
              <li>Comentários e avaliações</li>
              <li>Precisão das informações publicadas</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              Você garante que possui direitos sobre o conteúdo e que não viola
              direitos de terceiros.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Negociações entre moradores
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              O portal apenas conecta moradores. Qualquer transação, negociação
              ou acordo é realizado diretamente entre vocês:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>O portal não intermedija vendas ou trocas</li>
              <li>O portal não processa pagamentos</li>
              <li>Negociações de preço/condições são entre vocês</li>
              <li>Disputes serão resolvidos diretamente entre as partes</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              O portal é isento de responsabilidade por problemas em transações
              realizadas entre moradores.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Conteúdo proibido
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Não é permitido publicar:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Conteúdo ilegal, ofensivo ou discriminatório</li>
              <li>Produtos ou serviços ilegais</li>
              <li>Spam, golpes ou conteúdo enganoso</li>
              <li>Informações pessoais de terceiros sem consentimento</li>
              <li>Conteúdo adulto ou violento</li>
              <li>Publicidade de fora da comunidade</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Remoção de conteúdo
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              O administrador do portal pode remover conteúdo que:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Viole estes termos ou a Política de Privacidade</li>
              <li>Seja reportado por outros moradores</li>
              <li>Contenha conteúdo inadequado ou prejudicial</li>
              <li>Seja spam ou duplicado</li>
            </ul>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              A remoção pode ser imediata, sem aviso prévio em casos graves.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Suspensão de conta
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Sua conta pode ser suspensa ou removida se:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Violar repetidamente estes termos</li>
              <li>Publicar conteúdo ilegítimo ou prejudicial</li>
              <li>Realizar fraude, golpes ou uso abusivo</li>
              <li>Usar múltiplas contas para burlar regras</li>
              <li>Não ser mais um morador autorizado do condomínio</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Isenção de responsabilidade
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              O portal é fornecido "como está". O administrador não é
              responsável por:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Problemas em transações entre moradores</li>
              <li>Qualidade ou legitimidade de produtos/serviços</li>
              <li>Perdas financeiras ou danos</li>
              <li>Indisponibilidade ou erros técnicos do portal</li>
              <li>Conduta de outros moradores</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              7. Modificações dos termos
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              Reservamos o direito de modificar estes termos a qualquer momento.
              Mudanças importantes serão comunicadas através do portal.
              Continuar usando o portal após mudanças significa aceitar os novos
              termos.
            </p>
          </section>

          <section className="mb-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              8. Contato
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              Dúvidas sobre estes termos ou para reportar violações:
            </p>
            <p className="text-slate-700 dark:text-slate-300 mt-4">
              <strong>E-mail:</strong>{" "}
              <a
                href="mailto:lemenezes@gmail.com"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
                lemenezes@gmail.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
