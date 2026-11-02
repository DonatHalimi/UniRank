import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

const REPORT_REASONS = [
    { value: 'copyright', label: 'Copyright violation' },
    { value: 'spam', label: 'Spam' },
    { value: 'inappropriate', label: 'Inappropriate content' },
    { value: 'wrong_subject', label: 'Wrong subject' },
    { value: 'other', label: 'Other' },
];

export function ReportDialog({ open, busy, onClose, onSubmit }) {
    const [reason, setReason] = useState('copyright');

    useEffect(() => {
        if (open) setReason('copyright');
    }, [open]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
                onClick={busy ? undefined : onClose}
            />
            <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h3 id="report-title" className="text-base font-semibold text-white">
                            Report this resource
                        </h3>
                        <p className="mt-1 text-sm text-slate-300">
                            Tell us why this material shouldn&apos;t be here. Reports are anonymous.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        aria-label="Close"
                        className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white"
                    >
                        <X size={16} aria-hidden="true" />
                    </button>
                </div>

                <fieldset className="mt-5 space-y-2">
                    <legend className="sr-only">Reason</legend>
                    {REPORT_REASONS.map((option) => (
                        <label key={option.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${reason === option.value
                                ? 'border-indigo-300/40 bg-indigo-300/10 text-white'
                                : 'border-white/10 text-slate-300 hover:bg-white/[.04]'
                                }`}
                        >
                            <input
                                type="radio"
                                name="report-reason"
                                value={option.value}
                                checked={reason === option.value}
                                onChange={() => setReason(option.value)}
                                className="accent-indigo-300"
                            />
                            {option.label}
                        </label>
                    ))}
                </fieldset>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={busy}
                        className="button-secondary"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onSubmit(reason)}
                        disabled={busy}
                        className="button-primary"
                    >
                        {busy ? 'Submitting…' : 'Submit report'}
                    </button>
                </div>
            </div>
        </div>
    );
}
