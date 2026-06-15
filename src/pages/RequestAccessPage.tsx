import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Home,
  User,
  Mail,
  Phone,
  Building,
  CheckCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useLoadingOverlay } from "../context/LoadingOverlayContext";
import { submitAccessRequest } from "../services/accessRequestsService";
import PrivacyPolicyModal from "../components/PrivacyPolicyModal";

const inputBase =
  "w-full bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-[#38B6D9]/40 transition-all duration-150 shadow-sm";

function normalizePhoneDigits(value: string): string {
  const digitsOnly = value.replace(/\D/g, "");
  const withoutCountryCode =
    digitsOnly.length > 11 && digitsOnly.startsWith("55")
      ? digitsOnly.slice(2)
      : digitsOnly;
  return withoutCountryCode.slice(0, 11);
}

function formatWhatsappMask(value: string): string {
  const digits = normalizePhoneDigits(value);

  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length <= 4) return `(${ddd}) ${rest}`;

  if (digits.length <= 10) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4, 8)}`;
  }

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5, 9)}`;
}

function sanitizeBlockInput(value: string, previousValue: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 1);
  if (!digits) return "";
  if (!/^[1-4]$/.test(digits)) return previousValue;
  return digits;
}

function sanitizeApartmentInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 4);
}

function sanitizeFullNameInput(value: string): string {
  const normalized = value.normalize("NFC");

  return normalized
    .replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^\s/, "");
}

function isValidFullName(value: string): boolean {
  const trimmed = value.normalize("NFC").trim();
  if (!trimmed) return false;

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) return false;

  return words.every(word => /^[A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(word));
}

function hasAtLeastTwoNameParts(value: string): boolean {
  return value.trim().split(/\s+/).filter(Boolean).length >= 2;
}

function isStrictEmail(value: string): boolean {
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@([^\s@.]+\.)+[^\s@.]{2,}$/.test(email);
}

export default function RequestAccessPage() {
  type FieldKey =
    | "full_name"
    | "email"
    | "whatsapp"
    | "block"
    | "apartment"
    | "password"
    | "confirm_password";

  const emailInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    block: "",
    apartment: "",
    password: "",
    confirm_password: "",
    message: ""
  });
  const [agreedToPrivacyPolicy, setAgreedToPrivacyPolicy] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ [k: string]: string }>({});
  const [privacyError, setPrivacyError] = useState<string | null>(null);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [isComposingFullName, setIsComposingFullName] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const { user, session, loading } = useAuth();
  const { withLoading } = useLoadingOverlay();

  const hasActiveSession = Boolean(session ?? user);

  const validateField = (field: FieldKey, value: string): string | null => {
    if (field === "full_name") {
      if (!value.trim()) return "Informe seu nome completo.";
      if (!hasAtLeastTwoNameParts(value)) {
        return "Informe nome e sobrenome.";
      }
      if (!isValidFullName(value)) {
        return "Nome completo deve conter apenas letras e espaços.";
      }
      return null;
    }

    if (field === "email") {
      const email = value.trim();
      if (!email) return "Informe seu e-mail.";

      const nativeEmailValid = emailInputRef.current?.validity.valid ?? true;
      if (!nativeEmailValid || !isStrictEmail(email)) {
        return "Informe um e-mail válido (ex: nome@exemplo.com.br).";
      }

      return null;
    }

    if (field === "whatsapp") {
      const digits = normalizePhoneDigits(value);
      if (!digits) return "Informe seu WhatsApp.";
      if (digits.length < 10) return "Informe um WhatsApp válido com DDD.";
      return null;
    }

    if (field === "block") {
      if (!value.trim()) return "Informe o bloco (1 a 4).";
      if (!/^[1-4]$/.test(value.trim())) {
        return "Bloco deve ser um número entre 1 e 4.";
      }
      return null;
    }

    if (field === "password") {
      if (!value) return "Crie uma senha.";
      if (value.length < 6) {
        return "A senha precisa ter pelo menos 6 caracteres.";
      }
      return null;
    }

    if (field === "confirm_password") {
      if (!value) return "Confirme sua senha.";
      if (value !== form.password) {
        return "A confirmação da senha não confere.";
      }
      return null;
    }

    const apartmentDigits = value.replace(/\D/g, "");
    if (!apartmentDigits) return "Informe o apartamento.";
    if (!/^\d{3,4}$/.test(apartmentDigits)) {
      return "Apartamento deve ter de 3 a 4 dígitos.";
    }
    return null;
  };

  const setFieldError = (field: FieldKey, nextError: string | null) => {
    setFieldErrors(prev => {
      if (!nextError) {
        const { [field]: _ignored, ...rest } = prev;
        return rest;
      }
      return { ...prev, [field]: nextError };
    });
  };

  const handleFieldBlur = (field: FieldKey) => () => {
    setFieldError(field, validateField(field, form[field]));
  };

  const handleEmailBlur = () => {
    setEmailFocused(false);
    handleFieldBlur("email")();
  };

  const handleFullNameCompositionEnd = (
    e: React.CompositionEvent<HTMLInputElement>
  ) => {
    setIsComposingFullName(false);

    const sanitized = sanitizeFullNameInput(e.currentTarget.value);
    setForm(f => ({ ...f, full_name: sanitized }));

    if (submitAttempted) {
      setFieldError("full_name", validateField("full_name", sanitized));
    }
  };

  const set =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const rawValue = e.target.value;
      let value = rawValue;

      if (field === "full_name") {
        value = isComposingFullName
          ? rawValue
          : sanitizeFullNameInput(rawValue);
      }
      if (field === "whatsapp") value = formatWhatsappMask(rawValue);

      setForm(f => {
        if (field === "block") {
          return { ...f, block: sanitizeBlockInput(rawValue, f.block) };
        }

        if (field === "apartment") {
          return { ...f, apartment: sanitizeApartmentInput(rawValue) };
        }

        return { ...f, [field]: value };
      });

      const validationValue =
        field === "block"
          ? sanitizeBlockInput(rawValue, form.block)
          : field === "apartment"
            ? sanitizeApartmentInput(rawValue)
            : value;

      if (
        submitAttempted &&
        (field === "full_name" ||
          field === "whatsapp" ||
          field === "block" ||
          field === "apartment" ||
          field === "password" ||
          field === "confirm_password")
      ) {
        if (field === "full_name" && isComposingFullName) return;
        setFieldError(field, validateField(field, validationValue));
      }

      if (field === "email" && submitAttempted && !emailFocused) {
        setFieldError("email", validateField("email", value));
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitAttempted(true);

    // Validar aceite da política
    if (!agreedToPrivacyPolicy) {
      setPrivacyError(
        "Você deve concordar com os Termos de Uso e a Política de Privacidade."
      );
      return;
    }
    setPrivacyError(null);

    const errors: { [k: string]: string } = {};
    const fieldsToValidate: FieldKey[] = [
      "full_name",
      "email",
      "whatsapp",
      "block",
      "apartment",
      "password",
      "confirm_password"
    ];

    fieldsToValidate.forEach(field => {
      const nextError = validateField(field, form[field]);
      if (nextError) errors[field] = nextError;
    });

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const whatsappDigits = normalizePhoneDigits(form.whatsapp);
    const apartmentDigits = form.apartment.replace(/\D/g, "");

    setSubmitting(true);
    try {
      await withLoading("Enviando solicitação...", async () => {
        await submitAccessRequest({
          full_name: form.full_name.trim(),
          email: form.email.trim().toLowerCase(),
          whatsapp: whatsappDigits,
          block: form.block.trim(),
          apartment: apartmentDigits,
          password: form.password,
          message: form.message.trim() || undefined
        });
      });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar solicitação."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
        <div className="w-full max-w-xl min-h-[420px] text-center flex flex-col justify-center mx-auto">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle
              className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-white mb-3">
            Solicitação enviada!
          </h2>
          <p className="text-white text-sm leading-relaxed mb-2">
            Sua solicitação foi recebida e será analisada pelo administrador do
            site.
          </p>

          <p className="text-white text-sm mb-8">
            Você receberá um e-mail em{" "}
            <strong className="text-white">{form.email}</strong> quando seu
            acesso for liberado. Depois, é só entrar com a senha que você acabou
            de criar.
          </p>
          <div className="flex justify-center">
            <Link to="/" className="text-white underline underline-offset-4">
              ← Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!loading && hasActiveSession) {
    return (
      <div className="min-h-[calc(100vh-80px-260px)] flex items-center justify-center px-4 py-16 sm:py-24 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
        <div className="w-full max-w-xl text-center flex flex-col items-center mx-auto">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-950/40 rounded-2xl flex items-center justify-center mx-auto mb-5 border border-sky-200 dark:border-sky-800">
            <CheckCircle
              className="w-8 h-8 text-sky-600 dark:text-sky-400"
              strokeWidth={1.5}
            />
          </div>
          <h2 className="font-['Cormorant_Garamond'] text-3xl font-semibold text-white mb-3">
            Você já está conectado ao Maayan Desapego.
          </h2>
          <p className="text-white text-sm leading-relaxed mb-8">
            Para continuar navegando, use o menu superior ou volte para a página
            inicial.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 bg-white text-[#0C5A86] px-6 py-3 rounded-xl font-semibold text-sm shadow-lg hover:bg-sky-50 hover:shadow-xl hover:scale-[1.03] focus:scale-[1.03] active:scale-95 transition-all duration-150 outline-none focus:ring-2 focus:ring-white/40">
            Voltar para página inicial
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center px-4 pt-6 pb-14 sm:pt-8 sm:pb-20 bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9]">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 max-w-4xl mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0C5A86]/10 to-[#1DAFD9]/10 dark:from-[#0C5A86]/20 dark:to-[#1DAFD9]/20 flex items-center justify-center mx-auto mb-5 border-1 border-[#0C5A86]/50 dark:border-sky-400/50">
            <Home
              className="w-6 h-6 text-white dark:text-sky-400"
              strokeWidth={1.5}
            />
          </div>
          <h1 className="font-['Cormorant_Garamond'] text-3xl sm:text-4xl font-semibold text-white mb-2">
            <span className="text-white">
              Bem-vindo ao portal do Maayan Cidade Jardim
            </span>
          </h1>
          <p className="text-white text-sm leading-relaxed">
            Solicite seu acesso preenchendo os dados abaixo. O administrador do
            portal validará as informações antes da aprovação do cadastro. Você
            receberá uma notificação por e-mail após a análise da solicitação.
          </p>
        </div>

        {/* Form */}
        <form
          noValidate
          onSubmit={handleSubmit}
          className="space-y-4 max-w-2xl mx-auto">
          {/* Nome */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Nome completo *</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={form.full_name}
                onChange={set("full_name")}
                onCompositionStart={() => setIsComposingFullName(true)}
                onCompositionEnd={handleFullNameCompositionEnd}
                onBlur={handleFieldBlur("full_name")}
                placeholder="Seu nome completo"
                className={`${inputBase} pl-10`}
                autoComplete="name"
              />
            </div>
            {fieldErrors.full_name && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.full_name}
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">E-mail *</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={emailInputRef}
                type="email"
                value={form.email}
                onChange={set("email")}
                onFocus={() => setEmailFocused(true)}
                onBlur={handleEmailBlur}
                placeholder="nome@exemplo.com"
                className={`${inputBase} pl-10`}
                autoComplete="email"
              />
            </div>
            {fieldErrors.email && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.email}
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">WhatsApp *</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="tel"
                value={form.whatsapp}
                onChange={set("whatsapp")}
                onBlur={handleFieldBlur("whatsapp")}
                inputMode="numeric"
                placeholder="(21) 99999-9999"
                className={`${inputBase} pl-10`}
                autoComplete="tel"
              />
            </div>
            {fieldErrors.whatsapp && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.whatsapp}
              </div>
            )}
            <p className="mt-1.5 text-xs text-white/90 leading-relaxed">
              Este número poderá ser utilizado pelo administrador do portal para
              contato relacionado à análise e aprovação do seu cadastro. Após a
              aprovação, ele também poderá ser exibido como forma de contato em
              anúncios publicados por você.
            </p>
          </div>

          {/* Senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Senha *</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                onBlur={handleFieldBlur("password")}
                placeholder="Mínimo de 6 caracteres"
                className={`${inputBase} pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(prev => !prev)}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.password && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.password}
              </div>
            )}
          </div>

          {/* Confirmar senha */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Confirmar senha *</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={form.confirm_password}
                onChange={set("confirm_password")}
                onBlur={handleFieldBlur("confirm_password")}
                placeholder="Digite novamente sua senha"
                className={`${inputBase} pr-11`}
                autoComplete="new-password"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword(prev => !prev)}
                aria-label={
                  showConfirmPassword ? "Ocultar senha" : "Mostrar senha"
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
            {fieldErrors.confirm_password && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {fieldErrors.confirm_password}
              </div>
            )}
          </div>

          {/* Bloco + Apartamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="text-white">Bloco *</span>
              </label>
              <div className="relative">
                <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={form.block}
                  onChange={set("block")}
                  onBlur={handleFieldBlur("block")}
                  placeholder="Ex: 1, 2, 3 ou 4"
                  maxLength={1}
                  inputMode="numeric"
                  className={`${inputBase} pl-10`}
                />
              </div>
              {fieldErrors.block && (
                <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                  {fieldErrors.block}
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                <span className="text-white">Apartamento *</span>
              </label>
              <input
                type="text"
                value={form.apartment}
                onChange={set("apartment")}
                onBlur={handleFieldBlur("apartment")}
                placeholder="Ex.: 999"
                maxLength={4}
                inputMode="numeric"
                className={inputBase}
              />
              {fieldErrors.apartment && (
                <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                  {fieldErrors.apartment}
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-white/90 leading-relaxed -mt-1">
            Essas informações serão utilizadas para validar que você é morador
            do condomínio. Elas não serão exibidas para outros usuários.
          </p>

          {/* Mensagem */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              <span className="text-white">Mensagem (opcional)</span>
            </label>
            <textarea
              value={form.message}
              onChange={set("message")}
              placeholder="Alguma informação adicional para o administrador do portal?"
              rows={3}
              className={`${inputBase} resize-none`}
            />
          </div>

          {error && (
            <p className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          {/* Checkbox - Termos e Política */}
          <div className="pt-2">
            <div className="flex items-start gap-3 group">
              <input
                type="checkbox"
                checked={agreedToPrivacyPolicy}
                onChange={e => {
                  setAgreedToPrivacyPolicy(e.target.checked);
                  if (e.target.checked) {
                    setPrivacyError(null);
                  }
                }}
                className="w-5 h-5 mt-0.5 rounded border-2 border-white/50 bg-white/10 checked:bg-white checked:border-white text-[#0C5A86] cursor-pointer accent-[#0C5A86] focus:ring-2 focus:ring-white/40 transition-colors flex-shrink-0"
              />
              <span className="text-white text-sm leading-relaxed">
                Li e concordo com os{" "}
                <Link
                  to="/termos-de-uso"
                  onClick={e => e.stopPropagation()}
                  className="underline underline-offset-2 hover:text-white/80 transition-colors text-white font-inherit">
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <button
                  type="button"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsPrivacyModalOpen(true);
                  }}
                  className="underline underline-offset-2 hover:text-white/80 transition-colors bg-none border-none p-0 cursor-pointer text-white font-inherit">
                  Política de Privacidade
                </button>
                .*
              </span>
            </div>
            {privacyError && (
              <div className="mt-2 bg-white dark:bg-slate-900/80 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-xs px-3 py-2 rounded-xl animate-fade-in">
                {privacyError}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#0C5A86] text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:bg-[#1DAFD9] focus:bg-[#1DAFD9] hover:text-[#0C5A86] focus:text-[#0C5A86] hover:shadow-xl focus:shadow-xl hover:scale-[1.03] focus:scale-[1.03] active:scale-95 transition-all duration-150 flex items-center justify-center gap-2 mt-2 outline-none ring-2 ring-transparent focus:ring-[#38B6D9]/40">
            {submitting ? "Enviando..." : "Enviar solicitação"}
          </button>

          <p className="text-xs text-white/90 leading-relaxed text-center">
            Ao enviar a solicitação, você concorda com o uso dessas informações
            para validação do seu cadastro de morador.
          </p>
        </form>
        <PrivacyPolicyModal
          isOpen={isPrivacyModalOpen}
          onClose={() => setIsPrivacyModalOpen(false)}
        />
      </div>
    </div>
  );
}
