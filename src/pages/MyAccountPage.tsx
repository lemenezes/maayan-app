import { useEffect, useState } from "react";
import {
  ChevronRight,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { supabase } from "../lib/supabase";

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);

  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function MyAccountPage() {
  const { user, profile, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
    setEmailInput(profile?.email ?? user?.email ?? "");
    setWhatsapp(formatPhone(profile?.whatsapp ?? ""));
  }, [profile, user?.email]);

  const email = emailInput;
  const block = profile?.block ?? "Nao informado";
  const apartment = profile?.apartment ?? "Nao informado";
  const normalizedName = fullName.trim();
  const normalizedEmail = emailInput.trim().toLowerCase();
  const currentName = (profile?.full_name ?? "").trim();
  const currentEmail = (profile?.email ?? user?.email ?? "")
    .trim()
    .toLowerCase();
  const phoneDigits = whatsapp.replace(/\D/g, "");
  const currentPhoneDigits = (profile?.whatsapp ?? "").replace(/\D/g, "");
  const hasProfileChanges =
    normalizedName !== currentName ||
    normalizedEmail !== currentEmail ||
    phoneDigits !== currentPhoneDigits;
  const isNameValid = normalizedName.length > 0;
  const isEmailValid = /^\S+@\S+\.\S+$/.test(normalizedEmail);
  const isPhoneFilled = phoneDigits.length > 0;
  const isPhoneValid = phoneDigits.length >= 10;
  const canSubmitProfile =
    hasProfileChanges && isNameValid && isEmailValid && isPhoneValid;
  const nameHint = !isNameValid
    ? "Preencha o campo Nome completo para salvar."
    : null;
  const emailHint = !normalizedEmail
    ? "Preencha o campo E-mail para salvar."
    : !isEmailValid
      ? "Informe um e-mail valido."
      : null;
  const phoneHint = !isPhoneFilled
    ? "Preencha o campo WhatsApp para salvar."
    : !isPhoneValid
      ? "WhatsApp deve ter pelo menos 10 digitos com DDD."
      : null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!hasProfileChanges) return;

    setProfileError(null);

    if (!normalizedName) {
      setProfileError("Informe seu nome completo.");
      return;
    }

    if (!normalizedEmail) {
      setProfileError("Informe seu e-mail.");
      return;
    }

    if (!isEmailValid) {
      setProfileError("Informe um e-mail valido.");
      return;
    }

    if (!phoneDigits) {
      setProfileError("Informe seu telefone / WhatsApp.");
      return;
    }

    if (phoneDigits.length < 10) {
      setProfileError("Informe um telefone valido com DDD.");
      return;
    }

    setSavingProfile(true);
    try {
      if (normalizedEmail !== currentEmail) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({
          email: normalizedEmail
        });

        if (emailUpdateError) throw emailUpdateError;
      }

      const { data: updatedProfile, error } = await supabase
        .from("profiles")
        .update({
          full_name: normalizedName,
          email: normalizedEmail,
          whatsapp: phoneDigits ? formatPhone(phoneDigits) : null
        })
        .eq("id", user.id)
        .select("id, full_name, email, whatsapp")
        .maybeSingle();

      if (error) throw error;
      if (!updatedProfile) {
        throw new Error(
          "Nao foi possivel salvar seu perfil. Verifique suas permissoes de acesso."
        );
      }

      await refreshProfile();
      showToast("Perfil atualizado com sucesso.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel atualizar seu perfil.";
      setProfileError(message);
      showToast("Erro ao atualizar perfil. Tente novamente.", "error");
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordError(null);

    if (!newPassword) {
      const message = "Informe a nova senha.";
      setPasswordError(message);
      showToast(message, "error");
      return;
    }

    if (newPassword.length < 6) {
      const message = "A nova senha deve ter pelo menos 6 caracteres.";
      setPasswordError(message);
      showToast(message, "error");
      return;
    }

    if (!confirmNewPassword) {
      const message = "Confirme a nova senha.";
      setPasswordError(message);
      showToast(message, "error");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      const message = "Nova senha e confirmação precisam ser iguais.";
      setPasswordError(message);
      showToast(message, "error");
      return;
    }

    setChangingPassword(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      setNewPassword("");
      setConfirmNewPassword("");
      setPasswordError(null);
      showToast("Senha alterada com sucesso.");
      setIsPasswordModalOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Nao foi possivel alterar a senha.";
      setPasswordError(message);
      showToast(message, "error");
    } finally {
      setChangingPassword(false);
    }
  };

  const inputBase =
    "w-full px-4 py-3 rounded-xl border bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm outline-none transition-all";

  const openPasswordModal = () => {
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (changingPassword) return;
    setIsPasswordModalOpen(false);
    setPasswordError(null);
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPasswords(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-7 sm:py-9">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
          Minha conta
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Atualize seus dados de contato e informações da sua conta.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12 lg:items-stretch">
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-5 shadow-sm lg:col-span-7 h-full flex flex-col">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-[#0C5A86] dark:text-sky-400">
              <UserRound size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Dados pessoais
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Informações básicas da sua conta.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSaveProfile}
            className="grid gap-3 h-full"
            noValidate>
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome Completo
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={e => {
                  setFullName(e.target.value);
                  setProfileError(null);
                }}
                placeholder="Seu nome completo"
                className={`${inputBase} border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
              />
              {!savingProfile && nameHint && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                  {nameHint}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    setProfileError(null);
                  }}
                  placeholder="seunome@email.com"
                  className={`${inputBase} pl-10 border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
                />
              </div>
              {!savingProfile && emailHint && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                  {emailHint}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Telefone / WhatsApp
              </label>
              <div className="relative">
                <Phone
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  id="whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={e => {
                    setWhatsapp(formatPhone(e.target.value));
                    setProfileError(null);
                  }}
                  placeholder="(11) 99999-9999"
                  className={`${inputBase} pl-10 border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5">
                Este número poderá ser exibido nos anúncios que você publicar
                para que moradores aprovados possam entrar em contato.
              </p>
              {!savingProfile && phoneHint && (
                <p className="text-xs text-red-600 dark:text-red-400 mt-1.5">
                  {phoneHint}
                </p>
              )}
            </div>

            {profileError && (
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm px-4 py-3">
                {profileError}
              </div>
            )}

            <div className="pt-0.5 mt-auto">
              <button
                type="submit"
                disabled={savingProfile || !canSubmitProfile}
                className="inline-flex items-center justify-center gap-2 bg-[#0C5A86] hover:bg-[#09476B] text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                {savingProfile ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Salvar dados pessoais
              </button>
            </div>
          </form>
        </section>

        <div className="lg:col-span-5 space-y-4">
          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-400">
                <Building2 size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Dados do condomínio
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Dados vinculados ao seu cadastro.
                </p>
              </div>
            </div>

            <dl className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              <div className="py-3 flex items-center gap-2">
                <dt className="text-slate-500 dark:text-slate-400">Bloco</dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {block}
                </dd>
              </div>
              <div className="pt-3 flex items-center gap-2">
                <dt className="text-slate-500 dark:text-slate-400">
                  Apartamento
                </dt>
                <dd className="font-semibold text-slate-700 dark:text-slate-200">
                  {apartment}
                </dd>
              </div>
            </dl>

            <div className="mt-4 rounded-xl border border-sky-100 dark:border-sky-900/40 bg-sky-50/70 dark:bg-sky-950/20 px-4 py-3 text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2.5">
              <ShieldCheck
                size={16}
                className="text-[#0C5A86] dark:text-sky-400 mt-0.5 flex-shrink-0"
              />
              <p>
                Seu bloco e apartamento são usados apenas para validação interna
                do cadastro e não ficam visíveis para outros moradores. Se
                precisar alterar essas informações, entre em contato com o
                administrador do site.
              </p>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-700 dark:text-violet-400">
                <Lock size={18} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                  Senha
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Atualize sua senha de acesso.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={openPasswordModal}
              className="inline-flex items-center gap-1 text-sm font-semibold text-[#0C5A86] hover:text-[#09476B] dark:text-sky-400 dark:hover:text-sky-300 transition-colors whitespace-nowrap">
              Alterar senha
              <ChevronRight size={15} />
            </button>
          </section>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Fechar modal"
            className="absolute inset-0 bg-slate-900/50"
            onClick={closePasswordModal}
          />

          <section className="relative w-full max-w-[420px] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center text-violet-700 dark:text-violet-400">
                <Lock size={17} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
                  Alterar senha
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Defina uma nova senha para sua conta.
                </p>
              </div>
            </div>

            <form
              onSubmit={handleChangePassword}
              className="grid gap-2.5"
              noValidate>
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nova senha
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showPasswords ? "text" : "password"}
                    value={newPassword}
                    onChange={e => {
                      setNewPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Mínimo de 6 caracteres"
                    className={`${inputBase} px-3.5 py-2.5 pr-10 rounded-lg border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPasswords ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPasswords(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirmNewPassword"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirmar nova senha
                </label>
                <div className="relative">
                  <input
                    id="confirmNewPassword"
                    type={showPasswords ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={e => {
                      setConfirmNewPassword(e.target.value);
                      setPasswordError(null);
                    }}
                    placeholder="Repita a nova senha"
                    className={`${inputBase} px-3.5 py-2.5 pr-10 rounded-lg border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40`}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    aria-label={
                      showPasswords ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() => setShowPasswords(prev => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                    {showPasswords ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {passwordError && (
                <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 text-sm px-4 py-3">
                  {passwordError}
                </div>
              )}

              <div className="pt-1 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center text-sm font-semibold px-3.5 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="inline-flex items-center justify-center gap-1.5 bg-[#0C5A86] hover:bg-[#09476B] text-white font-semibold px-3.5 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                  {changingPassword ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Lock size={16} />
                  )}
                  Alterar senha
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
