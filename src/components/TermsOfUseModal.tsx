import { useEffect } from "react";
import { X } from "lucide-react";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TermsOfUseModal({
  isOpen,
  onClose
}: TermsOfUseModalProps) {
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
      aria-label="Termos de Uso"
      onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-scale-in"
        onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex justify-end p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
          <button
            onClick={onClose}
            className="w-10 h-10 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            aria-label="Fechar">
            <X size={18} className="text-slate-700 dark:text-slate-200" />
          </button>
        </div>

        <div className="prose prose-sm dark:prose-invert max-w-none p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Termos de Uso
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Última atualização: 15 de junho de 2026
          </p>

          <p className="text-slate-700 dark:text-slate-300 mt-6">
            Ao acessar e usar o portal Maayan, você concorda com estes termos.
            Se não concorda, por favor não use o portal.
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 my-6">
            <p className="text-blue-900 dark:text-blue-100 font-medium m-0">
              <strong>Independência do Portal:</strong> Este portal é uma
              iniciativa independente criada para facilitar anúncios e serviços
              entre moradores. Não possui vínculo oficial com o síndico,
              administração condominial ou comissão de moradores.
            </p>
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            1. Responsabilidade pelo conteúdo
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Você é totalmente responsável por qualquer conteúdo que publica no
            portal, incluindo descrições, imagens, comentários e precisão das
            informações publicadas. Você garante que possui direitos sobre o
            conteúdo e que não viola direitos de terceiros.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            2. Negociações entre moradores
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            O portal apenas conecta moradores. Qualquer transação, negociação ou
            acordo é realizado diretamente entre as partes. O portal não
            intermedia vendas, não processa pagamentos e é isento de
            responsabilidade por problemas nas transações.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            3. Conteúdo proibido
          </h3>
          <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 text-sm">
            <li>Conteúdo ilegal, ofensivo ou discriminatório</li>
            <li>Produtos ou serviços ilegais</li>
            <li>Spam, golpes ou conteúdo enganoso</li>
            <li>Informações pessoais de terceiros sem consentimento</li>
            <li>Conteúdo adulto ou violento</li>
            <li>Publicidade de fora da comunidade</li>
          </ul>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            4. Remoção de conteúdo
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            O administrador do portal pode remover conteúdo que viole estes
            termos ou a Política de Privacidade, seja reportado por moradores,
            contenha material inadequado ou seja spam/duplicado.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            5. Suspensão de conta
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Sua conta pode ser suspensa ou removida em caso de violações
            repetidas, fraude, conteúdo prejudicial, abuso da plataforma ou
            perda de autorização como morador.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            6. Isenção de responsabilidade
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            O portal é fornecido "como está". O administrador não se
            responsabiliza por problemas em transações entre moradores,
            qualidade de produtos/serviços, perdas financeiras,
            indisponibilidade técnica ou conduta de usuários.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            7. Modificações dos termos
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Estes termos podem ser modificados a qualquer momento. Mudanças
            importantes serão comunicadas através do portal. O uso contínuo do
            portal após alterações significa aceite dos novos termos.
          </p>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-6 mb-2">
            8. Contato
          </h3>
          <p className="text-slate-700 dark:text-slate-300 text-sm">
            Dúvidas sobre estes termos ou para reportar violações:
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm mt-2">
            <strong>E-mail:</strong>{" "}
            <a
              href="mailto:lemenezes@gmail.com"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
              lemenezes@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
