
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface LightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageAlt: string;
}

export function Lightbox({ isOpen, onClose, imageSrc, imageAlt }: LightboxProps) {
  // Use escape key to close the lightbox
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleEscKey);
    }

    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 bg-transparent border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 rounded-full p-1 z-10"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img 
            src={imageSrc} 
            alt={imageAlt} 
            className="max-w-full max-h-[85vh] object-contain" 
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
