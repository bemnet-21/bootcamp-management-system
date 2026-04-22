import React, { useEffect } from 'react';

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

const Modal = ({ open, title, description, onClose, children, footer }: ModalProps) => {
  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-10">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-[12px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-[#F8FBFF] px-6 py-5">
          <div>
            {title ? <h2 className="text-lg font-black tracking-tight text-slate-900">{title}</h2> : null}
            {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-white hover:text-slate-900"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto px-6 py-6">{children}</div>

        {footer ? <div className="border-t border-blue-100 bg-white px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  );
};

export default Modal;

