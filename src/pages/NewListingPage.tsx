import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useListings } from '../hooks/useListings';
import { CATEGORIES } from '../types';
import type { Category } from '../types';

interface FormData {
  title: string;
  description: string;
  category: Category;
  price: string;
  whatsapp: string;
  imageUrl: string;
  authorName: string;
  apartment: string;
}

const initialForm: FormData = {
  title: '',
  description: '',
  category: 'venda',
  price: '',
  whatsapp: '',
  imageUrl: '',
  authorName: '',
  apartment: '',
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function NewListingPage() {
  const { addListing } = useListings();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numStr = form.price.replace(',', '.');
    const priceValue =
      form.price.trim() && !isNaN(parseFloat(numStr)) ? parseFloat(numStr) : undefined;

    addListing({
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      price: priceValue,
      whatsapp: form.whatsapp.replace(/\D/g, ''),
      images: form.imageUrl.trim() ? [form.imageUrl.trim()] : [],
      authorName: form.authorName.trim(),
      apartment: form.apartment.trim() || undefined,
    });

    setSubmitted(true);
  };

  const inputClass = (field: keyof FormData) =>
    `w-full px-4 py-3 rounded-xl border text-sm text-slate-800 placeholder-slate-400 outline-none transition-all bg-white ${
      errors[field]
        ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
        : 'border-slate-200 focus:border-sky-400 focus:ring-2 focus:ring-sky-100'
    }`;

  /* ── Success screen ── */
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-3">Anúncio publicado!</h1>
        <p className="text-slate-400 mb-8">
          Seu anúncio já está visível para todos os moradores do condomínio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/anuncios"
            className="bg-gradient-to-r from-sky-500 to-purple-600 text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
          >
            Ver anúncios
          </Link>
          <button
            onClick={() => {
              setForm(initialForm);
              setSubmitted(false);
            }}
            className="text-slate-500 font-medium px-8 py-3 rounded-full border border-slate-200 hover:bg-slate-50 transition-colors"
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
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-medium mb-8 transition-colors"
      >
        <ArrowLeft size={16} />
        Voltar
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">Publicar anúncio</h1>
        <p className="text-slate-400 text-sm">
          Preencha os dados para os vizinhos verem
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        {/* Category selector */}
        <div>
          <p className="block text-sm font-semibold text-slate-700 mb-3">
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
                    ? 'border-sky-400 bg-sky-50 text-sky-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
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
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 mb-1.5">
            Título <span className="text-red-400">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Ex: Sofá 3 lugares em ótimo estado"
            className={inputClass('title')}
            maxLength={100}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            Descrição <span className="text-red-400">*</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descreva o que está anunciando com detalhes..."
            rows={5}
            className={`${inputClass('description')} resize-none`}
            maxLength={1000}
          />
          <div className="flex justify-between mt-1">
            {errors.description ? (
              <p className="text-red-500 text-xs">{errors.description}</p>
            ) : (
              <span />
            )}
            <p className="text-slate-300 text-xs">{form.description.length}/1000</p>
          </div>
        </div>

        {/* Price (conditional) */}
        {showPrice && (
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              {form.category === 'servicos' ? 'Valor por hora' : 'Preço'}{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium pointer-events-none">
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
                className={`${inputClass('price')} pl-10`}
              />
            </div>
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
          </div>
        )}

        {/* Image URL */}
        <div>
          <label
            htmlFor="imageUrl"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            URL da imagem{' '}
            <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            type="url"
            value={form.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
            className={inputClass('imageUrl')}
          />
          <p className="text-slate-400 text-xs mt-1">Cole o link de uma imagem hospedada online</p>
        </div>

        {/* Author + apartment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="authorName"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Seu nome <span className="text-red-400">*</span>
            </label>
            <input
              id="authorName"
              name="authorName"
              type="text"
              value={form.authorName}
              onChange={handleChange}
              placeholder="Ex: Maria Silva"
              className={inputClass('authorName')}
              maxLength={60}
            />
            {errors.authorName && (
              <p className="text-red-500 text-xs mt-1">{errors.authorName}</p>
            )}
          </div>
          <div>
            <label
              htmlFor="apartment"
              className="block text-sm font-semibold text-slate-700 mb-1.5"
            >
              Apartamento{' '}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              id="apartment"
              name="apartment"
              type="text"
              value={form.apartment}
              onChange={handleChange}
              placeholder="Ex: Apto 304"
              className={inputClass('apartment')}
              maxLength={20}
            />
          </div>
        </div>

        {/* WhatsApp */}
        <div>
          <label
            htmlFor="whatsapp"
            className="block text-sm font-semibold text-slate-700 mb-1.5"
          >
            WhatsApp <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              +55
            </span>
            <input
              id="whatsapp"
              name="whatsapp"
              type="tel"
              inputMode="numeric"
              value={form.whatsapp}
              onChange={handleChange}
              placeholder="(11) 99999-9999"
              className={`${inputClass('whatsapp')} pl-12`}
              maxLength={16}
            />
          </div>
          {errors.whatsapp ? (
            <p className="text-red-500 text-xs mt-1">{errors.whatsapp}</p>
          ) : (
            <p className="text-slate-400 text-xs mt-1">
              Os interessados entrarão em contato pelo WhatsApp
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-sky-500 to-purple-600 text-white font-bold py-4 rounded-2xl text-base hover:opacity-90 transition-opacity shadow-sm mt-2"
        >
          Publicar Anúncio
        </button>
      </form>
    </div>
  );
}
