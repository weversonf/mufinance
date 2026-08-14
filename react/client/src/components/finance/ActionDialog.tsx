// Diálogos de ação: superfícies calmas, foco claro e fechamento previsível para cada fluxo do dashboard.

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";

type ActionDialogProps = {
  open: boolean;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  labelledBy?: string;
};

export function ActionDialog({ open, eyebrow, title, description, icon, onClose, children, footer, labelledBy = "action-dialog-title" }: ActionDialogProps) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
          <motion.div className="modal-panel action-dialog-panel" role="dialog" aria-modal="true" aria-labelledby={labelledBy} initial={{ opacity: 0, y: 18, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.98 }} transition={{ duration: 0.22 }}>
            <div className="modal-header">
              <div className="modal-heading"><span className="modal-icon">{icon}</span><div><p className="eyebrow">{eyebrow}</p><h2 id={labelledBy}>{title}</h2><p>{description}</p></div></div>
              <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar diálogo"><X size={18} /></button>
            </div>
            <div className="action-dialog-content">{children}</div>
            {footer && <div className="modal-actions">{footer}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
