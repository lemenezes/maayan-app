import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Upload,
  X,
  Loader2,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext.tsx";
import { createListing } from "../services/listingsService";
import { CATEGORIES } from "../types";
import type { Category, ListingPriceMode } from "../types";
import {
  defaultPriceModeForCategory,
  getPriceModeOptions,
  shouldRequirePriceValue,
  shouldShowPriceInput
} from "../utils/pricing";

interface FormData {
  title: string;
  description: string;
  category: Category;
  price: string;
  priceMode: ListingPriceMode;
}

const initialForm: FormData = {
  title: "",
  description: "",
  category: "venda",
  price: "",
  priceMode: defaultPriceModeForCategory("venda")
};

type FormErrors = Partial<Record<keyof FormData | "images", string>>;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif"
];
const MAX_FILE_SIZE_MB = 5;
const MAX_IMAGES = 4;

interface ImageEntry {
  file: File;
  preview: string;
}

export default function NewListingPage() {
  // Garante que a página sempre começa do topo ao entrar
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormData>(initialForm);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(e.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
    };
    if (categoryDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [categoryDropdownOpen]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = "Campo obrigatório";
    if (!form.description.trim()) e.description = "Campo obrigatório";

    if (
      shouldRequirePriceValue(form.category, form.priceMode) &&
      !form.price.trim()
    ) {
      e.price = "Campo obrigatório";
    } else if (form.price) {
      const numStr = form.price.replace(",", ".");
      if (isNaN(parseFloat(numStr)) || parseFloat(numStr) < 0) {
        e.price = "Valor inválido";
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setErrors(prev => ({
        ...prev,
        images: `Máximo de ${MAX_IMAGES} imagens atingido.`
      }));
      return;
    }

    const toAdd: ImageEntry[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          images: "Formato inválido. Use JPG, PNG, WebP ou GIF."
        }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          images: `Imagem muito grande. Máximo ${MAX_FILE_SIZE_MB}MB cada.`
        }));
        continue;
      }
      toAdd.push({ file, preview: URL.createObjectURL(file) });
    }

    setErrors(prev => ({ ...prev, images: undefined }));
    setImages(prev => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    if (!profile?.full_name?.trim()) {
      setSubmitError("Complete seu nome em Minha Conta antes de publicar.");
      return;
    }

    if (!profile?.whatsapp?.trim()) {
      setSubmitError("Adicione seu WhatsApp em Minha Conta antes de publicar.");
      return;
    }

    const phoneDigits = profile.whatsapp.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      setSubmitError("Número de WhatsApp inválido em seu perfil.");
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    const numStr = form.price.replace(",", ".");
    const priceValue =
      form.price.trim() && !isNaN(parseFloat(numStr))
        ? parseFloat(numStr)
        : undefined;

    try {
      await createListing({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: priceValue,
        priceMode: form.priceMode,
        whatsapp: phoneDigits,
        imageFiles: images.map(img => img.file),
        authorName: profile.full_name.trim(),
        userId: user.id
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Erro ao publicar anúncio."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all bg-white dark:bg-slate-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] ${
      errors[field]
        ? "border-red-300 dark:border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30"
        : "border-slate-200/80 dark:border-slate-700 focus:border-[#1DAFD9] focus:ring-2 focus:ring-sky-100/80 dark:focus:ring-sky-900/30"
    }`;

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 dark:bg-amber-950/40 rounded-full flex items-center justify-center mx-auto mb-6">
          <Clock className="w-10 h-10 text-amber-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
          Anúncio enviado!
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          Seu anúncio foi <strong>publicado</strong> com sucesso.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">
          Ele já está visível para a comunidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/meus-anuncios"
            className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            Meus anúncios
          </Link>
          <button
            onClick={() => {
              setForm(initialForm);
              images.forEach(img => URL.revokeObjectURL(img.preview));
              setImages([]);
              setSubmitted(false);
            }}
            className="text-slate-500 dark:text-slate-400 font-medium px-8 py-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Publicar outro
          </button>
        </div>
      </div>
    );
  }

  const showPrice = shouldShowPriceInput(form.category);
  const priceModeOptions = getPriceModeOptions(form.category);
  const valueMicrocopy =
    form.category === "servicos"
      ? "Defina como deseja cobrar pelo serviço."
      : form.category === "imoveis"
        ? "Informe o valor de venda ou locação."
        : form.category === "doacao"
          ? "Este anúncio será exibido como gratuito."
          : form.category === "indicacoes"
            ? "Valor opcional."
            : "Informe o valor do anúncio.";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/80 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium mb-8 transition-colors">
          <ArrowLeft size={16} />
          Voltar
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            Publicar anúncio
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm">
            Preencha os dados e compartilhe com a comunidade
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl border border-slate-200/60 bg-white/90 dark:bg-slate-900/70 dark:border-slate-700/60 shadow-sm backdrop-blur-sm p-5 sm:p-8 flex flex-col gap-6"
          noValidate>
          <div>
            <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
              Categoria <span className="text-red-400">*</span>
            </p>
            <div ref={categoryDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                aria-haspopup="listbox"
                aria-expanded={categoryDropdownOpen}>
                <span className="flex items-center gap-2">
                  <span className="text-lg">
                    {CATEGORIES.find(c => c.value === form.category)?.icon}
                  </span>
                  <span className="text-sm font-medium">
                    {CATEGORIES.find(c => c.value === form.category)?.label}
                  </span>
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 dark:text-slate-500 transition-transform ${
                    categoryDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {categoryDropdownOpen && (
                <div
                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-md z-10 overflow-hidden"
                  role="listbox">
                  {CATEGORIES.map((cat, idx) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => {
                        setForm(p => ({
                          ...p,
                          category: cat.value,
                          price: "",
                          priceMode: defaultPriceModeForCategory(cat.value)
                        }));
                        setCategoryDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm font-medium transition-all ${
                        idx !== CATEGORIES.length - 1
                          ? "border-b border-slate-100 dark:border-slate-800"
                          : ""
                      } ${
                        form.category === cat.value
                          ? "bg-sky-50 dark:bg-sky-950/30 text-[#0C5A86] dark:text-sky-400"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                      role="option"
                      aria-selected={form.category === cat.value}>
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.label}</span>
                      {form.category === cat.value && (
                        <span className="ml-auto text-[#1DAFD9]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Fotos do anúncio{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal">
                (opcional · máx. {MAX_IMAGES})
              </span>
            </p>

            {images.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3 rounded-2xl bg-slate-50/80 dark:bg-slate-900/40 p-2 ring-1 ring-slate-200/60 dark:ring-slate-700/60">
                {images.map((img, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                    <img
                      src={img.preview}
                      alt={`Prévia ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remover imagem">
                      <X size={12} className="text-white" />
                    </button>
                    {i === 0 && (
                      <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                        Capa
                      </span>
                    )}
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border border-dashed border-slate-200/80 dark:border-slate-700 flex flex-col items-center justify-center gap-1 bg-white/70 dark:bg-slate-900/50 hover:border-[#1DAFD9]/60 dark:hover:border-sky-700 hover:bg-sky-50/70 dark:hover:bg-sky-950/20 transition-all shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                    <Upload
                      size={16}
                      className="text-slate-400 dark:text-slate-500"
                    />
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      Adicionar
                    </span>
                  </button>
                )}
              </div>
            )}

            {images.length === 0 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all ${
                  errors.images
                    ? "border-red-300 dark:border-red-500/60 bg-red-50 dark:bg-red-950/20"
                    : "border-slate-200/80 dark:border-slate-700 bg-sky-50/60 dark:bg-slate-800/50 hover:border-[#1DAFD9]/60 dark:hover:border-sky-700 hover:bg-sky-50/80 dark:hover:bg-sky-950/20"
                }`}>
                <div className="w-10 h-10 bg-white/90 dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
                  <Upload
                    size={18}
                    className="text-slate-400 dark:text-slate-500"
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Clique para enviar fotos
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                    JPG, PNG, WebP ou GIF · Máx. {MAX_FILE_SIZE_MB}MB cada · até{" "}
                    {MAX_IMAGES} fotos
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleImageChange}
              className="hidden"
              aria-hidden="true"
            />
            {errors.images && (
              <p className="text-red-500 text-xs mt-1">{errors.images}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="title"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Título <span className="text-red-400">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Sofá 3 lugares em ótimo estado"
              className={inputClass("title")}
              maxLength={100}
            />
            {errors.title && (
              <p className="text-red-500 text-xs mt-1">{errors.title}</p>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="price"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Valor
                {form.category === "indicacoes" ? (
                  <span className="ml-1 text-slate-400 dark:text-slate-500 font-normal">
                    (opcional)
                  </span>
                ) : form.category === "doacao" ? null : (
                  <span className="ml-1 text-red-500" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                {valueMicrocopy}
              </p>
              {showPrice &&
                (form.category !== "servicos" ||
                  form.priceMode !== "quote") && (
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                      R$
                    </span>
                    <input
                      id="price"
                      name="price"
                      type="text"
                      inputMode="decimal"
                      value={form.price}
                      onChange={handleChange}
                      placeholder="0,00"
                      className={`${inputClass("price")} pl-10`}
                    />
                  </div>
                )}
              {showPrice &&
                form.category === "servicos" &&
                form.priceMode === "quote" && (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                    O anúncio será exibido como Sob consulta.
                  </div>
                )}
              {!showPrice && (
                <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                  Este anúncio será exibido como gratuito.
                </div>
              )}
              {showPrice && errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>

            {showPrice && priceModeOptions.length > 0 && (
              <div>
                <label
                  htmlFor="priceMode"
                  className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {form.category === "servicos" ? "Cobrança" : "Tipo"}
                  <span className="text-red-400"> *</span>
                </label>
                <select
                  id="priceMode"
                  name="priceMode"
                  value={form.priceMode}
                  onChange={e => {
                    const priceMode = e.target.value as ListingPriceMode;
                    setForm(prev => ({
                      ...prev,
                      priceMode,
                      price: priceMode === "quote" ? "" : prev.price
                    }));
                  }}
                  className={inputClass("priceMode")}>
                  {priceModeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Descrição <span className="text-red-400">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva o que está anunciando com detalhes..."
              rows={5}
              className={`${inputClass("description")} resize-none`}
              maxLength={1000}
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-500 text-xs">{errors.description}</p>
              ) : (
                <span />
              )}
              <p className="text-slate-300 dark:text-slate-600 text-xs">
                {form.description.length}/1000
              </p>
            </div>
          </div>

          {submitError && (
            <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting && <Loader2 size={18} className="animate-spin" />}
            {submitting
              ? images.length > 0
                ? `Enviando ${images.length} foto${images.length > 1 ? "s" : ""}…`
                : "Publicando…"
              : "Publicar Anúncio"}
          </button>
        </form>
      </div>
    </div>
  );
}
