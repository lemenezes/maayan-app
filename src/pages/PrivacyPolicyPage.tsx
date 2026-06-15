import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicyPage() {
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
              Política de Privacidade
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Última atualização: 15 de junho de 2026
            </p>
          </div>

          {/* Aviso importante */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-8">
            <p className="text-blue-900 dark:text-blue-100 font-medium m-0">
              <strong>Independência do Portal:</strong> Este portal é uma
              iniciativa independente criada para facilitar anúncios e serviços
              entre moradores. Não possui vínculo oficial com a administração do
              condomínio.
            </p>
          </div>

          {/* Seções */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              1. O que coletamos
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Para usar o Desapega Maayan, coletamos as seguintes informações
              pessoais:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>
                <strong>Nome completo</strong> - para identificação entre
                moradores
              </li>
              <li>
                <strong>E-mail</strong> - para acesso à conta e comunicações
              </li>
              <li>
                <strong>Número de WhatsApp</strong> - para contato entre
                moradores
              </li>
              <li>
                <strong>Bloco e apartamento</strong> - para confirmar que você é
                morador
              </li>
              <li>
                <strong>Anúncios publicados</strong> - produtos, serviços ou
                trocas que você oferece
              </li>
              <li>
                <strong>Histórico de atividade</strong> - para segurança e
                moderação
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              2. Por que coletamos
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Verificar que você é um morador autorizado</li>
              <li>Permitir que você publique e gerencie seus anúncios</li>
              <li>
                Possibilitar que outros moradores entrem em contato com você
              </li>
              <li>Moderação e conformidade com regras da comunidade</li>
              <li>Proteger contra abuso, fraude ou uso indevido do portal</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              3. Quem pode visualizar seus dados
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Seu nome e WhatsApp:</strong> Visíveis apenas para outros
              moradores autenticados que visualizam seus anúncios ou entram em
              contato com você.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Seu bloco e apartamento:</strong> Usados apenas para
              validar seu cadastro e não são exibidos publicamente.
            </p>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              <strong>Administrador do portal:</strong> Tem acesso a todas as
              informações para moderação, segurança e conformidade.
            </p>
            <p className="text-slate-700 dark:text-slate-300">
              <strong>Não vendemos ou compartilhamos</strong> seus dados com
              terceiros de nenhuma forma.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              4. Segurança dos dados
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              Seus dados são armazenados em banco de dados seguro com
              criptografia. Acessos são controlados e monitorados. Realizamos
              backup regularmente para evitar perda de dados.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              5. Como solicitar remoção da conta
            </h2>
            <p className="text-slate-700 dark:text-slate-300 mb-4">
              Se deseja remover sua conta e dados pessoais do portal:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-slate-700 dark:text-slate-300">
              <li>Entre em contato com o administrador do portal</li>
              <li>Solicitaremos confirmação da sua identidade</li>
              <li>Removeremos seus dados dentro de 7 dias úteis</li>
              <li>
                Seus anúncios serão desativados, mas histórico pode ser retido
                por segurança
              </li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              6. Contato
            </h2>
            <p className="text-slate-700 dark:text-slate-300">
              Dúvidas sobre privacidade ou para solicitar acesso/remoção de
              dados:
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

          <section className="mb-12 pt-8 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Esta política pode ser atualizada ocasionalmente. Notificaremos
              sobre mudanças importantes através do portal.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
