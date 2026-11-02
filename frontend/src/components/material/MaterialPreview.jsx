import { Download, FileText } from 'lucide-react';

export default function MaterialPreview({ material, onDownload }) {
    const isPdf = material.mimeType === 'application/pdf';
    const previewable =
        isPdf || material.mimeType?.startsWith('image/');

    return (
        <section className="surface overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 p-4">
                <h2 className="font-semibold text-white">File preview</h2>
                <button className="button-primary" onClick={onDownload}>
                    <Download size={15} aria-hidden="true" /> Download
                </button>
            </div>

            {previewable ? (
                isPdf ? (
                    <iframe
                        title="PDF preview"
                        src={material.fileUrl}
                        className="h-[650px] w-full bg-white"
                    />
                ) : (
                    <div className="grid min-h-72 place-items-center bg-black/20 p-5">
                        <img
                            src={material.fileUrl}
                            alt={material.title}
                            className="max-h-[600px] max-w-full object-contain"
                        />
                    </div>
                )
            ) : (
                <div className="p-12 text-center">
                    <FileText size={40} className="mx-auto text-slate-400" aria-hidden="true" />
                    <p className="mt-3 text-sm text-slate-200">
                        Preview is unavailable for this file type.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                        Download the original file to view it.
                    </p>
                    <button onClick={onDownload} className="button-primary mt-5">
                        <Download size={15} aria-hidden="true" /> Download file
                    </button>
                </div>
            )}
        </section>
    );
}