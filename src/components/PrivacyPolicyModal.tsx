import { useEffect } from "react";
import { X } from "lucide-react";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyModal({
  isOpen,
  onClose
}: PrivacyPolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Política de Privacidade"
      onClick={onClose}>
      {/* Modal */}
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}>
        {/* Close button */}
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Fechar">
            <X size={18} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        {/* Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Política de Privacidade
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Última atualização: 15 de junho de 2026
          </p>

          {/* Aviso importante */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
            <p className="text-blue-900 dark:text-blue-100 font-medium m-0">
              <strong>Independência do Portal:</strong> Este portal é uma
              iniciativa independente criada para facilitar anúncios e serviços
              entre moradores. Não possui vínculo oficial com o síndico,
              administração condominial ou comissão de moradores.
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            Responsável pelo portal
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-1">
            <strong>Leandro Miglioli</strong>
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Caso deseje solicitar correção ou remoção dos seus dados, entre em
            contato com o administrador do portal.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            1. O que coletamos
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Para utilizar o portal Maayan, coletamos as seguintes informações:
          </p>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
            <li>
              <strong>Nome completo</strong> - para identificação entre
              moradores
            </li>
            <li>
              <strong>E-mail</strong> - para acesso à conta e comunicações
            </li>
            <li>
              <strong>Número de WhatsApp</strong> - para contato entre moradores
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

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            2. Por que coletamos
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
            <li>Verificar que você é um morador autorizado</li>
            <li>Permitir que você publique e gerencie seus anúncios</li>
            <li>
              Possibilitar que outros moradores entrem em contato com você
            </li>
            <li>Moderação e conformidade com regras da comunidade</li>
            <li>Proteger contra abuso, fraude ou uso indevido do portal</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            3. Quem pode visualizar seus dados
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            <strong>Seu nome e WhatsApp:</strong> Visíveis apenas para outros
            moradores autenticados que visualizam seus anúncios ou entram em
            contato com você.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            <strong>Seu bloco e apartamento:</strong> Usados apenas para validar
            seu cadastro e não são exibidos publicamente.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            <strong>Administrador do portal:</strong> Tem acesso a todas as
            informações para moderação, segurança e conformidade.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            <strong>Não vendemos ou compartilhamos</strong> seus dados com
            terceiros de nenhuma forma.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            4. Segurança dos dados
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Seus dados são armazenados em banco de dados seguro com
            criptografia. Acessos são controlados e monitorados. Realizamos
            backup regularmente para evitar perda de dados.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            5. Como solicitar remoção da conta
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm mb-2">
            Se deseja remover sua conta e dados pessoais do portal:
          </p>
          <ol className="list-decimal list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
            <li>Entre em contato com o administrador do portal</li>
            <li>Solicitaremos confirmação da sua identidade</li>
            <li>Removeremos seus dados dentro de 7 dias úteis</li>
            <li>
              Seus anúncios serão desativados, mas histórico pode ser retido por
              segurança
            </li>
          </ol>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            6. Contato
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Dúvidas sobre privacidade ou para solicitar acesso/remoção de dados:
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm mt-2">
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:lemenezes@gmail.com"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
              lemenezes@gmail.com
            </a>
          </p>

          <p className="text-xs text-slate-600 dark:text-slate-400 mt-8 pt-4 border-t border-slate-200 dark:border-slate-700">
            Esta política pode ser atualizada ocasionalmente. Notificaremos
            sobre mudanças importantes através do portal.
          </p>
        </div>
      </div>
    </div>
  );
}
