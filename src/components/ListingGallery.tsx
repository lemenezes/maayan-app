import { useState } from "react";
import { ImageOff, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import ListingLightbox from "./ListingLightbox";

interface Props {
  images: string[];
  title: string;
  /** Extra overlay content (e.g. close button, category badge) */
  overlay?: React.ReactNode;
  /** Rounded top corners style: 'modal' (rounded-t-3xl) or 'page' (none) */
  rounded?: "modal" | "page";
  /** Main image fit mode */
  mainImageFit?: "contain" | "cover";
}

export default function ListingGallery({
  images,
  title,
  overlay,
  rounded = "modal",
  mainImageFit = "contain"
}: Props) {
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const hasMultiple = images.length > 1;

  const prevImg = () =>
    setActiveImg(i => (i - 1 + images.length) % images.length);
  const nextImg = () => setActiveImg(i => (i + 1) % images.length);

  const roundedClass =
    rounded === "modal"
      ? "sm:rounded-t-3xl rounded-t-3xl"
      : "sm:rounded-2xl rounded-none";

  return (
    <div>
      {/* Main image */}
      <div
        className={`aspect-video relative bg-slate-50 dark:bg-slate-900 ${roundedClass} overflow-hidden flex items-center justify-center`}>
        {images.length > 0 ? (
          <>
            <button
              className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none group"
              onClick={() => setLightboxOpen(true)}
              aria-label="Ampliar imagem"
              tabIndex={0}>
              <img
                key={activeImg}
                src={images[activeImg]}
                alt={`${title} ${activeImg + 1}`}
                className={`block w-full h-full object-center p-2 sm:p-3 animate-fade-in ${
                  mainImageFit === "contain" ? "object-contain" : "object-cover"
                }`}
                style={{ objectFit: mainImageFit, objectPosition: "center" }}
              />
              {/* Zoom hint */}
              <span className="absolute bottom-3 right-3 w-8 h-8 bg-black/40 group-hover:bg-black/60 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn size={14} className="text-white" />
              </span>
            </button>
            {hasMultiple && (
              <>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    prevImg();
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
                  aria-label="Foto anterior">
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    nextImg();
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 text-white rounded-full flex items-center justify-center backdrop-blur-sm transition-colors z-10"
                  aria-label="Próxima foto">
                  <ChevronRight size={18} />
                </button>
                {/* Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={e => {
                        e.stopPropagation();
                        setActiveImg(i);
                      }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${i === activeImg ? "bg-white w-4" : "bg-white/50"}`}
                      aria-label={`Foto ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
            <ImageOff className="w-12 h-12 text-slate-300 dark:text-slate-600" />
            <span className="text-sm text-slate-300 dark:text-slate-600">
              Sem imagem
            </span>
          </div>
        )}

        {overlay}
      </div>

      {/* Thumbnail strip */}
      {hasMultiple && (
        <div className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-none bg-slate-50 dark:bg-slate-900/40">
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActiveImg(i)}
              className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                i === activeImg
                  ? "border-sky-400 opacity-100"
                  : "border-transparent opacity-50 hover:opacity-75"
              }`}>
              <img
                src={url}
                alt={`Miniatura ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {images.length > 0 && (
        <ListingLightbox
          images={images}
          initialIndex={activeImg}
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
