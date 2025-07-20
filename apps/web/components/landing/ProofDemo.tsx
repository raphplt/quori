import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";

interface ProofDemoProps {
  src: string; // URL du GIF ou vidéo
  poster?: string; // Image de fallback
  alt?: string;
}

export const ProofDemo: React.FC<ProofDemoProps> = ({ src, poster, alt }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Aperçu cliquable */}
      <div
        className="relative w-full max-w-md mx-auto rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
        onClick={() => setOpen(true)}
        tabIndex={0}
        aria-label="Voir la démo en grand"
        role="button"
        onKeyDown={e => (e.key === "Enter" || e.key === " ") && setOpen(true)}
      >
        <video
          src={src}
          poster={poster}
          autoPlay
          loop
          muted
          playsInline
          preload="none"
          className="w-full h-auto object-cover bg-black/10"
          aria-label={alt}
        />
        {/* Overlay play */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition">
          <div className="bg-white/80 rounded-full p-3 shadow-lg">
            <Play className="h-8 w-8 text-primary" />
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            tabIndex={-1}
            aria-modal="true"
            role="dialog"
          >
            <motion.div
              className="relative max-w-2xl w-full mx-4 rounded-2xl overflow-hidden shadow-2xl"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={e => e.stopPropagation()}
            >
              <video
                src={src}
                poster={poster}
                autoPlay
                loop
                muted
                playsInline
                controls
                className="w-full h-auto object-cover bg-black"
                aria-label={alt}
              />
              <button
                className="absolute top-2 right-2 bg-white/80 rounded-full p-2 shadow hover:bg-white"
                onClick={() => setOpen(false)}
                aria-label="Fermer la démo"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};