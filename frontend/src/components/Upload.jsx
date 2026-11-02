
import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { showError } from '../utils/format.js';
import { FileDropzone } from './FileDropzone.jsx';
import { Field } from '../pages/Materials.jsx';

const FILE_TYPES = [
    { value: 'past_exam', label: 'Past exam' },
    { value: 'summary', label: 'Summary' },
    { value: 'lecture_note', label: 'Lecture note' },
    { value: 'cheat_sheet', label: 'Cheat sheet' },
];

export function Upload() {
    const [params] = useSearchParams();
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [file, setFile] = useState(null);
    const [busy, setBusy] = useState(false);
    const [form, setForm] = useState({
        title: '',
        description: '',
        subjectId: params.get('subjectId') || '',
        fileType: 'past_exam',
        targetTier: 'bare_minimum',
        tags: '',
    });

    useEffect(() => {
        api
            .get('/subjects', { params: { limit: 50 } })
            .then(({ data }) => setSubjects(data.data.subjects))
            .catch(() => toast.error('Could not load subjects.'));
    }, []);

    function set(key, value) {
        setForm((current) => ({ ...current, [key]: value }));
    }

    async function submit(event) {
        event.preventDefault();
        if (!file) {
            toast.error('Select a file to upload.');
            return;
        }
        setBusy(true);
        const payload = new FormData();
        Object.entries(form).forEach(([key, value]) => payload.append(key, value));
        payload.append('file', file);
        try {
            const { data } = await api.post('/materials', payload, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success('Material uploaded successfully.');
            navigate(`/materials/${data.data.material._id}`);
        } catch (error) {
            toast.error(showError(error, 'Upload failed.'));
        } finally {
            setBusy(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl">
            <Link to="/subjects" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white">
                <ArrowLeft size={15} aria-hidden="true" /> Back to subjects
            </Link>

            <header className="mb-7 mt-6">
                <p className="eyebrow">Contribute to your community</p>
                <h1 className="section-title mt-2">Upload study material</h1>
                <p className="mt-3 text-slate-400">
                    Share notes, exams and other useful resources. Files are limited to 10 MB.
                </p>
            </header>

            <form onSubmit={submit} className="surface space-y-5 p-5 sm:p-8">
                <Field label="Title" required htmlFor="upload-title">
                    <input
                        id="upload-title"
                        required
                        maxLength={200}
                        value={form.title}
                        onChange={(event) => set('title', event.target.value)}
                        placeholder="Midterm exam with solutions"
                        className="field w-full"
                    />
                </Field>

                <Field label="Description" htmlFor="upload-description">
                    <textarea
                        id="upload-description"
                        className="field min-h-24 w-full"
                        maxLength={500}
                        value={form.description}
                        onChange={(event) => set('description', event.target.value)}
                        placeholder="Add context about this resource…"
                    />
                </Field>

                <Field label="Subject" required htmlFor="upload-subject">
                    <select
                        id="upload-subject"
                        required
                        value={form.subjectId}
                        onChange={(event) => set('subjectId', event.target.value)}
                        className="field w-full"
                    >
                        <option value="">Select a subject</option>
                        {subjects.map((subject) => (
                            <option key={subject._id} value={subject._id}>
                                {subject.code} — {subject.name} · {subject.university}
                            </option>
                        ))}
                    </select>
                </Field>

                <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="File type" htmlFor="upload-file-type">
                        <select
                            id="upload-file-type"
                            value={form.fileType}
                            onChange={(event) => set('fileType', event.target.value)}
                            className="field w-full"
                        >
                            {FILE_TYPES.map((type) => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label="Target tier" htmlFor="upload-target-tier">
                        <select
                            id="upload-target-tier"
                            value={form.targetTier}
                            onChange={(event) => set('targetTier', event.target.value)}
                            className="field w-full"
                        >
                            <option value="bare_minimum">Bare Minimum</option>
                            <option value="max_distinction">Max Distinction</option>
                        </select>
                    </Field>
                </div>

                <Field label="Tags" hint="Separate tags with commas." htmlFor="upload-tags">
                    <input
                        id="upload-tags"
                        value={form.tags}
                        onChange={(event) => set('tags', event.target.value)}
                        placeholder="midterm, solutions, formulas"
                        className="field w-full"
                    />
                </Field>

                <FileDropzone file={file} onChoose={setFile} onRemove={() => setFile(null)} />

                <button className="button-primary w-full justify-center" disabled={busy}>
                    {busy ? 'Uploading…' : 'Upload material'}
                </button>
            </form>
        </div>
    );
}