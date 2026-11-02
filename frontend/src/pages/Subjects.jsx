import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Search, SlidersHorizontal } from 'lucide-react';
import { Link, useSearchParams, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingSkeleton from '../components/LoadingSkeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import MaterialCard from '../components/MaterialCard.jsx';
import TierToggle from '../components/TierToggle.jsx';
import FileTypeFilter from '../components/FileTypeFilter.jsx';
import { labelFor, showError } from '../utils/format.js';

export function SubjectList() {
  const [params, setParams] = useSearchParams();
  const [subjects, setSubjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const university = params.get('university') || '';
  const faculty = params.get('faculty') || '';
  const search = params.get('search') || '';
  const page = Number(params.get('page') || 1);

  useEffect(() => {
    api.get('/subjects/universities').then(({ data }) => setUniversities(data.data)).catch(() => {});
  }, []);
  useEffect(() => {
    if (!university) { setFaculties([]); return; }
    api.get('/subjects/faculties', { params: { university } }).then(({ data }) => setFaculties(data.data)).catch(() => setFaculties([]));
  }, [university]);
  useEffect(() => {
    let active = true; setLoading(true);
    api.get('/subjects', { params: { university, faculty, search, page, limit: 12 } })
      .then(({ data }) => { if (active) { setSubjects(data.data.subjects); setPagination(data.data.pagination); } })
      .catch((error) => { if (active) toast.error(showError(error, 'Could not load subjects.')); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [university, faculty, search, page]);

  function update(key, value) {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page'); setParams(next);
  }

  return <div>
    <div className="mb-8"><p className="eyebrow">Academic directory</p><h1 className="section-title mt-2">Explore subjects</h1><p className="mt-3 max-w-2xl text-slate-400">Find course materials by university, faculty and subject. Every course has a dedicated hub for both study tiers.</p></div>
    <div className="surface mb-7 grid gap-3 p-4 md:grid-cols-[1fr_1fr_1.2fr]
      "><label className="text-xs text-slate-400">University<select className="field mt-2 w-full" value={university} onChange={(event) => { const next = new URLSearchParams(params); if (event.target.value) next.set('university', event.target.value); else next.delete('university'); next.delete('faculty'); next.delete('page'); setParams(next); }}><option value="">All universities</option>{universities.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-xs text-slate-400">Faculty<select className="field mt-2 w-full" value={faculty} onChange={(event) => update('faculty', event.target.value)} disabled={!university}><option value="">All faculties</option>{faculties.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="text-xs text-slate-400">Search subjects<div className="relative mt-2"><Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" /><input className="field w-full pl-9" value={search} onChange={(event) => update('search', event.target.value)} placeholder="Course name or code" /></div></label>
    </div>
    <div className="mb-4 flex items-center justify-between gap-3"><p className="text-sm text-slate-400">{pagination.total} subject{pagination.total === 1 ? '' : 's'} found</p><span className="inline-flex items-center gap-2 text-xs text-slate-500"><SlidersHorizontal size={14} /> Filters update automatically</span></div>
    {loading ? <LoadingSkeleton rows={4} /> : subjects.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{subjects.map((subject) => <Link key={subject._id} to={`/subjects/${subject._id}`} className="surface group p-5 transition hover:-translate-y-0.5 hover:border-indigo-300/30"><div className="flex items-start justify-between gap-3"><span className="rounded-lg bg-indigo-300/10 px-2.5 py-1 font-mono text-xs text-indigo-200">{subject.code}</span><BookOpen size={18} className="text-slate-500 transition group-hover:text-accent" /></div><h2 className="mt-4 text-lg font-semibold text-white group-hover:text-accent">{subject.name}</h2><p className="mt-1 text-sm text-slate-400">{subject.faculty}</p><p className="mt-1 text-xs text-slate-500">{subject.university}</p><div className="mt-5 flex items-center justify-between border-t border-white/5 pt-4 text-xs text-slate-500"><span>{subject.materialCount || 0} resources</span><span className="inline-flex items-center gap-1 text-slate-300">Open course <ArrowRight size={13} /></span></div></Link>)}</div> : <EmptyState title="No subjects found" description="Try another university, faculty or search term." />}
    {pagination.pages > 1 && <div className="mt-8 flex items-center justify-center gap-4"><button className="button-secondary" disabled={page <= 1} onClick={() => update('page', String(page - 1))}><ArrowLeft size={15} /> Previous</button><span className="text-sm text-slate-400">Page {page} of {pagination.pages}</span><button className="button-secondary" disabled={page >= pagination.pages} onClick={() => update('page', String(page + 1))}>Next <ArrowRight size={15} /></button></div>}
  </div>;
}

export function SubjectDetail() {
  const { id } = useParams(); const { user } = useAuth();
  const [subject, setSubject] = useState(null); const [counts, setCounts] = useState({ bare_minimum: 0, max_distinction: 0 });
  const [materials, setMaterials] = useState([]); const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [tier, setTier] = useState('bare_minimum'); const [fileType, setFileType] = useState(''); const [sort, setSort] = useState('newest'); const [page, setPage] = useState(1); const [loading, setLoading] = useState(true);
  async function loadSubject() {
    const { data } = await api.get(`/subjects/${id}`); setSubject(data.data.subject); setCounts(data.data.materialCounts);
  }
  async function loadMaterials() {
    setLoading(true);
    try { const { data } = await api.get(`/subjects/${id}/materials`, { params: { targetTier: tier, fileType: fileType || undefined, sort, page, limit: 10 } }); setMaterials(data.data.materials); setPagination(data.data.pagination); }
    catch (error) { toast.error(showError(error, 'Could not load course materials.')); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadSubject().catch((error) => toast.error(showError(error, 'Subject could not be found.'))); }, [id]);
  useEffect(() => { loadMaterials(); }, [id, tier, fileType, sort, page]);
  function changeTier(value) { setTier(value); setPage(1); }
  async function upvote(materialId) {
    if (!user) return toast.error('Sign in to vote on materials.');
    try { await api.patch(`/materials/${materialId}/upvote`); await loadMaterials(); }
    catch (error) { toast.error(showError(error, 'Could not update vote.')); }
  }
  if (!subject) return <LoadingSkeleton rows={3} />;
  return <div>
    <div className="mb-7"><Link to="/subjects" className="text-sm text-slate-400 hover:text-white">← All subjects</Link><div className="mt-5 flex flex-wrap items-start justify-between gap-5"><div><p className="eyebrow">{subject.university} · {subject.faculty}</p><h1 className="section-title mt-2">{subject.name}</h1><div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-400"><span className="rounded-md bg-white/5 px-2 py-1 font-mono text-xs text-indigo-200">{subject.code}</span>{subject.semester && <span>{subject.semester}</span>}{subject.credits ? <span>· {subject.credits} credits</span> : null}</div></div><Link to={`/materials/upload?subjectId=${id}`} className="button-primary">Upload material</Link></div>{subject.description && <p className="mt-5 max-w-3xl leading-7 text-slate-400">{subject.description}</p>}{subject.professors?.length > 0 && <p className="mt-3 text-sm text-slate-500">Professors: {subject.professors.join(', ')}</p>}</div>
    <div className="surface p-5 sm:p-7"><div className="mb-5 flex flex-wrap items-center justify-between gap-4"><div><p className="eyebrow">Choose your study depth</p><h2 className="mt-1 text-xl font-semibold text-white">Min vs. Max resource hub</h2></div><span className="text-xs text-slate-500">{counts.bare_minimum} pass-focused · {counts.max_distinction} distinction</span></div><TierToggle value={tier} onChange={changeTier} /><div className="mt-6 flex flex-wrap items-center justify-between gap-4"><FileTypeFilter value={fileType} onChange={(value) => { setFileType(value); setPage(1); }} /><select className="field w-auto min-w-44" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }} aria-label="Sort materials"><option value="newest">Newest first</option><option value="upvotes">Most upvoted</option><option value="downloads">Most downloaded</option></select></div>
      <div className="mt-6">{loading ? <LoadingSkeleton rows={3} /> : materials.length ? <div className="space-y-3">{materials.map((material) => <MaterialCard key={material._id} material={material} currentUser={user} onUpvote={upvote} />)}</div> : <EmptyState title="No resources in this tier yet" description="Be the first to share useful material for this subject." action={<Link to={`/materials/upload?subjectId=${id}`} className="button-primary">Upload a resource</Link>} />}</div>
      {pagination.pages > 1 && <div className="mt-6 flex items-center justify-center gap-4"><button className="button-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</button><span className="text-sm text-slate-400">Page {page} of {pagination.pages}</span><button className="button-secondary" disabled={page >= pagination.pages} onClick={() => setPage((p) => p + 1)}>Next</button></div>}
    </div>
  </div>;
}
