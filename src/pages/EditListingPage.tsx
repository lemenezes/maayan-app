import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { fetchUserListings, updateListing } from '../services/listingsService';
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

type FormErrors = Partial<Record<keyof FormData | 'images', string>>;

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_MB = 5;
const MAX_IMAGES = 4;

interface NewImageEntry {
  file: File;
  preview: string;
}

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notFound, setNotFound] = useState(false);
  const [loadingListing, setLoadingListing] = useState(true);
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    category: 'venda',
    price: '',
    whatsapp: '',
    authorName: '',
    apartment: '',
  });
  /** Existing image URLs kept from original listing */
  const [keptImages, setKeptImages] = useState<string[]>([]);
  /** New files selected by user */
  const [newImages, setNewImages] = useState<NewImageEntry[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const totalImages = keptImages.length + newImages.length;

  // Load listing
  const loadListing = useCallback(async () => {
    if (!user || !id) return;
    setLoadingListing(true);
    try {
      const all = await fetchUserListings(user.id);
      const listing = all.find((l) => l.id === id);
      if (!listing) {
        setNotFound(true);
        return;
      }
      setForm({
        title: listing.title,
        description: listing.description,
        category: listing.category,
        price: listing.price !== undefined ? String(listing.price).replace('.', ',') : '',
        whatsapp: listing.whatsapp,
        authorName: listing.authorName,
        apartment: listing.apartment ?? '',
      });
      setKeptImages(listing.images);
    } catch {
      showToast('Erro ao carregar anúncio', 'error');
      navigate('/meus-anuncios');
    } finally {
      setLoadingListing(false);
    }
  }, [user, id, showToast, navigate]);

  useEffect(() => { loadListing(); }, [loadListing]);

  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => { newImages.forEach((img) => URL.revokeObjectURL(img.preview)); };
  }, [newImages]);

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.title.trim()) e.title = 'Campo obrigatório';
    if (!form.description.trim()) e.description = 'Campo obrigatório';
    if (!form.authorName.trim()) e.authorName = 'Campo obrigatório';
    const phone = form.whatsapp.replace(/\D/g, '');
    if (!phone) e.whatsapp = 'Campo obrigatório';
    else if (phone.length < 10) e.whatsapp = 'Número inválido (mínimo 10 dígitos)';
    if (form.price) {
      const n = parseFloat(form.price.replace(',', '.'));
      if (isNaN(n) || n < 0) e.price = 'Valor inválido';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const remaining = MAX_IMAGES - totalImages;
    if (remaining <= 0) {
      setErrors((prev) => ({ ...prev, images: `Máximo de ${MAX_IMAGES} imagens atingido.` }));
      return;
    }
    const toAdd: NewImageEntry[] = [];
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
    setNewImages((prev) => [...prev, ...toAdd]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeKept = (url: string) => setKeptImages((prev) => prev.filter((u) => u !== url));
  const removeNew = (index: number) => {
    setNewImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user || !id) return;

    setSubmitting(true);
    const numStr = form.price.replace(',', '.');
    const priceValue = form.price.trim() && !isNaN(parseFloat(numStr)) ? parseFloat(numStr) : undefined;

    try {
      await updateListing(id, {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        price: priceValue,
        whatsapp: form.whatsapp.replace(/\D/g, ''),
        keptImageUrls: keptImages,
        newImageFiles: newImages.map((img) => img.file),
        authorName: form.authorName.trim(),
        apartment: form.apartment.trim() || undefined,
        userId: user.id,
      });
      showToast('Anúncio atualizado com sucesso!');
      navigate('/meus-anuncios');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao atualizar anúncio.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none transition-all bg-white dark:bg-slate-800 ${
      errors[field]
        ? 'border-red-300 dark:border-red-500/60 focus:border-red-400 focus:ring-2 focus:ring-red-100 dark:focus:ring-red-900/30'
        : 'border-slate-200 dark:border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-100 dark:focus:ring-sky-900/40'
    }`;

  if (loadingListing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 flex justify-center">
        <Loader2 size={28} className="animate-spin text-slate-400" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-slate-500 dark:text-slate-400 mb-4">Anúncio não encontrado.</p>
        <Link to="/meus-anuncios" className="text-sky-500 font-medium hover:underline">
          Voltar para meus anúncios
        </Link>
      </div>
    );
  }

  const showPrice = form.category === 'venda' || form.category === 'servicos';

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate('/meus-anuncios')}
        className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Meus anúncios
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Editar anúncio</h1>
        <p className="text-slate-400 dark:text-slate-500 text-sm">Atualize as informações do seu anúncio</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Category */}
        <div>
          <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
            Categoria <span className="text-red-400">*</span>
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value} type="button"
                onClick={() => setForm((p) => ({ ...p, category: cat.value, price: '' }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.category === cat.value
                    ? 'border-sky-400 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span className="text-2xl">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Título <span className="text-red-400">*</span>
          </label>
          <input id="title" name="title" type="text" value={form.title} onChange={handleChange}
            placeholder="Ex: Sofá 3 lugares em ótimo estado" className={inputClass('title')} maxLength={100} />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea id="description" name="description" value={form.description} onChange={handleChange}
            placeholder="Descreva o que está anunciando com detalhes..." rows={5}
            className={`${inputClass('description')} resize-none`} maxLength={1000} />
          <div className="flex justify-between mt-1">
            {errors.description ? <p className="text-red-500 text-xs">{errors.description}</p> : <span />}
            <p className="text-slate-300 dark:text-slate-600 text-xs">{form.description.length}/1000</p>
          </div>
        </div>

        {/* Price */}
        {showPrice && (
          <div>
            <label htmlFor="price" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              {form.category === 'servicos' ? 'Valor por hora' : 'Preço'}{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm font-medium pointer-events-none">R$</span>
              <input id="price" name="price" type="text" inputMode="decimal" value={form.price} onChange={handleChange}
                placeholder="0,00" className={`${inputClass('price')} pl-10`} />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        )}

        {/* Images */}
        <div>
          <p className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            Fotos do anúncio{' '}
            <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional · máx. {MAX_IMAGES})</span>
          </p>

          {totalImages > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
              {/* Kept images */}
              {keptImages.map((url, i) => (
                <div key={`kept-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                  <img src={url} alt={`Imagem ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeKept(url)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remover imagem">
                    <X size={12} className="text-white" />
                  </button>
                  {i === 0 && keptImages.length + newImages.length > 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-black/50 text-white px-1.5 py-0.5 rounded-full">Capa</span>
                  )}
                </div>
              ))}
              {/* New images */}
              {newImages.map((img, i) => (
                <div key={`new-${i}`} className="relative aspect-square rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 group">
                  <img src={img.preview} alt={`Nova ${i + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNew(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remover imagem">
                    <X size={12} className="text-white" />
                  </button>
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-semibold bg-sky-500/80 text-white px-1.5 py-0.5 rounded-full">Nova</span>
                </div>
              ))}
              {/* Add more slot */}
              {totalImages < MAX_IMAGES && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-1 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20 transition-all">
                  <Upload size={16} className="text-slate-400 dark:text-slate-500" />
                  <span className="text-xs text-slate-400 dark:text-slate-500">Adicionar</span>
                </button>
              )}
            </div>
          )}

          {totalImages === 0 && (
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className={`w-full flex flex-col items-center gap-3 py-10 rounded-2xl border-2 border-dashed transition-all ${
                errors.images
                  ? 'border-red-300 dark:border-red-500/60 bg-red-50 dark:bg-red-950/20'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-sky-300 dark:hover:border-sky-700 hover:bg-sky-50/50 dark:hover:bg-sky-950/20'
              }`}>
              <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center shadow-sm">
                <Upload size={18} className="text-slate-400 dark:text-slate-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Clique para enviar fotos</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                  JPG, PNG, WebP ou GIF · Máx. {MAX_FILE_SIZE_MB}MB cada · até {MAX_IMAGES} fotos
                </p>
              </div>
            </button>
          )}

          <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_IMAGE_TYPES.join(',')}
            onChange={handleImageChange} className="hidden" aria-hidden="true" />
          {errors.images && <p className="text-red-500 text-xs mt-1">{errors.images}</p>}
        </div>

        {/* Author + apartment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="authorName" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Seu nome <span className="text-red-400">*</span>
            </label>
            <input id="authorName" name="authorName" type="text" value={form.authorName} onChange={handleChange}
              placeholder="Ex: Maria Silva" className={inputClass('authorName')} maxLength={60} />
            {errors.authorName && <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>}
          </div>
          <div>
            <label htmlFor="apartment" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Apartamento{' '}
              <span className="text-slate-400 dark:text-slate-500 font-normal">(opcional)</span>
            </label>
            <input id="apartment" name="apartment" type="text" value={form.apartment} onChange={handleChange}
              placeholder="Ex: Apto 304" className={inputClass('apartment')} maxLength={20} />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label htmlFor="whatsapp" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
            WhatsApp <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-sm pointer-events-none">+55</span>
            <input id="whatsapp" name="whatsapp" type="tel" inputMode="numeric" value={form.whatsapp} onChange={handleChange}
              placeholder="(11) 99999-9999" className={`${inputClass('whatsapp')} pl-12`} maxLength={16} />
          </div>
          {errors.whatsapp ? (
            <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
          ) : (
            <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">Os interessados entrarão em contato pelo WhatsApp</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <button type="button" onClick={() => navigate('/meus-anuncios')}
            className="flex-1 py-4 rounded-2xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={submitting}
            className="flex-1 bg-gradient-to-r from-sky-500 to-purple-600 text-white font-bold py-4 rounded-2xl text-sm hover:opacity-90 active:scale-[0.98] transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting && <Loader2 size={16} className="animate-spin" />}
            {submitting
              ? newImages.length > 0 ? `Enviando ${newImages.length} foto${newImages.length > 1 ? 's' : ''}…` : 'Salvando…'
              : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
