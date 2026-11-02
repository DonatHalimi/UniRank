import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { UploadCloud } from 'lucide-react';
import { formatBytes } from '../utils/format.js';

const ACCEPTED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/png',
    'image/jpeg',
];
const ACCEPTED_EXTENSIONS = '.pdf,.docx,.pptx,.png,.jpg,.jpeg';
const MAX_FILE_BYTES = 10 * 1024 * 1024;

export function FileDropzone({ file, onChoose, onRemove }) {
    const inputRef = useRef(null);
    const [dragging, setDragging] = useState(false);

    function handleFiles(files) {
        const selected = files?.[0];
        if (!selected) return;
        if (!ACCEPTED_TYPES.includes(selected.type)) {
            toast.error('Choose a PDF, DOCX, PPTX, PNG or JPG file.');
            return;
        }
        if (selected.size > MAX_FILE_BYTES) {
            toast.error('Maximum file size is 10 MB.');
            return;
        }
        onChoose(selected);
    }

    return (
        <div>
            <span className="block text-sm font-medium text-slate-200">File</span>
            <div
                role="button"
                tabIndex={0}
                onClick={() => inputRef.current?.click()}
                onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        inputRef.current?.click();
                    }
                }}
                onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                    event.preventDefault();
                    setDragging(false);
                    handleFiles(event.dataTransfer.files);
                }}
                className={`mt-2 cursor-pointer rounded-2xl border border-dashed p-6 text-center transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300/40 ${dragging
                    ? 'border-indigo-300/60 bg-indigo-300/5'
                    : 'border-white/15 bg-white/[.02] hover:border-indigo-300/40'
                    }`}
            >
                <UploadCloud size={26} className="mx-auto text-accent" aria-hidden="true" />
                <span className="mt-3 block text-sm font-medium text-white">
                    {file ? file.name : 'Choose a file or drag it here'}
                </span>
                <span className="mt-1 block text-xs text-slate-400">
                    PDF, DOCX, PPTX, PNG or JPG · Max 10 MB
                </span>
                <input
                    ref={inputRef}
                    type="file"
                    className="sr-only"
                    accept={ACCEPTED_EXTENSIONS}
                    onChange={(event) => {
                        handleFiles(event.target.files);
                        event.target.value = '';
                    }}
                />
            </div>
            {file && (
                <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                    <span>{formatBytes(file.size)}</span>
                    <button
                        type="button"
                        onClick={onRemove}
                        className="rounded-md px-2 py-1 text-rose-300 hover:bg-rose-500/10 hover:text-rose-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-400"
                    >
                        Remove file
                    </button>
                </div>
            )}
        </div>
    );
}
