import { Flag, ShieldCheck, Trash2 } from 'lucide-react';
import { formatBytes } from '../../utils/format.js';

export default function MaterialSidebar({
    material,
    canVerify,
    canDelete,
    canReport,
    verifyBusy,
    onVerify,
    onDelete,
    onReport,
}) {
    const rows = [
        ['Course', material.subjectId?.code || '—'],
        ['File name', material.fileName, 'break-all'],
        ['File size', formatBytes(material.fileSize)],
        ['Downloads', material.downloadCount],
        ['Upvotes', material.upvotes],
        ['Status', <span className="capitalize">{material.status}</span>],
    ];

    return (
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section className="surface p-5">
                <h2 className="font-semibold text-white">Resource details</h2>
                <dl className="mt-4 space-y-3 text-sm">
                    {rows.map(([label, value, extra]) => (
                        <div key={label} className="flex justify-between gap-3">
                            <dt className="text-slate-400">{label}</dt>
                            <dd className={`text-right text-slate-200 ${extra || ''}`}>{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            {canVerify && (
                <button
                    disabled={verifyBusy}
                    onClick={onVerify}
                    className="button-secondary w-full justify-center"
                >
                    <ShieldCheck size={16} aria-hidden="true" /> Verify resource
                </button>
            )}

            {canDelete && (
                <button
                    onClick={onDelete}
                    className="button-secondary w-full justify-center text-rose-300 hover:bg-rose-500/10 hover:text-rose-200"
                >
                    <Trash2 size={16} aria-hidden="true" /> Delete material
                </button>
            )}

            {canReport && (
                <button
                    onClick={onReport}
                    className="button-secondary w-full justify-center"
                >
                    <Flag size={16} aria-hidden="true" /> Report this resource
                </button>
            )}
        </aside>
    );
}