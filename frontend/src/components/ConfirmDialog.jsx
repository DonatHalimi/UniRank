import { useEffect, useRef } from 'react';
import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ open, title, description, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger', onConfirm, onCancel, busy }) {
    const confirmRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const onKey = (event) => {
            if (event.key === 'Escape' && !busy) onCancel();
            if (event.key === 'Enter') { event.preventDefault(); if (!busy) onConfirm(); }
        };
        document.addEventListener('keydown', onKey);
        confirmRef.current?.focus();
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', onKey);
            document.body.style.overflow = previousOverflow;
        };
    }, [open, busy, onConfirm, onCancel]);

    if (!open) return null;

    // Rose-600 on white text: 5.2:1 (AA for normal text, AAA for large)
    const confirmClass = variant === 'danger'
        ? 'button-primary !bg-rose-600 hover:!bg-rose-500 !text-white focus-visible:outline-rose-400'
        : 'button-primary';

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-description"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                onClick={() => { if (!busy) onCancel(); }}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-start gap-3">
                    {variant === 'danger' && (
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500/20 text-rose-200">
                            <AlertTriangle size={18} aria-hidden="true" />
                        </span>
                    )}
                    <div className="min-w-0">
                        <h3 id="confirm-title" className="text-base font-semibold text-white">{title}</h3>
                        {description && (
                            <p id="confirm-description" className="mt-1 text-sm leading-6 text-slate-300">{description}</p>
                        )}
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <button type="button" className="button-secondary text-slate-200" onClick={onCancel} disabled={busy}>
                        {cancelLabel}
                    </button>
                    <button
                        ref={confirmRef}
                        type="button"
                        className={confirmClass}
                        onClick={onConfirm}
                        disabled={busy}
                    >
                        {busy ? 'Deleting…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
