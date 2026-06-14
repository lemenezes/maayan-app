import Lightbox from "yet-another-react-lightbox";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import "yet-another-react-lightbox/plugins/thumbnails.css";

interface Props {
  images: string[];
  initialIndex?: number;
  open: boolean;
  onClose: () => void;
}

export default function ListingLightbox({
  images,
  initialIndex = 0,
  open,
  onClose
}: Props) {
  const slides = images.map(src => ({ src }));
  const thumbnailPreload = Math.max(2, images.length - 1);

  return (
    <Lightbox
      open={open}
      close={onClose}
      index={initialIndex}
      slides={slides}
      plugins={[Zoom, Counter, Thumbnails]}
      counter={{
        separator: " / ",
        container: {
          style: {
            top: 12,
            left: 12,
            right: "auto",
            bottom: "auto",
            backgroundColor: "rgba(15, 23, 42, 0.72)",
            color: "#f8fafc",
            border: "1px solid rgba(255, 255, 255, 0.25)",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            letterSpacing: "0.02em",
            backdropFilter: "blur(8px)"
          }
        }
      }}
      zoom={{
        maxZoomPixelRatio: 4,
        zoomInMultiplier: 2,
        doubleTapDelay: 300,
        doubleClickDelay: 300,
        scrollToZoom: true
      }}
      thumbnails={{
        position: "bottom",
        width: 94,
        height: 68,
        border: 2,
        borderRadius: 10,
        padding: 4,
        gap: 10,
        imageFit: "cover",
        vignette: false
      }}
      animation={{ fade: 250, swipe: 300 }}
      carousel={{
        preload: thumbnailPreload,
        finite: true,
        imageFit: "contain"
      }}
      styles={{
        container: { backgroundColor: "rgba(0,0,0,0.93)" },
        thumbnailsContainer: {
          overflowX: "auto",
          overflowY: "hidden",
          WebkitOverflowScrolling: "touch",
          width: "100%",
          paddingTop: 12,
          paddingBottom: 18,
          backgroundColor: "rgba(0, 0, 0, 0.72)",
          ["--yarl__thumbnails_thumbnail_border_color"]:
            "rgba(255,255,255,0.45)",
          ["--yarl__thumbnails_thumbnail_active_border_color"]: "#1DAFD9"
        },
        thumbnailsTrack: {
          display: "flex",
          flexWrap: "nowrap",
          width: "max-content",
          margin: "0 auto"
        },
        thumbnail: {
          boxShadow: "0 6px 16px rgba(0,0,0,0.35)"
        }
      }}
    />
  );
}
