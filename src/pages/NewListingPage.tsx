import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createListing } from '../services/listingsService';
import { CATEGORIES } from '../types';
import type { Category } from '../types';

interface FormData {
  title: string;
  description: string;
  category: Category;
  price: string;
  whatsapp: string;
  authorName: string;
  apartment: string;
}

const initialForm: FormData = {
  title: '',
  description: '',
  category: 'venda',
  price: '',
  whatsapp: '',
  authorName: '',
  apartment: '',
};

type FormErrors = Partial<Record<keyof FormData | 'images', string>>;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;
const MAX_IMAGES = 4;

interface ImageEntry {
  file: File;
  preview: string;
}

export default function NewListingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>(initialForm);
  const [images, setImages] = useState<ImageEntry[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Campo obrigatório';
    if (!form.description.trim()) e.description = 'Campo obrigatório';
    if (!form.authorName.trim()) e.authorName = 'Campo obrigatório';

    const phone = form.whatsapp.replace(/\D/g, '');
    if (!phone) {
      e.whatsapp = 'Campo obrigatório';
    } else if (phone.length < 10) {
      e.whatsapp = 'Número inválido (mínimo 10 dígitos)';
    }

    if (form.price) {
      const numStr = form.price.replace(',', '.');
      if (isNaN(parseFloat(numStr)) || parseFloat(numStr) < 0) {
        e.price = 'Valor inválido';
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const remaining = MAX_IMAGES - images.length;
    if (remaining <= 0) {
      setErrors((prev) => ({ ...prev, images: `Máximo de ${MAX_IMAGES} imagens atingido.` }));
      return;
    }

    const toAdd: ImageEntry[] = [];
    for (const file of files.slice(0, remaining)) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        setErrors((prev) => ({ ...prev, images: 'Formato inválido. Use JPG, PNG, WebP ou GIF.' }));
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, images: `Imagem muito grande. Máximo ${MAX_FILE_SIZE_MB}MB cada.` }));
        continue;
      }
      toAdd.push({ file, preview: URL.createObjectURL(file) });
    }

    setErrors((prev) => ({ ...prev, images: undefined }));
    setImages((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!user) return;

    setSubmitting(true);
    setSubmitError(null);

    const numStr = form.price.replace(',', '.');
    const priceValue =
      form.price.trim() && !isNaN(parseFloat(numStr)) ? parseFloat(numStr) : undefined;

    try {
      await createListing({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: priceValue,
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        imageFiles: images.map((img) => img.file),
        authorName: form.authorName.trim(),
        apartment: form.apartment.trim() || undefined,
        userId: user.id,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao publicar anúncio.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all bg-white dark:bg-slate-800 ${
      errors[field]
        ? 'border-red-300 dark:border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
        : 'border-slate-200 dark:border-slate-700 focus:border-[#1DAFD9] focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40'
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
          Seu anúncio está <strong className="text-amber-600 dark:text-amber-400">aguardando aprovação</strong> do administrador.
        </p>
        <p className="text-slate-400 dark:text-slate-500 text-sm mb-8">
          Você receberá um e-mail quando ele for aprovado e ficar visível para a comunidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/meus-anuncios"
            className="bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Meus anúncios
          </Link>
          <button
            onClick={() => {
              setForm(initialForm);
              images.forEach((img) => URL.revokeObjectURL(img.preview));
              setImages([]);
              setSubmitted(false);
            }}
            className="text-slate-500 dark:text-slate-400 font-medium px-8 py-3 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Publicar outro
          </button>
        </div>
      </div>
    );
  }

  const showPrice = form.category === 'venda' || form.category === 'servicos';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium mb-8 transition-colors"
      >
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

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div>
          <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Categoria <span className="text-red-400">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setForm((p) => ({ ...p, category: cat.value, price: '' }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.category === cat.value
                    ? 'border-[#1DAFD9] bg-sky-50 dark:bg-sky-950/40 text-[#0C5A86] dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            id="title" name="title" type="text"
            value={form.title} onChange={handleChange}
            placeholder="Ex: Sofá 3 lugares em ótimo estado"
            className={inputClass('title')} maxLength={100}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description" name="description"
            value={form.description} onChange={handleChange}
            placeholder="Descreva o que está anunciando com detalhes..."
            rows={5} className={`${inputClass('description')} resize-none`} maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-slate-300 dark:text-slate-600 text-xs">{form.description.length}/1000</p>
          </div>
        </div>

        {showPrice && (
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {form.category === 'servicos' ? 'Valor por hora' : 'Preço'}{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">
                R$
              </span>
              <input
                id="price" name="price" type="text" inputMode="decimal"
                value={form.price} onChange={handleChange}
                placeholder="0,00" className={`${inputClass('price')} pl-10`}
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        )}

        <div>
          <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Fotos do anúncio{' '}
            <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional · máx. {MAX_IMAGES})</span>
          </p>

          {/* Preview grid */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                  <img src={img.preview} alt={`Prévia ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remover imagem"
                  >
                    <X size={12} className="text-white" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-full">
                      Capa
                    </span>
                  )}
                </div>
              ))}
              {/* Add more slot */}
              {images.length < MAX_IMAGES && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 hover:border-[#1DAFD9]/60 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all"
                >
                  <Upload size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Adicionar</span>
                </button>
              )}
            </div>
          )}

          {/* Drop zone (only when empty) */}
          {images.length === 0 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all ${
                errors.images
                  ? 'border-red-300 dark:border-red-500/60 bg-red-50 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-[#1DAFD9]/60 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'
              }`}
            >
              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <Upload size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Clique para enviar fotos
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  JPG, PNG, WebP ou GIF · Máx. {MAX_FILE_SIZE_MB}MB cada · até {MAX_IMAGES} fotos
                </p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef} type="file" multiple
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleImageChange} className="hidden" aria-hidden="true"
          />
          {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Seu nome <span className="text-red-400">*</span>
            </label>
            <input
              id="authorName" name="authorName" type="text"
              value={form.authorName} onChange={handleChange}
              placeholder="Ex: Maria Silva" className={inputClass('authorName')} maxLength={60}
            />
            {errors.authorName && <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>}
          </div>
          <div>
            <label htmlFor="apartment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Apartamento{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <input
              id="apartment" name="apartment" type="text"
              value={form.apartment} onChange={handleChange}
              placeholder="Ex: Apto 304" className={inputClass('apartment')} maxLength={20}
            />
          </div>
        </div>

        <div>
          <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            WhatsApp <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">
              +55
            </span>
            <input
              id="whatsapp" name="whatsapp" type="tel" inputMode="numeric"
              value={form.whatsapp} onChange={handleChange}
              placeholder="(11) 99999-9999" className={`${inputClass('whatsapp')} pl-12`} maxLength={16}
            />
          </div>
          {errors.whatsapp ? (
            <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
              Os interessados entrarão em contato pelo WhatsApp
            </p>
          )}
        </div>

        {submitError && (
          <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-400 text-sm px-4 py-3 rounded-xl animate-fade-in">
            {submitError}
          </div>
        )}

        <button
          type="submit" disabled={submitting}
          className="w-full bg-gradient-to-r from-[#0C5A86] to-[#1DAFD9] text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 active:scale-[0.98] transition-all shadow-sm mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 size={18} className="animate-spin" />}
          {submitting
            ? images.length > 0
              ? `Enviando ${images.length} foto${images.length > 1 ? 's' : ''}…`
              : 'Publicando…'
            : 'Publicar Anúncio'}
        </button>
      </form>
    </div>
  );
}
