import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

interface Props {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export default function ListingLightbox({ images, initialIndex = 0, open, onClose }: Props) {
  const slides = images.map((src) => ({ src }));

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Zoom, Thumbnails]}
      zoom={{
        maxZoomPixelRatio: 4,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        scrollToZoom: true,
      }}
      thumbnails={{
        position: 'bottom',
        width: 64,
        height: 48,
        border: 2,
        borderRadius: 8,
        padding: 4,
        gap: 8,
        imageFit: 'cover',
        vignette: true,
      }}
      animation={{ fade: 250, swipe: 300 }}
      carousel={{ preload: 1, finite: false }}
      styles={{
        container: { backgroundColor: 'rgba(0,0,0,0.93)' },
      }}
    />
  );
}
